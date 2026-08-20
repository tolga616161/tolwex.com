import Link from "next/link";
import { TolwexLogo } from "@/components/brand/TolwexLogo";
import { RECOVERY_SERVICES } from "@/lib/recovery";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

const CAT_META: Record<string, { icon: string; blurb: string }> = {
  kapanan: { icon: "01", blurb: "Kapalı veya engelli hesap başvurusu" },
  calinan: { icon: "02", blurb: "Çalınan / ele geçirilen hesap başvurusu" },
  fake: { icon: "03", blurb: "Adınıza açılan sahte hesap şikayeti" },
};

export function RecoveryHome() {
  const wa = whatsappUrl("Merhaba, TOLWEX hesap kurtarma için yazıyorum.");

  return (
    <div className="rec-home is-clean">
      <section className="rec-hero rec-hero-clean">
        <div className="rec-hero-soft" aria-hidden />
        <div className="site-shell rec-hero-inner">
          <div className="rec-hero-logo">
            <TolwexLogo size="lg" showMark showWordmark />
          </div>
          <h1 className="rec-hero-title display">
            Hesap kurtarma
            <span>başvuru merkezi</span>
          </h1>
          <p className="rec-hero-sub">
            Platformu seç, fotoğraf ekle, kısa bilgi yaz — başvurun WhatsApp’tan bize ulaşır.
          </p>
          <div className="rec-hero-actions">
            <Link href="/basvuru/kapanan" className="btn btn-primary">
              Başvuruya başla
            </Link>
            <a href={wa} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="rec-services">
        <div className="site-shell">
          <div className="rec-services-head">
            <h2 className="display">Kategoriler</h2>
            <p>İhtiyacına uygun formu seç</p>
          </div>
          <div className="rec-service-grid rec-service-grid-3">
            {RECOVERY_SERVICES.map((s) => {
              const meta = CAT_META[s.slug] || { icon: "•", blurb: s.short };
              return (
                <Link key={s.slug} href={s.href} className="rec-service-card rec-cat-card">
                  <span className="rec-cat-num">{meta.icon}</span>
                  <h3>{s.title}</h3>
                  <p>{meta.blurb}</p>
                  <span className="rec-service-go">Devam →</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rec-how">
        <div className="site-shell rec-how-inner rec-how-clean">
          <h2 className="display">3 adım</h2>
          <ol className="rec-how-list">
            <li>
              <strong>Kategori seç</strong>
              <span>Kapanan, çalınan veya fake</span>
            </li>
            <li>
              <strong>Fotoğraf ekle</strong>
              <span>Ekran görüntüsü yükle</span>
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
