import { HeroSection } from "@/components/hero/HeroSection";
import {
  FeaturedProductsSection,
  HowItWorksSection,
  RecoveryHighlightSection,
  ServicesSection,
} from "@/components/marketing/HomeSections";
import { ProductGrid } from "@/components/products/ProductGrid";
import { getAllProducts } from "@/lib/products/data";

export default async function HomePage() {
  const products = await getAllProducts();

  return (
    <div className="home-root">
      <HeroSection />
      <FeaturedProductsSection />
      <section className="home-section">
        <div className="site-shell">
          <ProductGrid
            title="ÜRÜNLER"
            subtitle="Şekil şeklinde katalog — eski, projeli ve kapanan hesap odaklı."
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
      </section>
      <ServicesSection />
      <RecoveryHighlightSection />
      <HowItWorksSection />
    </div>
  );
}
