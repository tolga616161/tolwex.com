import Link from "next/link";
import { MemberAuthForm } from "@/components/auth/MemberAuthForm";
import { ServiceCatalog } from "@/components/smm/ServiceCatalog";
import { HowItWorksSection } from "@/components/marketing/HomeSections";
import { SocialLogos } from "@/components/marketing/SocialLogos";

export default function HomePage() {
  return (
    <div className="home-root">
      <section className="hero-stage panel-hero smm-landing-hero">
        <div className="hero-glow" aria-hidden />
        <div className="hero-grid-fx" aria-hidden />
        <div className="site-shell panel-hero-grid">
          <div className="hero-copy panel-hero-copy">
            <p className="hero-kicker">TOLWEX</p>
            <h1 className="hero-title display">
              <span className="title-line">Profesyonel</span>
              <span className="title-line hero-title-accent">SMM Paneli</span>
            </h1>
            <p className="hero-sub">
              Instagram, TikTok, YouTube ve daha fazlası için takipçi, beğeni ve izlenme.
              Tek panelden sipariş ver, bakiyeni yönet, API ile entegre ol.
            </p>
            <SocialLogos className="hero-socials" />
            <div className="hero-actions">
              <Link href="/uye/kayit" className="btn btn-primary">
                Hemen Başla
              </Link>
              <Link href="/hizmetler" className="btn btn-ghost">
                Servisler
              </Link>
              <Link href="/sss" className="btn btn-ghost">
                SSS
              </Link>
            </div>
          </div>
          <div className="panel-hero-login">
            <MemberAuthForm mode="login" compact />
          </div>
        </div>
      </section>

      <section className="home-section section-platforms">
        <div className="site-shell">
          <div className="section-head">
            <p className="section-kicker">Platformlar</p>
            <h2 className="section-title">Tüm sosyal ağlar tek panelde</h2>
            <p className="section-sub">
              Popüler platformlar için hızlı teslimat — bakiyeni yükle, siparişini ver.
            </p>
          </div>
          <SocialLogos className="platforms-row" />
        </div>
      </section>

      <section className="home-section section-alt" id="ozellikler">
        <div className="site-shell why-grid">
          {[
            {
              t: "Anında teslimat",
              d: "Siparişler smmapi.com üzerinden otomatik işleme alınır.",
            },
            {
              t: "Banka ile bakiye",
              d: "İş Bankası havale/EFT — ödeme bildir, admin onaylasın.",
            },
            {
              t: "Reseller API",
              d: "PerfectPanel uyumlu /api/v1 — kendi yazılımınızı bağlayın.",
            },
            {
              t: "Şeffaf fiyat",
              d: "Canlı katalog, min/max ve 1000 başına satış fiyatı.",
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
            <h2 className="section-title">Hizmet listesi</h2>
            <p className="section-sub">Giriş yapmadan göz atın, sipariş için üye olun.</p>
          </div>
          <ServiceCatalog />
        </div>
      </section>
      <HowItWorksSection />
    </div>
  );
}
