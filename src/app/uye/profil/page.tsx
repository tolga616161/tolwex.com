"use client";

import { FormEvent, useEffect, useState } from "react";
import { MemberPanelShell } from "@/components/smm/MemberPanelShell";

type Me = {
  username: string;
  email: string;
  name: string;
  phone: string;
  balance: number;
};

export default function MemberProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/member/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((p) => {
        if (!p?.member) return;
        setMe(p.member);
        setName(p.member.name || "");
        setPhone(p.member.phone || "");
      });
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const body: Record<string, string> = { name, phone };
    if (newPassword) {
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }
    const res = await fetch("/api/member/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data.error || "Kaydedilemedi");
      return;
    }
    setMsg("Profil güncellendi");
    setCurrentPassword("");
    setNewPassword("");
    if (data.member) setMe({ ...data.member });
  }

  if (!me) return <div className="site-shell py-16 muted">Yükleniyor…</div>;

  return (
    <MemberPanelShell username={me.username} email={me.email} balance={me.balance}>
      <div className="member-page">
        <div className="section-head mb-6">
          <p className="section-kicker">Profil</p>
          <h1 className="section-title">{me.username}</h1>
          <p className="section-sub">{me.email}</p>
        </div>

        <form onSubmit={save} className="glass-panel rounded-2xl p-5 grid gap-3 max-w-lg">
          <label className="muted text-xs">Ad Soyad</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <label className="muted text-xs">Telefon</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          <label className="muted text-xs">Mevcut şifre (şifre değişimi için)</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <label className="muted text-xs">Yeni şifre</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {msg ? <p style={{ color: "#6ee7a8" }}>{msg}</p> : null}
          {err ? <p style={{ color: "#f87171" }}>{err}</p> : null}
          <button type="submit" className="btn btn-primary">
            Kaydet
          </button>
        </form>
      </div>
    </MemberPanelShell>
  );
}
