import Link from "next/link";
import { ProductCard, type ProductCardData } from "@/components/products/ProductCard";

export function ProductGrid({
  products,
  title = "Hizmetler",
  subtitle = "Meta eski hesap, projeli paket ve kapanan hesap açma.",
  showAllLink = true,
}: {
  products: ProductCardData[];
  title?: string;
  subtitle?: string;
  showAllLink?: boolean;
}) {
  if (!products.length) {
    return (
      <section id="urunler" className="glass-panel rounded-2xl p-8 text-center">
        <h2 className="display text-2xl mb-2">Henüz hizmet yok</h2>
        <p className="muted text-sm">Hizmetler yakında eklenecek.</p>
      </section>
    );
  }

  const featured = products.slice(0, 3);
  const rest = products.slice(3);

  return (
    <section id="urunler" className="relative product-showcase">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: "var(--accent)" }}>
            Ürün kataloğu
          </p>
          <h2 className="display text-3xl md:text-5xl font-bold">{title}</h2>
          <p className="muted mt-2 max-w-xl">{subtitle}</p>
        </div>
        {showAllLink ? (
          <Link href="/urunler" className="btn btn-ghost">
            Tüm ürünler
          </Link>
        ) : null}
      </div>

      <div className="product-bento">
        {featured.map((p, i) => (
          <Link
            key={p.slug}
            href={`/urunler/${p.slug}`}
            className={`product-bento-card is-featured feat-${i + 1}`}
            style={
              {
                "--accent": p.accent,
                "--accent2": p.accent2,
              } as React.CSSProperties
            }
          >
            <span className="product-bento-index">0{i + 1}</span>
            <div className="product-bento-brand" aria-hidden>
              <span className="blob ig" />
              <span className="blob fb" />
            </div>
            {p.badge ? <span className="product-badge">{p.badge}</span> : null}
            <h3 className="display text-2xl md:text-3xl font-bold mt-3">{p.name}</h3>
            <p className="muted text-sm md:text-base mt-2 leading-relaxed max-w-md">{p.shortDesc}</p>
            <span className="product-cta mt-auto pt-6">İncele →</span>
          </Link>
        ))}
      </div>

      {rest.length ? (
        <div className="product-grid product-grid-shaped mt-6">
          {rest.map((p, i) => (
            <div key={p.slug} className={`product-shape-slot slot-${(i % 6) + 1}`}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
