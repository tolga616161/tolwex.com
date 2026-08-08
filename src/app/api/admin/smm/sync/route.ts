import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { writeAuditLog } from "@/lib/audit";
import { fetchSmmBalance, smmConfig } from "@/lib/smm/client";
import { recalculateSellRates, syncSmmServices } from "@/lib/smm/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const { prisma } = await import("@/lib/db");
  const [count, categories, last] = await Promise.all([
    prisma.smmService.count({ where: { active: true } }),
    prisma.smmService.groupBy({
      by: ["category"],
      where: { active: true },
      _count: { _all: true },
    }),
    prisma.smmService.findFirst({
      orderBy: { syncedAt: "desc" },
      select: { syncedAt: true },
    }),
  ]);

  let balance: { balance: string; currency: string } | null = null;
  let balanceError: string | null = null;
  try {
    if (smmConfig().key) balance = await fetchSmmBalance();
  } catch (e) {
    balanceError = e instanceof Error ? e.message : "Bakiye alınamadı";
  }

  return NextResponse.json({
    configured: Boolean(smmConfig().key),
    markupPercent: smmConfig().markupPercent,
    activeServices: count,
    categories: categories.length,
    lastSyncedAt: last?.syncedAt?.toISOString() || null,
    balance,
    balanceError,
  });
}

export async function POST(request: Request) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  try {
    const url = new URL(request.url);
    if (url.searchParams.get("reprice") === "1") {
      const result = await recalculateSellRates();
      await writeAuditLog({
        action: "smm.reprice",
        actorType: "admin",
        metadata: result,
      });
      return NextResponse.json({ ok: true, ...result });
    }

    const result = await syncSmmServices();
    await writeAuditLog({
      action: "smm.sync",
      actorType: "admin",
      metadata: result,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync başarısız";
    await writeAuditLog({
      action: "smm.sync_error",
      actorType: "admin",
      metadata: { message },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
