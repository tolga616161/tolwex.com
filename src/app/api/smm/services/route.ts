import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { applyMarkup, smmConfig } from "@/lib/smm/client";
import { ensureSmmCatalogFresh } from "@/lib/smm/sync";
import {
  detectPlatform,
  filterCategoriesForPlatform,
  type PlatformId,
} from "@/lib/platforms";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PLATFORM_IDS = new Set([
  "ig",
  "tt",
  "yt",
  "tw",
  "fb",
  "sc",
  "in",
  "pt",
  "tg",
  "web",
  "other",
]);

export async function GET(req: NextRequest) {
  let syncError: string | undefined;
  try {
    const force = req.nextUrl.searchParams.get("sync") === "1";
    await ensureSmmCatalogFresh(force ? 0 : undefined);
  } catch (e) {
    syncError = e instanceof Error ? e.message : "SMM sync hatası";
  }

  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim();
  const category = (sp.get("category") || "").trim();
  const platformRaw = (sp.get("platform") || "").trim();
  const platform = (PLATFORM_IDS.has(platformRaw) ? platformRaw : "") as PlatformId | "";
  const page = Math.max(1, Number(sp.get("page") || 1));
  const pageSize = Math.min(500, Math.max(10, Number(sp.get("pageSize") || 40)));

  // Category order = first appearance in smmapi list (min sortOrder)
  const catAgg = await prisma.smmService.groupBy({
    by: ["category"],
    where: { active: true },
    _count: { _all: true },
    _min: { sortOrder: true },
  });
  const categoryRows = catAgg
    .map((c) => ({
      name: c.category,
      count: c._count._all,
      sortOrder: c._min.sortOrder ?? 0,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "tr"));

  let categoryFilter: string | { in: string[] } | undefined = category || undefined;
  if (!category && platform) {
    const names = filterCategoriesForPlatform(categoryRows, platform).map((c) => c.name);
    if (names.length) {
      categoryFilter = { in: names };
    } else {
      categoryFilter = { in: ["__none__"] };
    }
  }

  const where = {
    active: true,
    ...(categoryFilter
      ? typeof categoryFilter === "string"
        ? { category: categoryFilter }
        : { category: categoryFilter }
      : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { category: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.smmService.count({ where }),
    prisma.smmService.findMany({
      where,
      // Exact smmapi services[] order
      orderBy: [{ sortOrder: "asc" }, { providerServiceId: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        providerServiceId: true,
        name: true,
        description: true,
        category: true,
        type: true,
        rate: true,
        sellRate: true,
        min: true,
        max: true,
        sortOrder: true,
        dripfeed: true,
        refill: true,
        cancel: true,
      },
    }),
  ]);

  const markup = smmConfig().markupPercent;
  const filteredCats = platform
    ? filterCategoriesForPlatform(categoryRows, platform)
    : categoryRows;

  return NextResponse.json({
    page,
    pageSize,
    total,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    markupPercent: markup,
    syncError,
    platform: platform || null,
    categories: filteredCats.map(({ name, count, sortOrder }) => ({
      name,
      count,
      sortOrder,
    })),
    // Always expose full category list for platform picker counts
    allCategories: categoryRows.map(({ name, count, sortOrder }) => ({
      name,
      count,
      sortOrder,
    })),
    items: items.map((item) => ({
      ...item,
      platform: detectPlatform(item.category || item.name),
      sellRate: applyMarkup(item.rate, markup),
    })),
  });
}
