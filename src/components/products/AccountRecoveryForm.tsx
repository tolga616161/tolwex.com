"use client";

import { useId, useState } from "react";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

const PLATFORMS = ["Instagram", "Facebook", "Meta / Diğer"] as const;
const REASONS = [
  "Topluluk kuralları ihlali",
  "Sahte / taklit hesap iddiası",
  "Telif / marka şikayeti",
  "Şüpheli giriş / güvenlik",
  "Hack / ele geçirme",
  "Diğer",
] as const;

type Props = {
  productId: string;
  productName: string;
};

export function AccountRecoveryForm({ productId, productName }: Props) {
  const inputId = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number]>("Instagram");
  const [username, setUsername] = useState("");
  const [reason, setReason] = useState<(typeof REASONS)[number]>(REASONS[0]);
  const [detail, setDetail] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onFile(file: File | null) {
    if (!file) {
      setPreview(null);
      setFileName("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Yalnızca görsel yükleyin (PNG / JPG / WEBP).");
      return;
    }
    if (file.size > 6 * 1024 * 1024) {
      setError("Görsel en fazla 6 MB olmalı.");
      return;
    }
    setError(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !phone.trim() || !username.trim() || !detail.trim()) {
      setError("İsim, telefon, hesap adı ve kapanma açıklaması zorunlu.");
      return;
    }
    if (!preview) {
      setError("Kapanma ekranının görselini yükleyin.");
      return;
    }

    setBusy(true);
    const note = [
      `Platform: ${platform}`,
      `Hesap: ${username.trim().startsWith("@") ? username.trim() : `@${username.trim()}`}`,
      `Neden: ${reason}`,
      `Açıklama: ${detail.trim()}`,
      `Görsel: ${fileName || "yüklendi"} (WhatsApp’ta ek gönderilecek)`,
    ].join("\n");

    try {
      const res = await fetch("/api/products/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          name: name.trim(),
          phone: phone.trim(),
          note,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Talep kaydedilemedi");
      }
      setDone(true);
      const wa = whatsappUrl(
        [
          `Merhaba, "${productName}" talebi:`,
          `Ad: ${name.trim()}`,
          `Tel: ${phone.trim()}`,
          `Platform: ${platform}`,
          `Hesap: ${username.trim()}`,
          `Neden: ${reason}`,
          `Açıklama: ${detail.trim()}`,
          `Görsel: ${fileName || "ekliyorum"} — kapanma ekranı ekran görüntüsünü bu mesaja ekliyorum.`,
        ].join("\n")
      );
      window.open(wa, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="recovery-form glass-panel rounded-2xl p-5 md:p-6 space-y-3">
        <h3 className="display text-xl">Talep alındı</h3>
        <p className="muted text-sm leading-relaxed">
          WhatsApp açıldıysa kapanma ekranı görselini mesaja ekleyin. Açılmadıysa
          numaraya yazın: {CONTACT_PHONE_DISPLAY}
        </p>
        <a
          href={whatsappUrl(`Kapanan hesap görselini ekliyorum — ${username}`)}
          className="btn btn-primary w-full text-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp’a görsel ekle
        </a>
      </div>
    );
  }

  return (
    <form className="recovery-form glass-panel rounded-2xl p-5 md:p-6 space-y-4" onSubmit={submit}>
      <div>
        <h3 className="display text-xl">Hesabı yükle & talep aç</h3>
        <p className="muted text-sm mt-1">
          Kapanma ekranını yükle, nedeni yaz — ekip WhatsApp’tan dönüş yapsın.
        </p>
      </div>

      <div className="recovery-grid">
        <label className="recovery-field">
          <span>Adınız</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad Soyad" required />
        </label>
        <label className="recovery-field">
          <span>Telefon</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05xx..."
            inputMode="tel"
            required
          />
        </label>
      </div>

      <div className="recovery-grid">
        <label className="recovery-field">
          <span>Platform</span>
          <select value={platform} onChange={(e) => setPlatform(e.target.value as typeof platform)}>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <label className="recovery-field">
          <span>Hesap adı</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@kullaniciadi"
            required
          />
        </label>
      </div>

      <label className="recovery-field">
        <span>Neden kapandı?</span>
        <select value={reason} onChange={(e) => setReason(e.target.value as typeof reason)}>
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className="recovery-field">
        <span>Detaylı açıklama</span>
        <textarea
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          rows={4}
          placeholder="Ne oldu, ne zaman kapandı, hangi uyarıyı gördünüz?"
          required
        />
      </label>

      <div className="recovery-upload">
        <label htmlFor={inputId} className={`recovery-drop ${preview ? "has-preview" : ""}`}>
          {preview ? (
            <img src={preview} alt="Kapanma ekranı önizleme" className="recovery-preview" />
          ) : (
            <span>
              <strong>Kapanma ekranı görseli</strong>
              <br />
              Dokun / sürükle — PNG, JPG (max 6 MB)
            </span>
          )}
        </label>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
        {fileName ? (
          <button type="button" className="btn btn-ghost text-sm" onClick={() => onFile(null)}>
            Görseli kaldır
          </button>
        ) : null}
      </div>

      {error ? <p className="text-sm" style={{ color: "#ff8a8a" }}>{error}</p> : null}

      <button type="submit" className="btn btn-primary w-full" disabled={busy}>
        {busy ? "Gönderiliyor…" : "Talebi gönder · WhatsApp"}
      </button>
      <p className="muted text-xs text-center">
        Şifre istemeyiz. Görseli WhatsApp mesajına eklemeyi unutmayın.
      </p>
    </form>
  );
}
