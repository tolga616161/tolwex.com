"use client";

import { useEffect, useState } from "react";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  kind?: string;
  imageData?: string;
  status: string;
  reply: string;
  createdAt: string;
  member: { username: string; email: string } | null;
};

const KIND_LABEL: Record<string, string> = {
  closed: "Kapanan hesap",
  fake: "Fake hesap",
  stolen: "Çalınan hesap",
  general: "Genel",
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [reply, setReply] = useState<Record<string, string>>({});

  async function load() {
    const d = await fetch("/api/admin/support").then((r) => (r.ok ? r.json() : null));
    setTickets(d?.tickets || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(id: string, status: string) {
    await fetch("/api/admin/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, reply: reply[id] || "" }),
    });
    load();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Destek</h2>
          <p className="muted">Destek talepleri</p>
        </div>
      </div>
      <div className="grid gap-4">
        {tickets.map((t) => (
          <article key={t.id} className="admin-panel">
            <div className="flex justify-between gap-3 mb-2">
              <strong>{t.subject}</strong>
              <span className="muted text-xs">{t.status}</span>
            </div>
            <p className="muted text-xs mb-2">
              {t.member?.username || "—"} · {t.member?.email || ""}
              {t.kind ? ` · ${KIND_LABEL[t.kind] || t.kind}` : ""}
            </p>
            <p className="text-sm mb-3" style={{ whiteSpace: "pre-wrap" }}>
              {t.message}
            </p>
            {t.imageData ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={t.imageData}
                alt="Ek görsel"
                style={{
                  maxWidth: "100%",
                  maxHeight: 280,
                  borderRadius: 12,
                  marginBottom: 12,
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              />
            ) : null}
            <textarea
              rows={3}
              placeholder="Yanıt"
              value={reply[t.id] ?? t.reply}
              onChange={(e) => setReply((s) => ({ ...s, [t.id]: e.target.value }))}
            />
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => save(t.id, "answered")}
              >
                Yanıtla
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => save(t.id, "closed")}
              >
                Kapat
              </button>
            </div>
          </article>
        ))}
        {tickets.length === 0 ? <p className="muted">Talep yok.</p> : null}
      </div>
    </div>
  );
}
