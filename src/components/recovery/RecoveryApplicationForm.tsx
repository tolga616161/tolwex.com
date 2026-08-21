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
import { prepareImagePreview } from "@/lib/image-compress";
import { GUIDE_ARTICLES } from "@/lib/guides";

export function RecoveryApplicationForm({ service }: { service: RecoveryService }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);
  const previewRef = useRef<string | null>(null);
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
  const [dragOver, setDragOver] = useState(false);

  const relatedGuides = GUIDE_ARTICLES.filter(
    (g) => g.relatedHref === service.href || g.tags.some((t) => service.title.includes(t.split(" ")[0]))
  ).slice(0, 2);

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
    if (!file) return;

    const result = await prepareImagePreview(file);
    if (result.ok && result.previewUrl) {
      fileRef.current = file;
      previewRef.current = result.previewUrl;
      setPreview(result.previewUrl);
      if (result.warning) setHint(result.warning);
    } else {
      setHint(result.warning || "Bu dosya önizlenemedi — WhatsApp’tan yine foto ekleyebilirsin.");
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
    const message = buildRecoveryWhatsAppText({
      kind: service.kind,
      platform,
      username: username.trim(),
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
        <p className="rec-done-kicker">Başvuru hazır</p>
        <h2>WhatsApp açıldı</h2>
        <p>
          Bilgiler {CONTACT_PHONE_DISPLAY} numarasına yazıldı.
          {fileRef.current ? (
            <>
              {" "}
              Sohbette <strong>fotoğrafı da ekleyip Gönder</strong>.
            </>
          ) : (
            <> Fotoğraf yoksa metin yeterli — istersen sonra da ekleyebilirsin.</>
          )}
        </p>
        <div className="rec-done-actions">
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            WhatsApp’ı tekrar aç
          </a>
          <button type="button" className="btn btn-ghost" onClick={() => setDone(false)}>
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
      <div
        className={`rec-drop ${preview ? "has-file" : ""} ${dragOver ? "is-drag" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void onFile(f);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic"
          className="sr-only"
          id={`photo-${service.slug}`}
          disabled={busy}
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Yüklenen fotoğraf" className="rec-preview" />
        ) : (
          <label htmlFor={`photo-${service.slug}`} className="rec-drop-copy">
            <strong>Galeriden fotoğraf ekle (opsiyonel)</strong>
            <em>{service.imageHint}</em>
            <em className="rec-drop-sub">Kamera açılmaz · galeri / dosya seç</em>
          </label>
        )}
      </div>
      {preview ? (
        <div className="rec-photo-actions">
          <button
            type="button"
            className="btn btn-ghost rec-change-img"
            onClick={() => inputRef.current?.click()}
          >
            Değiştir
          </button>
          <button
            type="button"
            className="btn btn-ghost rec-change-img"
            onClick={() => onFile(null)}
          >
            Kaldır
          </button>
        </div>
      ) : null}

      <fieldset className="rec-platform-field">
        <legend>Platform seç *</legend>
        <div className="rec-platform-chips" role="group" aria-label="Platform">
          {chipPlatforms.map((p) => {
            const icon = PLATFORM_ICON[p as keyof typeof PLATFORM_ICON];
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

      {hint ? <p className="rec-hint rec-hint-soft">{hint}</p> : null}

      <button type="submit" className="btn btn-primary rec-submit" disabled={busy}>
        {busy ? "Hazırlanıyor…" : service.cta}
      </button>
      <p className="rec-foot muted">
        WhatsApp açılır, yazı dolar. Fotoğraf seçtiysen sohbete eklemen yeterli — zorunlu değil.
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
