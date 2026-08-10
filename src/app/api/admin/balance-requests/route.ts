import { NextRequest, NextResponse } from "next/server";
import { ensureDbHydrated, prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";
import { adjustBalance } from "@/lib/member";
import { pullPaymentsFromGist, pushPaymentsToGist } from "@/lib/payments-durable";
import { IBAN_APPROVE_BONUS_TRY, ibanDepositBonus } from "@/lib/welcome-bonus";
import { writeAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";

function isIbanMethod(method: string) {
  const m = (method || "").toLowerCase();
  return m === "bank_transfer" || m === "whatsapp" || m === "havale" || m === "eft";
}

export async function GET() {
  try {
    await ensureDbHydrated(true);
    const gate = await requireAdminApi();
    if (!gate.ok) return gate.response;

    await pullPaymentsFromGist({ force: true }).catch(() => null);

    const items = await prisma.balanceRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { member: { select: { id: true, username: true, email: true } } },
    });

    return NextResponse.json({
      ok: true,
      items,
      ibanApproveBonus: IBAN_APPROVE_BONUS_TRY,
      ibanBonusMinDeposit: 500,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Liste alınamadı";
    return NextResponse.json({ ok: false, error: message, items: [] }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await ensureDbHydrated(true);
    const gate = await requireAdminApi();
    if (!gate.ok) return gate.response;

    await pullPaymentsFromGist({ force: true }).catch(() => null);

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

    const before = await prisma.balanceRequest.findUnique({ where: { id: body.id } });
    if (!before) {
      return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
    }
    if (before.status !== "pending") {
      return NextResponse.json({ error: "Talep zaten işlenmiş." }, { status: 400 });
    }

    // Bonus: sadece IBAN ve en az 500₺ yatırıldıysa
    const ibanBonus =
      body.status === "approved" && isIbanMethod(before.method)
        ? ibanDepositBonus(before.amount)
        : 0;

    const noteExtra =
      ibanBonus > 0
        ? ` · IBAN hediye +${ibanBonus}₺ (≥500₺ yatırım)`
        : body.status === "approved" && isIbanMethod(before.method)
          ? " · hediye yok (<500₺)"
          : "";

    const claimed = await prisma.balanceRequest.updateMany({
      where: { id: body.id, status: "pending" },
      data: {
        status: body.status,
        adminNote: `${body.adminNote?.trim() || ""}${noteExtra}`.trim(),
        updatedAt: new Date(),
      },
    });

    if (claimed.count === 0) {
      return NextResponse.json({ error: "Talep zaten işlenmiş." }, { status: 400 });
    }

    const item = await prisma.balanceRequest.findUnique({ where: { id: body.id } });
    if (!item) {
      return NextResponse.json({ error: "Talep bulunamadı." }, { status: 404 });
    }

    let credited = 0;
    let bonusCredited = 0;

    if (body.status === "approved") {
      await adjustBalance(
        item.memberId,
        item.amount,
        "deposit",
        body.adminNote?.trim() || `Havale/EFT onay · ${item.amount.toFixed(2)}₺`,
        item.id
      );
      credited = item.amount;

      if (ibanBonus > 0) {
        await adjustBalance(
          item.memberId,
          ibanBonus,
          "bonus",
          `IBAN 500₺+ yatırım hediyesi +${ibanBonus}₺`,
          `${item.id}:iban-bonus`
        );
        bonusCredited = ibanBonus;
      }

      await writeAuditLog({
        action: "balance.approve",
        actorType: "admin",
        actorId: "admin",
        metadata: {
          requestId: item.id,
          memberId: item.memberId,
          amount: item.amount,
          method: item.method,
          ibanBonus: bonusCredited,
          total: credited + bonusCredited,
        },
      }).catch(() => null);
    }

    await pushPaymentsToGist().catch(() => null);

    const updated = await prisma.balanceRequest.findUnique({
      where: { id: item.id },
      include: { member: { select: { id: true, username: true, email: true, balance: true } } },
    });

    return NextResponse.json({
      ok: true,
      item: updated,
      credited,
      ibanBonus: bonusCredited,
      totalCredited: credited + bonusCredited,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "İşlem hatası";
    console.error("balance_approve_failed", message);
    return NextResponse.json(
      { error: "Onay işlemi tamamlanamadı — tekrar deneyin.", detail: message },
      { status: 500 }
    );
  }
}
