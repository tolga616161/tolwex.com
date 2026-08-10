"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MemberGate } from "@/components/smm/MemberGate";
import { whatsappUrl } from "@/lib/contact";

type Bank = { name: string; iban: string; iban_formatted: string; holder: string };
type RequestRow = {
  id: string;
  amount: number;
  method: string;
  note: string;
  status: string;
  createdAt: string;
};

const STATUS_TR: Record<string, string> = {
  pending: "Beklemede",
  approved: "Onaylandı",
  rejected: "Reddedildi",
};

const METHOD_TR: Record<string, string> = {
  bank_transfer: "Havale",
  shopier: "Kart",
  whatsapp: "WhatsApp",
};

const PRESETS = [100, 250, 500, 1000, 2500];

export default function MemberBalancePage() {
  return (
    <MemberGate>
      {(api) => <BalanceInner api={api} />}
    </MemberGate>
  );
}

function BalanceInner({
  api,
}: {
  api: {
    me: { username: string; email: string; balance: number; phone?: string };
    refreshMe: () => Promise<void>;
    setBalance: (n: number) => void;
  };
}) {
  const router = useRouter();
  const { me, refreshMe, setBalance } = api;
  const [bank, setBank] = useState<Bank | null>(null);
  const [minDeposit, setMinDeposit] = useState(50);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [amount, setAmount] = useState("100");
  const [note, setNote] = useState("");
  const [senderName, setSenderName] = useState("");
  const [coupon, setCoupon] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [shopierBusy, setShopierBusy] = useState(false);
  const [couponBusy, setCouponBusy] = useState(false);
  const [shopierEnabled, setShopierEnabled] = useState(false);
  const [showBankHelp, setShowBankHelp] = useState(false);

  const loadRequests = useCallback(async () => {
    const res = await fetch("/api/member/balance", { credentials: "same-origin" });
    if (res.status === 401) {
      router.replace("/uye/giris");
      return;
    }
    const data = await res.json().catch(() => null);
    if (data?.requests) setRequests(data.requests);
    if (typeof data?.balance === "number") setBalance(data.balance);
  }, [router, setBalance]);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => {
        if (s?.bank?.iban) setBank(s.bank);
        if (s?.min_deposit) setMinDeposit(Number(s.min_deposit) || 50);
        setShopierEnabled(Boolean(s?.shopier_enabled));
      });
    loadRequests();
    const q = new URLSearchParams(window.location.search);
    const pay = q.get("pay") || q.get("shopier");
    if (pay === "ok") {
      setMsg("Ödeme alındı — bakiyeniz güncellendi.");
      refreshMe().catch(() => undefined);
      loadRequests();
      window.history.replaceState({}, "", "/uye/bakiye");
    } else if (pay === "fail") {
      setErr("Ödeme tamamlanamadı veya iptal edildi. Tekrar deneyebilirsiniz.");
      window.history.replaceState({}, "", "/uye/bakiye");
    } else if (pay === "return") {
      setMsg("Ödeme sayfasından döndünüz. Bakiye birkaç saniye içinde güncellenir.");
      refreshMe().catch(() => undefined);
      loadRequests();
      window.history.replaceState({}, "", "/uye/bakiye");
    }
  }, [loadRequests, refreshMe]);

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
    setBusy(true);
    try {
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
      if (res.status === 401) {
        router.replace("/uye/giris");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || "Ödeme bildirimi oluşturulamadı");
        return;
      }
      setMsg("Ödeme bildiriminiz alındı. Onaylanınca bakiyeniz yüklenir.");
      setNote("");
      setSenderName("");
      await loadRequests();
    } catch {
      setErr("Ağ hatası — tekrar deneyin");
    } finally {
      setBusy(false);
    }
  }

  async function payWithShopier(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const value = Number(String(amount).replace(",", "."));
    if (!Number.isFinite(value) || value < minDeposit) {
      setErr(`Minimum yükleme tutarı ${minDeposit} ₺`);
      return;
    }
    setShopierBusy(true);
    try {
      const res = await fetch("/api/member/shopier/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ amount: value }),
      });
      if (res.status === 401) {
        router.replace("/uye/giris");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || "Ödeme başlatılamadı");
        return;
      }
      const form = document.createElement("form");
      form.method = "POST";
      form.action = String(data.action);
      form.acceptCharset = "UTF-8";
      const fields = (data.fields || {}) as Record<string, string | number>;
      for (const [key, val] of Object.entries(fields)) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(val);
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch {
      setErr("Ağ hatası — tekrar deneyin");
      setShopierBusy(false);
    }
  }

  async function redeemCoupon(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setCouponBusy(true);
    try {
      const res = await fetch("/api/member/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ code: coupon }),
      });
      if (res.status === 401) {
        router.replace("/uye/giris");
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || "Kupon kullanılamadı");
        return;
      }
      setMsg(`Kupon uygulandı: +${Number(data.amount).toFixed(2)} ₺`);
      setCoupon("");
      if (typeof data.balance === "number") setBalance(data.balance);
      else await refreshMe();
    } catch {
      setErr("Ağ hatası — tekrar deneyin");
    } finally {
      setCouponBusy(false);
    }
  }

  const wa = whatsappUrl(
    `Merhaba, TOLWEX bakiye yükledim. Kullanıcı: ${me.username}, tutar: ${amount} ₺`
  );
  const pending = requests.filter((r) => r.status === "pending").length;
  const amountNum = Number(String(amount).replace(",", ".")) || 0;

  return (
    <div className="sp-page">
      <div className="sp-page-title">
        <h1>Bakiye Yükle</h1>
        <p>
          Güncel bakiye: <strong>{me.balance.toFixed(2)} ₺</strong>
          {pending ? ` · ${pending} işlem bekliyor` : ""}
        </p>
      </div>

      {msg ? <p className="sp-ok mb-3">{msg}</p> : null}
      {err ? <p className="sp-err mb-3">{err}</p> : null}

      <div className="pay-grid">
        <div className="pay-col">
          {shopierEnabled ? (
            <form onSubmit={payWithShopier} className="sp-card pay-card-primary sp-form mb-4">
              <div className="sp-card-head">
                <h2>Kart ile anında yükle</h2>
                <span className="pay-badge">Önerilen</span>
              </div>
              <p className="pay-lead">
                Visa / Mastercard ile güvenli ödeme. Tutar onaylanınca bakiyenize otomatik
                eklenir.
              </p>

              <div className="pay-presets" role="group" aria-label="Hızlı tutar">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`pay-chip ${amountNum === p ? "is-on" : ""}`}
                    onClick={() => setAmount(String(p))}
                  >
                    {p.toLocaleString("tr-TR")} ₺
                  </button>
                ))}
              </div>

              <label>
                <span>Yükleme tutarı (₺)</span>
                <input
                  type="number"
                  min={minDeposit}
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </label>
              <p className="muted text-xs">Minimum {minDeposit} ₺</p>

              <button type="submit" className="btn btn-primary pay-cta" disabled={shopierBusy}>
                {shopierBusy ? "Ödeme sayfasına gidiliyor…" : "Güvenli ödemeye geç"}
              </button>

              <ul className="pay-tips">
                <li>Açılan sayfada <strong>Hemen al</strong> → bilgileri doldur → ödemeyi tamamla.</li>
                <li>Sepete ekleyerek ödeme yapmayın — bakiye otomatik tanımlanmaz.</li>
                <li>İşlem bitince <strong>panele dön</strong> yazısına tıklayın.</li>
              </ul>
            </form>
          ) : (
            <div className="sp-card mb-4 pay-card-wait">
              <div className="sp-card-head">
                <h2>Kart ile ödeme</h2>
              </div>
              <p className="muted text-sm" style={{ padding: "0 1.1rem 1.1rem" }}>
                Kartlı ödeme yakında aktif. Şimdilik havale / EFT ile yükleyebilirsiniz.
              </p>
            </div>
          )}

          <div className="sp-card bank-card mb-4">
            <div className="sp-card-head">
              <h2>Havale / EFT</h2>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowBankHelp((v) => !v)}
              >
                {showBankHelp ? "Gizle" : "Detay"}
              </button>
            </div>
            {bank ? (
              <div className="bank-rows" style={{ padding: "0 1.1rem 1.1rem" }}>
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
                    {copied ? "Kopyalandı" : "IBAN kopyala"}
                  </button>
                </div>
                <p className="muted text-xs mt-3">
                  Açıklamaya <strong>{me.username}</strong> yazın · Min. {minDeposit} ₺
                </p>
              </div>
            ) : (
              <p className="muted p-4 text-sm">Banka bilgisi yükleniyor…</p>
            )}
          </div>

          {(showBankHelp || !shopierEnabled) && (
            <form onSubmit={submitRequest} className="sp-card sp-form mb-4">
              <div className="sp-card-head">
                <h2>Havale bildirimi</h2>
              </div>
              <p className="muted text-sm" style={{ marginTop: "-0.35rem" }}>
                Transferden sonra tutarı bildirin — onayda bakiye yüklenir.
              </p>
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
                  placeholder="Hesaptaki isim"
                />
              </label>
              <label>
                <span>Not / dekont (opsiyonel)</span>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
              </label>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="btn btn-primary" disabled={busy}>
                  {busy ? "Gönderiliyor…" : "Ödeme bildir"}
                </button>
                <a href={wa} className="btn btn-ghost" target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </div>
            </form>
          )}

          <form onSubmit={redeemCoupon} className="sp-card sp-form">
            <div className="sp-card-head">
              <h2>Kupon</h2>
            </div>
            <label>
              <span>Kupon kodu</span>
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Kupon kodunuz"
                required
              />
            </label>
            <button type="submit" className="btn btn-ghost" disabled={couponBusy}>
              {couponBusy ? "…" : "Kuponu kullan"}
            </button>
          </form>
        </div>

        <div className="pay-col">
          <div className="sp-card">
            <div className="sp-card-head">
              <h2>İşlemlerim</h2>
              <button type="button" className="btn btn-ghost" onClick={() => loadRequests()}>
                Yenile
              </button>
            </div>
            <div className="sp-table-wrap">
              <table className="sp-table">
                <thead>
                  <tr>
                    <th>Tutar</th>
                    <th>Durum</th>
                    <th>Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.amount.toFixed(2)} ₺</strong>
                        <div className="muted text-xs">{METHOD_TR[r.method] || r.method}</div>
                        {r.note ? (
                          <div className="muted text-xs" style={{ maxWidth: 200 }}>
                            {r.note}
                          </div>
                        ) : null}
                      </td>
                      <td>
                        <span className={`pay-status pay-${r.status}`}>
                          {STATUS_TR[r.status] || r.status}
                        </span>
                      </td>
                      <td className="muted text-xs">
                        {new Date(r.createdAt).toLocaleString("tr-TR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {requests.length === 0 ? (
                <p className="muted p-4 text-sm">Henüz işlem yok.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
