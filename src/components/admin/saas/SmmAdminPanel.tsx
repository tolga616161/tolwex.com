"use client";

import { useEffect, useState } from "react";

type Status = {
  configured: boolean;
  markupPercent: number;
  activeServices: number;
  categories: number;
  lastSyncedAt: string | null;
  balance: { balance: string; currency: string } | null;
  balanceError: string | null;
};

export function SmmAdminPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/smm/sync");
    if (!res.ok) return;
    setStatus(await res.json());
  }

  useEffect(() => {
    load();
  }, []);

  async function sync() {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/smm/sync", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error || "Sync başarısız");
      return;
    }
    setMsg(
      `Senkron tamam · ${data.upserted} servis · ${data.categories} kategori · kâr %${data.markupPercent}`
    );
    await load();
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel rounded-2xl p-5">
        <h1 className="display text-3xl mb-2">SMM API · smmapi.com</h1>
        <p className="muted text-sm mb-4">
          Tüm servisleri çek, %50 kâr ekle, sitede /hizmetler ve üye panelinde listele.
          Hata uydurmuyoruz — API’den gelen veri senkronlanır.
        </p>
        <div className="grid md:grid-cols-3 gap-3 mb-4">
          <div className="mono-panel">
            <p className="mono-panel-title">Durum</p>
            <p>{status?.configured ? "API key tanımlı" : "SMM_API_KEY eksik"}</p>
          </div>
          <div className="mono-panel">
            <p className="mono-panel-title">Aktif servis</p>
            <p>{status?.activeServices ?? "—"}</p>
          </div>
          <div className="mono-panel">
            <p className="mono-panel-title">Bakiye</p>
            <p>
              {status?.balance
                ? `${status.balance.balance} ${status.balance.currency}`
                : status?.balanceError || "—"}
            </p>
          </div>
        </div>
        <p className="muted text-sm mb-4">
          Kâr: %{status?.markupPercent ?? 50} · Son sync:{" "}
          {status?.lastSyncedAt
            ? new Date(status.lastSyncedAt).toLocaleString("tr-TR")
            : "yok"}
        </p>
        <button type="button" className="btn btn-primary" onClick={sync} disabled={busy}>
          {busy ? "Senkronize ediliyor…" : "Servisleri şimdi çek / güncelle"}
        </button>
        {msg ? <p className="muted text-sm mt-3">{msg}</p> : null}
      </section>

      <section className="glass-panel rounded-2xl p-5">
        <h2 className="display text-xl mb-2">Env</h2>
        <ul className="mono-list">
          <li>SMM_API_URL=https://smmapi.com/api/v2</li>
          <li>SMM_API_KEY=•••• (Vercel env)</li>
          <li>SMM_MARKUP_PERCENT=50</li>
        </ul>
      </section>
    </div>
  );
}
