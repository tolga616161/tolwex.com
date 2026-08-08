"use client";

import { useEffect, useState } from "react";
import { CopyField, StatusPill } from "@/components/admin/saas/AdminWidgets";

type Hints = {
  origin: string;
  hostname: string;
  rootDomain: string;
  siteUrl: string;
  oauthRedirectUri: string;
  privacyUrl: string;
  termsUrl: string;
  dataDeletionUrl: string;
  webhookUrl: string;
  appDomains: string[];
};

type Config = {
  connectionStatus: string;
  configured: boolean;
  source: string;
  envManaged: boolean;
  appIdConfigured: boolean;
  appSecretConfigured: boolean;
  appId: string;
  redirectUri: string | null;
  domain: string | null;
  apiVersion: string;
  igBusinessAccountId: string;
  facebookPageId: string;
  webhookVerifyToken: string | null;
  lastTestAt: string | null;
  lastTestOk: boolean | null;
  lastTestMessage: string | null;
  lastApiError: string | null;
  hints: Hints;
};

export function MetaDeveloperPanel() {
  const [cfg, setCfg] = useState<Config | null>(null);
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [domain, setDomain] = useState("");
  const [apiVersion, setApiVersion] = useState("v21.0");
  const [igBiz, setIgBiz] = useState("");
  const [pageId, setPageId] = useState("");
  const [webhook, setWebhook] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/meta/config");
    if (!res.ok) return;
    const data = await res.json();
    setCfg(data);
    setAppId(data.appId || "");
    setRedirectUri(data.redirectUri || data.hints?.oauthRedirectUri || "");
    setDomain(data.domain || data.hints?.origin || "");
    setApiVersion(data.apiVersion || "v21.0");
    setIgBiz(data.igBusinessAccountId || "");
    setPageId(data.facebookPageId || "");
    setWebhook(data.webhookVerifyToken || "");
  }

  useEffect(() => {
    load();
  }, []);

  async function saveAndTest(runTest: boolean) {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/meta/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appId,
        appSecret: appSecret || undefined,
        redirectUri,
        domain,
        apiVersion,
        webhookVerifyToken: webhook || undefined,
        igBusinessAccountId: igBiz,
        facebookPageId: pageId,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Kayıt başarısız");
      setBusy(false);
      return;
    }
    setAppSecret("");
    setMsg("Yapılandırma kaydedildi. App Secret tarayıcıya geri dönülmez.");

    if (runTest) {
      const t = await fetch("/api/meta/test", { method: "POST" });
      const td = await t.json();
      setMsg(td.message || (t.ok ? "Test OK" : "Test başarısız"));
    }
    await load();
    setBusy(false);
  }

  if (!cfg) return <p className="muted">Meta yapılandırması yükleniyor…</p>;
  const h = cfg.hints;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Meta Developer</h2>
          <p className="muted">
            Kendi Meta App bilgilerini buraya gir. Değerler uydurulmaz — sen doldurursun.
          </p>
        </div>
        <StatusPill status={cfg.connectionStatus} />
      </div>

      {cfg.envManaged ? (
        <div className="admin-banner">
          Kaynak: <strong>environment (.env)</strong>. Canlı env değerleri önceliklidir.
          Aşağıdaki form DB alanlarını da günceller; secret boş bırakılırsa mevcut secret korunur.
        </div>
      ) : null}

      <div className="admin-two-col">
        <div className="admin-panel meta-form">
          <h3>Yapılandırma alanları</h3>
          <label>Meta App ID</label>
          <input
            value={appId}
            onChange={(e) => setAppId(e.target.value)}
            placeholder="Meta Developer → App ID"
            autoComplete="off"
          />
          <label>Meta App Secret</label>
          <input
            type="password"
            value={appSecret}
            onChange={(e) => setAppSecret(e.target.value)}
            placeholder={
              cfg.appSecretConfigured
                ? "•••••••• (değiştirmek için yeni secret yaz)"
                : "App Secret — sadece sen girersin"
            }
            autoComplete="new-password"
          />
          <label>OAuth Redirect URI</label>
          <input
            value={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}
            placeholder={h.oauthRedirectUri}
          />
          <label>Domain / Site URL</label>
          <input value={domain} onChange={(e) => setDomain(e.target.value)} />
          <label>Instagram Business Account ID (opsiyonel)</label>
          <input
            value={igBiz}
            onChange={(e) => setIgBiz(e.target.value)}
            placeholder="Meta panelinden — yoksa boş bırak"
          />
          <label>Facebook Page ID (opsiyonel)</label>
          <input
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            placeholder="Meta panelinden — yoksa boş bırak"
          />
          <label>API Version</label>
          <input value={apiVersion} onChange={(e) => setApiVersion(e.target.value)} />
          <label>Webhook Verify Token</label>
          <input
            type="password"
            value={webhook}
            onChange={(e) => setWebhook(e.target.value)}
            placeholder="Kendin ürettiğin rastgele token"
            autoComplete="new-password"
          />

          <div className="admin-btn-row">
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() => saveAndTest(true)}
            >
              Kaydet ve Test Et
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy}
              onClick={() => saveAndTest(false)}
            >
              Sadece Kaydet
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const t = await fetch("/api/meta/test", { method: "POST" });
                const td = await t.json();
                setMsg(td.message);
                await load();
                setBusy(false);
              }}
            >
              Meta Bağlantısını Test Et
            </button>
          </div>
          {msg ? <p className="admin-msg">{msg}</p> : null}
          {cfg.lastTestMessage ? (
            <p className="muted text-sm">
              Son test: {cfg.lastTestMessage}
              {cfg.lastTestAt
                ? ` · ${new Date(cfg.lastTestAt).toLocaleString("tr-TR")}`
                : ""}
            </p>
          ) : null}
          {cfg.lastApiError ? (
            <p className="admin-error">Son API hatası: {cfg.lastApiError}</p>
          ) : null}
        </div>

        <div className="admin-panel">
          <h3>Meta Developer’da şu işlemleri yap</h3>
          <ol className="admin-steps">
            <li>developers.facebook.com → App oluştur</li>
            <li>Facebook Login + Instagram ürünlerini ekle</li>
            <li>Valid OAuth Redirect URI ekle (aşağıdaki COPY)</li>
            <li>Gerekli izinleri / test kullanıcılarını ekle</li>
            <li>App ID’yi buraya gir</li>
            <li>App Secret’i buraya gir (maskeli alan)</li>
          </ol>

          <h3 className="mt-6">Otomatik URI’ler (mevcut domain)</h3>
          <CopyField label="OAuth Redirect URI" value={h.oauthRedirectUri} />
          <CopyField label="App Domains" value={h.appDomains.join(", ")} />
          <CopyField label="Site URL" value={h.siteUrl} />
          <CopyField label="Privacy Policy" value={h.privacyUrl} />
          <CopyField label="Terms of Service" value={h.termsUrl} />
          <CopyField label="Data Deletion" value={h.dataDeletionUrl} />
          <CopyField label="Webhook Callback" value={h.webhookUrl} />

          <p className="legal-note mt-4">
            Redirect path proje sabiti: <code>/api/meta/oauth/callback</code>. Domain
            uydurulmaz — <code>NEXT_PUBLIC_APP_URL</code> / canlı host’tan üretilir.
          </p>
        </div>
      </div>
    </div>
  );
}
