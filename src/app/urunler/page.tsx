import { ProductGrid } from "@/components/products/ProductGrid";
import { getAllProducts } from "@/lib/products/data";

export default function ProductsPage() {
  const products = getAllProducts();

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
