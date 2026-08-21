import Link from "next/link";
import { TolwexLogo } from "@/components/brand/TolwexLogo";
import { HeroOrbit } from "@/components/recovery/HeroOrbit";
import { RECOVERY_SERVICES } from "@/lib/recovery";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

const GROUPS: Array<{ id: "hesap" | "buyume" | "reklam"; title: string; note: string }> = [
  { id: "hesap", title: "Hesap hizmetleri", note: "Kapanan, çalınan, fake ve genel hesap" },
  { id: "buyume", title: "Büyüme & influencer", note: "Büyüme ve influencer başvuruları" },
  { id: "reklam", title: "Reklam", note: "Kısıt kaldırma ve reklam onayları" },
];

export function RecoveryHome() {
  const wa = whatsappUrl("Merhaba, TOLWEX hizmetleri için yazıyorum.");

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
            <h1 className="rec-hero-title display">
              Teknik
              <span>destek</span>
            </h1>
            <p className="rec-hero-sub">
              Instagram · Facebook hesap, büyüme ve reklam. Kategori seç, fotoğraf ekle — WhatsApp’tan bize ulaşır.
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
          {GROUPS.map((g) => {
            const items = RECOVERY_SERVICES.filter((s) => s.group === g.id);
            return (
              <div key={g.id} className="rec-group">
                <div className="rec-services-head">
                  <h2 className="display">{g.title}</h2>
                  <p>{g.note}</p>
                </div>
                <div className="rec-service-grid rec-service-grid-auto">
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

      <section className="rec-how">
        <div className="site-shell rec-how-inner rec-how-clean">
          <h2 className="display">3 adım</h2>
          <ol className="rec-how-list">
            <li>
              <strong>Kategori seç</strong>
              <span>Hesap, büyüme veya reklam</span>
            </li>
            <li>
              <strong>Bilgi + fotoğraf</strong>
              <span>Formu doldur, ekran ekle</span>
            </li>
            <li>
              <strong>WhatsApp’a gönder</strong>
              <span>{CONTACT_PHONE_DISPLAY}</span>
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
