"use client";

import { useEffect, useState } from "react";

export default function AdminApiPage() {
  const [info, setInfo] = useState<{
    smm_api_url?: string;
    smm_api_configured?: boolean;
    markup_percent?: number;
  } | null>(null);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setInfo(d?.settings || null));
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
      `Senkron tamam: ${data.upserted ?? "?"} servis · ${data.categories ?? "?"} kategori · markup %${data.markupPercent ?? ""}`
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>API Ayarları</h2>
          <p className="muted">smmapi.com entegrasyonu</p>
        </div>
      </div>

      <div className="admin-panel grid gap-3 max-w-xl">
        <p>
          <span className="muted">API URL: </span>
          <code>{info?.smm_api_url || "—"}</code>
        </p>
        <p>
          <span className="muted">API Key: </span>
          {info?.smm_api_configured ? "yapılandırıldı (env)" : "eksik"}
        </p>
        <p>
          <span className="muted">Markup: </span>%{info?.markup_percent ?? "—"}
        </p>
        <p className="muted text-sm">
          Anahtar ve markup yalnızca ortam değişkenlerinden okunur:
          <code> SMM_API_KEY</code>, <code> SMM_API_URL</code>,{" "}
          <code> SMM_MARKUP_PERCENT</code>.
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
                  ? `Fiyatlar yenilendi: ${data.updated ?? "?"} servis · %${data.markupPercent ?? 50} kâr · 2 ondalık`
                  : data.error || "Fiyat güncellemesi başarısız"
              );
            }}
          >
            Fiyatları %50 ile yuvarla
          </button>
        </div>
        {syncMsg ? <p className="text-sm">{syncMsg}</p> : null}
      </div>
    </div>
  );
}
