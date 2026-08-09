"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AccountHelpTool } from "@/lib/account-help";
import { compressImageToDataUrl } from "@/lib/image-compress";

export function AccountHelpForm({ tool }: { tool: AccountHelpTool }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [whenStolen, setWhenStolen] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  async function onFile(file: File | null) {
    setHint(null);
    if (!file) {
      setPreview(null);
      return;
    }
    try {
      const url = await compressImageToDataUrl(file);
      setPreview(url);
    } catch (e) {
      setPreview(null);
      setHint(e instanceof Error ? e.message : "Görsel yüklenemedi");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setHint(null);
    if (!preview) {
      setHint("Devam etmek için bir ekran görüntüsü yükle");
      return;
    }
    if (tool.whenLabel && !whenStolen.trim()) {
      setHint(`${tool.whenLabel} alanını doldur`);
      return;
    }

    setBusy(true);
    setScanning(true);
    // Short “visual reader” beat before ticket + redirect
    await new Promise((r) => setTimeout(r, 1100));

    try {
      const res = await fetch("/api/member/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          kind: tool.kind,
          subject: tool.subject,
          username: username.trim() || undefined,
          whenStolen: whenStolen.trim() || undefined,
          note: note.trim() || undefined,
          imageData: preview,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setScanning(false);
        setBusy(false);
        setHint(data.error || "Gönderilemedi — tekrar dene veya Destek menüsünden yaz");
        return;
      }
      // Direct to help center
      router.push("/uye/destek?from=hesap-yardim&ok=1");
    } catch {
      setScanning(false);
      setBusy(false);
      setHint("Bağlantı kopuk — tekrar dene");
    }
  }

  return (
    <form className="account-help-form recovery-form" onSubmit={submit}>
      <div className="account-help-visual">
        <label
          className={`recovery-drop ${preview ? "has-preview" : ""} ${scanning ? "is-scanning" : ""}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
          />
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Yüklenen görsel" className="recovery-preview" />
          ) : (
            <span>
              <strong>Görsel yükle</strong>
              <br />
              Ekran görüntüsünü buraya bırak veya seç
            </span>
          )}
          {scanning ? (
            <span className="account-help-scan" aria-live="polite">
              Görsel okunuyor… yardım merkezine yönlendiriliyorsun
            </span>
          ) : null}
        </label>
        {preview ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setPreview(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            Görseli değiştir
          </button>
        ) : null}
      </div>

      <div className="recovery-grid">
        <label className="recovery-field">
          <span>Hesap kullanıcı adı (opsiyonel)</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="@kullaniciadi"
            autoComplete="off"
          />
        </label>
        {tool.whenLabel ? (
          <label className="recovery-field">
            <span>{tool.whenLabel}</span>
            <input
              value={whenStolen}
              onChange={(e) => setWhenStolen(e.target.value)}
              placeholder={tool.whenPlaceholder || ""}
              required
            />
          </label>
        ) : (
          <label className="recovery-field">
            <span>Kısa not (opsiyonel)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Örn. e-posta doğrulama geldi"
            />
          </label>
        )}
      </div>

      {tool.whenLabel ? (
        <label className="recovery-field">
          <span>Ek not (opsiyonel)</span>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Varsa ek bilgi yaz…"
          />
        </label>
      ) : null}

      {hint ? <p className="account-help-hint">{hint}</p> : null}

      <button type="submit" className="btn btn-primary w-full" disabled={busy}>
        {busy ? "İşleniyor…" : tool.cta}
      </button>
      <p className="muted text-sm text-center">
        Gönderince kayıt oluşur ve <strong>Yardım Merkezi / Destek</strong> sayfasına geçersin.
      </p>
    </form>
  );
}
