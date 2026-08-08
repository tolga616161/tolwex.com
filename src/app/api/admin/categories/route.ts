import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const grouped = await prisma.smmService.groupBy({
    by: ["category"],
    _count: { _all: true },
    orderBy: { category: "asc" },
  });

  const activeCounts = await prisma.smmService.groupBy({
    by: ["category"],
    where: { active: true },
    _count: { _all: true },
  });
  const activeMap = new Map(activeCounts.map((c) => [c.category, c._count._all]));

  return NextResponse.json({
    ok: true,
    categories: grouped.map((g) => ({
      name: g.category || "Diğer",
      total: g._count._all,
      active: activeMap.get(g.category) || 0,
    })),
  });
}
