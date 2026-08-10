"use client";

import { useEffect, useMemo, useState } from "react";

type Item = {
  id: string;
  amount: number;
  method: string;
  note: string;
  status: string;
  adminNote: string;
  createdAt: string;
  member: { username: string; email: string };
};

type Bank = { name: string; iban: string; iban_formatted: string; holder: string };

const STATUS_TR: Record<string, string> = {
  pending: "Beklemede",
  approved: "Onaylandı",
  rejected: "Reddedildi",
};

export default function AdminBalanceRequestsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [bank, setBank] = useState<Bank | null>(null);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ibanBonus, setIbanBonus] = useState(500);

  async function load() {
    const [d, s] = await Promise.all([
      fetch("/api/admin/balance-requests").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/settings/public").then((r) => (r.ok ? r.json() : null)),
    ]);
    setItems(d?.items || []);
    if (typeof d?.ibanApproveBonus === "number") setIbanBonus(d.ibanApproveBonus);
    if (s?.bank) setBank(s.bank);
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);

  const visible = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.status === "pending");
  }, [items, filter]);

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const pendingTotal = items
    .filter((i) => i.status === "pending")
    .reduce((s, i) => s + i.amount, 0);

  async function decide(id: string, status: "approved" | "rejected") {
    setBusy(id);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/admin/balance-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error || "İşlem başarısız");
        return;
      }
      setMsg(
        status === "approved"
          ? data.ibanBonus
            ? `Onaylandı — ${Number(data.totalCredited || 0).toFixed(2)}₺ yüklendi (yatırım + ${Number(data.ibanBonus).toFixed(0)}₺ hediye)`
            : "Ödeme onaylandı — bakiye yüklendi"
          : "Bildirim reddedildi"
      );
      await load();
    } catch {
      setErr("Ağ hatası");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Ödeme Bildirimleri</h2>
          <p className="muted">
            {pendingCount} bekleyen · {pendingTotal.toFixed(2)} ₺ — havale onayında tutar +{" "}
            {ibanBonus}₺ hediye otomatik yüklenir
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={`btn ${filter === "pending" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter("pending")}
          >
            Bekleyen ({pendingCount})
          </button>
          <button
            type="button"
            className={`btn ${filter === "all" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter("all")}
          >
            Tümü
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => load()}>
            Yenile
          </button>
        </div>
      </div>

      {msg ? <p className="mb-3 text-sm" style={{ color: "#6ee7a8" }}>{msg}</p> : null}
      {err ? <p className="mb-3 text-sm" style={{ color: "#f87171" }}>{err}</p> : null}

      {bank ? (
        <div className="admin-panel mb-4 bank-admin-strip">
          <div>
            <span className="muted text-xs">Banka hesabı (üyelerin gördüğü)</span>
            <strong>
              {bank.name} · {bank.holder}
            </strong>
          </div>
          <code>{bank.iban_formatted || bank.iban}</code>
        </div>
      ) : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Üye</th>
              <th>Tutar</th>
              <th>Yöntem</th>
              <th>Not</th>
              <th>Tarih</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="muted">
                  {filter === "pending" ? "Bekleyen ödeme bildirimi yok." : "Kayıt yok."}
                </td>
              </tr>
            ) : (
              visible.map((i) => (
                <tr key={i.id}>
                  <td>
                    <div>{i.member?.username || "—"}</div>
                    <div className="muted text-xs">{i.member?.email}</div>
                  </td>
                  <td>
                    <strong>{i.amount.toFixed(2)} ₺</strong>
                    {(i.method === "bank_transfer" ||
                      i.method === "whatsapp" ||
                      i.method === "havale") &&
                    i.status === "pending" ? (
                      <div className="muted text-xs">+{ibanBonus}₺ hediye</div>
                    ) : null}
                  </td>
                  <td>
                    {i.method === "bank_transfer"
                      ? "Havale/EFT"
                      : i.method === "shopier"
                        ? "Kart"
                        : i.method}
                  </td>
                  <td className="max-w-xs">{i.note || "—"}</td>
                  <td className="muted text-xs">
                    {new Date(i.createdAt).toLocaleString("tr-TR")}
                  </td>
                  <td>
                    <span className={`pay-status pay-${i.status}`}>
                      {STATUS_TR[i.status] || i.status}
                    </span>
                  </td>
                  <td>
                    {i.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={busy === i.id}
                          onClick={() => decide(i.id, "approved")}
                        >
                          {busy === i.id ? "…" : `Onayla (+${ibanBonus}₺)`}
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          disabled={busy === i.id}
                          onClick={() => decide(i.id, "rejected")}
                        >
                          Reddet
                        </button>
                      </div>
                    ) : (
                      <span className="muted text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
