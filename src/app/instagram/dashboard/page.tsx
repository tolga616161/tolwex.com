import Link from "next/link";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export const metadata = {
  title: "Instagram Hesap Kontrolü — TOLWEX",
};

export default function DashboardPage() {
  return (
    <div className="site-shell py-10 pb-20 max-w-2xl">
      <h1 className="display text-3xl md:text-5xl font-bold mb-4">
        Instagram Hesap Kontrolü
      </h1>
      <p className="muted leading-relaxed mb-6">
        Canlı API kontrolü için WhatsApp üzerinden destek alın. Şifre istemeyiz;
        süreç resmi Meta bağlantısıyla yürütülür.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href={whatsappUrl("Merhaba, Instagram hesap kontrolü istiyorum.")}
          className="btn btn-primary"
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp {CONTACT_PHONE_DISPLAY}
        </a>
        <Link href="/instagram/security" className="btn btn-ghost">
          Güvenlik Merkezi
        </Link>
      </div>
    </div>
  );
}
