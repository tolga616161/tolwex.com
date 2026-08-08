import productsJson from "@/data/products.json";

export type StaticProduct = {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  badge: string;
  icon: string;
  accent: string;
  accent2: string;
  features: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
};

const FALLBACK = productsJson as StaticProduct[];

function isStaticExport() {
  return process.env.GITHUB_PAGES === "1";
}

function sortProducts(list: StaticProduct[]) {
  return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
}

async function fromDatabase(activeOnly: boolean): Promise<StaticProduct[] | null> {
  if (isStaticExport()) return null;
  try {
    const { prisma } = await import("@/lib/db");
    const rows = await prisma.product.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      shortDesc: p.shortDesc,
      description: p.description,
      price: 0,
      currency: p.currency,
      category: p.category,
      badge: p.badge,
      icon: p.icon,
      accent: p.accent,
      accent2: p.accent2,
      features: p.features,
      featured: p.featured,
      active: p.active,
      sortOrder: p.sortOrder,
    }));
  } catch {
    return null;
  }
}

/** Active services for storefront (DB when available, else JSON). */
export async function getAllProducts(): Promise<StaticProduct[]> {
  const db = await fromDatabase(true);
  if (db) return db;
  return sortProducts(FALLBACK.filter((p) => p.active));
}

export async function getFeaturedProducts(): Promise<StaticProduct[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.featured);
}

export async function getProductBySlug(slug: string): Promise<StaticProduct | undefined> {
  const all = await getAllProducts();
  return all.find((p) => p.slug === slug);
}

/** Sync helpers for static export / generateStaticParams (JSON only). */
export function getStaticProductSlugs() {
  return FALLBACK.filter((p) => p.active).map((p) => p.slug);
}
