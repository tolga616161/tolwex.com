import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { placeMemberOrder } from "@/lib/smm/place-order";
import { fetchSmmMultiStatus, fetchSmmOrderStatus } from "@/lib/smm/client";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

async function memberByKey(key: string | null) {
  if (!key) return null;
  return prisma.member.findFirst({ where: { apiKey: key, active: true } });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const form = await req.formData().catch(() => null);
  const json = form ? null : await req.json().catch(() => null);

  const get = (k: string) => {
    if (form) {
      const v = form.get(k);
      return v == null ? "" : String(v);
    }
    if (json && typeof json === "object") {
      const v = (json as Record<string, unknown>)[k];
      return v == null ? "" : String(v);
    }
    return "";
  };

  const key = get("key");
  const action = get("action");
  const rl = rateLimit(`api-v1:${key || ip}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Rate limit" }, { status: 429 });
  }

  const member = await memberByKey(key);
  if (!member) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  if (action === "balance") {
    return NextResponse.json({ balance: member.balance.toFixed(2), currency: "TRY" });
  }

  if (action === "services") {
    const services = await prisma.smmService.findMany({
      where: { active: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
      take: 5000,
    });
    return NextResponse.json(
      services.map((s) => ({
        service: s.providerServiceId,
        name: s.name,
        type: s.type,
        category: s.category,
        rate: s.sellRate,
        min: s.min,
        max: s.max,
        dripfeed: s.dripfeed,
        refill: s.refill,
        cancel: s.cancel,
      }))
    );
  }

  if (action === "add") {
    const service = Number(get("service"));
    const link = get("link");
    const quantity = Number(get("quantity"));
    const comments = get("comments") || undefined;
    const runs = get("runs") ? Number(get("runs")) : undefined;
    const interval = get("interval") ? Number(get("interval")) : undefined;
    try {
      const order = await placeMemberOrder({
        memberId: member.id,
        providerServiceId: service,
        link,
        quantity,
        comments,
        dripfeedRuns: runs,
        dripfeedInterval: interval,
      });
      return NextResponse.json({ order: order.providerOrderId || order.id });
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : "Order failed" },
        { status: 400 }
      );
    }
  }

  if (action === "status") {
    const orderId = get("order");
    const orders = get("orders");
    if (orders) {
      const ids = orders.split(",").map((x) => x.trim()).filter(Boolean);
      const owned = await prisma.smmOrder.findMany({
        where: {
          memberId: member.id,
          OR: [{ providerOrderId: { in: ids } }, { id: { in: ids } }],
        },
      });
      const map: Record<string, unknown> = {};
      for (const o of owned) {
        const k = o.providerOrderId || o.id;
        map[k] = {
          charge: o.charge.toFixed(5),
          start_count: o.startCounter ?? 0,
          status: o.status,
          remains: o.remains ?? "",
          currency: "TRY",
        };
      }
      // refresh from provider when possible
      const providerIds = owned.map((o) => o.providerOrderId).filter(Boolean) as string[];
      if (providerIds.length) {
        try {
          const live = await fetchSmmMultiStatus(providerIds);
          Object.assign(map, live);
        } catch {
          /* keep local */
        }
      }
      return NextResponse.json(map);
    }
    if (!orderId) {
      return NextResponse.json({ error: "order required" }, { status: 400 });
    }
    const order = await prisma.smmOrder.findFirst({
      where: {
        memberId: member.id,
        OR: [{ providerOrderId: orderId }, { id: orderId }],
      },
    });
    if (!order) return NextResponse.json({ error: "Incorrect order ID" }, { status: 404 });
    if (order.providerOrderId) {
      try {
        const live = await fetchSmmOrderStatus(order.providerOrderId);
        return NextResponse.json(live);
      } catch {
        /* fallthrough */
      }
    }
    return NextResponse.json({
      charge: order.charge.toFixed(5),
      start_count: order.startCounter ?? 0,
      status: order.status,
      remains: order.remains ?? "",
      currency: "TRY",
    });
  }

  return NextResponse.json({ error: "Incorrect request" }, { status: 400 });
}
