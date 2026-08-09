"use client";

import { FormEvent, useEffect, useState } from "react";

type Settings = {
  site_name: string;
  support_whatsapp: string;
  support_email: string;
  min_deposit: string;
  announcement: string;
  announcement_enabled: string;
  announcement_style: string;
  bank_name: string;
  bank_iban: string;
  bank_holder: string;
};

const FALLBACK: Settings = {
  site_name: "TOLWEX",
  support_whatsapp: "",
  support_email: "",
  min_deposit: "100",
  announcement: "Hoş geldiniz — bakiye yükleyip anında sipariş verebilirsiniz.",
  announcement_enabled: "1",
  announcement_style: "mono",
  bank_name: "",
  bank_iban: "",
  bank_holder: "",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.settings) {
          setSettings({ ...FALLBACK, ...d.settings });
          setLoadError(null);
        } else {
          setSettings(FALLBACK);
          setLoadError("Ayarlar alınamadı — varsayılan form açıldı");
        }
      })
      .catch(() => {
        setSettings(FALLBACK);
        setLoadError("Bağlantı hatası — varsayılan form açıldı");
      });
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setMsg(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setMsg(res.ok ? "Kaydedildi — duyuru sitede güncellendi" : "Kaydederken hata oluştu");
    } catch {
      setMsg("Bağlantı hatası");
    }
  }

  if (!settings) return <p className="muted">Yükleniyor…</p>;

  const style = settings.announcement_style === "accent" ? "accent" : "mono";

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Ayarlar</h2>
          <p className="muted">Duyuru paneli, banka hesabı ve genel ayarlar</p>
        </div>
      </div>
      {loadError ? <div className="admin-banner">{loadError}</div> : null}

      <form onSubmit={save} className="admin-settings-grid">
        <div className="admin-panel grid gap-4">
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
          {msg ? <p className="admin-msg">{msg}</p> : null}
          <button type="submit" className="btn btn-primary">
            Kaydet
          </button>
        </div>

        <div className="admin-panel grid gap-4">
          <h3 className="text-sm font-semibold">Duyuru paneli</h3>
          <p className="muted text-xs">
            Sitenin üst bandında görünür. Metni ve stili buradan anında özelleştirin.
          </p>

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
            Duyuruyu sitede göster
          </label>

          <label className="grid gap-1">
            <span className="muted text-xs">Duyuru yazısı</span>
            <textarea
              rows={4}
              value={settings.announcement}
              onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
              placeholder="Örn: Bu hafta Instagram takipçi kampanyası aktif!"
              maxLength={220}
            />
            <span className="muted text-xs">{settings.announcement.length}/220</span>
          </label>

          <div className="grid gap-2">
            <span className="muted text-xs">Stil</span>
            <div className="admin-btn-row" style={{ marginTop: 0 }}>
              <button
                type="button"
                className={`btn ${style === "mono" ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setSettings({ ...settings, announcement_style: "mono" })}
              >
                Mono (önerilen)
              </button>
              <button
                type="button"
                className={`btn ${style === "accent" ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setSettings({ ...settings, announcement_style: "accent" })}
              >
                Vurgulu
              </button>
            </div>
          </div>

          <div className="announce-preview-wrap">
            <span className="muted text-xs">Canlı önizleme</span>
            <div
              className={`announce-banner style-${style} announce-preview ${
                settings.announcement_enabled === "1" ? "" : "is-off"
              }`}
            >
              <div className="announce-banner-inner">
                <span className="announce-badge">Duyuru</span>
                <p className="announce-text">
                  {settings.announcement.trim() || "Duyuru metni buraya gelecek…"}
                </p>
              </div>
            </div>
            {settings.announcement_enabled !== "1" ? (
              <p className="muted text-xs">Kapalı — sitede görünmez.</p>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
}
