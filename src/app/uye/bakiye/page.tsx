"use client";

import { FormEvent, useEffect, useState } from "react";
import { MemberPanelShell } from "@/components/smm/MemberPanelShell";
import { whatsappUrl } from "@/lib/contact";

type Me = { username: string; email: string; balance: number };
type Bank = { name: string; iban: string; iban_formatted: string; holder: string };

export default function MemberBalancePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [bank, setBank] = useState<Bank | null>(null);
  const [minDeposit, setMinDeposit] = useState(50);
  const [amount, setAmount] = useState("100");
  const [note, setNote] = useState("");
  const [senderName, setSenderName] = useState("");
  const [coupon, setCoupon] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function load() {
    const [p, s] = await Promise.all([
      fetch("/api/member/profile").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/settings/public").then((r) => (r.ok ? r.json() : null)),
    ]);
    if (p?.member) {
      setMe({
        username: p.member.username,
        email: p.member.email,
        balance: p.member.balance,
      });
    }
    if (s?.bank) setBank(s.bank);
    if (s?.min_deposit) setMinDeposit(Number(s.min_deposit) || 50);
  }

  useEffect(() => {
    load();
  }, []);

  async function copyIban() {
    if (!bank?.iban) return;
    try {
      await navigator.clipboard.writeText(bank.iban.replace(/\s+/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setErr("IBAN kopyalanamadı");
    }
  }

  async function submitRequest(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const value = Number(amount);
    if (!Number.isFinite(value) || value < minDeposit) {
      setErr(`Minimum yükleme tutarı ${minDeposit} ₺`);
      return;
    }
    const noteParts = [
      senderName.trim() ? `Gönderen: ${senderName.trim()}` : "",
      note.trim(),
    ].filter(Boolean);
    const res = await fetch("/api/member/balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: value,
        note: noteParts.join(" · "),
        method: "bank_transfer",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data.error || "Ödeme bildirimi oluşturulamadı");
      return;
    }
    setMsg("Ödeme bildiriminiz alındı. Havale kontrol edilince bakiyeniz tanımlanacak.");
    setNote("");
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
    `Merhaba, TOLWEX bakiye yükledim. Kullanıcı: ${me.username}, tutar: ${amount} ₺, IBAN: ${bank?.iban || ""}`
  );

  return (
    <MemberPanelShell username={me.username} email={me.email} balance={me.balance}>
      <div className="member-page">
        <div className="section-head mb-6">
          <p className="section-kicker">Bakiye Yükle</p>
          <h1 className="section-title">{me.balance.toFixed(2)} ₺</h1>
          <p className="section-sub">
            Banka hesabına havale/EFT yapın, ardından ödeme bildirimi gönderin.
          </p>
        </div>

        {msg ? <p className="text-sm mb-3" style={{ color: "#6ee7a8" }}>{msg}</p> : null}
        {err ? <p className="text-sm mb-3" style={{ color: "#f87171" }}>{err}</p> : null}

        {bank ? (
          <div className="bank-card glass-panel rounded-2xl p-5 mb-6">
            <p className="section-kicker mb-2">Ödeme hesabı</p>
            <div className="bank-rows">
              <div>
                <span className="muted text-xs">Banka</span>
                <strong>{bank.name}</strong>
              </div>
              <div>
                <span className="muted text-xs">Alıcı</span>
                <strong>{bank.holder}</strong>
              </div>
              <div className="bank-iban-row">
                <span className="muted text-xs">IBAN</span>
                <strong className="bank-iban">{bank.iban_formatted || bank.iban}</strong>
                <button type="button" className="btn btn-ghost" onClick={copyIban}>
                  {copied ? "Kopyalandı" : "IBAN Kopyala"}
                </button>
              </div>
            </div>
            <p className="muted text-xs mt-3">
              Açıklamaya kullanıcı adınızı ({me.username}) yazın. Min. tutar: {minDeposit} ₺
            </p>
          </div>
        ) : null}

        <form onSubmit={submitRequest} className="glass-panel rounded-2xl p-5 grid gap-3 mb-6">
          <h2 className="text-lg font-semibold">Ödeme bildirimi</h2>
          <p className="muted text-sm">
            Havale/EFT yaptıktan sonra tutarı bildirin — admin onaylayınca bakiye yüklenir.
          </p>
          <label className="muted text-xs">Yatırılan tutar (₺)</label>
          <input
            type="number"
            min={minDeposit}
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <label className="muted text-xs">Gönderen adı (hesaptaki isim)</label>
          <input
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="Tolga Mazlum"
          />
          <label className="muted text-xs">Not / dekont no (opsiyonel)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="btn btn-primary">
              Ödeme Bildir
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
