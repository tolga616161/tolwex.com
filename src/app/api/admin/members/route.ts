import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { ensureDbHydrated, prisma } from "@/lib/db";
import { adjustBalance } from "@/lib/member";
import { pullMembersFromGist, pushMembersToGist } from "@/lib/members-durable";
import { z } from "zod";

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  await ensureDbHydrated(true);
  await pullMembersFromGist();
  const members = await prisma.member.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      username: true,
      email: true,
      name: true,
      phone: true,
      balance: true,
      active: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });
  return NextResponse.json({ members });
}

const patchSchema = z.object({
  id: z.string(),
  active: z.boolean().optional(),
  balanceDelta: z.number().optional(),
  note: z.string().max(200).optional(),
});

export async function PATCH(req: NextRequest) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz" }, { status: 400 });

  if (parsed.data.balanceDelta) {
    await adjustBalance(
      parsed.data.id,
      parsed.data.balanceDelta,
      "adjust",
      parsed.data.note || "Admin bakiye düzeltmesi"
    );
  }
  if (parsed.data.active !== undefined) {
    await prisma.member.update({
      where: { id: parsed.data.id },
      data: { active: parsed.data.active },
    });
  }
  await pushMembersToGist();
  return NextResponse.json({ ok: true });
}
