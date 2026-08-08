import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export const metadata = {
  title: "Instagram Hesabını Bağla — TOLWEX",
};

const isStaticHost = process.env.GITHUB_PAGES === "1";

export default async function InstagramConnectPage() {
  let configured = false;
  if (!isStaticHost) {
    try {
      const { getMetaConfig } = await import("@/lib/meta/config");
      const config = await getMetaConfig();
      configured = config.configured;
    } catch {
      configured = false;
    }
  }

  return (
    <div className="site-shell py-8 pb-24">
      <section className="connect-hero glass-panel rounded-3xl p-6 md:p-10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <p className="section-kicker">Resmi Instagram bağlantısı</p>
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

          {isStaticHost ? (
            <div className="glass-panel rounded-2xl p-4 mb-4 text-sm space-y-3">
              <p className="font-semibold text-white">Bağlantı şu an pasif (statik hosting)</p>
              <p className="muted">
                tolwex.com şu an GitHub Pages üzerinde. Instagram OAuth ve admin paneli
                için Node.js sunucu gerekir (Vercel / Hostinger Node). Meta paneli
                ayarları hazır; API route’lar canlıya alınca çalışır.
              </p>
              <p className="muted">
                Detay: <code className="copy-code">docs/META_APP_SETUP.md</code>
              </p>
              <a
                href={whatsappUrl("Instagram bağlantısı / Node hosting için yazıyorum.")}
                className="btn btn-primary inline-flex"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp {CONTACT_PHONE_DISPLAY}
              </a>
            </div>
          ) : !configured ? (
            <p className="muted text-sm mb-4">
              Meta App ID / Secret henüz yapılandırılmadı.{" "}
              <Link href="/admin61/setup" className="underline">
                Admin kurulum
              </Link>{" "}
              veya WhatsApp:{" "}
              <a
                href={whatsappUrl("Instagram bağlantısı için yazıyorum.")}
                className="underline"
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

      <section className="mt-8 grid md:grid-cols-2 gap-4">
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="display text-xl mb-2">Profil ziyaret / engelleyenler</h3>
          <p className="muted text-sm leading-relaxed">
            Instagram resmi Graph API, kullanıcı bazında “profilime kim baktı”
            listesi ve kişisel hesap “engelleyenler” listesini üçüncü taraf
            uygulamalara vermez. TOLWEX sahte liste üretmez; yalnızca API’nin
            verdiği gerçek alanları gösterir.
          </p>
        </div>
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="display text-xl mb-2">Ne çalışır?</h3>
          <p className="muted text-sm leading-relaxed">
            Resmi OAuth ile hesap bağlama, izin durumu, kullanıcı adı / hesap tipi,
            medya sayısı (izin varsa) ve güvenlik checklist. Node hosting + Meta
            panel ayarları tamamlanınca aktif olur.
          </p>
        </div>
      </section>
    </div>
  );
}
