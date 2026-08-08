import { ProductGrid } from "@/components/products/ProductGrid";
import { getAllProducts } from "@/lib/products/data";

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="site-shell py-8 pb-20">
      <ProductGrid
        title="Tüm Hizmetler"
        subtitle="Sosyal medya hesap, kurtarma, güvenlik ve itibar hizmetleri."
        products={products.map((p) => ({
          slug: p.slug,
          name: p.name,
          shortDesc: p.shortDesc,
          badge: p.badge,
          icon: p.icon,
          accent: p.accent,
          accent2: p.accent2,
        }))}
      />
    </div>
  );
}
