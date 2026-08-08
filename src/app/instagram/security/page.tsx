import Link from "next/link";
import { SecurityChecklist } from "@/components/instagram/SecurityChecklist";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export const metadata = {
  title: "Hesap Güvenliği — TOLWEX",
};

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
    text: "Benzersiz ve uzun bir parola kullanın; paylaşmayın. Bu sitede şifre istenmez.",
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
    <div className="site-shell py-10 pb-20 space-y-10 security-page">
      <section className="security-page-hero glass-panel rounded-3xl p-6 md:p-10 fade-up">
        <p className="section-kicker">Hesap Güvenliği</p>
        <h1 className="display text-4xl md:text-5xl font-bold mb-3">Güvenlik Merkezi</h1>
        <p className="muted max-w-2xl mb-4">
          Resmi Instagram güvenlik adımları ve TOLWEX kontrol listesi. IP ile gizli
          takip yok; şifrenizi bu sitede yazmanız gerekmez.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={whatsappUrl("Hesap güvenliği hakkında yazıyorum.")}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp Destek · {CONTACT_PHONE_DISPLAY}
          </a>
          <Link href="/analiz/profilime-kim-bakti" className="btn btn-ghost">
            Profilime Kim Baktı?
          </Link>
        </div>
      </section>

      <section className="surface rounded-2xl p-6 fade-up-delay security-status-panel">
        <h2 className="display text-2xl mb-3">Öncelikli kontroller</h2>
        <ul className="space-y-3">
          <li className="flex gap-3 items-center">
            <span className="status-dot status-warn" />
            <span>2FA açık mı? Yedek kodlar saklandı mı?</span>
          </li>
          <li className="flex gap-3 items-center">
            <span className="status-dot status-idle" />
            <span className="muted">Tanımadığınız oturum / cihaz var mı?</span>
          </li>
          <li className="flex gap-3 items-center">
            <span className="status-dot status-idle" />
            <span className="muted">Kullanılmayan üçüncü taraf uygulama erişimi?</span>
          </li>
          <li className="flex gap-3 items-center">
            <span className="status-dot status-ok" />
            <span className="muted">TOLWEX şifre veya IP takibi istemez</span>
          </li>
        </ul>
        <p className="mt-5 text-sm muted border-t border-white/10 pt-4">
          Şüpheli giriş fark ettiyseniz resmi hesap güvenliği adımlarını uygulayın;
          gerekirse WhatsApp’tan yazın.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        {topics.map((t) => (
          <article key={t.title} className="surface rounded-2xl p-5 security-topic-card">
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
