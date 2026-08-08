import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin/auth";
import { placeSmmOrder, fetchSmmOrderStatus } from "@/lib/smm/client";
import { adjustBalance } from "@/lib/member";
import { writeAuditLog } from "@/lib/audit";

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

export async function PATCH(request: NextRequest) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;

  const body = (await request.json().catch(() => ({}))) as {
    id?: string;
    action?: "approve_retry" | "sync" | "set_status" | "refund";
    status?: string;
  };

  if (!body.id || !body.action) {
    return NextResponse.json({ error: "id ve action gerekli" }, { status: 400 });
  }

  const order = await prisma.smmOrder.findUnique({ where: { id: body.id } });
  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  }

  if (body.action === "set_status") {
    const status = (body.status || "").trim().toLowerCase();
    if (!status) {
      return NextResponse.json({ error: "status gerekli" }, { status: 400 });
    }
    const updated = await prisma.smmOrder.update({
      where: { id: order.id },
      data: { status },
    });
    await writeAuditLog({
      action: "admin.order_status",
      actorType: "admin",
      metadata: { orderId: order.id, status },
    });
    return NextResponse.json({ ok: true, order: updated });
  }

  if (body.action === "sync") {
    if (!order.providerOrderId) {
      return NextResponse.json({ error: "Provider sipariş ID yok" }, { status: 400 });
    }
    const remote = (await fetchSmmOrderStatus(order.providerOrderId)) as {
      status?: string;
      start_count?: string | number;
      remains?: string | number;
    };
    const status = String(remote.status || order.status).toLowerCase();
    const updated = await prisma.smmOrder.update({
      where: { id: order.id },
      data: {
        status,
        startCounter:
          remote.start_count != null ? Number(remote.start_count) : order.startCounter,
        remains: remote.remains != null ? Number(remote.remains) : order.remains,
      },
    });
    return NextResponse.json({ ok: true, order: updated });
  }

  if (body.action === "refund") {
    if (order.status === "refunded") {
      return NextResponse.json({ error: "Zaten iade edilmiş" }, { status: 400 });
    }
    await adjustBalance(
      order.memberId,
      order.charge,
      "refund",
      `Sipariş iadesi · ${order.serviceName}`,
      order.id
    );
    const updated = await prisma.smmOrder.update({
      where: { id: order.id },
      data: { status: "refunded" },
    });
    await writeAuditLog({
      action: "admin.order_refund",
      actorType: "admin",
      metadata: { orderId: order.id, amount: order.charge },
    });
    return NextResponse.json({ ok: true, order: updated });
  }

  if (body.action === "approve_retry") {
    if (order.providerOrderId && order.status !== "error" && order.status !== "pending") {
      return NextResponse.json(
        { error: "Bu sipariş zaten provider'a gönderilmiş" },
        { status: 400 }
      );
    }
    try {
      const qty = order.dripfeedRuns && order.dripfeedRuns > 1
        ? Math.round(order.quantity / order.dripfeedRuns)
        : order.quantity;
      const placed = await placeSmmOrder({
        service: order.providerServiceId,
        link: order.link,
        quantity: qty,
        comments: order.comments || undefined,
        runs: order.dripfeedRuns || undefined,
        interval: order.dripfeedInterval || undefined,
      });
      const updated = await prisma.smmOrder.update({
        where: { id: order.id },
        data: {
          providerOrderId: String(placed.order),
          status: "processing",
          errorMessage: null,
        },
      });
      await writeAuditLog({
        action: "admin.order_approve",
        actorType: "admin",
        metadata: { orderId: order.id, providerOrderId: String(placed.order) },
      });
      return NextResponse.json({ ok: true, order: updated });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Gönderilemedi";
      const updated = await prisma.smmOrder.update({
        where: { id: order.id },
        data: { status: "error", errorMessage: message },
      });
      return NextResponse.json({ error: message, order: updated }, { status: 502 });
    }
  }

  return NextResponse.json({ error: "Bilinmeyen action" }, { status: 400 });
}
