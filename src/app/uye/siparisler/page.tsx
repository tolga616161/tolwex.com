"use client";

import { useEffect, useState } from "react";
import { MemberGate } from "@/components/smm/MemberGate";

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

export default function MemberOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetch("/api/member/orders", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((o) => setOrders(o?.orders || []));
  }, []);

  return (
    <MemberGate>
      {(_) => (
        <div className="sp-page">
          <div className="sp-page-title">
            <h1>Siparişlerim</h1>
            <p>Sipariş geçmişi ve durum</p>
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
                        <span className={`sp-badge status-${o.status}`}>{o.status}</span>
                      </td>
                      <td className="muted text-xs">
                        {new Date(o.createdAt).toLocaleString("tr-TR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 ? (
                <p className="muted p-4 text-sm">Henüz sipariş yok.</p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </MemberGate>
  );
}
