import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member";

export async function GET() {
  const member = await requireMember();
  if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const items = await prisma.walletTransaction.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ items, balance: member.balance });
}
