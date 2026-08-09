import { prisma } from "@/lib/db";
import { adjustBalance } from "@/lib/member";
import { placeSmmOrder } from "@/lib/smm/client";
import { writeAuditLog } from "@/lib/audit";
import { ensureProviderService, ensureSmmCatalogFresh } from "@/lib/smm/sync";
import { upsertOrderInGist } from "@/lib/orders-durable";

export type PlaceOrderRequest = {
  memberId: string;
  serviceId?: string;
  providerServiceId?: number;
  link: string;
  quantity: number;
  comments?: string;
  dripfeedRuns?: number;
  dripfeedInterval?: number;
};

function providerIdFromInput(input: PlaceOrderRequest): number | null {
  if (input.providerServiceId != null && Number.isFinite(input.providerServiceId)) {
    return Number(input.providerServiceId);
  }
  if (input.serviceId) {
    const asNum = Number(input.serviceId);
    if (Number.isFinite(asNum) && String(asNum) === input.serviceId.trim()) return asNum;
  }
  return null;
}

async function findService(input: PlaceOrderRequest) {
  // providerServiceId is stable across Vercel /tmp SQLite instances; cuid is not
  const pid = providerIdFromInput(input);
  if (pid != null) {
    const byProvider = await prisma.smmService.findFirst({
      where: { providerServiceId: pid, active: true },
    });
    if (byProvider) return byProvider;
  }
  if (input.serviceId) {
    const byId = await prisma.smmService.findFirst({
      where: { id: input.serviceId, active: true },
    });
    if (byId) return byId;
  }
  return null;
}

export async function placeMemberOrder(input: PlaceOrderRequest) {
  const member = await prisma.member.findFirst({
    where: { id: input.memberId, active: true },
  });
  if (!member) throw Object.assign(new Error("Üye bulunamadı"), { status: 401 });

  let service = await findService(input);
  const pid = providerIdFromInput(input) ?? service?.providerServiceId ?? null;

  if (!service) {
    try {
      await ensureSmmCatalogFresh(0);
    } catch {
      // continue — try live provider lookup below
    }
    service = await findService(input);
  }

  // Cold Vercel instance: pull this exact service from smmapi and upsert
  if (!service && pid != null) {
    try {
      service = await ensureProviderService(pid);
    } catch (e) {
      console.error("ensure_provider_service_failed", e instanceof Error ? e.message : e);
    }
  }

  if (!service) {
    throw Object.assign(
      new Error(
        pid
          ? `Servis bulunamadı (API #${pid}) — smmapi’de yok veya senkron başarısız`
          : "Servis bulunamadı — sayfayı yenileyip servisi tekrar seç"
      ),
      { status: 404 }
    );
  }

  const runs = input.dripfeedRuns && input.dripfeedRuns > 1 ? input.dripfeedRuns : undefined;
  const interval =
    runs && input.dripfeedInterval && input.dripfeedInterval >= 1
      ? input.dripfeedInterval
      : undefined;

  if (runs && !service.dripfeed) {
    throw Object.assign(new Error("Bu serviste drip-feed yok"), { status: 400 });
  }

  const billQty = runs ? runs * input.quantity : input.quantity;
  if (billQty < service.min || billQty > service.max) {
    throw Object.assign(
      new Error(`Adet ${service.min} – ${service.max} arasında olmalı`),
      { status: 400 }
    );
  }

  const charge = Math.round(((service.sellRate * billQty) / 1000) * 100) / 100;
  const cost = Math.round(((service.rate * billQty) / 1000) * 100) / 100;

  if (member.balance < charge) {
    throw Object.assign(
      new Error(
        `Yetersiz bakiye. Gerekli: ${charge.toFixed(2)} ₺ · Bakiye: ${member.balance.toFixed(2)} ₺`
      ),
      { status: 402 }
    );
  }

  let providerOrderId: string | null = null;
  let status = "pending";
  let errorMessage: string | null = null;

  try {
    const placed = await placeSmmOrder({
      service: service.providerServiceId,
      link: input.link.trim(),
      quantity: input.quantity,
      comments: input.comments?.trim() || undefined,
      runs,
      interval,
    });
    providerOrderId = String(placed.order);
    status = "processing";
  } catch (e) {
    status = "error";
    errorMessage = e instanceof Error ? e.message : "Sipariş gönderilemedi";
  }

  if (status === "error") {
    const order = await prisma.smmOrder.create({
      data: {
        memberId: member.id,
        serviceId: service.id,
        providerServiceId: service.providerServiceId,
        serviceName: service.name,
        serviceType: service.type,
        link: input.link.trim(),
        quantity: billQty,
        charge,
        cost,
        status,
        providerOrderId,
        comments: input.comments?.trim() || "",
        dripfeedRuns: runs,
        dripfeedInterval: interval,
        errorMessage: errorMessage || undefined,
      },
    });
    await upsertOrderInGist(order.id).catch(() => null);
    await writeAuditLog({
      action: "smm.order_error",
      actorType: "visitor",
      actorId: member.id,
      metadata: { orderId: order.id },
    });
    throw Object.assign(new Error(errorMessage || "Sipariş başarısız"), {
      status: 502,
      order,
    });
  }

  await adjustBalance(member.id, -charge, "order", `Sipariş · ${service.name}`, "");
  await prisma.member.update({
    where: { id: member.id },
    data: { spent: { increment: charge } },
  });

  const order = await prisma.smmOrder.create({
    data: {
      memberId: member.id,
      serviceId: service.id,
      providerServiceId: service.providerServiceId,
      serviceName: service.name,
      serviceType: service.type,
      link: input.link.trim(),
      quantity: billQty,
      charge,
      cost,
      status,
      providerOrderId,
      comments: input.comments?.trim() || "",
      dripfeedRuns: runs,
      dripfeedInterval: interval,
    },
  });

  await prisma.walletTransaction.updateMany({
    where: { memberId: member.id, type: "order", refId: "" },
    data: { refId: order.id },
  });

  await upsertOrderInGist(order.id).catch(() => null);
  await writeAuditLog({
    action: "smm.order",
    actorType: "visitor",
    actorId: member.id,
    metadata: { orderId: order.id, providerServiceId: service.providerServiceId },
  });

  return order;
}
