import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const sp = req.nextUrl.searchParams;
  const q = (sp.get("q") || "").trim().toLowerCase();
  const filter = sp.get("filter") || "all"; // all | active | passive | connected | disconnected
  const take = Math.min(Number(sp.get("limit") || 50), 200);

  const sessions = await prisma.visitorSession.findMany({
    orderBy: { updatedAt: "desc" },
    take: 500,
    include: {
      connection: true,
      checklist: true,
    },
  });

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  let rows = sessions.map((s) => {
    const c = s.connection;
    const connected = Boolean(c?.connected);
    const active = s.updatedAt >= weekAgo;
    return {
      id: s.id,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      lastSeen: s.updatedAt.toISOString(),
      active,
      connected,
      disconnected: Boolean(c?.disconnectedAt) && !connected,
      platform: c ? "instagram" : "—",
      igUsername: c?.igUsername || null,
      accountType: c?.accountType || null,
      tokenStatus: c?.tokenStatus || "none",
      // never expose tokens / secrets
      hasConnection: Boolean(c),
      email: null as string | null, // not collected
    };
  });

  if (q) {
    rows = rows.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        (r.igUsername || "").toLowerCase().includes(q.replace(/^@/, "")) ||
        r.platform.toLowerCase().includes(q)
    );
  }

  if (filter === "active") rows = rows.filter((r) => r.active);
  if (filter === "passive") rows = rows.filter((r) => !r.active);
  if (filter === "connected") rows = rows.filter((r) => r.connected);
  if (filter === "disconnected") rows = rows.filter((r) => r.disconnected);

  return NextResponse.json({
    total: rows.length,
    users: rows.slice(0, take),
  });
}
