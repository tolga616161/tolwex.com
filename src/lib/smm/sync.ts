import { prisma } from "@/lib/db";
import { applyMarkup, fetchSmmServices, smmConfig } from "@/lib/smm/client";

let syncing: Promise<Awaited<ReturnType<typeof syncSmmServices>>> | null = null;

export async function syncSmmServices() {
  const { markupPercent } = smmConfig();
  const raw = await fetchSmmServices();
  const now = new Date();
  const seen = new Set<number>();

  let upserted = 0;
  const batchSize = 50;
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

/** Single-flight sync — empty catalog or older than 6 hours. */
export async function ensureSmmCatalogFresh(maxAgeMs = 6 * 60 * 60 * 1000) {
  const count = await prisma.smmService.count({ where: { active: true } });
  const last = await prisma.smmService.findFirst({
    orderBy: { syncedAt: "desc" },
    select: { syncedAt: true },
  });
  const age = last ? Date.now() - last.syncedAt.getTime() : Number.POSITIVE_INFINITY;
  const needs = count === 0 || age > maxAgeMs;
  if (!needs) return { synced: false, count, ageMs: age };

  if (!smmConfig().key) {
    return { synced: false, count, ageMs: age, error: "SMM_API_KEY yok" };
  }

  if (!syncing) {
    syncing = syncSmmServices().finally(() => {
      syncing = null;
    });
  }
  const result = await syncing;
  return { synced: true, count: result.upserted, result };
}
