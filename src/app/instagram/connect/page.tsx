import Link from "next/link";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export const metadata = {
  title: "İletişim — TOLWEX",
};

export default function InstagramConnectPage() {
  return (
    <div className="site-shell py-8 pb-24">
      <section className="connect-hero glass-panel rounded-3xl p-6 md:p-10">
        <p className="section-kicker">Hizmetler</p>
        <h1 className="display text-3xl md:text-5xl font-bold mb-4">
          Hesap ürünleri & destek
        </h1>
        <p className="muted leading-relaxed mb-6 max-w-2xl">
          Public sitede Instagram API bağlama yok. Eski hesap, projeli paket veya
          kapanan hesap açma için ürün sayfalarını kullanın; destek WhatsApp.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/urunler/eski-tarihli-hesaplar" className="btn btn-primary">
            Eski Hesaplar
          </Link>
          <Link href="/urunler/projeli-hesaplar" className="btn btn-ghost">
            Projeli Hesaplar
          </Link>
          <Link href="/urunler/kapanan-hesap-aktif-etme" className="btn btn-ghost">
            Kapanan Hesap Aç
          </Link>
          <a
            href={whatsappUrl("Merhaba, TOLWEX destek için yazıyorum.")}
            className="btn btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp · {CONTACT_PHONE_DISPLAY}
          </a>
        </div>
      </section>
    </div>
  );
}
