import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { prisma, ensureDbHydrated } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  try {
    await ensureDbHydrated();
    const [
      members,
      orders,
      services,
      pendingBalance,
      openTickets,
      revenue,
      pendingOrders,
    ] = await Promise.all([
      prisma.member.count().catch(() => 0),
      prisma.smmOrder.count().catch(() => 0),
      prisma.smmService.count({ where: { active: true } }).catch(() => 0),
      prisma.balanceRequest.count({ where: { status: "pending" } }).catch(() => 0),
      prisma.supportTicket.count({ where: { status: "open" } }).catch(() => 0),
      prisma.smmOrder
        .aggregate({
          _sum: { charge: true },
          where: { status: { in: ["processing", "completed", "partial"] } },
        })
        .catch(() => ({ _sum: { charge: 0 } })),
      prisma.smmOrder
        .count({
          where: {
            OR: [
              { status: "pending" },
              { status: "awaiting" },
              { providerOrderId: null, status: { notIn: ["refunded", "error", "canceled", "cancelled"] } },
            ],
          },
        })
        .catch(() => 0),
    ]);

    return NextResponse.json({
      ok: true,
      members,
      orders,
      services,
      pendingBalance,
      openTickets,
      pendingOrders,
      revenue: Number(revenue._sum.charge || 0),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "İstatistikler alınamadı";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
