import Link from "next/link";
import { HeroSection } from "@/components/hero/HeroSection";
import { ServiceCatalog } from "@/components/smm/ServiceCatalog";
import { HowItWorksSection } from "@/components/marketing/HomeSections";

export default function HomePage() {
  return (
    <div className="home-root">
      <HeroSection />
      <section className="home-section section-alt" id="neden">
        <div className="site-shell why-grid">
          {[
            {
              t: "Otomatik katalog",
              d: "smmapi.com API’sinden tüm servisler çekilir, Hizmetler’de listelenir.",
            },
            {
              t: "Üye kayıt / giriş",
              d: "Kullanıcı adı + şifre ile panel hesabı. Kayıt ol, giriş yap, sipariş ver.",
            },
            {
              t: "Anında sipariş",
              d: "Kategori → servis → link → adet. Sipariş API’ye otomatik düşer.",
            },
          ].map((x) => (
            <article key={x.t} className="why-card glass-panel rounded-2xl p-5">
              <h3 className="display text-xl mb-2">{x.t}</h3>
              <p className="muted text-sm leading-relaxed">{x.d}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="home-section" id="hizmetler">
        <div className="site-shell">
          <div className="section-head">
            <p className="section-kicker">Servisler</p>
            <h2 className="section-title">HİZMET LİSTESİ</h2>
            <p className="section-sub">
              Fiyatlar tedarikçi oranının üzerine %50 kâr eklenmiş satış fiyatıdır.
            </p>
          </div>
          <div className="mb-6 flex flex-wrap gap-3">
            <Link href="/uye/kayit" className="btn btn-primary">
              Üye ol ve sipariş ver
            </Link>
            <Link href="/uye/giris" className="btn btn-ghost">
              Giriş yap
            </Link>
          </div>
          <ServiceCatalog />
        </div>
      </section>
      <HowItWorksSection />
    </div>
  );
}
