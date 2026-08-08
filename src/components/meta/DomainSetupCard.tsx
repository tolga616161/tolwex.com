"use client";

import { useState } from "react";
import Link from "next/link";

type Props = {
  appDomains: string[];
  siteUrl: string;
  redirectUri: string;
};

export function DomainSetupCard({ appDomains, siteUrl, redirectUri }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      // ignore
    }
  }

  return (
    <aside className="glass-panel rounded-2xl p-4 md:p-5 text-sm leading-relaxed border border-amber-400/25">
      <p className="font-semibold mb-1" style={{ color: "#ffc76b" }}>
        Bağlantı hatası: Meta App Domains eksik
      </p>
      <p className="muted mb-3">
        Evet — domain/host kaydı Meta tarafında yapılmalı. Kod doğru; Facebook
        “domain yer almıyor” diyorsa App Domains’e eklemeniz gerekir.
      </p>

      <div className="space-y-2 mb-4">
        {appDomains.map((d) => (
          <button
            key={d}
            type="button"
            className="copy-code w-full text-left"
            onClick={() => copy(d, d)}
          >
            App Domain: {d} {copied === d ? "✓" : ""}
          </button>
        ))}
        <button
          type="button"
          className="copy-code w-full text-left"
          onClick={() => copy(siteUrl, "site")}
        >
          Site URL: {siteUrl} {copied === "site" ? "✓" : ""}
        </button>
        <button
          type="button"
          className="copy-code w-full text-left"
          onClick={() => copy(redirectUri, "redir")}
        >
          OAuth Redirect: {redirectUri} {copied === "redir" ? "✓" : ""}
        </button>
      </div>

      <ol className="muted space-y-1 list-decimal pl-5 mb-4">
        <li>Meta App → Settings → Basic → App Domains</li>
        <li>Website platformu → Site URL</li>
        <li>Facebook Login → Valid OAuth Redirect URIs</li>
        <li>Roles → kendi hesabınızı ekleyin</li>
        <li>Kaydet → 2 dk bekle → tekrar dene</li>
      </ol>

      <div className="flex flex-col sm:flex-row gap-2">
        <a
          className="btn btn-primary"
          href="https://developers.facebook.com/apps/1023808800487900/settings/basic/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Meta Ayarlarını Aç
        </a>
        <Link href="/instagram/connect" className="btn btn-ghost">
          Bağlantı sayfası
        </Link>
      </div>
    </aside>
  );
}
