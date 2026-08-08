import { prisma } from "@/lib/db";
import { applyMarkup, fetchSmmServices, smmConfig } from "@/lib/smm/client";

export async function syncSmmServices() {
  const { markupPercent } = smmConfig();
  const raw = await fetchSmmServices();
  const now = new Date();
  const seen = new Set<number>();

  let upserted = 0;
  const batchSize = 40;
  for (let i = 0; i < raw.length; i += batchSize) {
    const chunk = raw.slice(i, i + batchSize);
    await Promise.all(
      chunk.map(async (s) => {
        const providerServiceId = Number(s.service);
        if (!Number.isFinite(providerServiceId)) return;
        seen.add(providerServiceId);
        const rate = Number(s.rate) || 0;
        const sellRate = applyMarkup(rate, markupPercent);
        await prisma.smmService.upsert({
          where: { providerServiceId },
          create: {
            providerServiceId,
            name: String(s.name || "").slice(0, 500),
            type: String(s.type || "Default").slice(0, 80),
            category: String(s.category || "Diğer").slice(0, 240),
            rate,
            sellRate,
            min: Number(s.min) || 1,
            max: Number(s.max) || 1000000,
            dripfeed: Boolean(s.dripfeed),
            refill: Boolean(s.refill),
            cancel: Boolean(s.cancel),
            active: true,
            syncedAt: now,
          },
          update: {
            name: String(s.name || "").slice(0, 500),
            type: String(s.type || "Default").slice(0, 80),
            category: String(s.category || "Diğer").slice(0, 240),
            rate,
            sellRate,
            min: Number(s.min) || 1,
            max: Number(s.max) || 1000000,
            dripfeed: Boolean(s.dripfeed),
            refill: Boolean(s.refill),
            cancel: Boolean(s.cancel),
            active: true,
            syncedAt: now,
          },
        });
        upserted += 1;
      })
    );
  }

  // Deactivate missing services
  const existing = await prisma.smmService.findMany({
    select: { id: true, providerServiceId: true },
  });
  const staleIds = existing
    .filter((e) => !seen.has(e.providerServiceId))
    .map((e) => e.id);
  if (staleIds.length) {
    await prisma.smmService.updateMany({
      where: { id: { in: staleIds } },
      data: { active: false },
    });
  }

  const categories = await prisma.smmService.groupBy({
    by: ["category"],
    where: { active: true },
    _count: { _all: true },
  });

  return {
    totalFromApi: raw.length,
    upserted,
    deactivated: staleIds.length,
    categories: categories.length,
    markupPercent,
    syncedAt: now.toISOString(),
  };
}

export async function ensureSmmCatalogSeeded() {
  const count = await prisma.smmService.count({ where: { active: true } });
  if (count > 0) return { seeded: false, count };
  if (!smmConfig().key) return { seeded: false, count: 0 };
  const result = await syncSmmServices();
  return { seeded: true, count: result.upserted, result };
}
