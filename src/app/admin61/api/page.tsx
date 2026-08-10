"use client";

import { useEffect, useState } from "react";

type Info = {
  smm_api_url?: string;
  smm_api_configured?: boolean;
  markup_percent?: number;
  shopier_configured?: boolean;
  shopier_website_index?: number;
  shopier_callback_url?: string;
};

export default function AdminApiPage() {
  const [info, setInfo] = useState<Info | null>(null);
  const [providerBal, setProviderBal] = useState<string | null>(null);
  const [providerErr, setProviderErr] = useState<string | null>(null);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  function loadBalance() {
    fetch("/api/admin/smm/balance")
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) {
          setProviderBal(`${d.balance} ${d.currency || "TRY"}`);
          setProviderErr(null);
        } else {
          setProviderBal(null);
          setProviderErr(d?.error || "Bakiye alınamadı");
        }
      })
      .catch(() => setProviderErr("Bakiye alınamadı"));
  }

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setInfo(d?.settings || null));
    loadBalance();
  }, []);

  async function sync() {
    setBusy(true);
    setSyncMsg(null);
    const res = await fetch("/api/admin/smm/sync", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setSyncMsg(data.error || "Senkron başarısız");
      return;
    }
    setSyncMsg(
      `Senkron tamam: ${data.upserted ?? "?"} servis · ${data.categories ?? "?"} kategori`
    );
  }

  async function copyCallback() {
    const url = info?.shopier_callback_url;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>API Ayarları</h2>
          <p className="muted">SMM sağlayıcı ve Shopier (kartlı ödeme)</p>
        </div>
      </div>

      <div className="admin-two-col">
        <div className="admin-panel grid gap-3">
          <h3 className="text-sm font-semibold">SMM API</h3>
          <p>
            <span className="muted">Durum: </span>
            {info?.smm_api_configured ? "bağlı" : "yapılandırılmadı"}
          </p>
          <p>
            <span className="muted">Sistem bakiyesi: </span>
            {providerBal ? <strong>{providerBal}</strong> : providerErr || "…"}
            <button
              type="button"
              className="btn btn-ghost"
              style={{ marginLeft: 8 }}
              onClick={loadBalance}
            >
              Yenile
            </button>
          </p>
          <p className="muted text-sm">
            Env: <code>SMM_API_KEY</code> · <code>SMM_API_URL</code> · kâr{" "}
            <code>SMM_MARKUP_PERCENT</code>
            {info?.markup_percent != null ? ` (şu an %${info.markup_percent})` : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={sync} disabled={busy}>
              {busy ? "Senkronlanıyor…" : "Servisleri senkronize et"}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setSyncMsg(null);
                const res = await fetch("/api/admin/smm/sync?reprice=1", { method: "POST" });
                const data = await res.json().catch(() => ({}));
                setBusy(false);
                setSyncMsg(
                  res.ok
                    ? `Liste fiyatları yenilendi: ${data.updated ?? "?"} servis`
                    : data.error || "Fiyat güncellemesi başarısız"
                );
              }}
            >
              Liste fiyatlarını yenile
            </button>
          </div>
          {syncMsg ? <p className="text-sm">{syncMsg}</p> : null}
        </div>

        <div className="admin-panel grid gap-3">
          <h3 className="text-sm font-semibold">Shopier (kartlı ödeme)</h3>
          <p>
            <span className="muted">Durum: </span>
            {info?.shopier_configured ? (
              <strong style={{ color: "#6ee7a8" }}>aktif</strong>
            ) : (
              <strong style={{ color: "#fbbf24" }}>bekliyor — env ekle</strong>
            )}
          </p>
          <p className="muted text-sm">
            Vercel Environment Variables:
          </p>
          <ul className="muted text-sm" style={{ paddingLeft: "1.1rem", margin: 0 }}>
            <li>
              <code>SHOPIER_API_KEY</code>
            </li>
            <li>
              <code>SHOPIER_API_SECRET</code>
            </li>
            <li>
              <code>SHOPIER_WEBSITE_INDEX</code> (varsayılan 1)
            </li>
            <li>
              <code>NEXT_PUBLIC_SITE_URL</code> = https://tolwex.com
            </li>
          </ul>
          <p>
            <span className="muted">Website index: </span>
            {info?.shopier_website_index ?? 1}
          </p>
          <div className="grid gap-1">
            <span className="muted text-xs">Callback URL (Shopier panele yapıştır)</span>
            <code className="text-xs" style={{ wordBreak: "break-all" }}>
              {info?.shopier_callback_url || "…"}
            </code>
            <button type="button" className="btn btn-ghost" onClick={() => void copyCallback()}>
              {copied ? "Kopyalandı" : "Callback kopyala"}
            </button>
          </div>
          <p className="muted text-xs">
            Shopier → Entegrasyon / API: site olarak tolwex.com ekle, dönüş URL’sine yukarıdaki
            callback’i yaz. Anahtarlar kaydedilince üye panelinde “Kart ile anında yükle” açılır.
          </p>
        </div>
      </div>
    </div>
  );
}
