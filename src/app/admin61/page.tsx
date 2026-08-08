"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/admin/saas/AdminWidgets";

type Stats = {
  members: number;
  orders: number;
  services: number;
  pendingBalance: number;
  openTickets: number;
  revenue: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats);
  }, []);

  if (!stats) {
    return <p className="muted">Dashboard yükleniyor…</p>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">SMM panel özeti</p>
        </div>
        <Link href="/admin61/api" className="btn btn-primary">
          API Ayarları
        </Link>
      </div>

      <div className="admin-stat-grid">
        <StatCard label="KULLANICILAR" value={stats.members} />
        <StatCard label="SİPARİŞLER" value={stats.orders} />
        <StatCard label="AKTİF SERVİS" value={stats.services} tone="ok" />
        <StatCard label="BAKİYE TALEBİ" value={stats.pendingBalance} tone="warn" />
        <StatCard label="AÇIK DESTEK" value={stats.openTickets} />
        <StatCard label="CİRO (₺)" value={stats.revenue.toFixed(2)} />
      </div>

      <div className="admin-two-col mt-6">
        <div className="admin-panel">
          <h3>Hızlı işlemler</h3>
          <ul className="admin-usage-list">
            <li>
              <span>Servis senkron</span>
              <Link href="/admin61/api">Aç</Link>
            </li>
            <li>
              <span>Bakiye talepleri</span>
              <Link href="/admin61/balance-requests">Aç</Link>
            </li>
            <li>
              <span>Siparişler</span>
              <Link href="/admin61/orders">Aç</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
