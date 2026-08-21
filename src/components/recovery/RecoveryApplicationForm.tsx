"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  buildRecoveryWhatsAppText,
  PLATFORM_ICON,
  RECOVERY_PLATFORMS,
  recoveryWhatsAppHref,
  type RecoveryPlatform,
  type RecoveryService,
} from "@/lib/recovery";
import { CONTACT_PHONE_DISPLAY } from "@/lib/contact";
import { fileToJpegFile, prepareImagePreview } from "@/lib/image-compress";
import { GUIDE_ARTICLES } from "@/lib/guides";

export function RecoveryApplicationForm({ service }: { service: RecoveryService }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);
  const previewRef = useRef<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [platform, setPlatform] = useState<RecoveryPlatform>("Instagram");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [whenText, setWhenText] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [waHref, setWaHref] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [sentWithImage, setSentWithImage] = useState(false);

  const relatedGuides = GUIDE_ARTICLES.filter((g) => g.relatedHref === service.href).slice(0, 2);

  useEffect(() => {
    return () => {
      if (previewRef.current?.startsWith("blob:")) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  async function onFile(file: File | null) {
    setHint(null);
    if (previewRef.current?.startsWith("blob:")) URL.revokeObjectURL(previewRef.current);
    previewRef.current = null;
    fileRef.current = null;
    setPreview(null);
    setFileName(null);
    if (!file) return;

    fileRef.current = file;
    setFileName(file.name || "fotoğraf");
    const result = await prepareImagePreview(file);
    if (result.ok && result.previewUrl) {
      previewRef.current = result.previewUrl;
      setPreview(result.previewUrl);
      if (result.warning) setHint(result.warning);
    } else {
      setHint(result.warning || "Önizleme yok — dosya seçildi.");
    }
  }

  async function uploadImage(file: File): Promise<string | null> {
    try {
      const fd = new FormData();
      fd.append("file", file, file.name || "tolwex-ekran.jpg");
      const res = await fetch("/api/basvuru/upload", { method: "POST", body: fd });
      const data = (await res.json().catch(() => null)) as { url?: string } | null;
      return data?.url || null;
    } catch {
      return null;
    }
  }

  /** Görseli WhatsApp’a ilet — share (ek) + wa.me (linkli metin) */
  async function sendToWhatsApp(message: string, href: string, imageFile: File | null) {
    // 1) Mobil: sistem paylaşımı → WhatsApp (görsel ekli açılır)
    if (imageFile && typeof navigator !== "undefined" && navigator.share && navigator.canShare) {
      try {
        const payload: ShareData = {
          files: [imageFile],
          text: message,
          title: service.title,
        };
        if (navigator.canShare(payload)) {
          await navigator.share(payload);
          setSentWithImage(true);
          return "shared";
        }
      } catch (err) {
        // Kullanıcı iptal ettiyse yine wa.me aç
        if (err instanceof Error && err.name === "AbortError") {
          /* devam */
        }
      }
    }

    // 2) WhatsApp uygulamasını / web’i metin + görsel linki ile aç
    setSentWithImage(Boolean(imageFile));
    window.location.href = href;
    return "wa";
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setHint(null);
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
    try {
      let imageFile: File | null = null;
      let imageUrl: string | undefined;

      if (fileRef.current) {
        imageFile = await fileToJpegFile(fileRef.current);
        imageUrl = (await uploadImage(imageFile)) || undefined;
        if (!imageUrl) {
          setHint("Görsel linki oluşamadı — paylaşım ekranından WhatsApp’ı seç.");
        }
      }

      const message = buildRecoveryWhatsAppText({
        kind: service.kind,
        platform,
        username: username.trim(),
        email: email.trim() || undefined,
        whenText: whenText.trim(),
        reason: reason.trim(),
        imageUrl,
      });
      const href = recoveryWhatsAppHref(message);
      setWaHref(href);
      setDone(true);
      await sendToWhatsApp(message, href, imageFile);
    } finally {
      setBusy(false);
    }
  }

  if (done && waHref) {
    return (
      <div className="rec-done">
        <p className="rec-done-kicker">Başvuru hazır</p>
        <h2>WhatsApp’a iletildi</h2>
        <p>
          {sentWithImage ? (
            <>
              Görsel + yazı hazır. Açılan ekranda <strong>WhatsApp</strong>’ı seçip{" "}
              <strong>Gönder</strong>’e bas — {CONTACT_PHONE_DISPLAY} numarasına düşer.
            </>
          ) : (
            <>
              WhatsApp açıldı, metin hazır. Sohbette <strong>Gönder</strong>’e bas.
            </>
          )}
        </p>
        <div className="rec-done-actions">
          <a href={waHref} className="btn btn-primary">
            WhatsApp’ı tekrar aç
          </a>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setDone(false);
              setSentWithImage(false);
            }}
          >
            Formu düzenle
          </button>
        </div>
        <p className="rec-foot muted" style={{ marginTop: "1.25rem" }}>
          <Link href="/makaleler">Yardımcı makalelere göz at →</Link>
        </p>
      </div>
    );
  }

  const chipPlatforms = RECOVERY_PLATFORMS.filter((p) => p !== "Diğer");

  return (
    <form className="rec-form" onSubmit={submit}>
      <div className={`rec-upload ${preview || fileName ? "has-file" : ""}`}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="rec-upload-input"
          id={`photo-${service.slug}`}
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            void onFile(f);
            e.target.value = "";
          }}
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="rec-preview" />
        ) : (
          <div className="rec-upload-empty">
            <strong>Galeriden fotoğraf seç</strong>
            <span>{service.imageHint}</span>
            <span className="rec-upload-note">Gönderince WhatsApp’a otomatik eklenir</span>
          </div>
        )}
        <div className="rec-upload-bar">
          <label htmlFor={`photo-${service.slug}`} className="btn btn-primary rec-upload-btn">
            {fileName ? "Değiştir" : "Galeriden seç"}
          </label>
          {fileName ? (
            <button type="button" className="btn btn-ghost" onClick={() => onFile(null)}>
              Kaldır
            </button>
          ) : null}
        </div>
        {fileName ? <p className="rec-upload-name">{fileName}</p> : null}
      </div>

      <fieldset className="rec-platform-field">
        <legend>Platform seç *</legend>
        <div className="rec-platform-chips" role="group" aria-label="Platform">
          {chipPlatforms.map((p) => {
            const icon = PLATFORM_ICON[p];
            return (
              <button
                key={p}
                type="button"
                className={`rec-chip rec-chip-icon ${platform === p ? "is-on" : ""}`}
                onClick={() => setPlatform(p)}
                disabled={busy}
              >
                {icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={icon} alt="" width={18} height={18} />
                ) : null}
                <span>{p === "X / Twitter" ? "X" : p}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="rec-field">
        <span>Hesap kullanıcı adı *</span>
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

      {hint ? <p className="rec-hint rec-hint-soft">{hint}</p> : null}

      <button type="submit" className="btn btn-primary rec-submit" disabled={busy}>
        {busy ? "WhatsApp’a hazırlanıyor…" : "WhatsApp’a gönder"}
      </button>
      <p className="rec-foot muted">
        Foto seçtiysen gönder’de WhatsApp açılır — görsel otomatik eklenir / link mesaja yazılır.
      </p>

      <div className="rec-form-guides">
        <p className="rec-form-guides-title">Yardımcı makaleler</p>
        <ul>
          {(relatedGuides.length ? relatedGuides : GUIDE_ARTICLES.slice(0, 2)).map((g) => (
            <li key={g.slug}>
              <Link href={`/makaleler/${g.slug}`}>{g.title}</Link>
            </li>
          ))}
          <li>
            <Link href="/makaleler">Tüm makaleler →</Link>
          </li>
        </ul>
      </div>
    </form>
  );
}
