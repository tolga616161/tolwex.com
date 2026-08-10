"use client";

import { useEffect, useMemo, useState } from "react";

type Member = {
  id: string;
  username: string;
  email: string;
  name: string;
  phone: string;
  phoneDisplay: string;
  registerIp: string;
  balance: number;
  spent: number;
  active: boolean;
  gotIbanBonus: boolean;
  welcomeBonusAt: string | null;
  createdAt: string;
  _count: { orders: number; balanceRequests: number };
};

export default function AdminUsersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [delta, setDelta] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const d = await fetch("/api/admin/members").then((r) => (r.ok ? r.json() : null));
      if (!d?.ok && d?.error) setErr(d.error);
      setMembers(d?.members || []);
    } catch {
      setErr("Üyeler yüklenemedi");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return members;
    return members.filter(
      (m) =>
        m.username.toLowerCase().includes(s) ||
        m.email.toLowerCase().includes(s) ||
        (m.phone || "").includes(s) ||
        (m.registerIp || "").includes(s) ||
        (m.name || "").toLowerCase().includes(s)
    );
  }, [members, q]);

  async function patch(id: string, body: Record<string, unknown>) {
    const res = await fetch("/api/admin/members", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setErr(data.error || "İşlem başarısız");
      return;
    }
    await load();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Kullanıcılar</h2>
          <p className="muted">
            {members.length} üye · e-posta, telefon, IP ve IBAN hediye durumu
          </p>
        </div>
        <div className="admin-btn-row" style={{ marginTop: 0 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ara: kullanıcı, mail, tel, IP…"
            style={{ minWidth: 220 }}
          />
          <button type="button" className="btn btn-ghost" onClick={() => void load()} disabled={loading}>
            {loading ? "…" : "Yenile"}
          </button>
        </div>
      </div>

      {err ? <p className="admin-banner mb-3">{err}</p> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Kullanıcı</th>
              <th>E-posta</th>
              <th>Telefon</th>
              <th>IP</th>
              <th>Bakiye</th>
              <th>Sipariş</th>
              <th>Hediye</th>
              <th>Kayıt</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="muted">
                  {loading ? "Yükleniyor…" : "Üye yok / eşleşme yok."}
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div>{m.username}</div>
                    {m.name ? <div className="muted text-xs">{m.name}</div> : null}
                  </td>
                  <td className="text-xs" style={{ wordBreak: "break-all" }}>
                    {m.email}
                  </td>
                  <td className="text-xs">{m.phoneDisplay || m.phone || "—"}</td>
                  <td className="text-xs">{m.registerIp || "—"}</td>
                  <td>
                    <strong>{m.balance.toFixed(2)} ₺</strong>
                  </td>
                  <td>{m._count.orders}</td>
                  <td className="text-xs">
                    {m.gotIbanBonus ? (
                      <span style={{ color: "#6ee7a8" }}>IBAN +500 alındı</span>
                    ) : (
                      <span className="muted">henüz yok</span>
                    )}
                  </td>
                  <td className="muted text-xs">
                    {new Date(m.createdAt).toLocaleString("tr-TR")}
                  </td>
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
                          void patch(m.id, {
                            balanceDelta: Number(delta[m.id] || 0),
                            note: "Admin düzeltme",
                          })
                        }
                      >
                        Bakiye
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => void patch(m.id, { active: !m.active })}
                      >
                        {m.active ? "Pasifleştir" : "Aktifleştir"}
                      </button>
                    </div>
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
