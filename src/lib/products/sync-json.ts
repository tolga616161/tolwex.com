import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/db";

/** Keep static catalog in sync so GitHub Pages / builds see admin edits. */
export async function syncProductsJson() {
  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  const payload = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    shortDesc: p.shortDesc,
    description: p.description,
    price: 0,
    currency: p.currency || "TRY",
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

  const file = path.join(process.cwd(), "src/data/products.json");
  await fs.writeFile(file, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return payload.length;
}
