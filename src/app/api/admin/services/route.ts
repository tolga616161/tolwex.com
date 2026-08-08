import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const category = searchParams.get("category")?.trim() || "";

  const services = await prisma.smmService.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q } },
                { category: { contains: q } },
              ],
            }
          : {},
        category ? { category } : {},
      ],
    },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    take: 5000,
  });

  return NextResponse.json({ ok: true, services, count: services.length });
}

export async function PATCH(request: NextRequest) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    active?: boolean;
    name?: string;
  };

  if (!body.id) {
    return NextResponse.json({ error: "id gerekli." }, { status: 400 });
  }

  const service = await prisma.smmService.update({
    where: { id: body.id },
    data: {
      ...(typeof body.active === "boolean" ? { active: body.active } : {}),
      ...(body.name ? { name: body.name.trim() } : {}),
    },
  });

  return NextResponse.json({ ok: true, service });
}
