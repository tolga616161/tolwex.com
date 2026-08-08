"use client";

import { useState } from "react";

const sections = [
  {
    id: "what",
    title: "2FA nedir?",
    body: "İki faktörlü doğrulama (2FA), şifrenize ek olarak telefonunuzdaki bir uygulama veya SMS ile gelen kodu ister. Böylece şifreniz sızsa bile hesabınıza giriş zorlaşır.",
    href: "https://help.instagram.com/566904619951951",
  },
  {
    id: "why",
    title: "Neden kullanılmalı?",
    body: "Phishing, sızdırılmış parolalar ve otomatik saldırılara karşı en etkili kişisel koruma katmanlarından biridir.",
    href: "https://help.instagram.com/566904619951951",
  },
  {
    id: "enable",
    title: "Nasıl aktif edilir?",
    body: "Instagram uygulamasında profil → menü → Hesap Merkezi → Şifre ve güvenlik → İki faktörlü kimlik doğrulama yolunu izleyin.",
    href: "https://help.instagram.com/566904619951951",
  },
  {
    id: "app",
    title: "Authentication app kullanımı",
    body: "Authenticator uygulamaları (ör. Meta’nın önerdiği uygulamalar) SMS’e göre daha güvenli kabul edilir. Kurulum sırasında QR kodu tarayın.",
    href: "https://www.facebook.com/help/1483090225242670",
  },
  {
    id: "sms",
    title: "SMS doğrulaması",
    body: "SMS kullanılabilir ancak SIM değiştirme riski vardır. Mümkünse authentication app tercih edin.",
    href: "https://help.instagram.com/566904619951951",
  },
  {
    id: "backup",
    title: "Backup codes",
    body: "Yedek kodları güvenli bir yere kaydedin. Telefonunuzu kaybederseniz hesaba dönmenizi sağlar.",
    href: "https://help.instagram.com/566904619951951",
  },
  {
    id: "logins",
    title: "Şüpheli girişleri kontrol etme",
    body: "Hesap Merkezi’nde “Giriş yaptığı yerler” bölümünden tanımadığınız oturumları inceleyin.",
    href: "https://www.facebook.com/help/162968940809035",
  },
  {
    id: "devices",
    title: "Tanımadığın cihazlardan çıkış yapma",
    body: "Tanımadığınız oturumları sonlandırın, ardından şifrenizi değiştirin ve 2FA’yı doğrulayın.",
    href: "https://www.facebook.com/help/162968940809035",
  },
  {
    id: "apps",
    title: "Şüpheli üçüncü taraf uygulamaları kaldırma",
    body: "Uygulamalar ve web siteleri listesinden tanımadığınız veya kullanmadığınız erişimleri kaldırın.",
    href: "https://www.facebook.com/help/262314300536155",
  },
];

export default function GuidePage() {
  const [open, setOpen] = useState<string | null>("what");

  return (
    <div className="site-shell py-10 pb-20">
      <h1 className="display text-4xl md:text-5xl font-bold mb-3 fade-up">
        2FA Güvenlik Rehberi
      </h1>
      <p className="muted max-w-2xl mb-10 fade-up-delay">
        Bu rehber bilgilendirme amaçlıdır. Instagram şifresi, 2FA kodu veya recovery
        code bu sitede istenmez.
      </p>

      <div className="space-y-3">
        {sections.map((s) => (
          <article key={s.id} className="surface rounded-2xl p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h2 className="display text-xl">{s.title}</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-ghost text-sm"
                  onClick={() => setOpen(open === s.id ? null : s.id)}
                >
                  Nasıl yapılır?
                </button>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost text-sm"
                >
                  Resmi kaynak
                </a>
              </div>
            </div>
            {open === s.id ? (
              <p className="mt-4 muted text-sm leading-relaxed">{s.body}</p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
