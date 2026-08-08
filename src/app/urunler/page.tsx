import { prisma } from "@/lib/db";
import { ProductGrid } from "@/components/products/ProductGrid";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="site-shell py-8 pb-20">
      <ProductGrid
        title="Tüm Ürünler"
        subtitle="Instagram, reklam, TikTok, SEO ve tasarım paketleri."
        products={products.map((p) => ({
          slug: p.slug,
          name: p.name,
          shortDesc: p.shortDesc,
          price: p.price,
          currency: p.currency,
          badge: p.badge,
          icon: p.icon,
          accent: p.accent,
          accent2: p.accent2,
        }))}
      />
    </div>
  );
}
