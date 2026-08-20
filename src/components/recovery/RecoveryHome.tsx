import Link from "next/link";
import { RECOVERY_SERVICES } from "@/lib/recovery";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";
import { CyberHeroStage } from "@/components/recovery/CyberHeroStage";

export function RecoveryHome() {
  const wa = whatsappUrl("Merhaba, TOLWEX hesap kurtarma / fake şikayet için yazıyorum.");

  return (
    <div className="rec-home">
      <section className="rec-hero cyber-hero">
        <CyberHeroStage />
        <div className="site-shell rec-hero-inner">
          <p className="rec-brand-mark cyber-glitch" data-text="TOLWEX">
            TOLWEX
          </p>
          <p className="cyber-line">// 010101 · sosyal medya hesap kurtarma</p>
          <h1 className="rec-hero-title display">
            Kapanan, çalınan
            <span>&amp; fake hesap</span>
          </h1>
          <p className="rec-hero-sub">
            Instagram · Facebook · TikTok… Platformu seç, fotoğraf ekle, sebebi yaz — başvuru
            doğrudan WhatsApp’a düşer. Yazılım / güvenlik operasyon görünümüyle hızlı destek.
          </p>
          <div className="rec-hero-actions">
            <Link href="/basvuru/kapanan" className="btn btn-primary">
              Kapanan hesap
            </Link>
            <Link href="/basvuru/calinan" className="btn btn-ghost">
              Çalınan hesap
            </Link>
            <Link href="/basvuru/fake" className="btn btn-ghost">
              Fake hesap şikayeti
            </Link>
          </div>
        </div>
      </section>

      <section className="rec-services">
        <div className="site-shell">
          <div className="rec-services-head">
            <h2 className="display">Operasyon menüsü</h2>
            <p>3 başvuru tipi · platform seç · fotoğraf yükle · WhatsApp’a ilet</p>
          </div>
          <div className="rec-service-grid rec-service-grid-3">
            {RECOVERY_SERVICES.map((s) => (
              <Link key={s.slug} href={s.href} className="rec-service-card">
                <span className="rec-service-eye">{s.eyebrow}</span>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <span className="rec-service-go">Formu aç →</span>
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
              <strong>Platform seç</strong>
              <span>Instagram, Facebook, TikTok…</span>
            </li>
            <li>
              <strong>Fotoğraf / ekran ekle</strong>
              <span>Giriş, kapanma veya fake profil resmi</span>
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
