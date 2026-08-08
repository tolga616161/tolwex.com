"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  amount: number;
  method: string;
  note: string;
  status: string;
  createdAt: string;
  member: { username: string; email: string };
};

export default function AdminBalanceRequestsPage() {
  const [items, setItems] = useState<Item[]>([]);

  async function load() {
    const d = await fetch("/api/admin/balance-requests").then((r) =>
      r.ok ? r.json() : null
    );
    setItems(d?.items || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(id: string, status: "approved" | "rejected") {
    await fetch("/api/admin/balance-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Bakiye Talepleri</h2>
          <p className="muted">Onay / red</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Üye</th>
              <th>Tutar</th>
              <th>Yöntem</th>
              <th>Not</th>
              <th>Durum</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>
                  <div>{i.member.username}</div>
                  <div className="muted text-xs">{i.member.email}</div>
                </td>
                <td>{i.amount.toFixed(2)} ₺</td>
                <td>{i.method}</td>
                <td>{i.note}</td>
                <td>{i.status}</td>
                <td>
                  {i.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => decide(i.id, "approved")}
                      >
                        Onayla
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => decide(i.id, "rejected")}
                      >
                        Reddet
                      </button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
