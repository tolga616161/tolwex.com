import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { adjustBalance, requireMember } from "@/lib/member";
import { placeSmmOrder } from "@/lib/smm/client";
import { rateLimit } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";

const schema = z.object({
  serviceId: z.string().min(1),
  link: z.string().url().max(500),
  quantity: z.number().int().positive(),
});

export async function GET() {
  const member = await requireMember();
  if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const orders = await prisma.smmOrder.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const member = await requireMember();
  if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = rateLimit(`order-member:${member.id}:${ip}`, 12, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Çok fazla sipariş denemesi" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz sipariş" }, { status: 400 });
  }

  const service = await prisma.smmService.findFirst({
    where: { id: parsed.data.serviceId, active: true },
  });
  if (!service) {
    return NextResponse.json({ error: "Servis bulunamadı" }, { status: 404 });
  }
  if (parsed.data.quantity < service.min || parsed.data.quantity > service.max) {
    return NextResponse.json(
      { error: `Adet ${service.min} – ${service.max} arasında olmalı` },
      { status: 400 }
    );
  }

  const charge = Math.round(((service.sellRate * parsed.data.quantity) / 1000) * 10000) / 10000;
  const cost = Math.round(((service.rate * parsed.data.quantity) / 1000) * 10000) / 10000;

  if (member.balance < charge) {
    return NextResponse.json(
      { error: `Yetersiz bakiye. Gerekli: ${charge.toFixed(2)} ₺ · Bakiye: ${member.balance.toFixed(2)} ₺` },
      { status: 402 }
    );
  }

  let providerOrderId: string | null = null;
  let status = "pending";
  let errorMessage: string | null = null;

  try {
    const placed = await placeSmmOrder({
      service: service.providerServiceId,
      link: parsed.data.link.trim(),
      quantity: parsed.data.quantity,
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
        link: parsed.data.link.trim(),
        quantity: parsed.data.quantity,
        charge,
        cost,
        status,
        providerOrderId,
        errorMessage: errorMessage || undefined,
      },
    });
    await writeAuditLog({
      action: "smm.order_error",
      actorType: "visitor",
      actorId: member.id,
      metadata: { orderId: order.id },
    });
    return NextResponse.json({ error: errorMessage || "Sipariş başarısız", order }, { status: 502 });
  }

  await adjustBalance(member.id, -charge, "order", `Sipariş · ${service.name}`, "");

  const order = await prisma.smmOrder.create({
    data: {
      memberId: member.id,
      serviceId: service.id,
      providerServiceId: service.providerServiceId,
      serviceName: service.name,
      link: parsed.data.link.trim(),
      quantity: parsed.data.quantity,
      charge,
      cost,
      status,
      providerOrderId,
    },
  });

  await prisma.walletTransaction.updateMany({
    where: { memberId: member.id, type: "order", refId: "" },
    data: { refId: order.id },
  });

  await writeAuditLog({
    action: "smm.order",
    actorType: "visitor",
    actorId: member.id,
    metadata: { orderId: order.id, providerServiceId: service.providerServiceId },
  });

  return NextResponse.json({ ok: true, order });
}
