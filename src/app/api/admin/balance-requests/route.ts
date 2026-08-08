import { NextRequest, NextResponse } from "next/server";
import { ensureDbHydrated, prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";
import { adjustBalance } from "@/lib/member";
import { pullPaymentsFromGist, pushPaymentsToGist } from "@/lib/payments-durable";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureDbHydrated(true);
  await pullPaymentsFromGist();
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
  await ensureDbHydrated(true);
  await pullPaymentsFromGist();
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
  if (body.status !== "approved" && body.status !== "rejected") {
    return NextResponse.json({ error: "Geçersiz status." }, { status: 400 });
  }

  try {
    // Atomic claim: only one worker can move pending → decided
    const claimed = await prisma.balanceRequest.updateMany({
      where: { id: body.id, status: "pending" },
      data: {
        status: body.status,
        adminNote: body.adminNote?.trim() || "",
        updatedAt: new Date(),
      },
    });

    if (claimed.count === 0) {
      const existing = await prisma.balanceRequest.findUnique({ where: { id: body.id } });
      if (!existing) {
        return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
      }
      return NextResponse.json({ error: "Talep zaten işlenmiş." }, { status: 400 });
    }

    const item = await prisma.balanceRequest.findUnique({ where: { id: body.id } });
    if (!item) {
      return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
    }

    if (body.status === "approved") {
      await adjustBalance(
        item.memberId,
        item.amount,
        "deposit",
        body.adminNote?.trim() || `Ödeme bildirimi onaylandı`,
        item.id
      );
    }

    await pushPaymentsToGist();

    const updated = await prisma.balanceRequest.findUnique({
      where: { id: item.id },
      include: { member: { select: { id: true, username: true, email: true } } },
    });

    return NextResponse.json({ ok: true, item: updated });
  } catch (e) {
    const message = e instanceof Error ? e.message : "İşlem hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
