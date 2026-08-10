import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireMember } from "@/lib/member";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { readPanelSettings } from "@/lib/settings";
import { pushPaymentsToGist } from "@/lib/payments-durable";
import { appBaseUrl } from "@/lib/session";
import {
  buildShopierPayment,
  shopierConfigured,
  shopierPhone,
  splitBuyerName,
} from "@/lib/shopier";
import { clientIpFromHeaders } from "@/lib/welcome-bonus";

const schema = z.object({
  amount: z.preprocess(
    (v) => (typeof v === "string" ? Number(v.replace(",", ".")) : v),
    z.number().positive().max(100000)
  ),
});

export async function POST(req: NextRequest) {
  try {
    if (!shopierConfigured()) {
      return NextResponse.json(
        {
          error:
            "Kartlı ödeme şu an kapalı. Havale/EFT kullanın veya destek ile iletişime geçin.",
        },
        { status: 503 }
      );
    }

    const member = await requireMember();
    if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

    const ip = clientIpFromHeaders(req.headers);
    const rl = rateLimit(`shopier:${member.id}:${ip}`, 8, 60_000);
    if (!rl.ok) return NextResponse.json({ error: "Çok fazla istek — biraz bekleyin" }, { status: 429 });

    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Geçersiz tutar" }, { status: 400 });
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

    // Drop stale pending Shopier checkouts (>2h) so members aren't blocked
    const staleBefore = new Date(Date.now() - 2 * 60 * 60 * 1000);
    await prisma.balanceRequest
      .updateMany({
        where: {
          memberId: member.id,
          method: "shopier",
          status: "pending",
          createdAt: { lt: staleBefore },
        },
        data: { status: "rejected", adminNote: "Shopier zaman aşımı" },
      })
      .catch(() => null);

    const pendingShopier = await prisma.balanceRequest.count({
      where: { memberId: member.id, status: "pending", method: "shopier" },
    });
    if (pendingShopier >= 3) {
      return NextResponse.json(
        {
          error:
            "Bekleyen kart ödemeniz var. Önceki işlemi tamamlayın veya 2 saat sonra tekrar deneyin.",
        },
        { status: 400 }
      );
    }

    const row = await prisma.balanceRequest.create({
      data: {
        memberId: member.id,
        amount,
        method: "shopier",
        note: "Kart ile ödeme başlatıldı",
        status: "pending",
      },
    });
    await pushPaymentsToGist().catch(() => null);

    const base = appBaseUrl(req);
    const { firstName, lastName } = splitBuyerName(member.name, member.username);
    const payment = buildShopierPayment({
      orderId: row.id,
      amount,
      productName: `TOLWEX Panel Bakiye ${amount.toFixed(2)} TL`,
      callbackUrl: `${base}/api/member/shopier/callback`,
      buyer: {
        id: member.id,
        firstName,
        lastName,
        email: member.email,
        phone: shopierPhone(member.phone),
      },
    });

    return NextResponse.json({
      ok: true,
      requestId: row.id,
      action: payment.action,
      fields: payment.fields,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Hata";
    console.error("shopier_create_failed", message);
    return NextResponse.json(
      { error: "Ödeme başlatılamadı. Biraz sonra tekrar deneyin.", detail: message },
      { status: 500 }
    );
  }
}
