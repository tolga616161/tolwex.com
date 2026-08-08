"use client";

import { FormEvent, useEffect, useState } from "react";

type Settings = {
  site_name: string;
  support_whatsapp: string;
  support_email: string;
  min_deposit: string;
  announcement: string;
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setSettings(d?.settings || null));
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setMsg(null);
    const res = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setMsg(res.ok ? "Kaydedildi" : "Hata");
  }

  if (!settings) return <p className="muted">Yükleniyor…</p>;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Ayarlar</h2>
          <p className="muted">Panel genel ayarları</p>
        </div>
      </div>
      <form onSubmit={save} className="admin-panel grid gap-3 max-w-lg">
        {(
          [
            ["site_name", "Site adı"],
            ["support_whatsapp", "WhatsApp"],
            ["support_email", "Destek e-posta"],
            ["min_deposit", "Min. bakiye"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="grid gap-1">
            <span className="muted text-xs">{label}</span>
            <input
              value={settings[key]}
              onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
            />
          </label>
        ))}
        <label className="grid gap-1">
          <span className="muted text-xs">Duyuru</span>
          <textarea
            rows={3}
            value={settings.announcement}
            onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
          />
        </label>
        <p className="muted text-sm">
          Admin şifresi <code>ADMIN_PASSWORD</code> ortam değişkeni ile yönetilir.
        </p>
        {msg ? <p>{msg}</p> : null}
        <button type="submit" className="btn btn-primary">
          Kaydet
        </button>
      </form>
    </div>
  );
}
