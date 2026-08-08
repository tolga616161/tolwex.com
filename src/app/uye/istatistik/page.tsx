"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MemberGate } from "@/components/smm/MemberGate";

type Stats = {
  totalOrders: number;
  openTickets: number;
  completed: number;
  processing: number;
  pending: number;
};

export default function MemberStatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/member/stats", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setStats({
          totalOrders: d.totalOrders ?? 0,
          openTickets: d.openTickets ?? 0,
          completed: d.status?.completed ?? 0,
          processing: d.status?.processing ?? 0,
          pending: d.status?.pending ?? 0,
        });
      });
  }, []);

  return (
    <MemberGate>
      {({ me }) => (
        <div className="sp-page">
          <div className="sp-page-title">
            <h1>İstatistikler</h1>
            <p>Hesap özeti</p>
          </div>
          <div className="sp-stat-grid">
            <article className="sp-stat tone-a">
              <span>Bakiye</span>
              <strong>{me.balance.toFixed(2)} ₺</strong>
            </article>
            <article className="sp-stat tone-b">
              <span>Harcama</span>
              <strong>{me.spent.toFixed(2)} ₺</strong>
            </article>
            <article className="sp-stat tone-c">
              <span>Sipariş</span>
              <strong>{stats?.totalOrders ?? "…"}</strong>
            </article>
            <article className="sp-stat tone-d">
              <span>Destek</span>
              <strong>{stats?.openTickets ?? "…"}</strong>
            </article>
          </div>
          <div className="sp-actions">
            <Link href="/uye" className="btn btn-primary">
              Yeni Sipariş
            </Link>
            <Link href="/uye/bakiye" className="btn btn-ghost">
              Bakiye Yükle
            </Link>
          </div>
        </div>
      )}
    </MemberGate>
  );
}
