import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";
import { SecurityChecklist } from "@/components/instagram/SecurityChecklist";
import { API_NOT_PROVIDED } from "@/lib/meta/api";

const topics = [
  {
    title: "2FA",
    text: "İki faktörlü doğrulama, şifreniz ele geçirilse bile hesabı korur.",
    href: "https://help.instagram.com/566904619951951",
  },
  {
    title: "Şüpheli girişler",
    text: "Tanımadığınız konum veya cihaz görürseniz oturumları kapatın ve şifrenizi değiştirin.",
    href: "https://www.facebook.com/help/162968940809035",
  },
  {
    title: "E-posta güvenliği",
    text: "Instagram’a bağlı e-posta hesabınızda da 2FA kullanın.",
    href: "https://help.instagram.com/502981923235522",
  },
  {
    title: "Telefon güvenliği",
    text: "SIM swap riskine karşı telefon numaranızı güncel ve korumalı tutun.",
    href: "https://www.facebook.com/help/203305893040179",
  },
  {
    title: "Bağlı uygulamalar",
    text: "Kullanmadığınız üçüncü taraf uygulamaların erişimini kaldırın.",
    href: "https://www.facebook.com/help/262314300536155",
  },
  {
    title: "Güçlü parola",
    text: "Benzersiz ve uzun bir parola kullanın; paylaşmayın.",
    href: "https://help.instagram.com/369001354735370",
  },
  {
    title: "Backup codes",
    text: "Yedek kodları çevrimdışı ve güvenli bir yerde saklayın.",
    href: "https://help.instagram.com/566904619951951",
  },
];

export default function SecurityCenterPage() {
  return (
    <div className="site-shell py-10 pb-20 space-y-10">
      <section className="fade-up">
        <h1 className="display text-4xl md:text-5xl font-bold mb-3">Güvenlik Merkezi</h1>
        <p className="muted max-w-2xl">
          Bu merkez resmi Meta API’nin sağlayabildiği bağlantı bilgileri ile sizin
          kendi kontrol listenizi bir araya getirir. API’nin doğrulamadığı iddialar
          üretilmez.
        </p>
      </section>

      <section className="surface rounded-2xl p-6 fade-up-delay">
        <h2 className="display text-2xl mb-3">Güvenlik Kontrolü</h2>
        <ul className="space-y-3">
          <li className="flex gap-3 items-center">
            <span className="status-dot status-warn" />
            <span>Bazı güvenlik bilgileri API tarafından sağlanmıyor</span>
          </li>
          <li className="flex gap-3 items-center">
            <span className="status-dot status-idle" />
            <span className="muted">{API_NOT_PROVIDED.securityScore}</span>
          </li>
          <li className="flex gap-3 items-center">
            <span className="status-dot status-idle" />
            <span className="muted">{API_NOT_PROVIDED.selfieVerification}</span>
          </li>
          <li className="flex gap-3 items-center">
            <span className="status-dot status-idle" />
            <span className="muted">{API_NOT_PROVIDED.twoFactorStatus}</span>
          </li>
        </ul>
        <p className="mt-5 text-sm muted border-t border-white/10 pt-4">
          İncelemeniz önerilir. Şüpheli giriş fark ettiyseniz resmi hesap güvenliği
          adımlarını uygulayın.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ConnectButton label="Instagram Hesabını Bağla" />
          <Link href="/instagram/dashboard" className="btn btn-ghost">
            Kontrol Ekranı
          </Link>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        {topics.map((t) => (
          <article key={t.title} className="surface rounded-2xl p-5">
            <h3 className="display text-xl mb-2">{t.title}</h3>
            <p className="muted text-sm mb-4 leading-relaxed">{t.text}</p>
            <a
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost text-sm"
            >
              Nasıl yapılır?
            </a>
          </article>
        ))}
      </section>

      <SecurityChecklist />
    </div>
  );
}
