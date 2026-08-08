"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type UserRow = {
  id: string;
  igUsername: string | null;
  platform: string;
  active: boolean;
  connected: boolean;
  disconnected: boolean;
  tokenStatus: string;
  lastSeen: string;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [users, setUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    const sp = new URLSearchParams({ q, filter, limit: "100" });
    fetch(`/api/admin/users?${sp}`)
      .then((r) => (r.ok ? r.json() : { users: [] }))
      .then((d) => setUsers(d.users || []));
  }, [q, filter]);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Kullanıcılar</h2>
          <p className="muted">Visitor session + Instagram bağlantıları. Token gösterilmez.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          placeholder="@kullanıcı / ID / platform"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Tümü</option>
          <option value="active">Aktif</option>
          <option value="passive">Pasif</option>
          <option value="connected">Bağlı</option>
          <option value="disconnected">Bağlantısı kesilmiş</option>
        </select>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Kullanıcı</th>
              <th>Platform</th>
              <th>Durum</th>
              <th>Son görülme</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="muted">
                  Kayıt yok veya filtre sonucu boş.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <code>{u.id.slice(0, 10)}…</code>
                  </td>
                  <td>{u.igUsername ? `@${u.igUsername}` : "—"}</td>
                  <td>{u.platform}</td>
                  <td>
                    {u.connected ? "Bağlı" : u.disconnected ? "Kesilmiş" : "Pasif"}
                    {u.active ? " · aktif" : ""}
                  </td>
                  <td>{new Date(u.lastSeen).toLocaleString("tr-TR")}</td>
                  <td>
                    <Link href={`/admin61/users/${u.id}`} className="btn btn-ghost btn-sm">
                      Detay
                    </Link>
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
