import Link from "next/link";
import { CategoryIcon } from "@/components/icons/CategoryIcons";

export type ProductCardData = {
  slug: string;
  name: string;
  shortDesc: string;
  price?: number;
  currency?: string;
  badge?: string | null;
  icon: string;
  accent: string;
  accent2: string;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  return (
    <Link
      href={`/urunler/${product.slug}`}
      className="product-card"
      style={
        {
          "--accent": product.accent,
          "--accent2": product.accent2,
        } as React.CSSProperties
      }
    >
      <div className="product-card-inner">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div className="category-icon-wrap">
            <CategoryIcon name={product.icon} className="size-7" />
          </div>
          {product.badge ? <span className="product-badge">{product.badge}</span> : null}
        </div>
        <h3 className="display text-xl font-bold mb-2">{product.name}</h3>
        <p className="muted text-sm mb-4 leading-relaxed">{product.shortDesc}</p>
        <div className="flex items-end justify-between gap-3 mt-auto">
          <span className="muted text-sm">Teklif al</span>
          <span className="product-cta">İncele →</span>
        </div>
      </div>
    </Link>
  );
}
