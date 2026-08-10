import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ensureDbHydrated, prisma } from "@/lib/db";
import { requireMember } from "@/lib/member";
import { rateLimit } from "@/lib/rate-limit";
import { readPanelSettings } from "@/lib/settings";
import { pushPaymentsToGist } from "@/lib/payments-durable";
import { IBAN_APPROVE_BONUS_TRY, IBAN_BONUS_MIN_DEPOSIT_TRY, ibanDepositBonus } from "@/lib/welcome-bonus";
import { clientIpFromHeaders } from "@/lib/welcome-bonus";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDbHydrated(true);
    const member = await requireMember();
    if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

    const requests = await prisma.balanceRequest.findMany({
      where: { memberId: member.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    });

    return NextResponse.json({
      balance: member.balance,
      requests,
      ibanApproveBonus: IBAN_APPROVE_BONUS_TRY,
      ibanBonusMinDeposit: IBAN_BONUS_MIN_DEPOSIT_TRY,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Hata";
    return NextResponse.json({ error: "Bakiye bilgisi alınamadı", detail: message }, { status: 500 });
  }
}

const schema = z.object({
  amount: z.preprocess(
    (v) => (typeof v === "string" ? Number(String(v).replace(",", ".")) : v),
    z.number().positive().max(100000)
  ),
  method: z.string().max(40).optional(),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    await ensureDbHydrated(true);
    const member = await requireMember();
    if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

    const ip = clientIpFromHeaders(req.headers);
    const rl = rateLimit(`bal:${member.id}:${ip}`, 10, 60_000);
    if (!rl.ok) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Geçersiz tutar — sayı girin" }, { status: 400 });
    }

    const amount = Math.round(parsed.data.amount * 100) / 100;
    const settings = await readPanelSettings();
    const minDeposit = Number(settings.min_deposit) || 50;
    if (amount < minDeposit) {
      return NextResponse.json(
        { error: `Minimum yükleme tutarı ${minDeposit} ₺` },
        { status: 400 }
      );
    }

    const method = (parsed.data.method || "bank_transfer").trim() || "bank_transfer";
    // Force IBAN path while Shopier may be off — reject fake shopier from client
    const safeMethod = method === "shopier" ? "bank_transfer" : method;

    const pendingCount = await prisma.balanceRequest.count({
      where: { memberId: member.id, status: "pending", method: { not: "shopier" } },
    });
    if (pendingCount >= 5) {
      return NextResponse.json(
        { error: "Bekleyen çok fazla bildiriminiz var. Onay bekleyin veya destek yazın." },
        { status: 400 }
      );
    }

    const row = await prisma.balanceRequest.create({
      data: {
        memberId: member.id,
        amount,
        method: safeMethod,
        note: parsed.data.note?.trim() || "",
        status: "pending",
      },
    });

    // Never fail the member UX on gist lag
    const synced = await pushPaymentsToGist().catch(() => ({ ok: false as const }));

    return NextResponse.json({
      ok: true,
      request: row,
      ibanApproveBonus: IBAN_APPROVE_BONUS_TRY,
      ibanBonusMinDeposit: IBAN_BONUS_MIN_DEPOSIT_TRY,
      durable: Boolean(synced && "ok" in synced && synced.ok),
      message:
        ibanDepositBonus(amount) > 0
          ? `Bildirim alındı. Onayda ${amount.toFixed(2)}₺ + ${IBAN_APPROVE_BONUS_TRY}₺ hediye yüklenecek.`
          : `Bildirim alındı. Onayda ${amount.toFixed(2)}₺ yüklenecek. (+${IBAN_APPROVE_BONUS_TRY}₺ hediye için en az ${IBAN_BONUS_MIN_DEPOSIT_TRY}₺ yatırın.)`,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Hata";
    console.error("balance_notify_failed", message);
    return NextResponse.json(
      { error: "Ödeme bildirimi oluşturulamadı — tekrar deneyin.", detail: message },
      { status: 500 }
    );
  }
}
