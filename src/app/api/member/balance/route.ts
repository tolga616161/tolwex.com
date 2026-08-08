import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member";
import { rateLimit } from "@/lib/rate-limit";
import { readPanelSettings } from "@/lib/settings";
import { pushPaymentsToGist } from "@/lib/payments-durable";

export async function GET() {
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
  });
}

const schema = z.object({
  amount: z.number().positive().max(100000),
  method: z.string().max(40).default("bank_transfer"),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const member = await requireMember();
    if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rl = rateLimit(`bal:${member.id}:${ip}`, 10, 60_000);
    if (!rl.ok) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Geçersiz tutar" }, { status: 400 });
    }

    const settings = await readPanelSettings();
    const minDeposit = Number(settings.min_deposit) || 50;
    if (parsed.data.amount < minDeposit) {
      return NextResponse.json(
        { error: `Minimum yükleme tutarı ${minDeposit} ₺` },
        { status: 400 }
      );
    }

    // Prevent spam: max 3 pending at once
    const pendingCount = await prisma.balanceRequest.count({
      where: { memberId: member.id, status: "pending" },
    });
    if (pendingCount >= 3) {
      return NextResponse.json(
        { error: "Zaten bekleyen 3 ödeme bildiriminiz var. Onay bekleyin." },
        { status: 400 }
      );
    }

    const row = await prisma.balanceRequest.create({
      data: {
        memberId: member.id,
        amount: parsed.data.amount,
        method: parsed.data.method || "bank_transfer",
        note: parsed.data.note?.trim() || "",
        status: "pending",
      },
    });

    const synced = await pushPaymentsToGist();
    if (!synced.ok) {
      return NextResponse.json(
        {
          ok: true,
          request: row,
          warning: "Bildirim alındı; senkron gecikebilir.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ ok: true, request: row });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Hata";
    return NextResponse.json({ error: "Ödeme bildirimi oluşturulamadı", detail: message }, { status: 500 });
  }
}
