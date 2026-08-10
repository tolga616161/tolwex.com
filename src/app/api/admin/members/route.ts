import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { ensureDbHydrated, prisma } from "@/lib/db";
import { adjustBalance } from "@/lib/member";
import { pullMembersFromGist, pushMembersToGist } from "@/lib/members-durable";
import { z } from "zod";
import { formatPhoneDisplay } from "@/lib/welcome-bonus";

export async function GET() {
  try {
    const gate = await requireAdminApi();
    if (!gate.ok) return gate.response;
    await ensureDbHydrated(true);
    await pullMembersFromGist({ force: true }).catch(() => null);

    const members = await prisma.member.findMany({
      orderBy: { createdAt: "desc" },
      take: 300,
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        registerIp: true,
        balance: true,
        spent: true,
        active: true,
        welcomeBonusAt: true,
        createdAt: true,
        _count: { select: { orders: true, balanceRequests: true } },
      },
    });

    return NextResponse.json({
      ok: true,
      members: members.map((m) => ({
        ...m,
        phoneDisplay: m.phone ? formatPhoneDisplay(m.phone) : "",
        gotIbanBonus: Boolean(m.welcomeBonusAt),
      })),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Üyeler alınamadı";
    return NextResponse.json({ ok: false, error: message, members: [] }, { status: 500 });
  }
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

  try {
    if (parsed.data.balanceDelta !== undefined && parsed.data.balanceDelta !== 0) {
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
    await pushMembersToGist().catch(() => null);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Güncelleme hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
