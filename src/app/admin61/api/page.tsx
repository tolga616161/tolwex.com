"use client";

import { useEffect, useState } from "react";
import { StatusPill } from "@/components/admin/saas/AdminWidgets";
import Link from "next/link";

export default function AdminApiPage() {
  const [status, setStatus] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/meta/config")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStatus);
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>API Yönetimi</h2>
          <p className="muted">Meta Graph API sağlık ve uç noktalar</p>
        </div>
        <Link href="/admin61/meta" className="btn btn-primary">
          Meta ayarları
        </Link>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat">
          <p className="admin-stat-label">Durum</p>
          <StatusPill status={String(status?.connectionStatus || "NOT CONNECTED")} />
        </div>
        <div className="admin-stat">
          <p className="admin-stat-label">API Version</p>
          <p className="admin-stat-value text-base">{String(status?.apiVersion || "—")}</p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat-label">Kaynak</p>
          <p className="admin-stat-value text-base">{String(status?.source || "—")}</p>
        </div>
      </div>

      <div className="admin-panel">
        <h3>Uç noktalar</h3>
        <ul className="admin-usage-list">
          <li>
            <span>OAuth Start</span>
            <code>/api/meta/oauth/start</code>
          </li>
          <li>
            <span>OAuth Callback</span>
            <code>/api/meta/oauth/callback</code>
          </li>
          <li>
            <span>Webhook</span>
            <code>/api/meta/webhook</code>
          </li>
          <li>
            <span>Status</span>
            <code>/api/meta/status</code>
          </li>
          <li>
            <span>Dashboard</span>
            <code>/api/meta/dashboard</code>
          </li>
        </ul>
        {status?.lastApiError ? (
          <p className="admin-error mt-4">Son hata: {String(status.lastApiError)}</p>
        ) : null}
      </div>
    </div>
  );
}
