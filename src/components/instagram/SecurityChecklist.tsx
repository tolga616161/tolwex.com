"use client";

import { useEffect, useState } from "react";

type Items = {
  twoFactorEnabled: boolean | null;
  emailSecure: boolean | null;
  phoneUpToDate: boolean | null;
  unknownDevices: boolean | null;
  suspiciousApps: boolean | null;
  strongPassword: boolean | null;
  backupCodesSafe: boolean | null;
};

const LABELS: { key: keyof Items; label: string; how: string; href: string }[] = [
  {
    key: "twoFactorEnabled",
    label: "İki faktörlü doğrulama aktif mi?",
    how: "Instagram → Ayarlar → Merkez → Hesap Merkezi → Şifre ve güvenlik → İki faktörlü kimlik doğrulama",
    href: "https://help.instagram.com/566904619951951",
  },
  {
    key: "emailSecure",
    label: "E-posta hesabım güvenli mi?",
    how: "E-posta sağlayıcınızda 2FA açın ve şüpheli oturumları kontrol edin.",
    href: "https://help.instagram.com/502981923235522",
  },
  {
    key: "phoneUpToDate",
    label: "Telefon numaram güncel mi?",
    how: "Hesap Merkezi → Kişisel bilgiler → İletişim bilgileri",
    href: "https://www.facebook.com/help/203305893040179",
  },
  {
    key: "unknownDevices",
    label: "Tanımadığım cihaz var mı?",
    how: "Hesap Merkezi → Şifre ve güvenlik → Giriş yaptığı yerler",
    href: "https://www.facebook.com/help/162968940809035",
  },
  {
    key: "suspiciousApps",
    label: "Şüpheli uygulamalar bağlı mı?",
    how: "Hesap Merkezi → Şifre ve güvenlik → Uygulamalar ve web siteleri",
    href: "https://www.facebook.com/help/262314300536155",
  },
  {
    key: "strongPassword",
    label: "Güçlü ve benzersiz parola kullanıyor muyum?",
    how: "Parola yöneticisi kullanın; Instagram şifrenizi başka yerde kullanmayın.",
    href: "https://help.instagram.com/369001354735370",
  },
  {
    key: "backupCodesSafe",
    label: "Backup kodlarımı güvenli yerde tutuyor muyum?",
    how: "2FA ayarlarından yedek kodları indirip güvenli bir yerde saklayın.",
    href: "https://help.instagram.com/566904619951951",
  },
];

export function SecurityChecklist() {
  const [items, setItems] = useState<Items | null>(null);
  const [openHow, setOpenHow] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/checklist")
      .then((r) => r.json())
      .then((d) => setItems(d.items))
      .catch(() =>
        setItems({
          twoFactorEnabled: null,
          emailSecure: null,
          phoneUpToDate: null,
          unknownDevices: null,
          suspiciousApps: null,
          strongPassword: null,
          backupCodesSafe: null,
        })
      );
  }, []);

  async function toggle(key: keyof Items) {
    if (!items) return;
    const next = { ...items, [key]: items[key] === true ? false : true };
    setItems(next);
    setSaving(true);
    try {
      await fetch("/api/checklist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: next[key] }),
      });
    } finally {
      setSaving(false);
    }
  }

  if (!items) {
    return <p className="muted text-sm">Checklist yükleniyor…</p>;
  }

  return (
    <div className="surface rounded-2xl p-6">
      <div className="mb-4">
        <h2 className="display text-2xl mb-2">Hesap Güvenlik Kontrolü</h2>
        <p className="text-sm muted">
          Bu checklist Meta/Instagram API sonucu değildir. Kendi beyanınıza dayalı bir
          kontrol listesidir.
        </p>
      </div>

      <div>
        {LABELS.map((row) => (
          <div key={row.key} className="check-row">
            <input
              id={row.key}
              type="checkbox"
              checked={items[row.key] === true}
              onChange={() => toggle(row.key)}
              className="mt-1 size-4 accent-[var(--accent)]"
            />
            <div className="flex-1">
              <label htmlFor={row.key} className="font-medium cursor-pointer">
                {row.label}
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="text-xs px-3 py-1.5 rounded-lg border border-white/15 muted hover:text-white"
                  onClick={() => setOpenHow(openHow === row.key ? null : row.key)}
                >
                  Nasıl kontrol edilir?
                </button>
                <a
                  href={row.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 rounded-lg border border-white/15 muted hover:text-white"
                >
                  Resmi yardım
                </a>
              </div>
              {openHow === row.key ? (
                <p className="mt-2 text-sm muted leading-relaxed">{row.how}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      {saving ? <p className="mt-3 text-xs muted">Kaydediliyor…</p> : null}
    </div>
  );
}
