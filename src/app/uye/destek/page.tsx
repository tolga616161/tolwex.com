"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MemberGate } from "@/components/smm/MemberGate";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  kind?: string;
  status: string;
  reply: string;
  createdAt: string;
  hasImage?: boolean;
  caseNumber?: string | null;
};

const KIND_LABEL: Record<string, string> = {
  closed: "Kapanan hesap kurtarma",
  fake: "Fake hesap (eski)",
  stolen: "Çalınan hesap kurtarma",
  general: "Genel",
};

function SupportInner() {
  const search = useSearchParams();
  const fromHelp = search.get("from") === "hesap-yardim" && search.get("ok") === "1";
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [okBanner, setOkBanner] = useState(fromHelp);

  async function load() {
    const t = await fetch("/api/member/support", { credentials: "same-origin" }).then((r) =>
      r.ok ? r.json() : null
    );
    setTickets(t?.tickets || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await fetch("/api/member/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ subject, message, kind: "general" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data.error || "Gönderilemedi");
      return;
    }
    setSubject("");
    setMessage("");
    load();
  }

  return (
    <div className="sp-page">
      <div className="sp-page-title">
        <h1>Yardım Merkezi</h1>
        <p>Destek taleplerin burada. Hesap sorunları için görsel menüyü kullan.</p>
      </div>

      {okBanner ? (
        <div className="account-help-success">
          <strong>Talebin alındı.</strong> WhatsApp’a da iletildi — görseli sohbete eklediysen ekibimiz
          inceleyecek.
          <button type="button" className="btn btn-ghost" onClick={() => setOkBanner(false)}>
            Kapat
          </button>
        </div>
      ) : null}

      <div className="account-help-mini-nav">
        <Link href="/uye/hesap-yardim">Hesap kurtarma</Link>
        <Link href="/uye/hesap-yardim/kapanan">Kapanan hesap</Link>
        <Link href="/uye/hesap-yardim/calinan">Çalınan hesap</Link>
      </div>

      <form onSubmit={submit} className="sp-card sp-form mb-6">
        <label>
          <span>Konu</span>
          <input
            placeholder="Konu"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            minLength={3}
          />
        </label>
        <label>
          <span>Mesaj</span>
          <textarea
            placeholder="Mesajınız"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            required
            minLength={5}
          />
        </label>
        {err ? <p className="sp-err">{err}</p> : null}
        <button type="submit" className="btn btn-primary">
          Gönder
        </button>
      </form>

      <div className="grid gap-3">
        {tickets.map((t) => (
          <article key={t.id} className="sp-card" style={{ padding: "1rem" }}>
            <div className="flex justify-between gap-3 mb-2">
              <strong>{t.subject}</strong>
              <span className="muted text-xs">{t.status}</span>
            </div>
            {t.caseNumber ? (
              <p className="text-sm mb-1">
                Başvuru no: <strong>{t.caseNumber}</strong>
              </p>
            ) : null}
            {t.kind && t.kind !== "general" ? (
              <p className="muted text-xs mb-2">
                {KIND_LABEL[t.kind] || t.kind}
                {t.hasImage ? " · görsel eklendi" : ""}
              </p>
            ) : null}
            <p className="text-sm mb-2" style={{ whiteSpace: "pre-wrap" }}>
              {t.message}
            </p>
            {t.reply ? <p className="text-sm muted">Yanıt: {t.reply}</p> : null}
          </article>
        ))}
        {tickets.length === 0 ? <p className="muted text-sm">Talep yok.</p> : null}
      </div>
    </div>
  );
}

export default function MemberSupportPage() {
  return (
    <MemberGate>
      {() => (
        <Suspense fallback={<p className="muted p-6">Yükleniyor…</p>}>
          <SupportInner />
        </Suspense>
      )}
    </MemberGate>
  );
}
