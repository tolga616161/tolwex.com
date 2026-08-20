import Link from "next/link";
import { RECOVERY_SERVICES } from "@/lib/recovery";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export function RecoveryHome() {
  const wa = whatsappUrl("Merhaba, TOLWEX hesap kurtarma için yazıyorum.");

  return (
    <div className="rec-home">
      <section className="rec-hero">
        <div className="rec-hero-bg" aria-hidden />
        <div className="rec-hero-grain" aria-hidden />
        <div className="site-shell rec-hero-inner">
          <p className="rec-brand-mark">TOLWEX</p>
          <h1 className="rec-hero-title display">
            Kapanan ve çalınan
            <span>hesap kurtarma</span>
          </h1>
          <p className="rec-hero-sub">
            Başvuru formunu doldur, ekran görüntünü yükle — her şey doğrudan WhatsApp’tan bize
            gelsin.
          </p>
          <div className="rec-hero-actions">
            <Link href="/basvuru/kapanan" className="btn btn-primary">
              Kapanan hesap
            </Link>
            <Link href="/basvuru/calinan" className="btn btn-ghost">
              Çalınan hesap
            </Link>
          </div>
        </div>
      </section>

      <section className="rec-services">
        <div className="site-shell">
          <div className="rec-services-head">
            <h2 className="display">Hizmetler</h2>
            <p>İki başvuru. Form doldur, görsel ekle, WhatsApp’tan ilet.</p>
          </div>
          <div className="rec-service-grid">
            {RECOVERY_SERVICES.map((s) => (
              <Link key={s.slug} href={s.href} className="rec-service-card">
                <span className="rec-service-eye">{s.eyebrow}</span>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <span className="rec-service-go">Başvuru formu →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rec-how">
        <div className="site-shell rec-how-inner">
          <h2 className="display">Nasıl işler?</h2>
          <ol className="rec-how-list">
            <li>
              <strong>Formu doldur</strong>
              <span>Hesap adı, zaman, sebep</span>
            </li>
            <li>
              <strong>Ekran resmi yükle</strong>
              <span>Giriş / kapanma / çalıntı ekranı</span>
            </li>
            <li>
              <strong>WhatsApp’a gönder</strong>
              <span>{CONTACT_PHONE_DISPLAY}</span>
            </li>
          </ol>
          <a href={wa} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
            Direkt WhatsApp yaz
          </a>
        </div>
      </section>
    </div>
  );
}
