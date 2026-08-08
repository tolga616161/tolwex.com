import Link from "next/link";
import { SERVICES } from "@/lib/services";
import { ServiceIcon } from "@/components/marketing/ServiceIcon";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export function ServicesSection() {
  return (
    <section id="hizmetler" className="home-section">
      <div className="site-shell">
        <div className="section-head">
          <p className="section-kicker">Hizmetler</p>
          <h2 className="section-title">HİZMETLERİMİZ</h2>
          <p className="section-sub">
            Sosyal istihbarat, hesap analizi ve güvenlik — tek kurumsal katmanda.
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

export function DashboardPreview() {
  const cards = [
    { label: "PROFİL ZİYARET", value: "Tahmini" },
    { label: "GÜVENLİK", value: "Kontrol" },
    { label: "ENGELLEME", value: "Sinyal" },
    { label: "TAKİP FARKI", value: "Karşılaştırma" },
    { label: "FAKE RİSK", value: "0–100" },
    { label: "DESTEK", value: "WhatsApp" },
  ];

  return (
    <section id="analiz" className="home-section section-alt">
      <div className="site-shell">
        <div className="section-head">
          <p className="section-kicker">Instagram Analiz</p>
          <h2 className="section-title">ANALİZ PANELİ</h2>
          <p className="section-sub">
            Tahmini sinyal analizi ve güvenlik rehberi — IP takibi yok, sahte
            @liste yok. Destek WhatsApp üzerinden.
          </p>
        </div>
        <div className="dash-preview">
          <div className="dash-preview-bar">
            <span className="dash-dot" />
            <span className="dash-dot" />
            <span className="dash-dot" />
            <span className="dash-bar-label">TOLWEX · Analiz Önizleme</span>
          </div>
          <div className="dash-grid">
            {cards.map((c) => (
              <div key={c.label} className="dash-card">
                <p className="dash-label">{c.label}</p>
                <p className="dash-value">{c.value}</p>
                <p className="dash-hint">Şeffaf açıklama</p>
              </div>
            ))}
          </div>
          <div className="dash-cta-row">
            <Link href="/analiz/profilime-kim-bakti" className="btn btn-primary">
              Profilime Kim Baktı?
            </Link>
            <Link href="/instagram/security" className="btn btn-ghost">
              Hesap Güvenliği
            </Link>
            <Link href="/analiz/beni-engelleyenler" className="btn btn-ghost">
              Engelleme Analizi
            </Link>
            <a
              href={whatsappUrl("Merhaba, analiz paneli hakkında yazıyorum.")}
              className="btn btn-ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Destek
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProfileVisitSection() {
  return (
    <section id="profil-ziyaret" className="home-section profile-visit-band">
      <div className="site-shell split-block">
        <div>
          <p className="section-kicker">Profilime Kim Baktı?</p>
          <h2 className="section-title">PROFİL ZİYARET ANALİZİ</h2>
          <p className="section-sub">
            Instagram kullanıcı bazında profil ziyaretçi listesini üçüncü taraf
            uygulamalara sunmaz. TOLWEX, erişilebilen etkileşim sinyallerinden
            tahmini yoğunluk analizi sunar — IP adresi veya konum takibi yoktur.
          </p>
          <ul className="promise-list">
            <li>IP / konum izleme yok</li>
            <li>Sahte @kullanıcı listesi yok</li>
            <li>Şeffaf “tahmini analiz” etiketi</li>
          </ul>
          <div className="flex flex-wrap gap-3 mt-5">
            <Link href="/analiz/profilime-kim-bakti" className="btn btn-primary">
              Analiz ekranını aç
            </Link>
            <a
              href={whatsappUrl("Profilime kim baktı analizi hakkında yazıyorum.")}
              className="btn btn-ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp ile sor
            </a>
          </div>
        </div>
        <div className="mono-panel analysis-feature-card profile-signal-panel">
          <div className="analysis-visual accent-eye" aria-hidden>
            <span className="analysis-visual-orb" />
            <span className="analysis-visual-core">◉</span>
          </div>
          <p className="mono-panel-title">Sinyal katmanları</p>
          <ul className="mono-list">
            <li>Erişilebilir etkileşim verisi</li>
            <li>Zaman serisi değişimleri</li>
            <li>Tahmini yoğunluk modeli</li>
            <li>IP / cihaz parmak izi yok</li>
          </ul>
          <p className="legal-note" style={{ marginTop: "1rem" }}>
            Kesin ziyaretçi kimliği üretilmez — yalnızca TAHMİNİ ANALİZ.
          </p>
        </div>
      </div>
    </section>
  );
}

export function BlockingSection() {
  return (
    <section id="engelleme" className="home-section section-alt">
      <div className="site-shell split-block">
        <div>
          <p className="section-kicker">Beni Engelleyenler</p>
          <h2 className="section-title">ENGELLEME ANALİZİ</h2>
          <p className="section-sub">
            Bu analiz resmi bir Instagram engelleme listesi değildir. TOLWEX
            yalnızca erişilebilen gerçek veri değişikliklerini — muhtemel
            engelleme sinyallerini — yorumlar.
          </p>
          <Link href="/analiz/beni-engelleyenler" className="btn btn-primary mt-4 inline-flex">
            Engelleme analizini aç
          </Link>
        </div>
        <div className="mono-panel analysis-feature-card">
          <div className="analysis-visual accent-block" aria-hidden>
            <span className="analysis-visual-orb" />
            <span className="analysis-visual-core">⊘</span>
          </div>
          <p className="mono-panel-title">Ne gösterilir?</p>
          <ul className="mono-list">
            <li>Karşılıklı görünürlük değişimleri</li>
            <li>Liste tutarsızlıkları</li>
            <li>Olasılık / güven bandı</li>
            <li>Kesin engelleyen listesi yok</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function UnfollowSection() {
  return (
    <section id="takipten-cikanlar" className="home-section">
      <div className="site-shell">
        <div className="section-head">
          <p className="section-kicker">Takip</p>
          <h2 className="section-title">TAKİPTEN ÇIKANLAR</h2>
          <p className="section-sub">
            Gerçek geçmiş veri mevcutsa önceki takipçi listesi ile yeni liste
            karşılaştırılır. Sonuç: son kontrolden bu yana değişen hesaplar.
          </p>
        </div>
        <div className="mono-panel wide">
          <p className="mono-panel-title">Karşılaştırma durumu</p>
          <p className="legal-note" style={{ marginTop: "0.75rem" }}>
            Karşılaştırma için önceki kayıt gerekir. Veri yoksa sonuç boş kalır —
            sahte @liste üretilmez. Destek için WhatsApp’tan yazabilirsiniz.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link href="/analiz/takipten-cikanlar" className="btn btn-primary inline-flex">
              Takipten çıkanlar
            </Link>
            <Link href="/analiz/takip-etmeyenler" className="btn btn-ghost inline-flex">
              Takip etmeyenler
            </Link>
            <a
              href={whatsappUrl("Takipten çıkanlar analizi hakkında yazıyorum.")}
              className="btn btn-ghost inline-flex"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp Destek
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FakeRiskSection() {
  return (
    <section id="fake-hesap" className="home-section section-alt">
      <div className="site-shell">
        <div className="section-head">
          <p className="section-kicker">Risk</p>
          <h2 className="section-title">FAKE HESAP TESPİTİ</h2>
          <p className="section-sub">
            Risk skoru sinyal tabanlıdır. “Bu hesap kesinlikle fake” gibi kesin
            hüküm verilmez.
          </p>
        </div>
        <div className="risk-board">
          <div className="risk-levels">
            {["LOW", "MEDIUM", "HIGH"].map((level) => (
              <div key={level} className="risk-level">
                <span className="risk-level-label">ACCOUNT RISK</span>
                <strong>{level}</strong>
              </div>
            ))}
          </div>
          <div className="risk-signals">
            {[
              "Profil aktivitesi",
              "Takipçi / takip oranı",
              "Etkileşim oranı",
              "Profil bilgileri",
              "Gönderi durumu",
              "Hesap davranışları",
            ].map((s) => (
              <div key={s} className="risk-signal">
                <span className="risk-signal-dot" />
                {s}
              </div>
            ))}
          </div>
          <Link href="/analiz/fake-hesap" className="btn btn-primary mt-6 inline-flex">
            Risk analizini aç
          </Link>
        </div>
      </div>
    </section>
  );
}

export function NewsRemovalSection() {
  return (
    <section className="home-section">
      <div className="site-shell split-block">
        <div>
          <p className="section-kicker">İtibar</p>
          <h2 className="section-title">HABER & İÇERİK KALDIRMA</h2>
          <p className="section-sub">
            Uygun resmi başvuru ve kaldırma süreçlerinde rehberlik. Garanti
            sonucu vaat edilmez; süreç platform kurallarına bağlıdır.
          </p>
          <Link href="/urunler/haber-silme" className="btn btn-primary mt-4 inline-flex">
            Rehberi İncele
          </Link>
        </div>
        <div className="mono-panel icon-panel">
          <ServiceIcon name="news" />
          <ServiceIcon name="security" />
        </div>
      </div>
    </section>
  );
}

export function SecuritySection() {
  const items = [
    {
      title: "2FA kontrolü",
      text: "İki faktörlü doğrulamayı açın; yedek kodları saklayın.",
    },
    {
      title: "Cihaz & oturum",
      text: "Tanımadığınız cihazları kapatın, şifreyi yenileyin.",
    },
    {
      title: "Şifre güvenliği",
      text: "Benzersiz parola; bu sitede şifre istenmez.",
    },
    {
      title: "Bağlı uygulamalar",
      text: "Kullanmadığınız üçüncü taraf erişimlerini kaldırın.",
    },
    {
      title: "WhatsApp destek",
      text: `${CONTACT_PHONE_DISPLAY} — şüpheli durumda yazın.`,
    },
  ];

  return (
    <section id="guvenlik" className="home-section security-band">
      <div className="site-shell">
        <div className="section-head light">
          <p className="section-kicker light">Hesap Güvenliği</p>
          <h2 className="section-title">HESABINIZI KORUYUN.</h2>
          <p className="section-sub light">
            IP ile gizli takip yok. Resmi Instagram güvenlik adımları + TOLWEX
            kontrol listesi — şifrenizi bizimle paylaşmanız gerekmez.
          </p>
        </div>
        <div className="security-grid security-grid-rich">
          {items.map((item) => (
            <div key={item.title} className="security-card security-card-rich">
              <span className="security-card-mark" aria-hidden />
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
        <div className="security-cta-row">
          <Link href="/instagram/security" className="btn btn-primary">
            Güvenlik merkezini aç
          </Link>
          <a
            href={whatsappUrl("Hesap güvenliği hakkında yazıyorum.")}
            className="btn btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp Destek
          </a>
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      n: "01",
      title: "KONU SEÇ",
      text: "Kim baktı, güvenlik, engelleme veya takip farkı — ihtiyacını seç.",
    },
    {
      n: "02",
      title: "ŞEFFAF ANALİZ",
      text: "Tahmini / sinyal açıklaması gösterilir. IP veya sahte liste yok.",
    },
    {
      n: "03",
      title: "DESTEK AL",
      text: "WhatsApp üzerinden profesyonel yönlendirme ve güvenlik adımları.",
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
