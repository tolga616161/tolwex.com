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
  maintenance_enabled: string;
  maintenance_until: string;
  maintenance_hours: string;
  maintenance_message: string;
};

type MaintInfo = {
  active: boolean;
  until: string | null;
  remainingMs: number;
  hours: number;
  message: string;
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
  maintenance_enabled: "0",
  maintenance_until: "",
  maintenance_hours: "24",
  maintenance_message: "Kısa bir bakımdayız. Çok yakında döneceğiz.",
};

function formatRemain(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  return `${h} saat ${m} dk`;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [maint, setMaint] = useState<MaintInfo | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [maintMsg, setMaintMsg] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.settings) {
          setSettings({ ...FALLBACK, ...d.settings });
          setMaint(d.maintenance ?? null);
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
        body: JSON.stringify({
          site_name: settings.site_name,
          support_whatsapp: settings.support_whatsapp,
          support_email: settings.support_email,
          min_deposit: settings.min_deposit,
          announcement: settings.announcement,
          announcement_enabled: settings.announcement_enabled,
          announcement_style: settings.announcement_style,
          bank_name: settings.bank_name,
          bank_iban: settings.bank_iban,
          bank_holder: settings.bank_holder,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.settings) {
        setSettings({ ...FALLBACK, ...data.settings });
        setMaint(data.maintenance ?? null);
      }
      setMsg(res.ok ? "Kaydedildi — duyuru sitede güncellendi" : "Kaydederken hata oluştu");
    } catch {
      setMsg("Bağlantı hatası");
    }
  }

  async function applyMaintenance(action: "on" | "off" | "restart" | "save") {
    if (!settings) return;
    setBusy(true);
    setMaintMsg(null);
    try {
      const hours = String(Math.max(1, Math.min(168, Number(settings.maintenance_hours) || 24)));
      const body: Record<string, string | boolean> = {
        maintenance_hours: hours,
        maintenance_message: settings.maintenance_message,
      };
      if (action === "on") {
        body.maintenance_enabled = "1";
        body.maintenance_restart = true;
      } else if (action === "off") {
        body.maintenance_enabled = "0";
      } else if (action === "restart") {
        body.maintenance_enabled = "1";
        body.maintenance_restart = true;
      } else {
        body.maintenance_enabled = settings.maintenance_enabled === "1" ? "1" : "0";
      }

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMaintMsg("Bakım ayarı kaydedilemedi");
        return;
      }
      if (data.settings) setSettings({ ...FALLBACK, ...data.settings });
      setMaint(data.maintenance ?? null);
      if (action === "on" || (action === "restart" && data.maintenance?.active)) {
        setMaintMsg(`3D bakım modu açık — süre: ${hours} saat`);
      } else if (action === "off") {
        setMaintMsg("Bakım modu kapatıldı — site yeniden açık");
      } else {
        setMaintMsg("Bakım ayarları kaydedildi");
      }
    } catch {
      setMaintMsg("Bağlantı hatası");
    } finally {
      setBusy(false);
    }
  }

  if (!settings) return <p className="muted">Yükleniyor…</p>;

  const style = settings.announcement_style === "accent" ? "accent" : "mono";
  const active = Boolean(maint?.active);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Ayarlar</h2>
          <p className="muted">Duyuru paneli, banka hesabı, bakım modu ve genel ayarlar</p>
        </div>
      </div>
      {loadError ? <div className="admin-banner">{loadError}</div> : null}

      <div className={`admin-maint-card mb-6 ${active ? "is-on" : ""}`}>
        <div className="admin-maint-status">
          <span className={`admin-maint-dot ${active ? "on" : ""}`}>
            {active ? "3D Bakım Modu AÇIK" : "Bakım Modu Kapalı"}
          </span>
          {active && maint ? (
            <span className="muted text-xs">
              Kalan: {formatRemain(maint.remainingMs)}
              {maint.until
                ? ` · Bitiş ${new Date(maint.until).toLocaleString("tr-TR")}`
                : ""}
            </span>
          ) : (
            <span className="muted text-xs">Açılınca ziyaretçiler 3D bakım ekranını görür</span>
          )}
        </div>

        <label className="grid gap-1">
          <span className="muted text-xs">Süre (saat)</span>
          <input
            type="number"
            min={1}
            max={168}
            value={settings.maintenance_hours}
            onChange={(e) => setSettings({ ...settings, maintenance_hours: e.target.value })}
          />
          <span className="muted text-xs">Varsayılan 24 saat. Süre bitince otomatik kapanır.</span>
        </label>

        <label className="grid gap-1">
          <span className="muted text-xs">Bakım mesajı</span>
          <textarea
            rows={2}
            maxLength={280}
            value={settings.maintenance_message}
            onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
          />
        </label>

        <div className="admin-btn-row" style={{ marginTop: 0 }}>
          {active ? (
            <>
              <button
                type="button"
                className="btn btn-primary"
                disabled={busy}
                onClick={() => void applyMaintenance("off")}
              >
                Bakımı Kapat
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={busy}
                onClick={() => void applyMaintenance("restart")}
              >
                Süreyi Yeniden Başlat
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy}
              onClick={() => void applyMaintenance("on")}
            >
              3D Bakım Moduna Gir
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            disabled={busy}
            onClick={() => void applyMaintenance("save")}
          >
            Mesaj / süreyi kaydet
          </button>
        </div>
        {maintMsg ? <p className="admin-msg">{maintMsg}</p> : null}
        <p className="muted text-xs">
          Admin paneli (`/admin61`) bakımdayken de açık kalır. Siteyi kontrol etmek için
          başka sekmede ana sayfayı açın.
        </p>
      </div>

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
