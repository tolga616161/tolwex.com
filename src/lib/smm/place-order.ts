import { prisma } from "@/lib/db";
import { adjustBalance } from "@/lib/member";
import { applyMarkup, placeSmmOrder, smmConfig } from "@/lib/smm/client";
import { writeAuditLog } from "@/lib/audit";
import { ensureProviderService, ensureSmmCatalogFresh } from "@/lib/smm/sync";
import { upsertOrderInGist } from "@/lib/orders-durable";
import { pullMembersFromGist, upsertMemberInGist } from "@/lib/members-durable";

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
  if (input.providerServiceId != null && Number.isFinite(Number(input.providerServiceId))) {
    return Number(input.providerServiceId);
  }
  if (input.serviceId) {
    const asNum = Number(input.serviceId);
    if (Number.isFinite(asNum) && String(asNum) === input.serviceId.trim()) return asNum;
  }
  return null;
}

async function findService(input: PlaceOrderRequest) {
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

async function resolveService(input: PlaceOrderRequest) {
  let service = await findService(input);
  const pid = providerIdFromInput(input) ?? service?.providerServiceId ?? null;

  if (!service) {
    try {
      await ensureSmmCatalogFresh(0);
    } catch {
      /* live lookup below */
    }
    service = await findService(input);
  }

  if (!service && pid != null) {
    try {
      service = await ensureProviderService(pid);
    } catch (e) {
      console.error("ensure_provider_service_failed", e instanceof Error ? e.message : e);
    }
  }

  return service;
}

export async function placeMemberOrder(input: PlaceOrderRequest) {
  // Fresh member wallet before debit (bypass TTL)
  await pullMembersFromGist({ force: true }).catch(() => null);

  let member = await prisma.member.findFirst({
    where: { id: input.memberId, active: true },
  });
  if (!member) {
    throw Object.assign(new Error("Üye bulunamadı — tekrar giriş yap"), { status: 401 });
  }

  const service = await resolveService(input);
  if (!service) {
    const pid = providerIdFromInput(input);
    throw Object.assign(
      new Error(
        pid
          ? `Servis bulunamadı (API #${pid}). Sayfayı yenile, servisi tekrar seç.`
          : "Servis seçilmedi. Sayfayı yenileyip servisi tekrar seç."
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

  const quantity = Math.floor(Number(input.quantity));
  if (!Number.isFinite(quantity) || quantity < 1) {
    throw Object.assign(new Error("Geçerli bir adet gir"), { status: 400 });
  }

  const billQty = runs ? runs * quantity : quantity;
  if (billQty < service.min || billQty > service.max) {
    throw Object.assign(
      new Error(`Adet ${service.min} – ${service.max} arasında olmalı`),
      { status: 400 }
    );
  }

  const link = input.link.trim();
  if (!link || !/^https?:\/\//i.test(link)) {
    throw Object.assign(new Error("Geçerli bir link gir (https://…)"), { status: 400 });
  }

  // Always charge from live markup formula (not stale sellRate alone)
  const sellRate = applyMarkup(service.rate, smmConfig().markupPercent);
  const charge = Math.round(((sellRate * billQty) / 1000) * 100) / 100;
  const cost = Math.round(((service.rate * billQty) / 1000) * 100) / 100;

  // Re-read balance after gist pull
  member = (await prisma.member.findFirst({
    where: { id: member.id, active: true },
  }))!;

  if (member.balance + 1e-9 < charge) {
    throw Object.assign(
      new Error(
        `Yetersiz bakiye. Gerekli: ${charge.toFixed(2)} ₺ · Bakiye: ${member.balance.toFixed(2)} ₺`
      ),
      { status: 402 }
    );
  }

  // Reserve balance BEFORE smmapi call (atomic) — refund if API fails
  const reserved = await prisma.member.updateMany({
    where: { id: member.id, active: true, balance: { gte: charge } },
    data: { balance: { decrement: charge }, spent: { increment: charge } },
  });
  if (reserved.count !== 1) {
    const fresh = await prisma.member.findFirst({ where: { id: member.id } });
    throw Object.assign(
      new Error(
        `Yetersiz bakiye. Gerekli: ${charge.toFixed(2)} ₺ · Bakiye: ${(fresh?.balance ?? 0).toFixed(2)} ₺`
      ),
      { status: 402 }
    );
  }

  const afterReserve = await prisma.member.findFirst({ where: { id: member.id } });
  if (afterReserve) {
    await prisma.walletTransaction.create({
      data: {
        memberId: member.id,
        type: "order",
        amount: -charge,
        balanceAfter: afterReserve.balance,
        note: `Sipariş · ${service.name}`,
        refId: "",
      },
    });
    await upsertMemberInGist(afterReserve).catch(() => null);
  }

  let providerOrderId: string | null = null;
  let errorMessage: string | null = null;

  try {
    let lastErr: unknown;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const placed = await placeSmmOrder({
          service: service.providerServiceId,
          link,
          quantity,
          comments: input.comments?.trim() || undefined,
          runs,
          interval,
        });
        const oid = placed?.order;
        if (oid === undefined || oid === null || oid === "") {
          throw new Error("SMM API sipariş numarası dönmedi");
        }
        providerOrderId = String(oid);
        lastErr = null;
        break;
      } catch (e) {
        lastErr = e;
        if (attempt === 0) await new Promise((r) => setTimeout(r, 400));
      }
    }
    if (lastErr) throw lastErr;
  } catch (e) {
    errorMessage = e instanceof Error ? e.message : "Sipariş gönderilemedi";
  }

  if (!providerOrderId) {
    // Refund reserved balance + undo spent
    await adjustBalance(
      member.id,
      charge,
      "refund",
      `İade · smmapi hata: ${errorMessage || "bilinmiyor"}`,
      ""
    );
    const afterRefund = await prisma.member
      .update({
        where: { id: member.id },
        data: { spent: { decrement: charge } },
      })
      .catch(() => null);
    if (afterRefund) await upsertMemberInGist(afterRefund).catch(() => null);

    const order = await prisma.smmOrder.create({
      data: {
        memberId: member.id,
        serviceId: service.id,
        providerServiceId: service.providerServiceId,
        serviceName: service.name,
        serviceType: service.type,
        link,
        quantity: billQty,
        charge,
        cost,
        status: "error",
        providerOrderId: null,
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
      metadata: { orderId: order.id, error: errorMessage },
    });
    throw Object.assign(new Error(errorMessage || "Sipariş smmapi’ye iletilemedi"), {
      status: 502,
      order,
    });
  }

  const order = await prisma.smmOrder.create({
    data: {
      memberId: member.id,
      serviceId: service.id,
      providerServiceId: service.providerServiceId,
      serviceName: service.name,
      serviceType: service.type,
      link,
      quantity: billQty,
      charge,
      cost,
      status: "processing",
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
    metadata: {
      orderId: order.id,
      providerServiceId: service.providerServiceId,
      providerOrderId,
    },
  });

  return order;
}
