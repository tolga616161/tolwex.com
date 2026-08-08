import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const [
    members,
    orders,
    services,
    pendingBalance,
    openTickets,
    revenue,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.smmOrder.count(),
    prisma.smmService.count({ where: { active: true } }),
    prisma.balanceRequest.count({ where: { status: "pending" } }),
    prisma.supportTicket.count({ where: { status: "open" } }),
    prisma.smmOrder.aggregate({
      _sum: { charge: true },
      where: { status: { in: ["processing", "completed", "partial"] } },
    }),
  ]);

  return NextResponse.json({
    members,
    orders,
    services,
    pendingBalance,
    openTickets,
    revenue: revenue._sum.charge || 0,
  });
}
