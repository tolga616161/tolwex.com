import { ProductGrid } from "@/components/products/ProductGrid";
import { getAllProducts } from "@/lib/products/data";

export default async function ProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="site-shell py-10 pb-24 products-page">
      <ProductGrid
        title="Tüm Ürünler"
        subtitle="Meta eski hesap, projeli paket, kapanan hesap açma — 3D atmosfer üzerinde şekilli liste."
        showAllLink={false}
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
