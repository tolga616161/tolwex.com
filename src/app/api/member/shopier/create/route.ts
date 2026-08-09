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
  splitBuyerName,
} from "@/lib/shopier";

const schema = z.object({
  amount: z.number().positive().max(100000),
});

export async function POST(req: NextRequest) {
  try {
    if (!shopierConfigured()) {
      return NextResponse.json(
        { error: "Shopier henüz yapılandırılmadı. Admin API anahtarlarını eklemeli." },
        { status: 503 }
      );
    }

    const member = await requireMember();
    if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    const rl = rateLimit(`shopier:${member.id}:${ip}`, 8, 60_000);
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

    const pendingShopier = await prisma.balanceRequest.count({
      where: { memberId: member.id, status: "pending", method: "shopier" },
    });
    if (pendingShopier >= 5) {
      return NextResponse.json(
        { error: "Bekleyen çok fazla Shopier işlemi var. Öncekilerin tamamlanmasını bekleyin." },
        { status: 400 }
      );
    }

    const row = await prisma.balanceRequest.create({
      data: {
        memberId: member.id,
        amount: parsed.data.amount,
        method: "shopier",
        note: "Shopier ödeme başlatıldı",
        status: "pending",
      },
    });
    await pushPaymentsToGist();

    const base = appBaseUrl(req);
    const { firstName, lastName } = splitBuyerName(member.name, member.username);
    const payment = buildShopierPayment({
      orderId: row.id,
      amount: parsed.data.amount,
      productName: `TOLWEX Bakiye ${parsed.data.amount.toFixed(2)} TL`,
      callbackUrl: `${base}/api/member/shopier/callback`,
      buyer: {
        id: member.id,
        firstName,
        lastName,
        email: member.email,
        phone: member.phone || "05000000000",
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
      { error: "Shopier ödeme başlatılamadı", detail: message },
      { status: 500 }
    );
  }
}
