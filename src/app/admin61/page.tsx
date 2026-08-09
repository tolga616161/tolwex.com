"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { StatCard } from "@/components/admin/saas/AdminWidgets";

type Stats = {
  members: number;
  orders: number;
  services: number;
  pendingBalance: number;
  openTickets: number;
  pendingOrders: number;
  revenue: number;
};

const EMPTY: Stats = {
  members: 0,
  orders: 0,
  services: 0,
  pendingBalance: 0,
  openTickets: 0,
  pendingOrders: 0,
  revenue: 0,
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/stats", { credentials: "same-origin" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStats(EMPTY);
        setError(data.error || "Dashboard verisi alınamadı");
        return;
      }
      setStats({
        members: Number(data.members) || 0,
        orders: Number(data.orders) || 0,
        services: Number(data.services) || 0,
        pendingBalance: Number(data.pendingBalance) || 0,
        openTickets: Number(data.openTickets) || 0,
        pendingOrders: Number(data.pendingOrders) || 0,
        revenue: Number(data.revenue) || 0,
      });
    } catch {
      setStats(EMPTY);
      setError("Bağlantı hatası — tekrar deneyin");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const s = stats || EMPTY;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Dashboard</h2>
          <p className="muted">TOLWEX operasyon özeti</p>
        </div>
        <div className="admin-btn-row" style={{ marginTop: 0 }}>
          <button type="button" className="btn btn-ghost" onClick={load} disabled={loading}>
            {loading ? "Yenileniyor…" : "Yenile"}
          </button>
          <Link href="/admin61/api" className="btn btn-primary">
            API Ayarları
          </Link>
        </div>
      </div>

      {error ? (
        <div className="admin-banner">
          <strong>Uyarı:</strong> {error}
        </div>
      ) : null}

      <div className="admin-stat-grid">
        <StatCard label="KULLANICILAR" value={s.members} />
        <StatCard label="SİPARİŞLER" value={s.orders} />
        <StatCard label="AKTİF SERVİS" value={s.services} tone="ok" />
        <StatCard
          label="BEKLEYEN SİPARİŞ"
          value={s.pendingOrders}
          tone={s.pendingOrders > 0 ? "warn" : "default"}
        />
        <StatCard
          label="BAKİYE TALEBİ"
          value={s.pendingBalance}
          tone={s.pendingBalance > 0 ? "warn" : "default"}
        />
        <StatCard
          label="AÇIK DESTEK"
          value={s.openTickets}
          tone={s.openTickets > 0 ? "warn" : "default"}
        />
        <StatCard label="CİRO (₺)" value={s.revenue.toFixed(2)} />
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
              <span>Ödeme bildirimleri {s.pendingBalance > 0 ? `(${s.pendingBalance})` : ""}</span>
              <Link href="/admin61/balance-requests">Aç</Link>
            </li>
            <li>
              <span>Sipariş onaylama {s.pendingOrders > 0 ? `(${s.pendingOrders})` : ""}</span>
              <Link href="/admin61/orders">Aç</Link>
            </li>
            <li>
              <span>Destek talepleri {s.openTickets > 0 ? `(${s.openTickets})` : ""}</span>
              <Link href="/admin61/support">Aç</Link>
            </li>
            <li>
              <span>Duyuru & banka ayarları</span>
              <Link href="/admin61/settings">Aç</Link>
            </li>
            <li>
              <span>3D Bakım Modu (24 saat)</span>
              <Link href="/admin61/settings">Ayarla</Link>
            </li>
            <li>
              <span>Trafik / ziyaretçi IP</span>
              <Link href="/admin61/trafik">Aç</Link>
            </li>
          </ul>
        </div>
        <div className="admin-panel">
          <h3>Dikkat gerekenler</h3>
          {s.pendingBalance + s.openTickets + s.pendingOrders === 0 ? (
            <p className="muted text-sm mt-2">Bekleyen kritik işlem yok.</p>
          ) : (
            <ul className="admin-usage-list">
              {s.pendingOrders > 0 ? (
                <li>
                  <span>{s.pendingOrders} sipariş onay/takip bekliyor</span>
                  <Link href="/admin61/orders">Git</Link>
                </li>
              ) : null}
              {s.pendingBalance > 0 ? (
                <li>
                  <span>{s.pendingBalance} bakiye bildirimi bekliyor</span>
                  <Link href="/admin61/balance-requests">Git</Link>
                </li>
              ) : null}
              {s.openTickets > 0 ? (
                <li>
                  <span>{s.openTickets} açık destek talebi</span>
                  <Link href="/admin61/support">Git</Link>
                </li>
              ) : null}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
