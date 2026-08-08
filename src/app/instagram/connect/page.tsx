import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";
import { getMetaConfig } from "@/lib/meta/config";
import { getMetaDomainHints } from "@/lib/meta/public-urls";

export const metadata = {
  title: "Instagram Hesabını Bağla — SecureLink",
};

export default async function InstagramConnectPage() {
  const config = await getMetaConfig();
  const domains = getMetaDomainHints();

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
            Resmi Meta OAuth
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
              Instagram Business/Creator API bağlantısı Meta (Facebook) kimlik
              doğrulaması üzerinden çalışır. Bu normal ve resmi akıştır — şifrenizi
              bizim sitemize yazmazsınız.
            </p>
          </div>

          {!config.configured ? (
            <Link href="/admin/setup" className="btn btn-ghost">
              Meta entegrasyonu yapılandırılmadı
            </Link>
          ) : (
            <div className="flex flex-col gap-3">
              <ConnectButton label="Meta ile Instagram’ı Bağla" force />
              <Link href="/instagram/dashboard" className="btn btn-ghost">
                Kontrol ekranına git
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8 glass-panel rounded-3xl p-6 md:p-8">
        <h2 className="display text-2xl mb-2">Meta App Domain ayarı (zorunlu)</h2>
        <p className="muted text-sm mb-5">
          Telefonda “Bu bağlantının domaini uygulamanın domainlerinde yer almıyor”
          hatası görürseniz Meta Developer Console’a aşağıdaki değerleri ekleyin.
        </p>
        <dl className="space-y-3 text-sm">
          <div className="copy-row">
            <dt>App Domains</dt>
            <dd>
              {domains.appDomains.map((d) => (
                <code key={d} className="copy-code">
                  {d}
                </code>
              ))}
            </dd>
          </div>
          <div className="copy-row">
            <dt>Site URL</dt>
            <dd>
              <code className="copy-code">{domains.siteUrl}</code>
            </dd>
          </div>
          <div className="copy-row">
            <dt>Valid OAuth Redirect URIs</dt>
            <dd>
              <code className="copy-code">{domains.oauthRedirectUri}</code>
            </dd>
          </div>
          <div className="copy-row">
            <dt>Privacy / Terms / Data Deletion</dt>
            <dd className="space-y-1">
              <code className="copy-code">{domains.privacyUrl}</code>
              <code className="copy-code">{domains.termsUrl}</code>
              <code className="copy-code">{domains.dataDeletionUrl}</code>
            </dd>
          </div>
        </dl>
        <ol className="mt-5 muted text-sm space-y-2 list-decimal pl-5">
          <li>
            <a
              className="underline"
              href="https://developers.facebook.com/apps/1023808800487900/settings/basic/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Meta App Ayarları (Basic)
            </a>{" "}
            → App Domains + Site URL
          </li>
          <li>
            Facebook Login → Settings → Valid OAuth Redirect URIs
          </li>
          <li>
            Roles → Roles’a kendi Facebook hesabınızı ekleyin (Development mode)
          </li>
          <li>Kaydedin, 1–2 dk bekleyin, tekrar deneyin</li>
        </ol>
      </section>

      <section className="mt-8 grid md:grid-cols-3 gap-4">
        {[
          {
            t: "Hesap güvenlik kontrolü",
            d: "Bağlantı sonrası dashboard’da API’nin verdiği gerçek veriler + checklist.",
            href: "/instagram/dashboard",
          },
          {
            t: "Güvenlik Merkezi",
            d: "2FA, cihaz, şüpheli giriş rehberi — API uydurma skor yok.",
            href: "/instagram/security",
          },
          {
            t: "2FA Rehberi",
            d: "Resmi yardım linkleriyle adım adım güvenlik.",
            href: "/instagram/guide",
          },
        ].map((x) => (
          <Link key={x.t} href={x.href} className="glass-panel rounded-2xl p-5 block">
            <h3 className="display text-xl mb-2">{x.t}</h3>
            <p className="muted text-sm">{x.d}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
