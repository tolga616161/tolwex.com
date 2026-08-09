import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireMember } from "@/lib/member";
import { placeMemberOrder } from "@/lib/smm/place-order";
import { rateLimit } from "@/lib/rate-limit";
import { pullOrdersFromGist } from "@/lib/orders-durable";

function normalizeLink(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

const optionalInt = (min: number, max: number) =>
  z.preprocess(
    (v) => (v === null || v === "" || v === undefined ? undefined : v),
    z.coerce.number().int().min(min).max(max).optional()
  );

const schema = z
  .object({
    serviceId: z.string().min(1).optional(),
    providerServiceId: z.preprocess(
      (v) => (v === null || v === "" || v === undefined ? undefined : v),
      z.coerce.number().int().positive().optional()
    ),
    link: z
      .string()
      .min(3, "Link gerekli")
      .max(500)
      .transform(normalizeLink)
      .refine((v) => /^https?:\/\//i.test(v), "Geçersiz link"),
    // Forms / JSON sometimes send quantity as string — coerce + floor
    quantity: z.preprocess(
      (v) => {
        if (v === null || v === undefined || v === "") return v;
        const n = Math.floor(Number(v));
        return Number.isFinite(n) ? n : v;
      },
      z.number().int("Adet tam sayı olmalı").positive("Adet 0'dan büyük olmalı")
    ),
    comments: z.preprocess(
      (v) => (v === null || v === undefined ? undefined : v),
      z.string().max(5000).optional()
    ),
    dripfeedRuns: optionalInt(1, 1000),
    dripfeedInterval: optionalInt(1, 1440),
  })
  .refine((v) => Boolean(v.serviceId || v.providerServiceId), {
    message: "Servis seçilmedi",
    path: ["serviceId"],
  });

const massSchema = z.object({
  lines: z.string().min(3).max(20000),
});

function zodErrorMessage(err: z.ZodError): string {
  const issue = err.issues[0];
  if (!issue) return "Geçersiz sipariş";
  const msg = issue.message;
  if (msg && !/^Invalid |^Expected |^Required$/i.test(msg)) return msg;
  const path = issue.path.join(".") || "form";
  return `Geçersiz sipariş (${path})`;
}

export async function GET() {
  const member = await requireMember();
  if (!member) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  await pullOrdersFromGist().catch(() => null);

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
    return NextResponse.json(
      {
        error: zodErrorMessage(parsed.error),
        detail: parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
      { status: 400 }
    );
  }

  try {
    const order = await placeMemberOrder({
      memberId: member.id,
      serviceId: parsed.data.serviceId,
      providerServiceId: parsed.data.providerServiceId,
      link: parsed.data.link,
      quantity: parsed.data.quantity,
      comments: parsed.data.comments,
      dripfeedRuns: parsed.data.dripfeedRuns,
      dripfeedInterval: parsed.data.dripfeedInterval,
    });
    return NextResponse.json({ ok: true, order });
  } catch (e) {
    const err = e as Error & { status?: number; order?: unknown };
    // Surface provider / balance errors as-is (API was called or blocked before call)
    return NextResponse.json(
      { error: err.message || "Sipariş başarısız", order: err.order },
      { status: err.status || 500 }
    );
  }
}
