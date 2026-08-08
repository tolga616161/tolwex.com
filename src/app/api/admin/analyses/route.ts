import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import { ANALYSIS_CATALOG, getAnalysisMeta } from "@/lib/analysis/honest";

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const type = req.nextUrl.searchParams.get("type");
  const runs = await prisma.analysisRun.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    catalog: ANALYSIS_CATALOG,
    runs: runs.map((r) => ({
      id: r.id,
      type: r.type,
      status: r.status,
      mode: r.mode,
      summary: r.summary,
      result: safe(r.resultJson),
      createdAt: r.createdAt.toISOString(),
      completedAt: r.completedAt?.toISOString() ?? null,
      meta: getAnalysisMeta(r.type),
    })),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => ({}));
  const type = String(body.type || "");
  const meta = getAnalysisMeta(type);
  if (!meta) {
    return NextResponse.json({ error: "Geçersiz analiz tipi" }, { status: 400 });
  }

  // Honest: create unavailable/insufficient run — never invent user lists
  const run = await prisma.analysisRun.create({
    data: {
      type,
      status: meta.apiProvidesUserList ? "pending" : "unavailable",
      mode: meta.mode,
      summary: meta.apiProvidesUserList
        ? "Analiz kuyruğa alındı"
        : "Instagram Graph API bu listeyi sağlamıyor — sahte sonuç üretilmedi.",
      resultJson: JSON.stringify({
        available: false,
        headline: meta.headline,
        explanation: meta.explanation,
        entries: [],
      }),
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, run });
}

function safe(raw: string) {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}
