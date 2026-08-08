import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { writeAuditLog } from "@/lib/audit";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  productId: z.string().min(1),
  name: z.string().min(2).max(120),
  phone: z.string().min(7).max(40),
  email: z.string().email().optional().or(z.literal("")),
  note: z.string().max(4000).optional(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rl = rateLimit(`order:${ip}`, 10, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Çok fazla istek. Biraz sonra deneyin." }, { status: 429 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz form bilgisi" }, { status: 400 });
  }

  const product = await prisma.product.findFirst({
    where: { id: parsed.data.productId, active: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
  }

  const lead = await prisma.orderLead.create({
    data: {
      productId: product.id,
      name: parsed.data.name.trim(),
      phone: parsed.data.phone.trim(),
      email: parsed.data.email?.trim() || "",
      note: parsed.data.note?.trim() || "",
      status: "new",
    },
  });

  await writeAuditLog({
    action: "order.lead_created",
    actorType: "visitor",
    metadata: { leadId: lead.id, productSlug: product.slug },
  });

  return NextResponse.json({ ok: true, id: lead.id });
}
