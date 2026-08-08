"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Status = {
  configured: boolean;
  source: string;
  appIdConfigured: boolean;
  appSecretConfigured: boolean;
  redirectUri: string | null;
  domain: string | null;
  apiVersion: string;
  webhookConfigured: boolean;
  webhookCallbackUrl?: string | null;
  webhookVerifyToken?: string | null;
  lastTestAt: string | null;
  lastTestOk: boolean | null;
  lastTestMessage: string | null;
  lastApiRequestAt: string | null;
  lastApiError: string | null;
  connectedAccountsCount: number;
  integrationStatus: string;
  message: string;
};

type ProdCheck = { id: string; label: string; ok: boolean; detail: string };

export function AdminPanel() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [checks, setChecks] = useState<ProdCheck[]>([]);
  const [testMsg, setTestMsg] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  async function load() {
    const [s, p] = await Promise.all([
      fetch("/api/meta/config").then(async (r) => {
        if (!r.ok) return fetch("/api/meta/status").then((x) => x.json());
        return r.json();
      }),
      fetch("/api/admin/production-checklist").then(async (r) => {
        if (!r.ok) return { checks: [] };
        return r.json();
      }),
    ]);
    setStatus(s);
    setChecks(p.checks || []);
  }

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setLoginError(data.error || "Giriş başarısız");
      return;
    }
    setAuthed(true);
    await load();
  }

  useEffect(() => {
    // Probe admin session via production-checklist
    fetch("/api/admin/production-checklist").then(async (r) => {
      if (r.ok) {
        setAuthed(true);
        await load();
      }
    });
  }, []);

  async function runTest() {
    setTesting(true);
    setTestMsg(null);
    const res = await fetch("/api/meta/test", { method: "POST" });
    const data = await res.json();
    setTestMsg(data.message);
    await load();
    setTesting(false);
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setStatus(null);
    setChecks([]);
    setPassword("");
  }

  if (!authed) {
    return (
      <form onSubmit={login} className="surface rounded-2xl p-6 max-w-md space-y-4">
        <h1 className="display text-3xl">Admin Girişi</h1>
        <p className="muted text-sm">Sadece şifre girin.</p>
        <label className="block text-sm muted" htmlFor="admin-password">
          Şifre
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          autoFocus
          required
        />
        {loginError ? (
          <p className="text-sm" style={{ color: "#ffc4c0" }}>
            {loginError}
          </p>
        ) : null}
        <button type="submit" className="btn btn-primary">
          Giriş yap
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="display text-4xl font-bold mb-2">META INTEGRATION</h1>
          <p className="muted">Instagram / Meta — secret değerler burada gösterilmez.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin61/products" className="btn btn-primary">
            Hizmet Yönetimi
          </Link>
          <Link href="/admin61/setup" className="btn btn-ghost">
            Meta API Kurulum
          </Link>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Çıkış
          </button>
        </div>
      </div>

      {status ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Stat
            title="OAuth bağlantısı"
            value={status.configured ? "Yapılandırıldı" : "Yapılandırılmadı"}
            ok={status.configured}
          />
          <Stat
            title="API durumu"
            value={
              status.lastTestOk === true
                ? "Çalışıyor"
                : status.lastTestOk === false
                  ? "Başarısız"
                  : "Test edilmedi"
            }
            ok={status.lastTestOk === true}
          />
          <Stat
            title="Son bağlantı / istek"
            value={
              status.lastApiRequestAt
                ? new Date(status.lastApiRequestAt).toLocaleString("tr-TR")
                : "—"
            }
            ok={Boolean(status.lastApiRequestAt)}
          />
          <Stat
            title="API hata durumu"
            value={status.lastApiError || "Yok"}
            ok={!status.lastApiError}
          />
          <Stat
            title="Bağlı hesap sayısı"
            value={String(status.connectedAccountsCount)}
            ok={true}
          />
          <Stat
            title="Token sağlık (sistem)"
            value={status.appSecretConfigured ? "Secret yapılandırıldı" : "Secret yok"}
            ok={status.appSecretConfigured}
          />
          <Stat title="API sürümü" value={status.apiVersion} ok={true} />
          <Stat
            title="Redirect URI"
            value={status.redirectUri || "—"}
            ok={Boolean(status.redirectUri)}
          />
          <Stat
            title="Kullanılabilir izinler"
            value="Meta App Dashboard üzerinden yönetilir"
            ok={status.configured}
          />
        </div>
      ) : null}

      <section className="surface rounded-2xl p-6 space-y-3">
        <h2 className="display text-2xl mb-1">App Domains (mobil hata çözümü)</h2>
        <p className="muted text-sm">
          “Domaini uygulamanın domainlerinde yer almıyor” hatası için Meta Basic Settings’e
          ekleyin:
        </p>
        <ul className="text-sm space-y-2">
          <li>
            App Domains:{" "}
            <code className="copy-code">
              {status?.domain
                ? status.domain.replace(/^https?:\/\//, "").replace(/\/$/, "")
                : "—"}
            </code>{" "}
            ve <code className="copy-code">trycloudflare.com</code>
          </li>
          <li>
            Site URL: <code className="copy-code">{status?.domain || "—"}/</code>
          </li>
          <li>
            OAuth Redirect:{" "}
            <code className="copy-code">{status?.redirectUri || "—"}</code>
          </li>
        </ul>
        <a
          className="btn btn-ghost text-sm"
          href="https://developers.facebook.com/apps/1023808800487900/settings/basic/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Meta App Ayarlarını Aç
        </a>
      </section>

      <section className="surface rounded-2xl p-6 space-y-3">
        <h2 className="display text-2xl mb-1">Webhook Token Doğrulama</h2>
        <p className="muted text-sm">
          Meta Developer Console → Webhooks bölümünde “Verify Token” istenirse aşağıdaki
          değeri kullanın. Callback URL’yi de aynı yere yapıştırın.
        </p>
        <div className="text-sm space-y-2">
          <p>
            <span className="muted">Callback URL: </span>
            <code className="break-all">
              {status?.webhookCallbackUrl ||
                `${typeof window !== "undefined" ? window.location.origin : ""}/api/meta/webhook`}
            </code>
          </p>
          <p>
            <span className="muted">Verify Token: </span>
            <code className="break-all">
              {status?.webhookVerifyToken || "Yapılandırılmadı — META_WEBHOOK_VERIFY_TOKEN"}
            </code>
          </p>
        </div>
      </section>

      <section className="surface rounded-2xl p-6">
        <h2 className="display text-2xl mb-3">Connection Test</h2>
        <p className="muted text-sm mb-4">
          Gerçek Graph API app endpoint’i çağrılır. Sahte başarı üretilmez.
        </p>
        <button type="button" className="btn btn-primary" onClick={runTest} disabled={testing}>
          {testing ? "Test ediliyor…" : "Meta API Bağlantısını Test Et"}
        </button>
        {testMsg || status?.lastTestMessage ? (
          <p className="mt-4 text-sm">
            <span
              className={`status-dot inline-block mr-2 ${
                (testMsg || "").includes("çalışıyor") || status?.lastTestOk
                  ? "status-ok"
                  : "status-bad"
              }`}
            />
            {testMsg || status?.lastTestMessage}
          </p>
        ) : null}
      </section>

      <section className="surface rounded-2xl p-6">
        <h2 className="display text-2xl mb-4">Production Ready</h2>
        <ul className="space-y-3">
          {checks.map((c) => (
            <li key={c.id} className="flex gap-3 items-start">
              <span className={`status-dot mt-1.5 ${c.ok ? "status-ok" : "status-warn"}`} />
              <div>
                <p className="font-medium">
                  {c.ok ? "☑" : "□"} {c.label}
                </p>
                <p className="text-sm muted">{c.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({
  title,
  value,
  ok,
}: {
  title: string;
  value: string;
  ok: boolean;
}) {
  return (
    <div className="surface rounded-2xl p-5">
      <p className="text-xs uppercase tracking-[0.14em] muted mb-2">{title}</p>
      <div className="flex items-start gap-3">
        <span className={`status-dot mt-1.5 ${ok ? "status-ok" : "status-warn"}`} />
        <p className="font-medium break-all">{value}</p>
      </div>
    </div>
  );
}
