"use client";

import { useEffect, useState } from "react";

export default function AdminNotificationsPage() {
  const [items, setItems] = useState<
    Array<{ id: string; title: string; body: string; level: string; read: boolean; createdAt: string }>
  >([]);

  async function load() {
    const res = await fetch("/api/admin/notifications");
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.notifications || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Bildirimler</h2>
          <p className="muted">Sistem bildirimleri</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={async () => {
            await fetch("/api/admin/notifications", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ markAllRead: true }),
            });
            await load();
          }}
        >
          Tümünü okundu say
        </button>
      </div>
      {items.length === 0 ? (
        <div className="admin-honest-empty">
          <h3>Bildirim yok</h3>
          <p>Meta test hataları ve önemli olaylar burada birikir.</p>
        </div>
      ) : (
        <ul className="admin-usage-list">
          {items.map((n) => (
            <li key={n.id}>
              <span>
                [{n.level}] {n.title} — {n.body}
              </span>
              <strong>{n.read ? "okundu" : "yeni"}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
