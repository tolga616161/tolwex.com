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

export default function AdminBalanceRequestsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [bank, setBank] = useState<Bank | null>(null);
  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const [d, s] = await Promise.all([
      fetch("/api/admin/balance-requests").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/settings/public").then((r) => (r.ok ? r.json() : null)),
    ]);
    setItems(d?.items || []);
    if (s?.bank) setBank(s.bank);
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.status === "pending");
  }, [items, filter]);

  const pendingCount = items.filter((i) => i.status === "pending").length;

  async function decide(id: string, status: "approved" | "rejected") {
    setBusy(id + status);
    await fetch("/api/admin/balance-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setBusy(null);
    load();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Ödeme Bildirimleri</h2>
          <p className="muted">
            Havale/EFT bildirimlerini onayla — bakiyeyi otomatik yükler ({pendingCount} bekleyen)
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={`btn ${filter === "pending" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter("pending")}
          >
            Bekleyen
          </button>
          <button
            type="button"
            className={`btn ${filter === "all" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter("all")}
          >
            Tümü
          </button>
        </div>
      </div>

      {bank ? (
        <div className="admin-panel mb-4 bank-admin-strip">
          <div>
            <span className="muted text-xs">Banka hesabı</span>
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
              <th></th>
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
                    <div>{i.member.username}</div>
                    <div className="muted text-xs">{i.member.email}</div>
                  </td>
                  <td>
                    <strong>{i.amount.toFixed(2)} ₺</strong>
                  </td>
                  <td>{i.method === "bank_transfer" ? "Havale/EFT" : i.method}</td>
                  <td className="max-w-xs">{i.note || "—"}</td>
                  <td className="muted text-xs">
                    {new Date(i.createdAt).toLocaleString("tr-TR")}
                  </td>
                  <td>
                    <span className={`pay-status pay-${i.status}`}>{i.status}</span>
                  </td>
                  <td>
                    {i.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={busy === i.id + "approved"}
                          onClick={() => decide(i.id, "approved")}
                        >
                          Onayla
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          disabled={busy === i.id + "rejected"}
                          onClick={() => decide(i.id, "rejected")}
                        >
                          Reddet
                        </button>
                      </div>
                    ) : null}
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
