import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  return Boolean(session.isAdmin);
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  const leads = await prisma.orderLead.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { product: { select: { name: true, slug: true } } },
  });
  return NextResponse.json({ products, leads });
}

const upsertSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(2),
  name: z.string().min(2),
  shortDesc: z.string().default(""),
  description: z.string().default(""),
  price: z.number().int().positive(),
  currency: z.string().default("TRY"),
  category: z.string().default("dijital"),
  badge: z.string().default(""),
  icon: z.string().default("social"),
  accent: z.string().default("#2ec4b6"),
  accent2: z.string().default("#7c5cff"),
  features: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = upsertSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz ürün verisi" }, { status: 400 });
  }

  const data = {
    slug: parsed.data.slug,
    name: parsed.data.name,
    shortDesc: parsed.data.shortDesc,
    description: parsed.data.description,
    price: parsed.data.price,
    currency: parsed.data.currency,
    category: parsed.data.category,
    badge: parsed.data.badge,
    icon: parsed.data.icon,
    accent: parsed.data.accent,
    accent2: parsed.data.accent2,
    features: JSON.stringify(parsed.data.features),
    featured: parsed.data.featured,
    active: parsed.data.active,
    sortOrder: parsed.data.sortOrder,
  };

  const product = parsed.data.id
    ? await prisma.product.update({ where: { id: parsed.data.id }, data })
    : await prisma.product.create({ data });

  return NextResponse.json({ ok: true, product });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
