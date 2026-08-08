import { NextRequest, NextResponse } from "next/server";
import { ensureDbHydrated, prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";
import { adjustBalance } from "@/lib/member";
import { flushDurableDbPush } from "@/lib/db-sync";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDbHydrated();
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const items = await prisma.balanceRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { member: { select: { id: true, username: true, email: true } } },
  });

  return NextResponse.json({ ok: true, items });
}

export async function PATCH(request: NextRequest) {
  await ensureDbHydrated();
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    status?: "approved" | "rejected";
    adminNote?: string;
  };

  if (!body.id || !body.status) {
    return NextResponse.json({ error: "id ve status gerekli." }, { status: 400 });
  }

  const item = await prisma.balanceRequest.findUnique({ where: { id: body.id } });
  if (!item) {
    return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
  }
  if (item.status !== "pending") {
    return NextResponse.json({ error: "Talep zaten işlenmiş." }, { status: 400 });
  }

  if (body.status === "approved") {
    await adjustBalance(
      item.memberId,
      item.amount,
      "deposit",
      body.adminNote?.trim() || `Bakiye talebi onaylandı`,
      item.id
    );
  }

  const updated = await prisma.balanceRequest.update({
    where: { id: item.id },
    data: {
      status: body.status,
      adminNote: body.adminNote?.trim() || item.adminNote,
    },
  });

  await flushDurableDbPush();
  return NextResponse.json({ ok: true, item: updated });
}
