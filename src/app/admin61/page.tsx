"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ActivityTimeline,
  MiniChart,
  StatCard,
  StatusPill,
} from "@/components/admin/saas/AdminWidgets";

type Stats = {
  cards: {
    totalUsers: number;
    activeUsers: number;
    igConnected: number;
    totalAnalyses: number;
    todayAnalyses: number;
    apiStatus: string;
    productsActive: number;
    leadsNew: number;
  };
  charts: {
    userGrowth: Array<{ date: string; value: number }>;
    dailyAnalyses: Array<{ date: string; value: number }>;
    igConnections: Array<{ date: string; value: number }>;
    activeUsers: Array<{ date: string; value: number }>;
    serviceUsage: Array<{ type: string; count: number }>;
  };
  activity: Array<{ id: string; label: string; createdAt: string; action: string }>;
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

  const c = stats.cards;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">Gerçek veritabanı metrikleri — uydurma sayı yok.</p>
        </div>
        <Link href="/admin61/meta" className="btn btn-primary">
          Meta Developer
        </Link>
      </div>

      <div className="admin-stat-grid">
        <StatCard label="TOPLAM KULLANICI" value={c.totalUsers} />
        <StatCard label="AKTİF KULLANICI" value={c.activeUsers} hint="Son 7 gün" />
        <StatCard label="INSTAGRAM BAĞLANTILARI" value={c.igConnected} tone="ok" />
        <StatCard label="TOPLAM ANALİZ" value={c.totalAnalyses} />
        <StatCard label="BUGÜNÜN ANALİZLERİ" value={c.todayAnalyses} />
        <StatCard
          label="API DURUMU"
          value={c.apiStatus}
          tone={c.apiStatus === "CONNECTED" ? "ok" : c.apiStatus === "ERROR" ? "err" : "warn"}
        />
      </div>

      <div className="admin-api-row">
        <span>Meta API</span>
        <StatusPill status={c.apiStatus} />
      </div>

      <div className="admin-chart-grid">
        <MiniChart title="Kullanıcı büyümesi" data={stats.charts.userGrowth} />
        <MiniChart title="Günlük analizler" data={stats.charts.dailyAnalyses} />
        <MiniChart title="Instagram bağlantıları" data={stats.charts.igConnections} />
        <MiniChart title="Aktif kullanıcılar" data={stats.charts.activeUsers} />
      </div>

      <div className="admin-two-col">
        <div className="admin-panel">
          <h3>Hizmet kullanım oranları</h3>
          {stats.charts.serviceUsage.length === 0 ? (
            <p className="muted text-sm">Henüz analiz kaydı yok.</p>
          ) : (
            <ul className="admin-usage-list">
              {stats.charts.serviceUsage.map((s) => (
                <li key={s.type}>
                  <span>{s.type}</span>
                  <strong>{s.count}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
        <ActivityTimeline items={stats.activity} />
      </div>
    </div>
  );
}
