import { prisma } from "@/lib/db";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number) {
  const x = startOfDay();
  x.setDate(x.getDate() - n);
  return x;
}

/** Aggregate real DB metrics for SaaS admin dashboard — never invents counts. */
export async function getAdminDashboardStats() {
  const today = startOfDay();
  const [
    totalUsers,
    activeUsers,
    igConnected,
    totalAnalyses,
    todayAnalyses,
    metaRow,
    productsActive,
    leadsNew,
    unreadNotifs,
  ] = await Promise.all([
    prisma.visitorSession.count(),
    prisma.visitorSession.count({
      where: { updatedAt: { gte: daysAgo(7) } },
    }),
    prisma.instagramConnection.count({ where: { connected: true } }),
    prisma.analysisRun.count(),
    prisma.analysisRun.count({ where: { createdAt: { gte: today } } }),
    prisma.metaConfig.findFirst({ orderBy: { updatedAt: "desc" } }),
    prisma.product.count({ where: { active: true } }),
    prisma.orderLead.count({ where: { status: "new" } }),
    prisma.adminNotification.count({ where: { read: false } }),
  ]);

  const apiStatus =
    metaRow?.lastTestOk === true
      ? "CONNECTED"
      : metaRow?.lastTestOk === false
        ? "ERROR"
        : "NOT CONNECTED";

  const growth = await buildDailySeries(14, async (from, to) =>
    prisma.visitorSession.count({
      where: { createdAt: { gte: from, lt: to } },
    })
  );

  const analysesSeries = await buildDailySeries(14, async (from, to) =>
    prisma.analysisRun.count({
      where: { createdAt: { gte: from, lt: to } },
    })
  );

  const connectionsSeries = await buildDailySeries(14, async (from, to) =>
    prisma.instagramConnection.count({
      where: { createdAt: { gte: from, lt: to }, connected: true },
    })
  );

  const activeSeries = await buildDailySeries(14, async (from, to) =>
    prisma.visitorSession.count({
      where: { updatedAt: { gte: from, lt: to } },
    })
  );

  const serviceUsage = await prisma.analysisRun.groupBy({
    by: ["type"],
    _count: { _all: true },
    orderBy: { _count: { type: "desc" } },
  });

  const recentLogs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  return {
    cards: {
      totalUsers,
      activeUsers,
      igConnected,
      totalAnalyses,
      todayAnalyses,
      apiStatus,
      productsActive,
      leadsNew,
      unreadNotifs,
    },
    charts: {
      userGrowth: growth,
      dailyAnalyses: analysesSeries,
      igConnections: connectionsSeries,
      activeUsers: activeSeries,
      serviceUsage: serviceUsage.map((s) => ({
        type: s.type,
        count: s._count._all,
      })),
    },
    activity: recentLogs.map((l) => ({
      id: l.id,
      action: l.action,
      actorType: l.actorType,
      actorId: l.actorId,
      metadata: safeJson(l.metadata),
      createdAt: l.createdAt.toISOString(),
      label: humanizeAction(l.action),
    })),
  };
}

async function buildDailySeries(
  days: number,
  counter: (from: Date, to: Date) => Promise<number>
) {
  const out: Array<{ date: string; value: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const from = daysAgo(i);
    const to = daysAgo(i - 1);
    const value = await counter(from, to);
    out.push({ date: from.toISOString().slice(0, 10), value });
  }
  return out;
}

function safeJson(raw: string) {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

function humanizeAction(action: string): string {
  const map: Record<string, string> = {
    "oauth.start": "OAuth başlatıldı",
    "oauth.connected": "Kullanıcı bağlandı",
    "oauth.denied": "OAuth reddedildi",
    "oauth.disconnected": "Bağlantı kesildi",
    "admin.meta_config_saved": "Meta bağlantısı yapılandırıldı",
    "admin.login": "Admin girişi",
    "admin.product_upsert": "Hizmet güncellendi",
    "meta.test.ok": "Meta bağlantı testi başarılı",
    "meta.test.fail": "API hatası",
    "analysis.started": "Analiz başlatıldı",
    "analysis.completed": "Analiz tamamlandı",
    "analysis.insufficient": "Analiz — yetersiz veri",
  };
  return map[action] || action;
}
