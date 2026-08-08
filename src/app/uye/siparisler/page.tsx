"use client";

import { useEffect, useState } from "react";
import { MemberPanelShell } from "@/components/smm/MemberPanelShell";

type Order = {
  id: string;
  serviceName: string;
  link: string;
  quantity: number;
  charge: number;
  status: string;
  providerOrderId: string | null;
  startCounter: number | null;
  remains: number | null;
  createdAt: string;
};

type Me = { username: string; email: string; balance: number };

export default function MemberOrdersPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/member/profile").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/member/orders").then((r) => (r.ok ? r.json() : null)),
    ]).then(([p, o]) => {
      if (p?.member) {
        setMe({
          username: p.member.username,
          email: p.member.email,
          balance: p.member.balance,
        });
      }
      setOrders(o?.orders || []);
    });
  }, []);

  if (!me) {
    return (
      <div className="sp-shell">
        <div className="sp-main muted">Yükleniyor…</div>
      </div>
    );
  }

  return (
    <MemberPanelShell username={me.username} email={me.email} balance={me.balance}>
      <div className="sp-page">
        <div className="sp-page-title">
          <h1>Siparişlerim</h1>
          <p>Order logs · durum tedarikçiden senkronlanır</p>
        </div>
        <div className="sp-card">
          <div className="sp-table-wrap">
            <table className="sp-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Servis</th>
                  <th>Adet</th>
                  <th>Start</th>
                  <th>Remains</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.providerOrderId || o.id.slice(0, 8)}</td>
                    <td>
                      <div>{o.serviceName}</div>
                      <div className="muted text-xs" style={{ maxWidth: 220 }}>
                        {o.link}
                      </div>
                    </td>
                    <td>{o.quantity}</td>
                    <td>{o.startCounter ?? "—"}</td>
                    <td>{o.remains ?? "—"}</td>
                    <td>{o.charge.toFixed(2)} ₺</td>
                    <td>
                      <span className="sp-badge">{o.status}</span>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleString("tr-TR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 ? (
              <p className="muted p-4 text-sm">Sipariş yok.</p>
            ) : null}
          </div>
        </div>
      </div>
    </MemberPanelShell>
  );
}
