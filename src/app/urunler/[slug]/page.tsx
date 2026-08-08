import Link from "next/link";
import { notFound } from "next/navigation";
import { CategoryIcon } from "@/components/icons/CategoryIcons";
import { OrderForm } from "@/components/products/OrderForm";
import { parseFeatures } from "@/lib/products/format";
import { getProductBySlug, getStaticProductSlugs } from "@/lib/products/data";

export function generateStaticParams() {
  return getStaticProductSlugs().map((slug) => ({ slug }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const features = parseFeatures(product.features);

  return (
    <div className="site-shell py-8 pb-20">
      <Link href="/urunler" className="muted text-sm">
        ← Tüm hizmetler
      </Link>

      <div className="mt-5 grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <section
          className="glass-panel rounded-3xl p-6 md:p-8"
          style={
            {
              "--accent": product.accent,
              "--accent2": product.accent2,
            } as React.CSSProperties
          }
        >
          <div className="flex items-start gap-4 mb-5">
            <div className="category-icon-wrap">
              <CategoryIcon name={product.icon} className="size-8" />
            </div>
            <div>
              {product.badge ? <span className="product-badge">{product.badge}</span> : null}
              <h1 className="display text-3xl md:text-4xl font-bold mt-2">{product.name}</h1>
              <p className="muted mt-2">{product.shortDesc}</p>
            </div>
          </div>

          <p className="leading-relaxed muted mb-6">{product.description}</p>

          {features.length ? (
            <ul className="space-y-2">
              {features.map((f) => (
                <li key={f} className="flex gap-2 items-center">
                  <span className="status-dot status-ok" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <OrderForm productId={product.id} productName={product.name} />
      </div>
    </div>
  );
}
