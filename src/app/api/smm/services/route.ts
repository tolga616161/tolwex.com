import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { applyMarkup, smmConfig } from "@/lib/smm/client";
import { ensureSmmCatalogFresh } from "@/lib/smm/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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
  const page = Math.max(1, Number(sp.get("page") || 1));
  const pageSize = Math.min(500, Math.max(10, Number(sp.get("pageSize") || 40)));

  const where = {
    active: true,
    ...(category ? { category } : {}),
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

  const [total, items, categories] = await Promise.all([
    prisma.smmService.count({ where }),
    prisma.smmService.findMany({
      where,
      orderBy: [{ category: "asc" }, { sellRate: "asc" }],
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
        dripfeed: true,
        refill: true,
        cancel: true,
      },
    }),
    prisma.smmService.groupBy({
      by: ["category"],
      where: { active: true },
      _count: { _all: true },
      orderBy: { category: "asc" },
    }),
  ]);

  const markup = smmConfig().markupPercent;
  return NextResponse.json({
    page,
    pageSize,
    total,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    markupPercent: markup,
    syncError,
    categories: categories.map((c) => ({
      name: c.category,
      count: c._count._all,
    })),
    items: items.map((item) => ({
      ...item,
      // Always expose clean 2-decimal sell price (+%50)
      sellRate: applyMarkup(item.rate, markup),
    })),
  });
}
