import Link from "next/link";
import { SERVICES } from "@/lib/services";
import { ServiceIcon } from "@/components/marketing/ServiceIcon";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export function ServicesSection() {
  return (
    <section id="hizmetler" className="home-section">
      <div className="site-shell">
        <div className="section-head">
          <p className="section-kicker">Ürünler</p>
          <h2 className="section-title">HESAP HİZMETLERİ</h2>
          <p className="section-sub">
            Meta eski hesap, projeli paket ve kapanan hesap açma — tek yerden.
          </p>
        </div>
        <div className="service-grid">
          {SERVICES.map((s) => (
            <Link key={s.id} href={s.href} className="service-card">
              <div className="service-card-top">
                <span className="service-num">{s.number}</span>
                <span className="service-icon-wrap">
                  <ServiceIcon name={s.icon} />
                </span>
              </div>
              <h3 className="service-title">{s.title}</h3>
              <p className="service-desc">{s.description}</p>
              <span className="service-cta">İncele →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedProductsSection() {
  const items = [
    {
      href: "/urunler/eski-tarihli-hesaplar",
      kicker: "Meta · Instagram",
      title: "Eski Tarihli Hesaplar",
      text: "Yaş / tarih filtresiyle uygun hesap seçenekleri ve güvenli teslim.",
      cta: "Eski hesap bak",
    },
    {
      href: "/urunler/projeli-hesaplar",
      kicker: "Proje · Marka",
      title: "Projeli Hesaplar",
      text: "Kampanya ve marka için hazır / yaşlı hesap paketleri.",
      cta: "Proje paketi",
    },
    {
      href: "/urunler/kapanan-hesap-aktif-etme",
      kicker: "Kurtarma",
      title: "Kapanan Hesap Açma",
      text: "Kapanma ekranını yükle, nedeni yaz — itiraz sürecini başlat.",
      cta: "Hesabı yükle",
    },
  ];

  return (
    <section id="urunler-onepager" className="home-section section-alt">
      <div className="site-shell">
        <div className="section-head">
          <p className="section-kicker">Öne çıkan</p>
          <h2 className="section-title">NE İSTİYORSAN SEÇ</h2>
        </div>
        <div className="product-spotlight-grid">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="product-spotlight">
              <p className="section-kicker">{item.kicker}</p>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <span className="service-cta">{item.cta} →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RecoveryHighlightSection() {
  return (
    <section id="kapanan-hesap" className="home-section recovery-band">
      <div className="site-shell split-block">
        <div>
          <p className="section-kicker">Kapanan hesap</p>
          <h2 className="section-title">EKRANI YÜKLE, NEDENİ YAZ.</h2>
          <p className="section-sub">
            Askıya alınan veya kapanan Instagram / Facebook hesabın için kapanma
            ekranı görselini yükle, ne olduğunu anlat. Ekip WhatsApp üzerinden
            süreç takibi yapar.
          </p>
          <ul className="promise-list">
            <li>Kapanma / askı ekran görüntüsü</li>
            <li>Hesap adı + platform</li>
            <li>Neden kapandı açıklaması</li>
            <li>Şifre istenmez</li>
          </ul>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link href="/urunler/kapanan-hesap-aktif-etme" className="btn btn-primary">
              Hesabı yükle
            </Link>
            <a
              href={whatsappUrl("Kapanan hesap açma için yazıyorum.")}
              className="btn btn-ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp {CONTACT_PHONE_DISPLAY}
            </a>
          </div>
        </div>
        <div className="mono-panel recovery-visual-panel" aria-hidden>
          <div className="recovery-mock">
            <span className="recovery-mock-bar" />
            <strong>Hesabınız askıya alındı</strong>
            <p>Topluluk Kuralları · görsel yükle</p>
            <span className="recovery-mock-btn">Ekran görüntüsü ekle</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      n: "01",
      title: "ÜRÜN SEÇ",
      text: "Eski hesap, projeli paket veya kapanan hesap açma.",
    },
    {
      n: "02",
      title: "BİLGİ / GÖRSEL",
      text: "İhtiyaçlarını yaz; kapanan hesapta ekran görüntüsü yükle.",
    },
    {
      n: "03",
      title: "WHATSAPP TAKİP",
      text: "Teklif ve süreç güncellemesi WhatsApp üzerinden gelir.",
    },
  ];

  return (
    <section id="nasil-calisir" className="home-section">
      <div className="site-shell">
        <div className="section-head">
          <p className="section-kicker">Süreç</p>
          <h2 className="section-title">NASIL ÇALIŞIR?</h2>
        </div>
        <div className="steps-row">
          {steps.map((s, i) => (
            <div key={s.n} className="step-card">
              <span className="step-num">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              {i < steps.length - 1 ? <span className="step-line" aria-hidden /> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
