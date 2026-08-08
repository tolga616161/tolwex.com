import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member";
import { placeMemberOrder } from "@/lib/smm/place-order";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  serviceId: z.string().min(1),
  link: z.string().url().max(500),
  quantity: z.number().int().positive(),
  comments: z.string().max(5000).optional(),
  dripfeedRuns: z.number().int().min(1).max(1000).optional(),
  dripfeedInterval: z.number().int().min(1).max(1440).optional(),
});

const massSchema = z.object({
  lines: z.string().min(3).max(20000),
});

export async function GET() {
  const member = await requireMember();
  if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const orders = await prisma.smmOrder.findMany({
    where: { memberId: member.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest) {
  const member = await requireMember();
  if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = rateLimit(`order-member:${member.id}:${ip}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Çok fazla sipariş denemesi" }, { status: 429 });
  }

  const json = await req.json().catch(() => null);

  // Mass order: serviceId|quantity|link per line (provider id or internal id)
  if (json && typeof json === "object" && "lines" in json) {
    const parsed = massSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Geçersiz toplu sipariş" }, { status: 400 });
    }
    const rows = parsed.data.lines
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .slice(0, 50);

    const results: Array<{ ok: boolean; line: string; error?: string; orderId?: string }> = [];
    for (const line of rows) {
      const parts = line.split("|").map((p) => p.trim());
      if (parts.length < 3) {
        results.push({ ok: false, line, error: "Format: service_id|adet|link" });
        continue;
      }
      const [sid, qtyStr, link] = parts;
      const quantity = Number(qtyStr);
      const asNum = Number(sid);
      try {
        const order = await placeMemberOrder({
          memberId: member.id,
          ...(Number.isFinite(asNum) && String(asNum) === sid
            ? { providerServiceId: asNum }
            : { serviceId: sid }),
          link,
          quantity,
        });
        results.push({ ok: true, line, orderId: order.id });
      } catch (e) {
        results.push({
          ok: false,
          line,
          error: e instanceof Error ? e.message : "Hata",
        });
      }
    }
    return NextResponse.json({ ok: true, results });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz sipariş" }, { status: 400 });
  }

  try {
    const order = await placeMemberOrder({
      memberId: member.id,
      serviceId: parsed.data.serviceId,
      link: parsed.data.link,
      quantity: parsed.data.quantity,
      comments: parsed.data.comments,
      dripfeedRuns: parsed.data.dripfeedRuns,
      dripfeedInterval: parsed.data.dripfeedInterval,
    });
    return NextResponse.json({ ok: true, order });
  } catch (e) {
    const err = e as Error & { status?: number; order?: unknown };
    return NextResponse.json(
      { error: err.message || "Sipariş başarısız", order: err.order },
      { status: err.status || 500 }
    );
  }
}
