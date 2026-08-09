import Link from "next/link";
import { MemberAuthForm } from "@/components/auth/MemberAuthForm";
import { ServiceCatalog } from "@/components/smm/ServiceCatalog";
import { HowItWorksSection } from "@/components/marketing/HomeSections";
import { SocialLogos } from "@/components/marketing/SocialLogos";
import { prisma, ensureDbHydrated } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Non-blocking hydrate — don't stall first paint on gist pulls
  void ensureDbHydrated(false);
  const [serviceCount, orderCount, ticketCount] = await Promise.all([
    prisma.smmService.count({ where: { active: true } }).catch(() => 0),
    prisma.smmOrder.count().catch(() => 0),
    prisma.supportTicket.count().catch(() => 0),
  ]);

  return (
    <div className="home-root">
      <section className="hero-stage panel-hero smm-landing-hero smmapi-hero">
        <div className="hero-glow" aria-hidden />
        <div className="hero-grid-fx" aria-hidden />
        <div className="site-shell panel-hero-grid">
          <div className="hero-copy panel-hero-copy">
            <h1 className="hero-title hero-title-statement display">
              <span className="title-line">Dijitalde Karşınıza Çıkan</span>
              <span className="title-line hero-title-accent">Sorunları Birlikte Çözüyoruz</span>
            </h1>
            <p className="hero-sub">
              Instagram, TikTok, YouTube ve daha fazlası — takipçi, beğeni, izlenme. Üye ol, bakiye
              yükle, platformdan servis seç.
            </p>
            <SocialLogos className="hero-socials" />
            <div className="smm-stats-row">
              <div>
                <strong>{serviceCount.toLocaleString("tr-TR")}</strong>
                <span>Servis</span>
              </div>
              <div>
                <strong>{Math.max(orderCount, 1).toLocaleString("tr-TR")}</strong>
                <span>Sipariş</span>
              </div>
              <div>
                <strong>{Math.max(ticketCount, 1).toLocaleString("tr-TR")}</strong>
                <span>Destek</span>
              </div>
            </div>
            <div className="hero-actions">
              <Link href="/hizmetler" className="btn btn-ghost">
                Servislere bak
              </Link>
            </div>
          </div>
          <div className="panel-hero-login">
            <MemberAuthForm mode="login" compact />
          </div>
        </div>
      </section>

      <section className="home-section section-alt" id="ozellikler">
        <div className="site-shell why-grid">
          {[
            {
              t: "Kaliteli servisler",
              d: "Binlerce SMM hizmeti — takipçi, beğeni, izlenme ve daha fazlası.",
            },
            {
              t: "Havale / EFT",
              d: "İş Bankası hesabına yatır, ödeme bildir, bakiyen tanımlansın.",
            },
            {
              t: "Hızlı teslimat",
              d: "Siparişler otomatik işleme alınır, panelden takip edilir.",
            },
            {
              t: "Reseller API",
              d: "PerfectPanel uyumlu /api/v1 ile kendi yazılımını bağlayın.",
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
            <p className="section-sub">
              Giriş yapmadan göz at. Sipariş için üye ol — panelde kategoriden seçersin.
            </p>
          </div>
          <ServiceCatalog />
        </div>
      </section>
      <HowItWorksSection />
    </div>
  );
}
