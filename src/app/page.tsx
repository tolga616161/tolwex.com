import Link from "next/link";
import { HeroSection } from "@/components/hero/HeroSection";
import { CategoryExplorer } from "@/components/categories/CategoryExplorer";
import { DigitalAtmosphere } from "@/components/fx/DigitalAtmosphere";
import { ProductGrid } from "@/components/products/ProductGrid";
import { getFeaturedProducts } from "@/lib/products/data";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export default async function HomePage() {
  let configured = true;
  if (process.env.GITHUB_PAGES !== "1") {
    try {
      const { getMetaConfig } = await import("@/lib/meta/config");
      const config = await getMetaConfig();
      configured = config.configured;
    } catch {
      configured = true;
    }
  }

  const featuredProducts = getFeaturedProducts();

  return (
    <div className="site-shell pt-4 pb-20 space-y-14 relative">
      <div className="page-atmosphere" aria-hidden>
        <DigitalAtmosphere variant="page" />
      </div>
      <HeroSection configured={configured} />

      <ProductGrid
        title="Öne çıkan hizmetler"
        subtitle="Eski tarihli hesaplar, kapanan hesap aktif etme, Meta Verified ve daha fazlası."
        products={featuredProducts.map((p) => ({
          slug: p.slug,
          name: p.name,
          shortDesc: p.shortDesc,
          badge: p.badge,
          icon: p.icon,
          accent: p.accent,
          accent2: p.accent2,
        }))}
      />

      <CategoryExplorer />

      <section className="grid md:grid-cols-3 gap-4">
        {[
          {
            title: "Hesap hizmetleri",
            text: "Eski tarihli hesaplar, Facebook eski hesap ve hesap aktif etme.",
          },
          {
            title: "Meta & güvenlik",
            text: "Meta Verified hataları ve Instagram güvenlik kontrolü.",
          },
          {
            title: "Teklif için yazın",
            text: `Fiyat sitede yok. WhatsApp: ${CONTACT_PHONE_DISPLAY}`,
          },
        ].map((item) => (
          <div key={item.title} className="glass-panel rounded-2xl p-6">
            <h2 className="display text-xl mb-2">{item.title}</h2>
            <p className="muted text-sm leading-relaxed">{item.text}</p>
          </div>
        ))}
      </section>

      <section className="glass-panel rounded-2xl p-6 md:p-8">
        <p className="text-sm md:text-base leading-relaxed">
          Sosyal medya hesap, kurtarma ve itibar hizmetleri. Detay ve teklif için
          WhatsApp’tan yazın.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/urunler" className="btn btn-primary">
            Tüm Hizmetler
          </Link>
          <Link href="/instagram/dashboard" className="btn btn-ghost">
            Hesap Güvenlik Testi
          </Link>
          <a
            href={whatsappUrl("Merhaba, hizmetler hakkında bilgi almak istiyorum.")}
            className="btn btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp {CONTACT_PHONE_DISPLAY}
          </a>
        </div>
      </section>
    </div>
  );
}
