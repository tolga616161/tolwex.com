"use client";

import { FormEvent, useEffect, useState } from "react";
import { MemberGate } from "@/components/smm/MemberGate";
import { whatsappUrl } from "@/lib/contact";

type Bank = { name: string; iban: string; iban_formatted: string; holder: string };

export default function MemberBalancePage() {
  const [bank, setBank] = useState<Bank | null>(null);
  const [minDeposit, setMinDeposit] = useState(50);
  const [amount, setAmount] = useState("100");
  const [note, setNote] = useState("");
  const [senderName, setSenderName] = useState("");
  const [coupon, setCoupon] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (s?.bank) setBank(s.bank);
        if (s?.min_deposit) setMinDeposit(Number(s.min_deposit) || 50);
      });
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

  return (
    <MemberGate>
      {(me) => {
        const bal = balance ?? me.balance;
        const wa = whatsappUrl(
          `Merhaba, TOLWEX bakiye yükledim. Kullanıcı: ${me.username}, tutar: ${amount} ₺, IBAN: ${bank?.iban || ""}`
        );

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
            credentials: "same-origin",
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
          setMsg("Ödeme bildiriminiz alındı. Onaylanınca bakiyeniz yüklenecek.");
          setNote("");
        }

        async function redeemCoupon(e: FormEvent) {
          e.preventDefault();
          setMsg(null);
          setErr(null);
          const res = await fetch("/api/member/coupon", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ code: coupon }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setErr(data.error || "Kupon kullanılamadı");
            return;
          }
          setMsg(`Kupon uygulandı: +${Number(data.amount).toFixed(2)} ₺`);
          setCoupon("");
          if (typeof data.balance === "number") setBalance(data.balance);
        }

        return (
          <div className="sp-page">
            <div className="sp-page-title">
              <h1>Bakiye Yükle</h1>
              <p>
                Güncel bakiye: <strong>{bal.toFixed(2)} ₺</strong>
              </p>
            </div>

            {msg ? <p className="sp-ok mb-3">{msg}</p> : null}
            {err ? <p className="sp-err mb-3">{err}</p> : null}

            {bank ? (
              <div className="bank-card sp-card mb-4">
                <div className="sp-card-head">
                  <h2>Ödeme hesabı</h2>
                </div>
                <div className="bank-rows" style={{ padding: "0 1rem 1rem" }}>
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
                  <p className="muted text-xs mt-3">
                    Açıklamaya kullanıcı adınızı ({me.username}) yazın. Min: {minDeposit} ₺
                  </p>
                </div>
              </div>
            ) : null}

            <form onSubmit={submitRequest} className="sp-card sp-form mb-4">
              <div className="sp-card-head">
                <h2>Ödeme bildirimi</h2>
              </div>
              <label>
                <span>Yatırılan tutar (₺)</span>
                <input
                  type="number"
                  min={minDeposit}
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </label>
              <label>
                <span>Gönderen adı</span>
                <input
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Tolga Mazlum"
                />
              </label>
              <label>
                <span>Not / dekont (opsiyonel)</span>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
              </label>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="btn btn-primary">
                  Ödeme Bildir
                </button>
                <a href={wa} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </div>
            </form>

            <form onSubmit={redeemCoupon} className="sp-card sp-form">
              <div className="sp-card-head">
                <h2>Kupon</h2>
              </div>
              <label>
                <span>Kupon kodu</span>
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="ORNEK50"
                  required
                />
              </label>
              <button type="submit" className="btn btn-ghost">
                Kuponu Kullan
              </button>
            </form>
          </div>
        );
      }}
    </MemberGate>
  );
}
