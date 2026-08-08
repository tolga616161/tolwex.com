export function HowItWorksSection() {
  const steps = [
    { n: "01", title: "ÜYE OL", text: "Kullanıcı adı ve şifre ile panel hesabı aç." },
    { n: "02", title: "BAKİYE YÜKLE", text: "Talep veya kupon ile bakiyeni doldur." },
    { n: "03", title: "SİPARİŞ VER", text: "Tekli / toplu sipariş veya API ile gönder." },
    { n: "04", title: "TAKİP ET", text: "Siparişlerim ve dashboard’dan durumu izle." },
  ];

  return (
    <section id="nasil-calisir" className="home-section">
      <div className="site-shell">
        <div className="section-head">
          <p className="section-kicker">Nasıl çalışır?</p>
          <h2 className="section-title">PANEL ADIMLARI</h2>
        </div>
        <div className="steps-row steps-4">
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
