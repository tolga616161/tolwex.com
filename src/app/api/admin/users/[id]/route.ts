import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;

  const session = await prisma.visitorSession.findUnique({
    where: { id },
    include: { connection: true, checklist: true },
  });
  if (!session) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  const analyses = await prisma.analysisRun.findMany({
    where: { visitorSessionId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const logs = await prisma.auditLog.findMany({
    where: { actorId: id },
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  const c = session.connection;

  return NextResponse.json({
    profile: {
      id: session.id,
      createdAt: session.createdAt.toISOString(),
      lastSeen: session.updatedAt.toISOString(),
      platform: c ? "instagram" : null,
    },
    connections: c
      ? [
          {
            id: c.id,
            igUsername: c.igUsername,
            accountType: c.accountType,
            connected: c.connected,
            tokenStatus: c.tokenStatus,
            connectedAt: c.createdAt.toISOString(),
            lastCheckedAt: c.lastCheckedAt?.toISOString() ?? null,
            disconnectedAt: c.disconnectedAt?.toISOString() ?? null,
            grantedScopes: safeParse(c.grantedScopes),
            // tokens NEVER returned
          },
        ]
      : [],
    checklist: session.checklist,
    analysisHistory: analyses.map((a) => ({
      id: a.id,
      type: a.type,
      status: a.status,
      mode: a.mode,
      summary: a.summary,
      createdAt: a.createdAt.toISOString(),
      completedAt: a.completedAt?.toISOString() ?? null,
    })),
    activity: logs.map((l) => ({
      id: l.id,
      action: l.action,
      createdAt: l.createdAt.toISOString(),
      metadata: safeParse(l.metadata),
    })),
    servicesUsed: [...new Set(analyses.map((a) => a.type))],
  });
}

function safeParse(raw: string) {
  try {
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}
