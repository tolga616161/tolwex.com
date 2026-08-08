import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;

  const items = await prisma.adminNotification.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    notifications: items.map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      level: n.level,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => ({}));
  if (body.markAllRead) {
    await prisma.adminNotification.updateMany({ data: { read: true } });
    return NextResponse.json({ ok: true });
  }
  if (body.id) {
    await prisma.adminNotification.update({
      where: { id: String(body.id) },
      data: { read: true },
    });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Geçersiz" }, { status: 400 });
}
