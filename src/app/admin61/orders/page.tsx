"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  serviceName: string;
  link: string;
  quantity: number;
  charge: number;
  cost: number;
  status: string;
  providerOrderId: string | null;
  createdAt: string;
  member: { username: string; email: string };
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setOrders(d?.orders || []));
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Siparişler</h2>
          <p className="muted">Son 300 sipariş</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Üye</th>
              <th>Servis</th>
              <th>Adet</th>
              <th>Satış</th>
              <th>Maliyet</th>
              <th>Durum</th>
              <th>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <div>{o.member.username}</div>
                  <div className="muted text-xs">{o.member.email}</div>
                </td>
                <td>
                  <div>{o.serviceName}</div>
                  <div className="muted text-xs truncate max-w-xs">{o.link}</div>
                </td>
                <td>{o.quantity}</td>
                <td>{o.charge.toFixed(2)}</td>
                <td>{o.cost.toFixed(2)}</td>
                <td>
                  {o.status}
                  {o.providerOrderId ? (
                    <div className="muted text-xs">#{o.providerOrderId}</div>
                  ) : null}
                </td>
                <td>{new Date(o.createdAt).toLocaleString("tr-TR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
