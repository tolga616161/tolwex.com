"use client";

import { FormEvent, useEffect, useState } from "react";

type Settings = {
  site_name: string;
  support_whatsapp: string;
  support_email: string;
  min_deposit: string;
  announcement: string;
  announcement_enabled: string;
  bank_name: string;
  bank_iban: string;
  bank_holder: string;
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
          <p className="muted">Duyuru, banka hesabı ve panel genel ayarları</p>
        </div>
      </div>
      <form onSubmit={save} className="admin-panel grid gap-4 max-w-xl">
        <div className="grid gap-3">
          <h3 className="text-sm font-semibold">Genel</h3>
          {(
            [
              ["site_name", "Site adı"],
              ["support_whatsapp", "WhatsApp"],
              ["support_email", "Destek e-posta"],
              ["min_deposit", "Min. bakiye (₺)"],
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
        </div>

        <div className="grid gap-3">
          <h3 className="text-sm font-semibold">Üst duyuru bandı</h3>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.announcement_enabled === "1"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  announcement_enabled: e.target.checked ? "1" : "0",
                })
              }
            />
            Duyuruyu göster
          </label>
          <label className="grid gap-1">
            <span className="muted text-xs">Duyuru yazısı</span>
            <textarea
              rows={3}
              value={settings.announcement}
              onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
              placeholder="Örn: Hafta sonu %10 ekstra bakiye kampanyası!"
            />
          </label>
        </div>

        <div className="grid gap-3">
          <h3 className="text-sm font-semibold">Banka / ödeme hesabı</h3>
          <p className="muted text-xs">
            Üyeler bakiye yüklerken bu bilgileri görür. Havale sonrası Ödeme Bildirimleri
            ekranından onaylayın.
          </p>
          {(
            [
              ["bank_name", "Banka"],
              ["bank_iban", "IBAN"],
              ["bank_holder", "Alıcı adı"],
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
        </div>

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
