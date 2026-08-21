import Link from "next/link";
import { TolwexLogo } from "@/components/brand/TolwexLogo";
import { HeroOrbit } from "@/components/recovery/HeroOrbit";
import { RECOVERY_SERVICES } from "@/lib/recovery";
import { GUIDE_ARTICLES } from "@/lib/guides";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

const GROUPS: Array<{ id: "hesap" | "reklam" | "fake"; title: string; note: string }> = [
  { id: "hesap", title: "Hesap", note: "Kapanan ve çalınan hesap çözümleri" },
  { id: "reklam", title: "Reklam", note: "Kısıtlanan reklam hesabı desteği" },
  { id: "fake", title: "Fake Hesaplar", note: "Tespit ve kapatma hizmeti" },
];

export function RecoveryHome() {
  const wa = whatsappUrl("Merhaba, TOLWEX Sosyal Medya Uzmanı — destek için yazıyorum.");

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
            <p className="rec-hero-kicker">TOLWEX</p>
            <h1 className="rec-hero-title display">Sosyal Medya Uzmanı</h1>
            <p className="rec-hero-sub">
              Kapanan, çalınan, kısıtlanan reklam ve fake hesaplar için teknik çözüm. Kategori
              seç — WhatsApp’tan ulaş.
            </p>
            <div className="rec-hero-actions">
              <a href="#kategoriler" className="btn btn-primary">
                Kategoriler
              </a>
              <a href={wa} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="rec-services" id="kategoriler">
        <div className="site-shell">
          <div className="rec-services-head">
            <p className="rec-cat-kicker">Kategoriler</p>
            <h2 className="display">Ne için başvuracaksın?</h2>
            <p>Hesap, reklam veya fake — seç, formu doldur</p>
          </div>

          {GROUPS.map((g) => {
            const items = RECOVERY_SERVICES.filter((s) => s.group === g.id);
            return (
              <div key={g.id} className="rec-cat-block">
                <div className="rec-cat-block-head">
                  <h3>{g.title}</h3>
                  <span>{g.note}</span>
                </div>
                <div
                  className={`rec-service-grid rec-service-grid-auto${
                    items.length === 1 ? " is-single" : ""
                  }`}
                >
                  {items.map((s) => (
                    <Link key={s.slug} href={s.href} className="rec-service-card rec-cat-card">
                      <span className="rec-cat-num">{s.eyebrow}</span>
                      <h3>{s.title}</h3>
                      <p>{s.description}</p>
                      <span className="rec-service-go">Başvur →</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rec-attack-band" aria-label="Siber savaş">
        <div className="site-shell rec-attack-inner">
          <p className="rec-attack-kicker">SİBER SAVAŞ · CANLI</p>
          <h2 className="display">Hesabın hedef alındıysa yalnız değilsin</h2>
          <p>
            Kapanan, çalınan, reklamı kısıtlanan veya fake hesaplarda hızlı teknik müdahale. Harita
            canlı — sen başvur, biz çözüme odaklanıyoruz.
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
            {GUIDE_ARTICLES.slice(0, 3).map((a) => (
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
              <strong>Kategori seç</strong>
              <span>Hesap, reklam veya fake</span>
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
            2020’den beri <strong>TOLWEX Sosyal Medya Uzmanı</strong>. Yolculuk{" "}
            <strong>tolgamedyam</strong> ile başladı — bugün <strong>TOLWEX</strong> adıyla devam
            ediyor.
          </p>
        </div>
      </section>
    </div>
  );
}
