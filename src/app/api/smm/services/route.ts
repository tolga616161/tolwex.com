import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSmmCatalogSeeded } from "@/lib/smm/sync";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await ensureSmmCatalogSeeded();
  } catch {
    // catalog may stay empty if key missing
  }

  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim();
  const category = (sp.get("category") || "").trim();
  const page = Math.max(1, Number(sp.get("page") || 1));
  const pageSize = Math.min(100, Math.max(10, Number(sp.get("pageSize") || 40)));

  const where = {
    active: true,
    ...(category ? { category } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q } },
            { category: { contains: q } },
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

  return NextResponse.json({
    page,
    pageSize,
    total,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    categories: categories.map((c) => ({
      name: c.category,
      count: c._count._all,
    })),
    items,
  });
}
