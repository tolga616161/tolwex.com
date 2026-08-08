import Link from "next/link";
import { ProductCard, type ProductCardData } from "@/components/products/ProductCard";

export function ProductGrid({
  products,
  title = "Ürünler",
  subtitle = "Satışa hazır dijital paketler — hemen inceleyin.",
}: {
  products: ProductCardData[];
  title?: string;
  subtitle?: string;
}) {
  if (!products.length) {
    return (
      <section id="urunler" className="glass-panel rounded-2xl p-8 text-center">
        <h2 className="display text-2xl mb-2">Henüz ürün yok</h2>
        <p className="muted text-sm">Admin panelinden ürün ekleyebilirsiniz.</p>
      </section>
    );
  }

  return (
    <section id="urunler" className="relative">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: "var(--accent)" }}>
            Mağaza
          </p>
          <h2 className="display text-3xl md:text-4xl font-bold">{title}</h2>
          <p className="muted mt-2 max-w-xl">{subtitle}</p>
        </div>
        <Link href="/urunler" className="btn btn-ghost">
          Tüm ürünler
        </Link>
      </div>
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
