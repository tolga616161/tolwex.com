"use client";

import { useRef, useState } from "react";
import {
  buildRecoveryWhatsAppText,
  RECOVERY_PLATFORMS,
  recoveryWhatsAppHref,
  type RecoveryPlatform,
  type RecoveryService,
} from "@/lib/recovery";
import { CONTACT_PHONE_DISPLAY } from "@/lib/contact";
import { compressImageToDataUrl } from "@/lib/image-compress";

export function RecoveryApplicationForm({ service }: { service: RecoveryService }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [platform, setPlatform] = useState<RecoveryPlatform>("Instagram");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [whenText, setWhenText] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [waHref, setWaHref] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const needImage = service.imageRequired !== false;

  async function onFile(file: File | null) {
    setHint(null);
    fileRef.current = file;
    if (!file) {
      setPreview(null);
      return;
    }
    try {
      const url = await compressImageToDataUrl(file);
      setPreview(url);
    } catch (e) {
      fileRef.current = null;
      setPreview(null);
      setHint(e instanceof Error ? e.message : "Görsel yüklenemedi");
    }
  }

  async function openWhatsApp(href: string, message: string) {
    const file = fileRef.current;
    try {
      if (file && typeof navigator !== "undefined" && navigator.canShare) {
        const shareFile = new File([file], file.name || "ekran.jpg", {
          type: file.type || "image/jpeg",
        });
        if (navigator.canShare({ files: [shareFile], text: message })) {
          await navigator.share({
            files: [shareFile],
            text: message,
            title: service.title,
          });
          return;
        }
      }
    } catch {
      /* iptal */
    }
    window.open(href, "_blank", "noopener,noreferrer");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setHint(null);
    if (needImage && !preview) {
      setHint("Fotoğraf / ekran görüntüsü zorunlu");
      return;
    }
    if (!username.trim()) {
      setHint("Hesap / kullanıcı adını yaz");
      return;
    }
    if (!whenText.trim()) {
      setHint(`${service.whenLabel} alanını doldur`);
      return;
    }
    if (reason.trim().length < 8) {
      setHint("Sebebi / detayı biraz daha yaz");
      return;
    }

    setBusy(true);
    const rawUser = username.trim();
    const message = buildRecoveryWhatsAppText({
      kind: service.kind,
      platform,
      username: rawUser.startsWith("@") || !rawUser.includes(" ") ? rawUser : rawUser,
      email: email.trim() || undefined,
      whenText: whenText.trim(),
      reason: reason.trim(),
    });
    const href = recoveryWhatsAppHref(message);
    setWaHref(href);
    setDone(true);
    setBusy(false);
    await openWhatsApp(href, message);
  }

  if (done && waHref) {
    return (
      <div className="rec-done">
        <p className="rec-done-kicker">010101 · paket hazır</p>
        <h2>WhatsApp açıldı</h2>
        <p>
          Platform, hesap, sebep ve notlar {CONTACT_PHONE_DISPLAY} numarasına yazıldı. Sohbette{" "}
          <strong>fotoğrafı da ekleyip Gönder</strong>.
        </p>
        <div className="rec-done-actions">
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            WhatsApp’ı tekrar aç
          </a>
          <button type="button" className="btn btn-ghost" onClick={() => setDone(false)}>
            Formu düzenle
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="rec-form" onSubmit={submit}>
      <label className={`rec-drop ${preview ? "has-file" : ""}`}>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          capture="environment"
          className="sr-only"
          disabled={busy}
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Yüklenen fotoğraf" className="rec-preview" />
        ) : (
          <span className="rec-drop-copy">
              <strong>
                Fotoğraf / ekran ekle{needImage ? " *" : " (önerilir)"}
              </strong>
              <em>{service.imageHint}</em>
              <em className="rec-drop-sub">JPG · PNG · WEBP</em>
          </span>
        )}
      </label>
      {preview ? (
        <button
          type="button"
          className="btn btn-ghost rec-change-img"
          onClick={() => {
            setPreview(null);
            fileRef.current = null;
            if (inputRef.current) inputRef.current.value = "";
          }}
        >
          Fotoğrafı değiştir
        </button>
      ) : null}

      <label className="rec-field">
        <span>Platform *</span>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as RecoveryPlatform)}
          disabled={busy}
          required
        >
          {RECOVERY_PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>

      <div className="rec-platform-chips" role="group" aria-label="Hızlı platform">
        {RECOVERY_PLATFORMS.filter((p) => p !== "Diğer").map((p) => (
          <button
            key={p}
            type="button"
            className={`rec-chip ${platform === p ? "is-on" : ""}`}
            onClick={() => setPlatform(p)}
            disabled={busy}
          >
            {p}
          </button>
        ))}
      </div>

      <label className="rec-field">
        <span>
          {service.kind === "fake" ? "Sahte hesap kullanıcı adı *" : "Hesap kullanıcı adı *"}
        </span>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="@kullaniciadi"
          required
          autoComplete="off"
          disabled={busy}
        />
      </label>

      <label className="rec-field">
        <span>Hesaba bağlı e-posta (varsa)</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@mail.com"
          disabled={busy}
        />
      </label>

      <label className="rec-field">
        <span>{service.whenLabel} *</span>
        <input
          value={whenText}
          onChange={(e) => setWhenText(e.target.value)}
          placeholder={service.whenPlaceholder}
          required
          disabled={busy}
        />
      </label>

      <label className="rec-field">
        <span>{service.reasonLabel} *</span>
        <textarea
          rows={5}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={service.reasonPlaceholder}
          required
          minLength={8}
          disabled={busy}
        />
      </label>

      {hint ? <p className="rec-hint">{hint}</p> : null}

      <button type="submit" className="btn btn-primary rec-submit" disabled={busy}>
        {busy ? "Paket hazırlanıyor…" : service.cta}
      </button>
      <p className="rec-foot muted">
        Gönderince WhatsApp açılır — yazı otomatik dolar, fotoğrafı sohbete eklemen yeterli.
      </p>
    </form>
  );
}
