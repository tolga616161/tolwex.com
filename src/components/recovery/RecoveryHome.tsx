import Link from "next/link";
import { TolwexLogo } from "@/components/brand/TolwexLogo";
import { HeroOrbit } from "@/components/recovery/HeroOrbit";
import { RECOVERY_SERVICES } from "@/lib/recovery";
import { GUIDE_ARTICLES } from "@/lib/guides";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

const GROUPS: Array<{ id: "hesap" | "buyume" | "reklam"; title: string; note: string }> = [
  {
    id: "hesap",
    title: "Hesap çözümleri",
    note: "Kapanan, askıya alınan, kullanıcı adı ve güvenlik",
  },
  { id: "buyume", title: "Büyüme & influencer", note: "Creator ve büyüme danışmanlığı" },
  { id: "reklam", title: "Reklam", note: "Kısıt kaldırma ve reklam onayları" },
];

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
              Kapanan hesap, askıya alınan hesap, kullanıcı adı alma — Instagram, TikTok, X ve daha
              fazlası. Platform seç, başvur, WhatsApp’tan ulaş.
            </p>
            <div className="rec-hero-actions">
              <a href="#kategoriler" className="btn btn-primary">
                Menüler
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

      <section className="rec-guides-teaser" id="makaleler">
        <div className="site-shell">
          <div className="rec-services-head">
            <h2 className="display">Yardımcı makaleler</h2>
            <p>Başvurmadan önce oku — süreç daha hızlı ilerler</p>
          </div>
          <div className="rec-guide-grid">
            {GUIDE_ARTICLES.slice(0, 4).map((a) => (
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
              <span>Kapanan, askı, username…</span>
            </li>
            <li>
              <strong>Platform + bilgi</strong>
              <span>Logo seç, kısa yaz — foto opsiyonel</span>
            </li>
            <li>
              <strong>WhatsApp</strong>
              <span>{CONTACT_PHONE_DISPLAY}</span>
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
