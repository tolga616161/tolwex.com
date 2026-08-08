"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STEPS = [
  "Meta App ID",
  "Meta App Secret",
  "Redirect URI",
  "Domain",
  "API Version",
  "Connection Test",
  "Production Check",
];

export function SetupWizard() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [step, setStep] = useState(0);
  const [appId, setAppId] = useState("");
  const [appSecret, setAppSecret] = useState("");
  const [redirectUri, setRedirectUri] = useState(() =>
    typeof window !== "undefined"
      ? `${window.location.origin}/api/meta/oauth/callback`
      : ""
  );
  const [domain, setDomain] = useState(() =>
    typeof window !== "undefined" ? window.location.origin : ""
  );
  const [apiVersion, setApiVersion] = useState("v21.0");
  const [webhookVerifyToken, setWebhookVerifyToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [prodChecks, setProdChecks] = useState<
    Array<{ id: string; label: string; ok: boolean; detail: string }>
  >([]);

  useEffect(() => {
    fetch("/api/admin/production-checklist").then(async (r) => {
      if (r.ok) {
        setAuthed(true);
        const status = await fetch("/api/meta/config").then((x) => x.json());
        if (status.redirectUri) setRedirectUri(status.redirectUri);
        if (status.domain) setDomain(status.domain);
        if (status.apiVersion) setApiVersion(status.apiVersion);
      }
    });
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) setAuthed(true);
    else setMessage("Giriş başarısız");
  }

  async function saveConfig() {
    setMessage(null);
    const res = await fetch("/api/meta/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appId,
        appSecret: appSecret || undefined,
        redirectUri,
        domain,
        apiVersion,
        webhookVerifyToken: webhookVerifyToken || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Kayıt başarısız");
      return false;
    }
    setMessage("Yapılandırma kaydedildi. Secret frontend’e gönderilmez.");
    setAppSecret("");
    return true;
  }

  async function runTest() {
    const saved = await saveConfig();
    if (!saved) return;
    const res = await fetch("/api/meta/test", { method: "POST" });
    const data = await res.json();
    setTestResult(data.message);
  }

  async function loadProd() {
    const res = await fetch("/api/admin/production-checklist");
    const data = await res.json();
    setProdChecks(data.checks || []);
  }

  if (!authed) {
    return (
      <form onSubmit={login} className="surface rounded-2xl p-6 max-w-md space-y-4">
        <h1 className="display text-3xl">Meta / Instagram Kurulumu</h1>
        <input
          type="password"
          placeholder="Admin şifresi"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {message ? <p className="text-sm" style={{ color: "#ffc4c0" }}>{message}</p> : null}
        <button className="btn btn-primary" type="submit">
          Devam
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="display text-4xl font-bold mb-2">Meta / Instagram Kurulumu</h1>
        <p className="muted">
          Secret bilgiler yalnızca sunucu tarafında saklanır. Gerçek credential’ları koda
          yazmayın.
        </p>
      </div>

      <ol className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`surface rounded-xl px-3 py-2 ${
              i === step ? "border-[var(--accent)]" : ""
            }`}
          >
            <span className="muted">{i + 1}.</span> {label}
          </li>
        ))}
      </ol>

      <div className="surface rounded-2xl p-6 space-y-4 max-w-xl">
        {step === 0 && (
          <>
            <label className="block text-sm muted">Meta App ID</label>
            <input value={appId} onChange={(e) => setAppId(e.target.value)} placeholder="1234567890" />
          </>
        )}
        {step === 1 && (
          <>
            <label className="block text-sm muted">Meta App Secret</label>
            <input
              type="password"
              value={appSecret}
              onChange={(e) => setAppSecret(e.target.value)}
              placeholder="••••••••"
              autoComplete="off"
            />
            <p className="text-xs muted">
              Secret kaydedilirken şifrelenir; bir daha düz metin olarak gösterilmez.
            </p>
          </>
        )}
        {step === 2 && (
          <>
            <label className="block text-sm muted">OAuth Redirect URI</label>
            <input value={redirectUri} onChange={(e) => setRedirectUri(e.target.value)} />
            <p className="text-xs muted">
              Meta Developer Console → Valid OAuth Redirect URIs alanına ekleyin.
            </p>
          </>
        )}
        {step === 3 && (
          <>
            <label className="block text-sm muted">Domain</label>
            <input value={domain} onChange={(e) => setDomain(e.target.value)} />
            <p className="text-xs muted">
              App Domains + Privacy Policy / Terms / Data Deletion URL’lerini Meta’da
              tanımlayın.
            </p>
            <ul className="text-xs muted space-y-1 list-disc pl-5">
              <li>Privacy: {domain || "https://your-domain.com"}/privacy</li>
              <li>Terms: {domain || "https://your-domain.com"}/terms</li>
              <li>
                Data Deletion: {domain || "https://your-domain.com"}/api/data-deletion
              </li>
            </ul>
          </>
        )}
        {step === 4 && (
          <>
            <label className="block text-sm muted">API Version</label>
            <input value={apiVersion} onChange={(e) => setApiVersion(e.target.value)} />
            <label className="block text-sm muted mt-4">Webhook Verify Token (opsiyonel)</label>
            <input
              value={webhookVerifyToken}
              onChange={(e) => setWebhookVerifyToken(e.target.value)}
              placeholder="rastgele-guclu-token"
            />
          </>
        )}
        {step === 5 && (
          <>
            <p className="muted text-sm">
              Kayıt sonrası gerçek Meta Graph API bağlantı testi çalıştırılır.
            </p>
            <button type="button" className="btn btn-primary" onClick={runTest}>
              Meta API Bağlantısını Test Et
            </button>
            {testResult ? (
              <p className="text-sm">
                <span
                  className={`status-dot inline-block mr-2 ${
                    testResult.includes("çalışıyor") ? "status-ok" : "status-bad"
                  }`}
                />
                {testResult}
              </p>
            ) : null}
          </>
        )}
        {step === 6 && (
          <>
            <button type="button" className="btn btn-ghost" onClick={loadProd}>
              Production kontrolünü yenile
            </button>
            <ul className="space-y-2 mt-4">
              {prodChecks.map((c) => (
                <li key={c.id} className="flex gap-2 text-sm">
                  <span>{c.ok ? "☑" : "□"}</span>
                  <span>
                    <strong>{c.label}</strong> — <span className="muted">{c.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        {message ? <p className="text-sm muted">{message}</p> : null}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Geri
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                if (step === 4) await saveConfig();
                if (step === 5) await loadProd();
                setStep((s) => Math.min(STEPS.length - 1, s + 1));
              }}
            >
              İleri
            </button>
          ) : (
            <Link href="/admin" className="btn btn-primary">
              Admin paneline dön
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
