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
  startCounter: number | null;
  remains: number | null;
  createdAt: string;
  member: { username: string; email: string };
};

const STATUS_TR: Record<string, string> = {
  pending: "Bekliyor",
  awaiting: "Onay bekliyor",
  processing: "İşleniyor",
  inprogress: "İşleniyor",
  "in progress": "İşleniyor",
  completed: "Tamamlandı",
  partial: "Kısmi",
  canceled: "İptal",
  cancelled: "İptal",
  refunded: "İade",
  error: "Hata",
};

function statusKey(s: string) {
  return s.toLowerCase().replace(/\s+/g, "");
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "error" | "processing" | "done">(
    "all"
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const d = await fetch("/api/admin/orders").then((r) => (r.ok ? r.json() : null));
    setOrders(d?.orders || []);
  }

  useEffect(() => {
    load();
    const t = setInterval(() => {
      load().catch(() => undefined);
    }, 45000);
    return () => clearInterval(t);
  }, []);

  const visible = useMemo(() => {
    if (filter === "all") return orders;
    if (filter === "pending") {
      return orders.filter((o) => {
        const s = statusKey(o.status);
        return s === "pending" || s === "awaiting" || (!o.providerOrderId && s !== "refunded");
      });
    }
    if (filter === "error") return orders.filter((o) => statusKey(o.status) === "error");
    if (filter === "done") {
      return orders.filter((o) => {
        const s = statusKey(o.status);
        return s === "completed" || s === "partial" || s === "refunded" || s === "canceled" || s === "cancelled";
      });
    }
    return orders.filter((o) => {
      const s = statusKey(o.status);
      return s === "processing" || s === "inprogress" || s === "inprogress";
    });
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
        ? "Sipariş API’ye gönderildi — karşı taraf işliyor"
        : action === "sync"
          ? "Durum API’den güncellendi"
          : action === "sync_all"
            ? `API senkron: ${data.updated || 0}/${data.checked || 0} güncellendi`
            : "Kaydedildi"
    );
    load();
  }

  async function syncAll() {
    setBusy("sync_all");
    setMsg(null);
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync_all" }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setMsg(data.error || "Senkron başarısız");
      return;
    }
    setMsg(`API’den çekildi · ${data.updated || 0} sipariş güncellendi (${data.checked || 0} kontrol)`);
    load();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Sipariş Onay / Takip</h2>
          <p className="muted">
            Üye siparişleri burada listelenir. Gönderim sistem API’sine gider; durumları
            buradan senkronlayın.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary"
            disabled={busy === "sync_all"}
            onClick={() => syncAll()}
          >
            {busy === "sync_all" ? "Çekiliyor…" : "API’den durum çek"}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => load()}>
            Yenile
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(
          [
            ["all", "Tümü"],
            ["pending", "Bekleyen / Onay"],
            ["processing", "İşlenen"],
            ["error", "Hatalı"],
            ["done", "Biten"],
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

      {msg ? <p className="mb-3 text-sm sp-ok">{msg}</p> : null}

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
            {visible.map((o) => {
              const sk = statusKey(o.status);
              return (
                <tr key={o.id}>
                  <td>
                    <div>{o.member?.username || "—"}</div>
                    <div className="muted text-xs">{o.member?.email}</div>
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
                  <td>
                    {o.quantity.toLocaleString("tr-TR")}
                    {o.remains != null ? (
                      <div className="muted text-xs">kalan {o.remains}</div>
                    ) : null}
                  </td>
                  <td>
                    {o.charge.toFixed(2)} ₺
                    <div className="muted text-xs">maliyet {o.cost.toFixed(2)}</div>
                  </td>
                  <td>
                    <span className={`pay-status pay-${sk}`}>
                      {STATUS_TR[o.status] || STATUS_TR[sk] || o.status}
                    </span>
                    {o.providerOrderId ? (
                      <div className="muted text-xs">API #{o.providerOrderId}</div>
                    ) : (
                      <div className="muted text-xs">API’ye gitmedi</div>
                    )}
                  </td>
                  <td className="muted text-xs">
                    {new Date(o.createdAt).toLocaleString("tr-TR")}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      {(sk === "error" || sk === "pending" || sk === "awaiting") &&
                      !o.providerOrderId ? (
                        <button
                          type="button"
                          className="btn btn-primary"
                          disabled={busy === o.id + "approve_retry"}
                          onClick={() => act(o.id, "approve_retry")}
                        >
                          Onayla / API’ye gönder
                        </button>
                      ) : null}
                      {o.providerOrderId ? (
                        <button
                          type="button"
                          className="btn btn-ghost"
                          disabled={busy === o.id + "sync"}
                          onClick={() => act(o.id, "sync")}
                        >
                          Durum çek
                        </button>
                      ) : null}
                      {sk !== "refunded" && sk !== "completed" ? (
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
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visible.length === 0 ? (
          <p className="muted p-4 text-sm">Bu filtrede sipariş yok.</p>
        ) : null}
      </div>
    </div>
  );
}
