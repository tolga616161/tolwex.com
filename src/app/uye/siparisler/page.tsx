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
    return <div className="site-shell py-16 muted">Yükleniyor…</div>;
  }

  return (
    <MemberPanelShell username={me.username} email={me.email} balance={me.balance}>
      <div className="member-page">
        <div className="section-head mb-6">
          <p className="section-kicker">Siparişlerim</p>
          <h1 className="section-title">Sipariş geçmişi</h1>
        </div>
        <div className="admin-table-wrap glass-panel rounded-2xl overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Servis</th>
                <th>Adet</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <div>{o.serviceName}</div>
                    <div className="muted text-xs truncate max-w-xs">{o.link}</div>
                  </td>
                  <td>{o.quantity}</td>
                  <td>{o.charge.toFixed(2)} ₺</td>
                  <td>{o.status}</td>
                  <td>{new Date(o.createdAt).toLocaleString("tr-TR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 ? <p className="muted p-4 text-sm">Sipariş yok.</p> : null}
        </div>
      </div>
    </MemberPanelShell>
  );
}
