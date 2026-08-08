import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";
import { getMetaConfig } from "@/lib/meta/config";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export const metadata = {
  title: "Instagram Hesabını Bağla — SecureLink",
};

export default async function InstagramConnectPage() {
  const config = await getMetaConfig();

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
            <strong className="text-white"> istenmez</strong>. Bağlantı yalnızca
            Meta’nın resmi giriş ekranından yapılır.
          </p>
          <div className="glass-panel rounded-2xl p-4 mb-6 text-sm leading-relaxed">
            <p className="font-semibold text-white mb-1">Neden Facebook açılıyor?</p>
            <p className="muted">
              Instagram Business/Creator bağlantısı Meta kimlik doğrulaması üzerinden
              çalışır. Bu normal ve resmi akıştır — şifrenizi bizim sitemize yazmazsınız.
            </p>
          </div>

          {!config.configured ? (
            <p className="muted text-sm mb-4">
              Bağlantı şu an hazırlanıyor. Destek için WhatsApp:{" "}
              <a
                href={whatsappUrl("Instagram bağlantısı için yazıyorum.")}
                className="underline"
                style={{ color: "var(--accent)" }}
              >
                {CONTACT_PHONE_DISPLAY}
              </a>
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <ConnectButton label="Instagram Hesabımı Bağla" force />
              <Link href="/instagram/dashboard" className="btn btn-ghost">
                Kontrol ekranına git
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 grid md:grid-cols-3 gap-4">
        {[
          {
            t: "1. Bağla",
            d: "Meta’nın resmi ekranından Instagram’ı onaylayın.",
            href: "#",
          },
          {
            t: "2. Kontrol et",
            d: "Bağlantı, izinler ve hesap durumunu dashboard’da görün.",
            href: "/instagram/dashboard",
          },
          {
            t: "3. Güçlendir",
            d: "2FA ve cihaz kontrolü için güvenlik merkezini kullanın.",
            href: "/instagram/security",
          },
        ].map((x) => (
          <Link
            key={x.t}
            href={x.href === "#" ? "/instagram/connect" : x.href}
            className="glass-panel rounded-2xl p-5 block"
          >
            <h3 className="display text-xl mb-2">{x.t}</h3>
            <p className="muted text-sm">{x.d}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
