import Link from "next/link";
import { SERVICES } from "@/lib/services";
import { ServiceIcon } from "@/components/marketing/ServiceIcon";

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
    { label: "TAKİPÇİLER", value: "—" },
    { label: "TAKİP EDİLENLER", value: "—" },
    { label: "TAKİP ETMEYENLER", value: "—" },
    { label: "TAKİPTEN ÇIKANLAR", value: "—" },
    { label: "ETKİLEŞİM", value: "—" },
    { label: "AKTİVİTE", value: "—" },
  ];

  return (
    <section id="analiz" className="home-section section-alt">
      <div className="site-shell">
        <div className="section-head">
          <p className="section-kicker">Instagram Analiz</p>
          <h2 className="section-title">ANALİZ PANELİ</h2>
          <p className="section-sub">
            Bağlantı sonrası erişilebilen gerçek metrikler. Sahte skor üretilmez.
          </p>
        </div>
        <div className="dash-preview">
          <div className="dash-preview-bar">
            <span className="dash-dot" />
            <span className="dash-dot" />
            <span className="dash-dot" />
            <span className="dash-bar-label">TOLWEX · Dashboard Preview</span>
          </div>
          <div className="dash-grid">
            {cards.map((c) => (
              <div key={c.label} className="dash-card">
                <p className="dash-label">{c.label}</p>
                <p className="dash-value">{c.value}</p>
                <p className="dash-hint">Bağlantı sonrası</p>
              </div>
            ))}
          </div>
          <div className="dash-cta-row">
            <Link href="/instagram/connect" className="btn btn-primary">
              Instagram ile Bağlan
            </Link>
            <Link href="/instagram/dashboard" className="btn btn-ghost">
              Paneli Aç
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProfileVisitSection() {
  return (
    <section className="home-section">
      <div className="site-shell split-block">
        <div>
          <p className="section-kicker">Profil</p>
          <h2 className="section-title">PROFİL ZİYARET ANALİZİ</h2>
          <p className="section-sub">
            Instagram kullanıcı bazında profil ziyaretçi listesini üçüncü taraf
            uygulamalara sunmaz. TOLWEX, erişilebilen gerçek etkileşim
            sinyallerinden tahmini analiz oluşturabilir.
          </p>
          <p className="legal-note">
            Kesin ziyaretçi listesi üretilmez. Yalnızca erişilebilir sinyaller
            yorumlanır.
          </p>
        </div>
        <div className="mono-panel">
          <p className="mono-panel-title">Sinyal katmanları</p>
          <ul className="mono-list">
            <li>Erişilebilir etkileşim verisi</li>
            <li>Zaman serisi değişimleri</li>
            <li>Tahmini yoğunluk modeli</li>
            <li>Sahte kullanıcı listesi yok</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function BlockingSection() {
  return (
    <section className="home-section section-alt">
      <div className="site-shell split-block">
        <div>
          <p className="section-kicker">Engelleme</p>
          <h2 className="section-title">MUHTEMEL ENGELLEME SİNYALLERİ</h2>
          <p className="section-sub">
            Bu analiz resmi bir Instagram engelleme listesi değildir. TOLWEX
            yalnızca erişilebilen gerçek veri değişikliklerini analiz eder.
          </p>
        </div>
        <div className="mono-panel">
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
            Karşılaştırma yapabilmek için önceki veri kaydı gerekiyor. Bağlantı
            kurup ilk kaydı oluşturduktan sonra sonraki kontrollerde fark
            analizi yapılabilir. Sahte veri oluşturulmaz.
          </p>
          <Link href="/instagram/connect" className="btn btn-primary mt-6 inline-flex">
            İlk kaydı başlat
          </Link>
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
    "Meta ile güvenli giriş",
    "Şifre saklamama",
    "Güvenli bağlantı",
    "Veri gizliliği",
    "Gerekli izinler",
  ];

  return (
    <section id="guvenlik" className="home-section security-band">
      <div className="site-shell">
        <div className="section-head light">
          <p className="section-kicker light">Güvenlik</p>
          <h2 className="section-title">VERİLERİNİZ SİZİN KONTROLÜNÜZDE.</h2>
          <p className="section-sub light">
            YOUR DATA. YOUR CONTROL. — Resmi OAuth, şeffaf izinler, kontrol sizde.
          </p>
        </div>
        <div className="security-grid">
          {items.map((item) => (
            <div key={item} className="security-card">
              <span className="security-card-mark" aria-hidden />
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const steps = [
    { n: "01", title: "META İLE BAĞLAN", text: "Resmi Instagram / Meta OAuth ile güvenli giriş." },
    { n: "02", title: "VERİLERİNİ ANALİZ ET", text: "Erişilebilen gerçek alanlar işlenir, uydurma skor yok." },
    { n: "03", title: "SONUÇLARINI GÖR", text: "Anlaşılır paneller ve risk sinyalleriyle içgörü alın." },
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
