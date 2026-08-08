import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const take = Math.min(Number(req.nextUrl.searchParams.get("limit") || 100), 300);
  const action = req.nextUrl.searchParams.get("action");

  const logs = await prisma.auditLog.findMany({
    where: action ? { action: { contains: action } } : undefined,
    orderBy: { createdAt: "desc" },
    take,
  });

  return NextResponse.json({
    logs: logs.map((l) => ({
      id: l.id,
      action: l.action,
      actorType: l.actorType,
      actorId: l.actorId,
      metadata: (() => {
        try {
          return JSON.parse(l.metadata || "{}");
        } catch {
          return {};
        }
      })(),
      createdAt: l.createdAt.toISOString(),
    })),
  });
}
