import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ ok: true, coupons });
}

export async function POST(request: NextRequest) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const body = (await request.json().catch(() => ({}))) as {
    code?: string;
    amount?: number;
    maxUses?: number;
  };

  const code = body.code?.trim().toUpperCase();
  const amount = Number(body.amount);
  const maxUses = Math.max(1, Math.floor(Number(body.maxUses || 1)));

  if (!code || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Kod ve tutar gerekli." }, { status: 400 });
  }

  const coupon = await prisma.coupon.create({
    data: { code, amount, maxUses, active: true },
  });

  return NextResponse.json({ ok: true, coupon });
}

export async function PATCH(request: NextRequest) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    active?: boolean;
  };
  if (!body.id) {
    return NextResponse.json({ error: "id gerekli." }, { status: 400 });
  }

  const coupon = await prisma.coupon.update({
    where: { id: body.id },
    data: { active: Boolean(body.active) },
  });

  return NextResponse.json({ ok: true, coupon });
}
