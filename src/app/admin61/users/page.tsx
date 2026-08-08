"use client";

import { useEffect, useState } from "react";

type Member = {
  id: string;
  username: string;
  email: string;
  balance: number;
  active: boolean;
  createdAt: string;
  _count: { orders: number };
};

export default function AdminUsersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [delta, setDelta] = useState<Record<string, string>>({});

  async function load() {
    const d = await fetch("/api/admin/members").then((r) => (r.ok ? r.json() : null));
    setMembers(d?.members || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function patch(id: string, body: Record<string, unknown>) {
    await fetch("/api/admin/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    load();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Kullanıcılar</h2>
          <p className="muted">Üye hesapları ve bakiye</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>Bakiye</th>
              <th>Sipariş</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>
                  <div>{m.username}</div>
                  <div className="muted text-xs">{m.email}</div>
                </td>
                <td>{m.balance.toFixed(2)} ₺</td>
                <td>{m._count.orders}</td>
                <td>{m.active ? "aktif" : "pasif"}</td>
                <td>
                  <div className="flex flex-wrap gap-2 items-center">
                    <input
                      style={{ width: 90 }}
                      placeholder="+/-"
                      value={delta[m.id] || ""}
                      onChange={(e) => setDelta((s) => ({ ...s, [m.id]: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() =>
                        patch(m.id, { balanceDelta: Number(delta[m.id] || 0), note: "Admin düzeltme" })
                      }
                    >
                      Bakiye
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => patch(m.id, { active: !m.active })}
                    >
                      {m.active ? "Pasifleştir" : "Aktifleştir"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
