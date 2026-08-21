import Link from "next/link";
import { TolwexLogo } from "@/components/brand/TolwexLogo";
import { HeroOrbit } from "@/components/recovery/HeroOrbit";
import { RECOVERY_SERVICES } from "@/lib/recovery";
import { GUIDE_ARTICLES } from "@/lib/guides";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export function RecoveryHome() {
  const wa = whatsappUrl("Merhaba, TOLWEX sosyal medya uzman desteği için yazıyorum.");

  return (
    <div className="rec-home is-clean">
      <section className="rec-hero rec-hero-clean rec-hero-filled">
        <div className="rec-hero-soft" aria-hidden />
        <HeroOrbit />
        <div className="site-shell rec-hero-stack">
          <div className="rec-hero-inner">
            <div className="rec-hero-logo">
              <TolwexLogo size="lg" showWordmark />
            </div>
            <p className="rec-hero-kicker">Sosyal medya uzmanı</p>
            <h1 className="rec-hero-title display">
              Teknik
              <span>çözümler</span>
            </h1>
            <p className="rec-hero-sub">
              Kapanan ve çalınan hesaplar için teknik çözüm. Platform seç — WhatsApp’tan ulaş.
            </p>
            <div className="rec-hero-actions">
              <a href="#menuler" className="btn btn-primary">
                Menüler
              </a>
              <a href={wa} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="rec-services" id="menuler">
        <div className="site-shell">
          <div className="rec-services-head">
            <h2 className="display">Menüler</h2>
            <p>Kapanan · çalınan — seç, başvur</p>
          </div>
          <div className="rec-service-grid rec-service-grid-2">
            {RECOVERY_SERVICES.map((s) => (
              <Link key={s.slug} href={s.href} className="rec-service-card rec-cat-card">
                <span className="rec-cat-num">{s.eyebrow}</span>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <span className="rec-service-go">Başvur →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rec-attack-band" aria-label="Siber savaş">
        <div className="site-shell rec-attack-inner">
          <p className="rec-attack-kicker">SİBER SAVAŞ · CANLI</p>
          <h2 className="display">Hesabın hedef alındıysa yalnız değilsin</h2>
          <p>
            Kapanan veya çalınan hesaplarda hızlı teknik müdahale. Harita canlı — sen başvur, biz
            çözüme odaklanıyoruz.
          </p>
        </div>
      </section>

      <section className="rec-guides-teaser" id="makaleler">
        <div className="site-shell">
          <div className="rec-services-head">
            <h2 className="display">Yardımcı makaleler</h2>
            <p>Kısa rehberler</p>
          </div>
          <div className="rec-guide-grid">
            {GUIDE_ARTICLES.slice(0, 2).map((a) => (
              <Link key={a.slug} href={`/makaleler/${a.slug}`} className="rec-guide-card">
                <h3>{a.title}</h3>
                <p>{a.excerpt}</p>
                <span>Oku →</span>
              </Link>
            ))}
          </div>
          <p className="rec-guides-all">
            <Link href="/makaleler">Tüm makaleler →</Link>
          </p>
        </div>
      </section>

      <section className="rec-how">
        <div className="site-shell rec-how-inner rec-how-clean">
          <h2 className="display">3 adım</h2>
          <ol className="rec-how-list">
            <li>
              <strong>Menü seç</strong>
              <span>Kapanan veya çalınan</span>
            </li>
            <li>
              <strong>Platform + bilgi</strong>
              <span>Logo seç — foto galeriden (opsiyonel)</span>
            </li>
            <li>
              <strong>WhatsApp</strong>
              <span>{CONTACT_PHONE_DISPLAY}</span>
            </li>
          </ol>
        </div>
      </section>

      <section className="rec-origin">
        <div className="site-shell rec-origin-inner">
          <p className="rec-origin-year">2020</p>
          <h2 className="display">tolgamedyam → TOLWEX</h2>
          <p>
            2020’den beri sosyal medya teknik çözümleri. Yolculuk <strong>tolgamedyam</strong> ile
            başladı — bugün <strong>TOLWEX</strong> adıyla devam ediyor.
          </p>
        </div>
      </section>
    </div>
  );
}
