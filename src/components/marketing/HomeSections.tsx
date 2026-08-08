export function HowItWorksSection() {
  const steps = [
    {
      n: "01",
      title: "HİZMET SEÇ",
      text: "smmapi.com’dan otomatik çekilen binlerce SMM servisten birini seç.",
    },
    {
      n: "02",
      title: "ÜYE GİRİŞİ",
      text: "Kayıt ol / giriş yap — Instagram bağlama veya şifre istenmez.",
    },
    {
      n: "03",
      title: "SİPARİŞ VER",
      text: "Link + adet gir; sipariş SMM API’ye otomatik düşer.",
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
