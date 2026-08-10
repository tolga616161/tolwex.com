import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { prisma, ensureDbHydrated } from "@/lib/db";
import { fetchSmmBalance, smmConfig } from "@/lib/smm/client";
import { pullOrdersFromGist } from "@/lib/orders-durable";
import { pullPaymentsFromGist } from "@/lib/payments-durable";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Sipariş durumları — müşteriden tahsil edilen / API maliyeti olan */
const BILLABLE = [
  "pending",
  "awaiting",
  "processing",
  "inprogress",
  "in progress",
  "completed",
  "partial",
] as const;

const DEAD = ["refunded", "canceled", "cancelled", "error"] as const;

type RangeKey = "today" | "7d" | "30d" | "all";

function rangeStart(range: RangeKey): Date | null {
  const now = new Date();
  if (range === "all") return null;
  if (range === "today") {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const days = range === "7d" ? 7 : 30;
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function money(n: number) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function parseRange(raw: string | null): RangeKey {
  if (raw === "today" || raw === "7d" || raw === "30d" || raw === "all") return raw;
  return "30d";
}

export async function GET(req: NextRequest) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  try {
    await ensureDbHydrated(true);
    // Best-effort hydrate durable data — never fail the page
    await Promise.all([
      pullOrdersFromGist().catch(() => null),
      pullPaymentsFromGist().catch(() => null),
    ]);

    const range = parseRange(req.nextUrl.searchParams.get("range"));
    const from = rangeStart(range);
    const createdAt = from ? { gte: from } : undefined;
    const orderWhere = createdAt ? { createdAt } : {};
    const billableWhere = {
      ...orderWhere,
      status: { in: [...BILLABLE] },
    };

    const cfg = smmConfig();
    const markupPercent = cfg.markupPercent;

    const [
      billableAgg,
      deadAgg,
      orderCounts,
      deposits,
      depositsByMethod,
      walletBonus,
      walletCoupon,
      walletRefund,
      memberBalances,
      recentOrders,
      providerBal,
    ] = await Promise.all([
      prisma.smmOrder
        .aggregate({
          where: billableWhere,
          _sum: { charge: true, cost: true },
          _count: true,
        })
        .catch(() => ({ _sum: { charge: 0, cost: 0 }, _count: 0 })),
      prisma.smmOrder
        .aggregate({
          where: { ...orderWhere, status: { in: [...DEAD] } },
          _sum: { charge: true, cost: true },
          _count: true,
        })
        .catch(() => ({ _sum: { charge: 0, cost: 0 }, _count: 0 })),
      prisma.smmOrder
        .groupBy({
          by: ["status"],
          where: orderWhere,
          _count: true,
          _sum: { charge: true, cost: true },
        })
        .catch(() => []),
      prisma.balanceRequest
        .aggregate({
          where: {
            status: "approved",
            ...(createdAt ? { updatedAt: createdAt } : {}),
          },
          _sum: { amount: true },
          _count: true,
        })
        .catch(() => ({ _sum: { amount: 0 }, _count: 0 })),
      prisma.balanceRequest
        .groupBy({
          by: ["method"],
          where: {
            status: "approved",
            ...(createdAt ? { updatedAt: createdAt } : {}),
          },
          _sum: { amount: true },
          _count: true,
        })
        .catch(() => []),
      prisma.walletTransaction
        .aggregate({
          where: { type: "bonus", ...(createdAt ? { createdAt } : {}) },
          _sum: { amount: true },
          _count: true,
        })
        .catch(() => ({ _sum: { amount: 0 }, _count: 0 })),
      prisma.walletTransaction
        .aggregate({
          where: { type: "coupon", ...(createdAt ? { createdAt } : {}) },
          _sum: { amount: true },
          _count: true,
        })
        .catch(() => ({ _sum: { amount: 0 }, _count: 0 })),
      prisma.walletTransaction
        .aggregate({
          where: {
            OR: [{ type: "refund" }, { type: "adjust", amount: { gt: 0 }, note: { contains: "İade" } }],
            ...(createdAt ? { createdAt } : {}),
          },
          _sum: { amount: true },
          _count: true,
        })
        .catch(() => ({ _sum: { amount: 0 }, _count: 0 })),
      prisma.member
        .aggregate({
          where: { active: true },
          _sum: { balance: true, spent: true },
          _count: true,
        })
        .catch(() => ({ _sum: { balance: 0, spent: 0 }, _count: 0 })),
      prisma.smmOrder
        .findMany({
          where: billableWhere,
          orderBy: { createdAt: "desc" },
          take: 40,
          select: {
            id: true,
            serviceName: true,
            quantity: true,
            charge: true,
            cost: true,
            status: true,
            createdAt: true,
            member: { select: { username: true } },
          },
        })
        .catch(() => []),
      (async () => {
        if (!cfg.key) return { ok: false as const, balance: null, currency: "TRY", error: "API key yok" };
        try {
          const bal = await fetchSmmBalance();
          return {
            ok: true as const,
            balance: bal.balance,
            currency: bal.currency || "TRY",
            error: null as string | null,
          };
        } catch (e) {
          return {
            ok: false as const,
            balance: null,
            currency: "TRY",
            error: e instanceof Error ? e.message : "API bakiye alınamadı",
          };
        }
      })(),
    ]);

    let revenue = money(billableAgg._sum.charge || 0);
    let costRaw = money(billableAgg._sum.cost || 0);

    // Zero-cost siparişlerde tahmini maliyet (kâr hesabı bozulmasın)
    const zeroCost = await prisma.smmOrder
      .findMany({
        where: { ...billableWhere, cost: 0, charge: { gt: 0 } },
        select: { charge: true },
      })
      .catch(() => [] as Array<{ charge: number }>);

    let estimatedCostExtra = 0;
    const factor = 1 + markupPercent / 100;
    for (const z of zeroCost) {
      estimatedCostExtra += z.charge / factor;
    }
    estimatedCostExtra = money(estimatedCostExtra);
    const cost = money(costRaw + estimatedCostExtra);
    const profit = money(revenue - cost);
    const marginPct = revenue > 0 ? money((profit / revenue) * 100) : 0;
    const effectiveMarkup =
      cost > 0 ? money(((revenue - cost) / cost) * 100) : markupPercent;

    // Günlük seri (son 14 gün) — range all/30d için anlamlı
    const dayCount = 14;
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    dayStart.setDate(dayStart.getDate() - (dayCount - 1));

    const dailyOrders = await prisma.smmOrder
      .findMany({
        where: {
          createdAt: { gte: dayStart },
          status: { in: [...BILLABLE] },
        },
        select: { createdAt: true, charge: true, cost: true },
      })
      .catch(() => []);

    const byDay = new Map<string, { revenue: number; cost: number; profit: number; orders: number }>();
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(dayStart);
      d.setDate(dayStart.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      byDay.set(key, { revenue: 0, cost: 0, profit: 0, orders: 0 });
    }
    for (const o of dailyOrders) {
      const key = o.createdAt.toISOString().slice(0, 10);
      const row = byDay.get(key);
      if (!row) continue;
      let c = Number(o.cost) || 0;
      if (c <= 0 && o.charge > 0) c = o.charge / factor;
      row.revenue += Number(o.charge) || 0;
      row.cost += c;
      row.orders += 1;
      row.profit = row.revenue - row.cost;
    }
    const daily = [...byDay.entries()].map(([date, v]) => ({
      date,
      revenue: money(v.revenue),
      cost: money(v.cost),
      profit: money(v.profit),
      orders: v.orders,
    }));

    // Servis bazlı kâr (top 15)
    const byServiceMap = new Map<
      string,
      { name: string; revenue: number; cost: number; orders: number }
    >();
    const serviceRows = await prisma.smmOrder
      .findMany({
        where: billableWhere,
        select: { serviceName: true, charge: true, cost: true },
        take: 5000,
      })
      .catch(() => []);
    for (const o of serviceRows) {
      const name = (o.serviceName || "Diğer").slice(0, 80);
      const cur = byServiceMap.get(name) || { name, revenue: 0, cost: 0, orders: 0 };
      let c = Number(o.cost) || 0;
      if (c <= 0 && o.charge > 0) c = o.charge / factor;
      cur.revenue += Number(o.charge) || 0;
      cur.cost += c;
      cur.orders += 1;
      byServiceMap.set(name, cur);
    }
    const byService = [...byServiceMap.values()]
      .map((s) => ({
        name: s.name,
        orders: s.orders,
        revenue: money(s.revenue),
        cost: money(s.cost),
        profit: money(s.revenue - s.cost),
        marginPct: s.revenue > 0 ? money(((s.revenue - s.cost) / s.revenue) * 100) : 0,
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 15);

    const lossOrders = recentOrders
      .filter((o) => {
        let c = Number(o.cost) || 0;
        if (c <= 0 && o.charge > 0) c = o.charge / factor;
        return money(o.charge - c) < 0;
      })
      .slice(0, 10)
      .map((o) => {
        let c = Number(o.cost) || 0;
        if (c <= 0 && o.charge > 0) c = o.charge / factor;
        return {
          id: o.id,
          serviceName: o.serviceName,
          username: o.member?.username || "—",
          charge: money(o.charge),
          cost: money(c),
          profit: money(o.charge - c),
          status: o.status,
          createdAt: o.createdAt.toISOString(),
        };
      });

    const statusBreakdown = orderCounts.map((g) => ({
      status: g.status,
      count: g._count,
      revenue: money(g._sum.charge || 0),
      cost: money(g._sum.cost || 0),
    }));

    const depositMethods = depositsByMethod.map((g) => ({
      method: g.method,
      count: g._count,
      amount: money(g._sum.amount || 0),
    }));

    return NextResponse.json({
      ok: true,
      range,
      from: from?.toISOString() || null,
      markup: {
        configuredPercent: markupPercent,
        effectivePercent: effectiveMarkup,
        note:
          "Satış = üye ödediği (charge). Maliyet = API provider rate. Kâr = satış − maliyet.",
      },
      summary: {
        orderCount: billableAgg._count || 0,
        revenue,
        cost,
        costStored: costRaw,
        costEstimated: estimatedCostExtra,
        profit,
        marginPct,
        deadOrderCount: deadAgg._count || 0,
        deadCharge: money(deadAgg._sum.charge || 0),
      },
      cash: {
        deposits: money(deposits._sum.amount || 0),
        depositCount: deposits._count || 0,
        depositMethods,
        bonuses: money(walletBonus._sum.amount || 0),
        bonusCount: walletBonus._count || 0,
        coupons: money(walletCoupon._sum.amount || 0),
        couponCount: walletCoupon._count || 0,
        refunds: money(walletRefund._sum.amount || 0),
        refundCount: walletRefund._count || 0,
        memberBalanceLiability: money(memberBalances._sum.balance || 0),
        memberSpent: money(memberBalances._sum.spent || 0),
        activeMembers: memberBalances._count || 0,
      },
      provider: {
        configured: Boolean(cfg.key),
        ok: providerBal.ok,
        balance: providerBal.balance,
        currency: providerBal.currency,
        error: providerBal.error,
        url: cfg.url,
      },
      daily,
      byService,
      statusBreakdown,
      lossOrders,
      recent: recentOrders.map((o) => {
        let c = Number(o.cost) || 0;
        const estimated = c <= 0 && o.charge > 0;
        if (estimated) c = o.charge / factor;
        return {
          id: o.id,
          serviceName: o.serviceName,
          username: o.member?.username || "—",
          quantity: o.quantity,
          charge: money(o.charge),
          cost: money(c),
          profit: money(o.charge - c),
          estimated,
          status: o.status,
          createdAt: o.createdAt.toISOString(),
        };
      }),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Muhasebe verisi alınamadı";
    console.error("accounting_failed", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
