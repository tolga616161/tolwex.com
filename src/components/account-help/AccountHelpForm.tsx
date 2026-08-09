"use client";

import { useRef, useState } from "react";
import type { AccountHelpTool } from "@/lib/account-help";
import { buildAnalysis, extractImageSignals } from "@/lib/account-help-analyze";
import { compressImageToDataUrl } from "@/lib/image-compress";

type Result = {
  caseNumber: string;
  summary: string;
  points: string[];
  metaHint: string;
  metaHelpUrl: string;
  metaHelpLabel: string;
  ticketId: string;
};

export function AccountHelpForm({ tool }: { tool: AccountHelpTool }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [whenText, setWhenText] = useState("");
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState<"form" | "scan" | "done">("form");
  const [scanLabel, setScanLabel] = useState("Görsel okunuyor…");
  const [hint, setHint] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

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
    setPhase("scan");
    setScanLabel("Görsel analiz ediliyor…");
    await new Promise((r) => setTimeout(r, 700));

    let analysis;
    try {
      setScanLabel("Ekran oranı ve arayüz taranıyor…");
      const signals = await extractImageSignals(preview);
      await new Promise((r) => setTimeout(r, 500));
      setScanLabel("Meta yardım kaydı hazırlanıyor…");
      analysis = buildAnalysis({
        kind: tool.kind,
        username,
        whenText,
        detail,
        email,
        signals,
      });
      await new Promise((r) => setTimeout(r, 450));
    } catch {
      setBusy(false);
      setPhase("form");
      setHint("Görsel analiz edilemedi — başka bir ekran görüntüsü dene");
      return;
    }

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
          analysisSummary: analysis.summary,
          analysisPoints: analysis.points,
          closureGuess: analysis.closureGuess,
          imageData: preview,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBusy(false);
        setPhase("form");
        setHint(data.error || "Kayıt alınamadı — tekrar dene");
        return;
      }

      const caseNumber = data.caseNumber || data.ticket?.caseNumber || "TW-—";
      const done: Result = {
        caseNumber,
        summary: analysis.summary,
        points: analysis.points,
        metaHint: analysis.metaHint,
        metaHelpUrl: tool.metaHelpUrl,
        metaHelpLabel: tool.metaHelpLabel,
        ticketId: data.ticket?.id || "",
      };
      setResult(done);
      setPhase("done");
      setBusy(false);

      // Direct Meta help transfer
      window.open(tool.metaHelpUrl, "_blank", "noopener,noreferrer");
    } catch {
      setBusy(false);
      setPhase("form");
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
        <h3>Görsel analizi</h3>
        <p className="account-help-summary">{result.summary}</p>
        <ul className="account-help-points">
          {result.points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <p className="muted text-sm">{result.metaHint}</p>
        <div className="account-help-result-actions">
          <a
            href={result.metaHelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            {result.metaHelpLabel}
          </a>
          <a href="/uye/destek" className="btn btn-ghost">
            Yardım Merkezi · taleplerim
          </a>
        </div>
        <p className="muted text-xs text-center">
          Numaranı sakla. Detaylı takip için Yardım Merkezi’nden aynı başvuruyu görebilirsin.
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
        <label
          className={`recovery-drop ${preview ? "has-preview" : ""} ${phase === "scan" ? "is-scanning" : ""}`}
        >
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
              <strong>Zorunlu · Görsel yükle</strong>
              <br />
              Kapanma / çalıntı / fake profil ekran görüntüsü
            </span>
          )}
          {phase === "scan" ? (
            <span className="account-help-scan" aria-live="polite">
              {scanLabel}
            </span>
          ) : null}
        </label>
        {preview && phase === "form" ? (
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
        {busy ? "Analiz ediliyor…" : tool.cta}
      </button>
      <p className="muted text-sm text-center">
        Analiz bitince başvuru numarası verilir ve <strong>Meta yardım</strong> formu açılır.
      </p>
    </form>
  );
}
