"use client";

import { useEffect, useState } from "react";

export default function AdminApiPage() {
  const [info, setInfo] = useState<{
    smm_api_url?: string;
    smm_api_configured?: boolean;
    markup_percent?: number;
  } | null>(null);
  const [providerBal, setProviderBal] = useState<string | null>(null);
  const [providerErr, setProviderErr] = useState<string | null>(null);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>API Ayarları</h2>
          <p className="muted">TOLWEX sistem API entegrasyonu</p>
        </div>
      </div>

      <div className="admin-panel grid gap-3 max-w-xl">
        <p>
          <span className="muted">Sistem API: </span>
          {info?.smm_api_configured ? "bağlı (env)" : "yapılandırılmadı"}
        </p>
        <p>
          <span className="muted">API Key: </span>
          {info?.smm_api_configured ? "yapılandırıldı (env)" : "eksik"}
        </p>
        <p>
          <span className="muted">Sistem bakiyesi: </span>
          {providerBal ? <strong>{providerBal}</strong> : providerErr || "…"}
          <button type="button" className="btn btn-ghost" style={{ marginLeft: 8 }} onClick={loadBalance}>
            Yenile
          </button>
        </p>
        <p className="muted text-sm">
          Üye bakiyesi yeterliyse sipariş anında işleme alınır ve onaylanır.
          Anahtar: <code>SMM_API_KEY</code> · URL: <code>SMM_API_URL</code>.
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
    </div>
  );
}
