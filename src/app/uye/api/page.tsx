"use client";

import { FormEvent, useEffect, useState } from "react";
import { MemberPanelShell } from "@/components/smm/MemberPanelShell";

type Me = { username: string; email: string; balance: number };

export default function MemberApiPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/member/profile").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/member/api-key").then((r) => (r.ok ? r.json() : null)),
    ]).then(([p, k]) => {
      if (p?.member) {
        setMe({
          username: p.member.username,
          email: p.member.email,
          balance: p.member.balance,
        });
      }
      if (k?.apiKey) setApiKey(k.apiKey);
    });
  }, []);

  async function rotate(e: FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/member/api-key", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      setApiKey(data.apiKey);
      setMsg("Yeni API anahtarı oluşturuldu");
    }
  }

  if (!me) return <div className="sp-shell"><div className="sp-main muted">Yükleniyor…</div></div>;

  const base =
    typeof window !== "undefined" ? window.location.origin : "https://tolwex.com";

  return (
    <MemberPanelShell username={me.username} email={me.email} balance={me.balance}>
      <div className="sp-page">
        <div className="sp-page-title">
          <h1>API</h1>
          <p>PerfectPanel uyumlu v2 stil uç nokta</p>
        </div>

        <div className="sp-card mb-4">
          <div className="sp-card-head">
            <h2>API Key</h2>
          </div>
          <form className="sp-form" onSubmit={rotate}>
            <label>
              <span>Anahtarınız</span>
              <input value={apiKey} readOnly />
            </label>
            {msg ? <p className="sp-ok">{msg}</p> : null}
            <button type="submit" className="btn btn-ghost">
              Anahtarı yenile
            </button>
          </form>
        </div>

        <div className="sp-card">
          <div className="sp-card-head">
            <h2>Dokümantasyon</h2>
          </div>
          <div className="sp-docs">
            <p>
              Endpoint: <code>{base}/api/v1</code> · Method: <code>POST</code> ·
              Content-Type: <code>application/x-www-form-urlencoded</code> veya JSON
            </p>
            <h3>balance</h3>
            <pre>{`key=${apiKey || "YOUR_KEY"}&action=balance`}</pre>
            <h3>services</h3>
            <pre>{`key=...&action=services`}</pre>
            <h3>add</h3>
            <pre>{`key=...&action=add&service=SERVICE_ID&link=https://...&quantity=1000`}</pre>
            <h3>status</h3>
            <pre>{`key=...&action=status&order=ORDER_ID`}</pre>
            <p className="muted text-sm">
              Toplu durum: <code>orders=1,2,3</code>
            </p>
          </div>
        </div>
      </div>
    </MemberPanelShell>
  );
}
