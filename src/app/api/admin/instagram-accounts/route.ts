import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const accounts = await prisma.instagramConnection.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  const analysisCounts = await prisma.analysisRun.groupBy({
    by: ["connectionId"],
    _count: { _all: true },
  });
  const countMap = new Map(
    analysisCounts
      .filter((a) => a.connectionId)
      .map((a) => [a.connectionId!, a._count._all])
  );

  return NextResponse.json({
    accounts: accounts.map((a) => ({
      id: a.id,
      // No profile photo URL from API in current schema — placeholder only
      profilePhoto: null,
      username: a.igUsername,
      accountType: a.accountType,
      igUserId: a.igUserId,
      metaUserId: a.metaUserId,
      connected: a.connected,
      status: a.connected
        ? a.tokenStatus === "active"
          ? "active"
          : a.tokenStatus
        : "disconnected",
      connectedAt: a.createdAt.toISOString(),
      lastSync: a.lastCheckedAt?.toISOString() ?? a.updatedAt.toISOString(),
      analysisCount: countMap.get(a.id) || 0,
      lastApiError: a.lastApiError,
      // never: access tokens
    })),
  });
}
