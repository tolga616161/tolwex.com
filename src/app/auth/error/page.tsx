import Link from "next/link";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export default function AuthErrorPage() {
  return (
    <div className="site-shell py-16 pb-24">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 p-8 md:p-12 max-w-2xl mx-auto glass-panel">
        <h1 className="display text-3xl md:text-4xl font-bold mb-4">Bağlantı kurulamadı</h1>
        <p className="muted leading-relaxed mb-8">
          Instagram bağlantısı şu an tamamlanamadı. WhatsApp’tan yazın, ekibimiz yardımcı olsun.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={whatsappUrl("Merhaba, Instagram bağlantısında sorun yaşıyorum.")}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp {CONTACT_PHONE_DISPLAY}
          </a>
          <Link href="/instagram/connect" className="btn btn-ghost">
            Bağlantı sayfası
          </Link>
        </div>
      </div>
    </div>
  );
}
