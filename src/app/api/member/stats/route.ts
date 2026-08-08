import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member";

export async function GET() {
  const member = await requireMember();
  if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const [totalOrders, tickets, byStatus, recent] = await Promise.all([
    prisma.smmOrder.count({ where: { memberId: member.id } }),
    prisma.supportTicket.count({
      where: { memberId: member.id, status: { in: ["open", "answered"] } },
    }),
    prisma.smmOrder.groupBy({
      by: ["status"],
      where: { memberId: member.id },
      _count: { _all: true },
    }),
    prisma.smmOrder.findMany({
      where: { memberId: member.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const statusMap = Object.fromEntries(byStatus.map((s) => [s.status, s._count._all]));

  return NextResponse.json({
    balance: member.balance,
    spent: member.spent,
    totalOrders,
    openTickets: tickets,
    status: {
      completed: statusMap.completed || 0,
      processing: (statusMap.processing || 0) + (statusMap.inprogress || 0),
      pending: statusMap.pending || 0,
      partial: statusMap.partial || 0,
      canceled: (statusMap.canceled || 0) + (statusMap.cancelled || 0),
      error: statusMap.error || 0,
    },
    recent,
  });
}
