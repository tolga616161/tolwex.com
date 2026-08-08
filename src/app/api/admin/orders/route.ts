import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const orders = await prisma.smmOrder.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: {
      member: { select: { id: true, username: true, email: true } },
      service: { select: { id: true, name: true, providerServiceId: true } },
    },
  });

  return NextResponse.json({ ok: true, orders });
}
