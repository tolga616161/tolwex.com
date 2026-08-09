import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  try {
    const sp = req.nextUrl.searchParams;
    const limit = Math.min(200, Math.max(20, Number(sp.get("limit") || 80)));
    const sinceHours = Math.min(24 * 30, Math.max(1, Number(sp.get("hours") || 24)));
    const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);

    const [visits, totalWindow, totalAll] = await Promise.all([
      prisma.siteVisit.findMany({
        where: { enteredAt: { gte: since } },
        orderBy: { enteredAt: "desc" },
        take: limit,
      }),
      prisma.siteVisit.count({ where: { enteredAt: { gte: since } } }),
      prisma.siteVisit.count(),
    ]);

    const uniqueIps = new Set(visits.map((v) => v.ip).filter(Boolean));
    const onlineCutoff = new Date(Date.now() - 5 * 60_000);
    const online = visits.filter(
      (v) => v.enteredAt >= onlineCutoff && (!v.leftAt || v.leftAt >= onlineCutoff)
    );
    const onlineIps = new Set(online.map((v) => v.ip));

    const pageMap = new Map<string, number>();
    for (const v of visits) {
      pageMap.set(v.path, (pageMap.get(v.path) || 0) + v.hitCount);
    }
    const topPages = [...pageMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([path, hits]) => ({ path, hits }));

    const refMap = new Map<string, number>();
    for (const v of visits) {
      const r = v.referrer?.trim() || "(direkt)";
      let host = r;
      try {
        if (r.startsWith("http")) host = new URL(r).hostname;
      } catch {
        /* keep */
      }
      refMap.set(host, (refMap.get(host) || 0) + 1);
    }
    const topReferrers = [...refMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([source, hits]) => ({ source, hits }));

    return NextResponse.json({
      ok: true,
      sinceHours,
      summary: {
        hits: totalWindow,
        hitsAll: totalAll,
        uniqueIps: uniqueIps.size,
        online: onlineIps.size,
      },
      topPages,
      topReferrers,
      visits: visits.map((v) => ({
        id: v.id,
        ip: v.ip,
        path: v.path,
        referrer: v.referrer,
        userAgent: v.userAgent,
        country: v.country,
        enteredAt: v.enteredAt,
        leftAt: v.leftAt,
        hitCount: v.hitCount,
        online: !v.leftAt || v.leftAt.getTime() > Date.now() - 5 * 60_000,
      })),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Analitik alınamadı";
    // Table may not exist yet on cold DB
    return NextResponse.json({
      ok: true,
      summary: { hits: 0, hitsAll: 0, uniqueIps: 0, online: 0 },
      topPages: [],
      topReferrers: [],
      visits: [],
      warning: message,
    });
  }
}
