"use client";

import { FormEvent, useEffect, useState } from "react";
import { MemberPanelShell } from "@/components/smm/MemberPanelShell";
import { whatsappUrl } from "@/lib/contact";

type Me = { username: string; email: string; balance: number };

export default function MemberBalancePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [amount, setAmount] = useState("100");
  const [note, setNote] = useState("");
  const [coupon, setCoupon] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    const p = await fetch("/api/member/profile").then((r) => (r.ok ? r.json() : null));
    if (p?.member) {
      setMe({
        username: p.member.username,
        email: p.member.email,
        balance: p.member.balance,
      });
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submitRequest(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const res = await fetch("/api/member/balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), note, method: "whatsapp" }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data.error || "Talep oluşturulamadı");
      return;
    }
    setMsg("Bakiye talebi alındı. WhatsApp üzerinden de bilgilendirebilirsiniz.");
  }

  async function redeemCoupon(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const res = await fetch("/api/member/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: coupon }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data.error || "Kupon kullanılamadı");
      return;
    }
    setMsg(`Kupon uygulandı: +${Number(data.amount).toFixed(2)} ₺`);
    setCoupon("");
    load();
  }

  if (!me) return <div className="site-shell py-16 muted">Yükleniyor…</div>;

  const wa = whatsappUrl(
    `Merhaba, TOLWEX bakiye yüklemek istiyorum. Kullanıcı: ${me.username}, tutar: ${amount} ₺`
  );

  return (
    <MemberPanelShell username={me.username} email={me.email} balance={me.balance}>
      <div className="member-page">
        <div className="section-head mb-6">
          <p className="section-kicker">Bakiye Yükle</p>
          <h1 className="section-title">{me.balance.toFixed(2)} ₺</h1>
          <p className="section-sub">Talep oluşturun veya kupon kullanın.</p>
        </div>

        {msg ? <p className="text-sm mb-3" style={{ color: "#6ee7a8" }}>{msg}</p> : null}
        {err ? <p className="text-sm mb-3" style={{ color: "#f87171" }}>{err}</p> : null}

        <form onSubmit={submitRequest} className="glass-panel rounded-2xl p-5 grid gap-3 mb-6">
          <label className="muted text-xs">Tutar (₺)</label>
          <input
            type="number"
            min={1}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <label className="muted text-xs">Not (opsiyonel)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn btn-primary">
              Talep Oluştur
            </button>
            <a href={wa} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
              WhatsApp ile yaz
            </a>
          </div>
        </form>

        <form onSubmit={redeemCoupon} className="glass-panel rounded-2xl p-5 grid gap-3">
          <label className="muted text-xs">Kupon kodu</label>
          <input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="ORNEK50"
            required
          />
          <button type="submit" className="btn btn-ghost">
            Kuponu Kullan
          </button>
        </form>
      </div>
    </MemberPanelShell>
  );
}
