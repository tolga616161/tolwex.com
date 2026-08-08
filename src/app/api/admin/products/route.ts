import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { syncProductsJson } from "@/lib/products/sync-json";

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
    take: 80,
    include: { product: { select: { name: true, slug: true } } },
  });
  return NextResponse.json({
    products: products.map((p) => ({ ...p, price: 0 })),
    leads,
  });
}

const upsertSchema = z.object({
  id: z.string().optional(),
  slug: z.string().min(2).max(120),
  name: z.string().min(2).max(160),
  shortDesc: z.string().max(400).default(""),
  description: z.string().max(5000).default(""),
  category: z.string().min(1).max(60).default("sosyal"),
  badge: z.string().max(40).default(""),
  icon: z.string().min(1).max(40).default("social"),
  accent: z.string().max(40).default("#2ec4b6"),
  accent2: z.string().max(40).default("#7c5cff"),
  features: z.array(z.string().max(200)).max(40).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(9999).default(0),
});

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const json = await req.json().catch(() => null);
  const parsed = upsertSchema.safeParse(json);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((i) => i.message).join("; ");
    return NextResponse.json(
      { error: detail || "Geçersiz hizmet verisi" },
      { status: 400 }
    );
  }

  const data = {
    slug: parsed.data.slug.trim().toLowerCase(),
    name: parsed.data.name.trim(),
    shortDesc: parsed.data.shortDesc.trim(),
    description: parsed.data.description.trim() || parsed.data.shortDesc.trim(),
    price: 0,
    currency: "TRY",
    category: parsed.data.category.trim(),
    badge: parsed.data.badge.trim(),
    icon: parsed.data.icon.trim(),
    accent: parsed.data.accent.trim() || "#2ec4b6",
    accent2: parsed.data.accent2.trim() || "#7c5cff",
    features: JSON.stringify(parsed.data.features.map((f) => f.trim()).filter(Boolean)),
    featured: parsed.data.featured,
    active: parsed.data.active,
    sortOrder: parsed.data.sortOrder,
  };

  try {
    const product = parsed.data.id
      ? await prisma.product.update({ where: { id: parsed.data.id }, data })
      : await prisma.product.create({ data });

    try {
      await syncProductsJson();
    } catch (err) {
      console.error("products.json sync failed", err);
    }

    return NextResponse.json({ ok: true, product: { ...product, price: 0 } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Kayıt hatası";
    if (message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Bu slug zaten kullanılıyor. Farklı bir slug deneyin." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id gerekli" }, { status: 400 });

  try {
    await prisma.product.delete({ where: { id } });
    try {
      await syncProductsJson();
    } catch (err) {
      console.error("products.json sync failed", err);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Hizmet silinemedi" }, { status: 404 });
  }
}
