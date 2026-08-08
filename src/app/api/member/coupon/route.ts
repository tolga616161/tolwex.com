import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { adjustBalance, requireMember } from "@/lib/member";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  code: z.string().min(2).max(40),
});

export async function POST(req: NextRequest) {
  const member = await requireMember();
  if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = rateLimit(`coupon:${member.id}:${ip}`, 8, 60_000);
  if (!rl.ok) return NextResponse.json({ error: "Çok fazla istek" }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz kod" }, { status: 400 });

  const code = parsed.data.code.trim().toUpperCase();
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.active) {
    return NextResponse.json({ error: "Kupon geçersiz" }, { status: 404 });
  }
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return NextResponse.json({ error: "Kupon süresi dolmuş" }, { status: 400 });
  }
  if (coupon.usedCount >= coupon.maxUses) {
    return NextResponse.json({ error: "Kupon kullanım limiti dolmuş" }, { status: 400 });
  }
  if (coupon.amount <= 0) {
    return NextResponse.json({ error: "Kupon tutarı tanımsız" }, { status: 400 });
  }

  const already = await prisma.walletTransaction.findFirst({
    where: { memberId: member.id, type: "coupon", refId: coupon.id },
  });
  if (already) {
    return NextResponse.json({ error: "Bu kuponu zaten kullandınız" }, { status: 400 });
  }

  await prisma.coupon.update({
    where: { id: coupon.id },
    data: { usedCount: { increment: 1 } },
  });

  const updated = await adjustBalance(
    member.id,
    coupon.amount,
    "coupon",
    `Kupon: ${coupon.code}`,
    coupon.id
  );

  return NextResponse.json({ ok: true, balance: updated.balance, amount: coupon.amount });
}
