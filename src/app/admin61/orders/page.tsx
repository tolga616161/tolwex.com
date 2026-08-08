"use client";

import { useEffect, useMemo, useState } from "react";

type Order = {
  id: string;
  serviceName: string;
  link: string;
  quantity: number;
  charge: number;
  cost: number;
  status: string;
  providerOrderId: string | null;
  errorMessage: string | null;
  createdAt: string;
  member: { username: string; email: string };
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "error" | "processing">("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const d = await fetch("/api/admin/orders").then((r) => (r.ok ? r.json() : null));
    setOrders(d?.orders || []);
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "pending") {
      return orders.filter((o) => o.status === "pending" || o.status === "awaiting");
    }
    if (filter === "error") return orders.filter((o) => o.status === "error");
    return orders.filter(
      (o) =>
        o.status === "processing" ||
        o.status === "inprogress" ||
        o.status === "in progress"
    );
  }, [orders, filter]);

  async function act(id: string, action: string, status?: string) {
    setBusy(id + action);
    setMsg(null);
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action, status }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setMsg(data.error || "İşlem başarısız");
      return;
    }
    setMsg(
      action === "approve_retry"
        ? "Sipariş provider'a gönderildi"
        : action === "sync"
          ? "Durum güncellendi"
          : "Kaydedildi"
    );
    load();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Sipariş Onaylama</h2>
          <p className="muted">
            Hatalı/bekleyen siparişleri yeniden gönderin, durum senkronlayın veya iade edin
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Tümü"],
              ["pending", "Bekleyen"],
              ["error", "Hatalı"],
              ["processing", "İşlenen"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`btn ${filter === key ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {msg ? <p className="mb-3 text-sm">{msg}</p> : null}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Üye</th>
              <th>Servis</th>
              <th>Adet</th>
              <th>Satış</th>
              <th>Durum</th>
              <th>Tarih</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => (
              <tr key={o.id}>
                <td>
                  <div>{o.member.username}</div>
                  <div className="muted text-xs">{o.member.email}</div>
                </td>
                <td>
                  <div>{o.serviceName}</div>
                  <div className="muted text-xs truncate max-w-xs">{o.link}</div>
                  {o.errorMessage ? (
                    <div className="text-xs" style={{ color: "#f87171" }}>
                      {o.errorMessage}
                    </div>
                  ) : null}
                </td>
                <td>{o.quantity}</td>
                <td>{o.charge.toFixed(2)} ₺</td>
                <td>
                  <span className={`pay-status pay-${o.status.replace(/\s+/g, "")}`}>
                    {o.status}
                  </span>
                  {o.providerOrderId ? (
                    <div className="muted text-xs">#{o.providerOrderId}</div>
                  ) : null}
                </td>
                <td className="muted text-xs">
                  {new Date(o.createdAt).toLocaleString("tr-TR")}
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    {(o.status === "error" || o.status === "pending") && !o.providerOrderId ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={busy === o.id + "approve_retry"}
                        onClick={() => act(o.id, "approve_retry")}
                      >
                        Onayla / Gönder
                      </button>
                    ) : null}
                    {o.providerOrderId ? (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={busy === o.id + "sync"}
                        onClick={() => act(o.id, "sync")}
                      >
                        Senkron
                      </button>
                    ) : null}
                    {o.status !== "refunded" && o.status !== "completed" ? (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={busy === o.id + "refund"}
                        onClick={() => {
                          if (confirm("Bakiyeyi iade et ve siparişi refunded yap?")) {
                            act(o.id, "refund");
                          }
                        }}
                      >
                        İade
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="btn btn-ghost"
                      disabled={busy === o.id + "set_status"}
                      onClick={() => act(o.id, "set_status", "completed")}
                    >
                      Tamamlandı
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
