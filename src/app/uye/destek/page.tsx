"use client";

import { FormEvent, useEffect, useState } from "react";
import { MemberPanelShell } from "@/components/smm/MemberPanelShell";

type Me = { username: string; email: string; balance: number };
type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  reply: string;
  createdAt: string;
};

export default function MemberSupportPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const [p, t] = await Promise.all([
      fetch("/api/member/profile").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/member/support").then((r) => (r.ok ? r.json() : null)),
    ]);
    if (p?.member) {
      setMe({
        username: p.member.username,
        email: p.member.email,
        balance: p.member.balance,
      });
    }
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
      body: JSON.stringify({ subject, message }),
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

  if (!me) return <div className="site-shell py-16 muted">Yükleniyor…</div>;

  return (
    <MemberPanelShell username={me.username} email={me.email} balance={me.balance}>
      <div className="member-page">
        <div className="section-head mb-6">
          <p className="section-kicker">Destek</p>
          <h1 className="section-title">Destek talepleri</h1>
        </div>

        <form onSubmit={submit} className="glass-panel rounded-2xl p-5 grid gap-3 mb-6">
          <input
            placeholder="Konu"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
          <textarea
            placeholder="Mesajınız"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            required
          />
          {err ? <p style={{ color: "#f87171" }}>{err}</p> : null}
          <button type="submit" className="btn btn-primary">
            Gönder
          </button>
        </form>

        <div className="grid gap-3">
          {tickets.map((t) => (
            <article key={t.id} className="glass-panel rounded-2xl p-4">
              <div className="flex justify-between gap-3 mb-2">
                <strong>{t.subject}</strong>
                <span className="muted text-xs">{t.status}</span>
              </div>
              <p className="text-sm mb-2">{t.message}</p>
              {t.reply ? (
                <p className="text-sm muted">Yanıt: {t.reply}</p>
              ) : null}
            </article>
          ))}
          {tickets.length === 0 ? <p className="muted text-sm">Talep yok.</p> : null}
        </div>
      </div>
    </MemberPanelShell>
  );
}
