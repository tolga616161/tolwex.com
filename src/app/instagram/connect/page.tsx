import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";
import { DomainSetupCard } from "@/components/meta/DomainSetupCard";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";
import { getMetaDomainHints } from "@/lib/meta/public-urls";

export const metadata = {
  title: "Instagram / Meta Bağla — TOLWEX",
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

  const hints = getMetaDomainHints();

  return (
    <div className="site-shell py-8 pb-24">
      <section className="connect-hero glass-panel rounded-3xl p-6 md:p-10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <p className="section-kicker">Meta OAuth</p>
          <h1 className="display text-3xl md:text-5xl font-bold mb-4">
            Instagram hesabını Meta ile bağla
          </h1>
          <p className="muted leading-relaxed mb-4">
            Şifre bu sitede yazılmaz. Meta’nın resmi giriş ekranı açılır. Bağlantı
            yalnızca{" "}
            <strong className="text-white">tolwex-com.vercel.app</strong> üzerinde
            çalışır — <code className="copy-code">tolwex.com</code> hâlâ GitHub
            Pages’te olduğu için orada API / Bağlan 404 verir.
          </p>

          {isStaticHost ? (
            <div className="glass-panel rounded-2xl p-4 mb-4 text-sm space-y-3">
              <p className="font-semibold text-white">Bu kopya statik (Pages)</p>
              <p className="muted">
                Meta bağlamak için şuraya git:{" "}
                <a
                  className="underline text-white"
                  href="https://tolwex-com.vercel.app/instagram/connect"
                >
                  tolwex-com.vercel.app/instagram/connect
                </a>
              </p>
              <a
                href={whatsappUrl("Meta bağlantısı için yazıyorum.")}
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
              <Link href="/admin61" className="underline">
                Admin61
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
            <div className="flex flex-col gap-3 mb-6">
              <ConnectButton label="Instagram Hesabımı Bağla" force />
              <Link href="/instagram/dashboard" className="btn btn-ghost">
                Kontrol ekranı
              </Link>
            </div>
          )}
        </div>
      </section>

      <div className="mt-6">
        <DomainSetupCard
          appDomains={hints.appDomains}
          siteUrl={hints.siteUrl}
          redirectUri={hints.oauthRedirectUri}
        />
      </div>

      <section className="mt-8 glass-panel rounded-2xl p-5 md:p-6">
        <h2 className="display text-xl mb-3">Meta panelde şimdi yazılacaklar</h2>
        <p className="muted text-sm mb-4">
          App ID: <code className="copy-code">1023808800487900</code> — Settings →
          Basic ve Facebook Login → Settings.
        </p>
        <ol className="muted space-y-2 list-decimal pl-5 text-sm leading-relaxed">
          <li>
            <strong className="text-white">App Domains:</strong>{" "}
            <code className="copy-code">tolwex-com.vercel.app</code>
          </li>
          <li>
            <strong className="text-white">Website → Site URL:</strong>{" "}
            <code className="copy-code">https://tolwex-com.vercel.app/</code>
          </li>
          <li>
            <strong className="text-white">Valid OAuth Redirect URIs:</strong>{" "}
            <code className="copy-code">
              https://tolwex-com.vercel.app/api/meta/oauth/callback
            </code>
          </li>
          <li>
            Privacy:{" "}
            <code className="copy-code">https://tolwex-com.vercel.app/privacy</code>
          </li>
          <li>
            Roles → kendi Facebook hesabını + Instagram tester ekle (Development
            modunda şart)
          </li>
          <li>
            Kaydet → 1–2 dk bekle → yukarıdaki{" "}
            <strong className="text-white">Bağla</strong> butonuna bas
          </li>
        </ol>
        <div className="flex flex-wrap gap-3 mt-5">
          <a
            className="btn btn-primary"
            href="https://developers.facebook.com/apps/1023808800487900/settings/basic/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Meta Basic Ayarları
          </a>
          <a
            className="btn btn-ghost"
            href="https://developers.facebook.com/apps/1023808800487900/fb-login/settings/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Facebook Login Settings
          </a>
        </div>
      </section>
    </div>
  );
}
