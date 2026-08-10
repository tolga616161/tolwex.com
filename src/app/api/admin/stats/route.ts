import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { prisma, ensureDbHydrated } from "@/lib/db";
import { ensureSmmCatalogFresh } from "@/lib/smm/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  try {
    await ensureDbHydrated();
    // Cold /tmp instances often have members (gist) but empty service catalog
    const warmCount = await prisma.smmService.count({ where: { active: true } }).catch(() => 0);
    if (warmCount < 50) {
      await ensureSmmCatalogFresh(0).catch(() => null);
    }

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
          _sum: { charge: true, cost: true },
          where: {
            status: {
              in: [
                "pending",
                "awaiting",
                "processing",
                "inprogress",
                "in progress",
                "completed",
                "partial",
              ],
            },
          },
        })
        .catch(() => ({ _sum: { charge: 0, cost: 0 } })),
      prisma.smmOrder
        .count({
          where: {
            OR: [
              { status: "pending" },
              { status: "awaiting" },
              {
                providerOrderId: null,
                status: { notIn: ["refunded", "error", "canceled", "cancelled"] },
              },
            ],
          },
        })
        .catch(() => 0),
    ]);

    const rev = Number(revenue._sum.charge || 0);
    const cost = Number(revenue._sum.cost || 0);
    const profit = Math.round((rev - cost) * 100) / 100;

    return NextResponse.json({
      ok: true,
      members,
      orders,
      services,
      pendingBalance,
      openTickets,
      pendingOrders,
      revenue: rev,
      cost,
      profit,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "İstatistikler alınamadı";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
