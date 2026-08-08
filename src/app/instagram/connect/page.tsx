import Link from "next/link";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export const metadata = {
  title: "İletişim & Destek — TOLWEX",
};

export default function InstagramConnectPage() {
  return (
    <div className="site-shell py-8 pb-24">
      <section className="connect-hero glass-panel rounded-3xl p-6 md:p-10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <p className="section-kicker">Destek</p>
          <h1 className="display text-3xl md:text-5xl font-bold mb-4">
            WhatsApp üzerinden destek
          </h1>
          <p className="muted leading-relaxed mb-4">
            Public sitede Instagram API bağlantısı veya şifre istenmez. Profil
            ziyaret analizi IP ile yapılmaz. Güvenlik ve analiz için WhatsApp’tan
            yazın veya ilgili sayfaları açın.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
            <a
              href={whatsappUrl("Merhaba, TOLWEX destek için yazıyorum.")}
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp · {CONTACT_PHONE_DISPLAY}
            </a>
            <Link href="/instagram/security" className="btn btn-ghost">
              Hesap Güvenliği
            </Link>
            <Link href="/analiz/profilime-kim-bakti" className="btn btn-ghost">
              Profilime Kim Baktı?
            </Link>
          </div>
          <p className="legal-note">
            Meta Developer / OAuth ayarları yalnızca admin panelinde yönetilir —
            ziyaretçi arayüzünde API bağlama teşvik edilmez.
          </p>
        </div>
      </section>

      <section className="mt-8 grid md:grid-cols-2 gap-4">
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="display text-xl mb-2">Profil ziyaret</h3>
          <p className="muted text-sm leading-relaxed">
            Kesin “kim baktı” listesi ve IP takibi yoktur. Tahmini sinyal analizi
            ve şeffaf sınırlar sunulur.
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="display text-xl mb-2">Hesap güvenliği</h3>
          <p className="muted text-sm leading-relaxed">
            2FA, cihaz, şifre ve bağlı uygulamalar için resmi adımlar + TOLWEX
            kontrol listesi.
          </p>
        </div>
      </section>
    </div>
  );
}
