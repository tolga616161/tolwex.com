"use client";

import { useRef, useState } from "react";
import type { AccountHelpTool } from "@/lib/account-help";
import {
  buildRecoveryWhatsAppMessage,
  recoveryWhatsAppUrl,
} from "@/lib/account-help";
import { compressImageToDataUrl } from "@/lib/image-compress";
import { CONTACT_PHONE_DISPLAY } from "@/lib/contact";

type Result = {
  caseNumber: string;
  whatsappHref: string;
  ticketId: string;
};

export function AccountHelpForm({ tool }: { tool: AccountHelpTool }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [whenText, setWhenText] = useState("");
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"form" | "done">("form");
  const [hint, setHint] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

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
      setPreview(null);
      fileRef.current = null;
      setHint(e instanceof Error ? e.message : "Görsel yüklenemedi");
    }
  }

  async function openWhatsAppWithImage(href: string, message: string) {
    const file = fileRef.current;
    // Mobilde mümkünse görseli de paylaş (WhatsApp seçilebilir)
    try {
      if (file && typeof navigator !== "undefined" && navigator.canShare) {
        const shareFile = new File([file], file.name || "ekran-goruntusu.jpg", {
          type: file.type || "image/jpeg",
        });
        if (navigator.canShare({ files: [shareFile], text: message })) {
          await navigator.share({ files: [shareFile], text: message, title: tool.title });
          return;
        }
      }
    } catch {
      // kullanıcı iptal / destek yok → wa.me
    }
    window.open(href, "_blank", "noopener,noreferrer");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setHint(null);
    if (!preview) {
      setHint("Devam etmek için ekran görüntüsü yükle");
      return;
    }
    if (!username.trim()) {
      setHint("Hesap kullanıcı adını yaz");
      return;
    }
    if (!whenText.trim()) {
      setHint(`${tool.whenLabel} alanını doldur`);
      return;
    }
    if (detail.trim().length < 10) {
      setHint(`${tool.detailLabel} — en az birkaç cümle yaz`);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/member/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          kind: tool.kind,
          subject: tool.subject,
          username: username.trim(),
          email: email.trim() || undefined,
          whenStolen: whenText.trim(),
          note: detail.trim(),
          imageData: preview,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBusy(false);
        setHint(data.error || "Kayıt alınamadı — tekrar dene");
        return;
      }

      const caseNumber = String(data.caseNumber || data.ticket?.caseNumber || "TW-—");
      const message =
        typeof data.whatsappMessage === "string" && data.whatsappMessage
          ? data.whatsappMessage
          : buildRecoveryWhatsAppMessage({
              kind: tool.kind,
              caseNumber,
              username: username.trim(),
              email: email.trim() || undefined,
              whenText: whenText.trim(),
              detail: detail.trim(),
            });
      const whatsappHref =
        typeof data.whatsappUrl === "string" && data.whatsappUrl
          ? data.whatsappUrl
          : recoveryWhatsAppUrl(message);

      const done: Result = {
        caseNumber,
        whatsappHref,
        ticketId: data.ticket?.id || "",
      };
      setResult(done);
      setPhase("done");
      setBusy(false);
      await openWhatsAppWithImage(whatsappHref, message);
    } catch {
      setBusy(false);
      setHint("Bağlantı kopuk — tekrar dene");
    }
  }

  if (phase === "done" && result) {
    return (
      <div className="account-help-result">
        <p className="account-help-case">
          Başvuru numaran
          <strong>{result.caseNumber}</strong>
        </p>
        <h3>WhatsApp açıldı</h3>
        <p className="account-help-summary">
          Tüm bilgiler {CONTACT_PHONE_DISPLAY} numarasına hazırlandı. Sohbette{" "}
          <strong>ekran görüntüsünü de ekleyip Gönder</strong> — böylece hem yazı hem görsel bize
          düşer.
        </p>
        <div className="account-help-result-actions">
          <a
            href={result.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            WhatsApp’ı tekrar aç
          </a>
          <a href="/uye/destek" className="btn btn-ghost">
            Yardım Merkezi · taleplerim
          </a>
        </div>
        <p className="muted text-xs text-center">
          Kayıt panelde de duruyor; görsel admin destek ekranında görünür.
        </p>
      </div>
    );
  }

  return (
    <form className="account-help-form recovery-form" onSubmit={submit}>
      <ol className="account-help-steps">
        {tool.steps.map((s, i) => (
          <li key={s}>
            <span>{i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      <div className="account-help-visual">
        <label className={`recovery-drop ${preview ? "has-preview" : ""}`}>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
            disabled={busy}
          />
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Yüklenen görsel" className="recovery-preview" />
          ) : (
            <span>
              <strong>Zorunlu · Ekran görüntüsü yükle</strong>
              <br />
              Kapanma / çalıntı ekranı
            </span>
          )}
        </label>
        {preview ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setPreview(null);
              fileRef.current = null;
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            Görseli değiştir
          </button>
        ) : null}
      </div>

      <div className="recovery-grid">
        <label className="recovery-field">
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
        <label className="recovery-field">
          <span>{tool.emailLabel}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@mail.com"
            disabled={busy}
          />
        </label>
      </div>

      <label className="recovery-field">
        <span>{tool.whenLabel} *</span>
        <input
          value={whenText}
          onChange={(e) => setWhenText(e.target.value)}
          placeholder={tool.whenPlaceholder}
          required
          disabled={busy}
        />
      </label>

      <label className="recovery-field">
        <span>{tool.detailLabel} *</span>
        <textarea
          rows={5}
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder={tool.detailPlaceholder}
          required
          minLength={10}
          disabled={busy}
        />
      </label>

      {hint ? <p className="account-help-hint">{hint}</p> : null}

      <button type="submit" className="btn btn-primary w-full" disabled={busy}>
        {busy ? "Gönderiliyor…" : tool.cta}
      </button>
      <p className="muted text-sm text-center">
        Gönderince kayıt oluşur ve <strong>WhatsApp</strong> açılır — görseli sohbete eklemeyi unutma.
      </p>
    </form>
  );
}
