import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const tickets = await prisma.supportTicket.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: { member: { select: { id: true, username: true, email: true } } },
  });

  return NextResponse.json({ ok: true, tickets });
}

export async function PATCH(request: NextRequest) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    status?: string;
    reply?: string;
  };

  if (!body.id) {
    return NextResponse.json({ error: "id gerekli." }, { status: 400 });
  }

  const ticket = await prisma.supportTicket.update({
    where: { id: body.id },
    data: {
      ...(body.status ? { status: body.status } : {}),
      ...(body.reply !== undefined ? { reply: body.reply.trim() } : {}),
    },
  });

  return NextResponse.json({ ok: true, ticket });
}
