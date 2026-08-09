import { prisma } from "@/lib/db";
import {
  applyMarkup,
  fetchSmmServices,
  serviceDescriptionFromRaw,
  smmConfig,
  type SmmRawService,
} from "@/lib/smm/client";

let syncing: Promise<Awaited<ReturnType<typeof syncSmmServices>>> | null = null;

function clampMax(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1_000_000;
  // SQLite/Prisma Int safe range; provider sometimes sends INT_MAX
  return Math.min(Math.floor(n), 2_000_000_000);
}

function clampMin(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(Math.floor(n), 2_000_000_000);
}

export function rowFromRaw(s: SmmRawService, sortOrder: number, now = new Date()) {
  const { markupPercent } = smmConfig();
  const providerServiceId = Number(s.service);
  const rate = Number(s.rate) || 0;
  return {
    providerServiceId,
    name: String(s.name || "").slice(0, 500),
    description: serviceDescriptionFromRaw(s),
    type: String(s.type || "Default").slice(0, 80),
    category: String(s.category || "Diğer").slice(0, 240),
    rate,
    sellRate: applyMarkup(rate, markupPercent),
    min: clampMin(s.min),
    max: clampMax(s.max),
    sortOrder,
    dripfeed: Boolean(s.dripfeed),
    refill: Boolean(s.refill),
    cancel: Boolean(s.cancel),
    active: true,
    syncedAt: now,
  };
}

/** Upsert one provider service (used when order hits a cold /tmp DB). */
export async function upsertServiceFromRaw(s: SmmRawService, sortOrder = 0) {
  const providerServiceId = Number(s.service);
  if (!Number.isFinite(providerServiceId)) return null;
  const data = rowFromRaw(s, sortOrder);
  return prisma.smmService.upsert({
    where: { providerServiceId },
    create: data,
    update: {
      name: data.name,
      description: data.description,
      type: data.type,
      category: data.category,
      rate: data.rate,
      sellRate: data.sellRate,
      min: data.min,
      max: data.max,
      sortOrder: data.sortOrder,
      dripfeed: data.dripfeed,
      refill: data.refill,
      cancel: data.cancel,
      active: true,
      syncedAt: data.syncedAt,
    },
  });
}

/** Recompute sellRate = rate + %markup, 2-decimal ceil — no provider call. */
export async function recalculateSellRates() {
  const { markupPercent } = smmConfig();
  const all = await prisma.smmService.findMany({ select: { id: true, rate: true } });
  const batchSize = 100;
  for (let i = 0; i < all.length; i += batchSize) {
    const chunk = all.slice(i, i + batchSize);
    await Promise.all(
      chunk.map((s) =>
        prisma.smmService.update({
          where: { id: s.id },
          data: { sellRate: applyMarkup(s.rate, markupPercent) },
        })
      )
    );
  }
  return { updated: all.length, markupPercent };
}

export async function syncSmmServices() {
  const raw = await fetchSmmServices();
  const now = new Date();
  const seen = new Set<number>();

  let upserted = 0;
  const batchSize = 50;
  // Preserve exact smmapi array order via sortOrder = index
  for (let i = 0; i < raw.length; i += batchSize) {
    const chunk = raw.slice(i, i + batchSize);
    await Promise.all(
      chunk.map(async (s, j) => {
        const providerServiceId = Number(s.service);
        if (!Number.isFinite(providerServiceId)) return;
        seen.add(providerServiceId);
        const sortOrder = i + j;
        const data = rowFromRaw(s, sortOrder, now);
        await prisma.smmService.upsert({
          where: { providerServiceId },
          create: data,
          update: {
            name: data.name,
            description: data.description,
            type: data.type,
            category: data.category,
            rate: data.rate,
            sellRate: data.sellRate,
            min: data.min,
            max: data.max,
            sortOrder: data.sortOrder,
            dripfeed: data.dripfeed,
            refill: data.refill,
            cancel: data.cancel,
            active: true,
            syncedAt: data.syncedAt,
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
    markupPercent: smmConfig().markupPercent,
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
  // Also re-sync when sortOrder never populated (pre-order migration)
  const ordered = await prisma.smmService.count({
    where: { active: true, sortOrder: { gt: 0 } },
  });
  const needs =
    count === 0 ||
    count < 50 ||
    age > maxAgeMs ||
    (count > 50 && ordered < Math.min(20, count));
  if (!needs) return { synced: false, count, ageMs: age };

  if (!smmConfig().key) {
    return { synced: false, count, ageMs: age, error: "SMM_API_KEY yok" };
  }

  if (!syncing) {
    syncing = syncSmmServices()
      .catch((e) => {
        console.error("smm_sync_failed", e instanceof Error ? e.message : e);
        throw e;
      })
      .finally(() => {
        syncing = null;
      });
  }
  const result = await syncing;
  return { synced: true, count: result.upserted, result };
}

/** Find provider service in live smmapi list and upsert locally. */
export async function ensureProviderService(providerServiceId: number) {
  const existing = await prisma.smmService.findFirst({
    where: { providerServiceId, active: true },
  });
  if (existing) return existing;

  const raw = await fetchSmmServices();
  const idx = raw.findIndex((s) => Number(s.service) === providerServiceId);
  if (idx < 0) return null;
  return upsertServiceFromRaw(raw[idx], idx);
}
