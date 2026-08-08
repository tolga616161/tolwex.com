import Link from "next/link";
import { HeroSection } from "@/components/hero/HeroSection";
import { ServiceCatalog } from "@/components/smm/ServiceCatalog";
import { HowItWorksSection } from "@/components/marketing/HomeSections";

export default function HomePage() {
  return (
    <div className="home-root">
      <HeroSection />
      <section className="home-section" id="hizmetler">
        <div className="site-shell">
          <div className="section-head">
            <p className="section-kicker">SMM API · smmapi.com</p>
            <h2 className="section-title">TÜM HİZMETLER</h2>
            <p className="section-sub">
              Servisler otomatik çekilir. Satış fiyatı = tedarikçi fiyatı + %50 kâr.
              Instagram bağlama yok — sadece SMM sipariş.
            </p>
          </div>
          <div className="mb-6 flex flex-wrap gap-3">
            <Link href="/uye/giris" className="btn btn-primary">
              Üye girişi / Sipariş
            </Link>
            <Link href="/hizmetler" className="btn btn-ghost">
              Tam katalog
            </Link>
          </div>
          <ServiceCatalog />
        </div>
      </section>
      <HowItWorksSection />
    </div>
  );
}
