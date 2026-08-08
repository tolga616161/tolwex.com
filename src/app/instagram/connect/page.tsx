import Link from "next/link";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export const metadata = {
  title: "Instagram Hesabını Bağla — TOLWEX",
};

export default function InstagramConnectPage() {
  return (
    <div className="site-shell py-8 pb-24">
      <section className="connect-hero glass-panel rounded-3xl p-6 md:p-10 relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-80 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 15% 20%, rgba(221,42,123,0.22), transparent 40%), radial-gradient(circle at 85% 10%, rgba(245,133,41,0.18), transparent 42%), radial-gradient(circle at 50% 100%, rgba(46,196,182,0.12), transparent 45%)",
          }}
        />
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.2em] mb-3" style={{ color: "#ff8cc8" }}>
            Resmi Instagram bağlantısı
          </p>
          <h1 className="display text-3xl md:text-5xl font-bold mb-4">
            Instagram hesabını güvenli bağla
          </h1>
          <p className="muted leading-relaxed mb-4">
            Bu sitede Instagram şifresi, cookie, session veya 2FA kodu
            <strong className="text-white"> istenmez</strong>. Bağlantı Meta’nın
            resmi ekranı üzerinden yapılır.
          </p>
          <div className="glass-panel rounded-2xl p-4 mb-6 text-sm leading-relaxed">
            <p className="font-semibold text-white mb-1">Hızlı destek</p>
            <p className="muted">
              Hesap güvenlik kontrolü ve bağlantı için WhatsApp’tan yazın —
              ekibimiz süreci sizinle birlikte tamamlar.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <a
              href={whatsappUrl("Merhaba, Instagram hesabımı güvenli bağlamak istiyorum.")}
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp ile Başla — {CONTACT_PHONE_DISPLAY}
            </a>
            <Link href="/instagram/security" className="btn btn-ghost">
              Güvenlik Merkezi
            </Link>
            <Link href="/urunler/instagram-hesap-guvenlik-kontrolu" className="btn btn-ghost">
              Güvenlik ürününü incele
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
