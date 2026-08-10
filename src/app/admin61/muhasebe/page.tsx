"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { StatCard, MiniChart } from "@/components/admin/saas/AdminWidgets";

type RangeKey = "today" | "7d" | "30d" | "all";

type Accounting = {
  range: RangeKey;
  markup: { configuredPercent: number; effectivePercent: number; note: string };
  summary: {
    orderCount: number;
    revenue: number;
    cost: number;
    costStored: number;
    costEstimated: number;
    profit: number;
    marginPct: number;
    deadOrderCount: number;
    deadCharge: number;
  };
  cash: {
    deposits: number;
    depositCount: number;
    depositMethods: Array<{ method: string; count: number; amount: number }>;
    bonuses: number;
    bonusCount: number;
    coupons: number;
    couponCount: number;
    refunds: number;
    refundCount: number;
    memberBalanceLiability: number;
    memberSpent: number;
    activeMembers: number;
  };
  provider: {
    configured: boolean;
    ok: boolean;
    balance: string | null;
    currency: string;
    error: string | null;
    url: string;
  };
  daily: Array<{ date: string; revenue: number; cost: number; profit: number; orders: number }>;
  byService: Array<{
    name: string;
    orders: number;
    revenue: number;
    cost: number;
    profit: number;
    marginPct: number;
  }>;
  statusBreakdown: Array<{ status: string; count: number; revenue: number; cost: number }>;
  lossOrders: Array<{
    id: string;
    serviceName: string;
    username: string;
    charge: number;
    cost: number;
    profit: number;
    status: string;
    createdAt: string;
  }>;
  recent: Array<{
    id: string;
    serviceName: string;
    username: string;
    quantity: number;
    charge: number;
    cost: number;
    profit: number;
    estimated: boolean;
    status: string;
    createdAt: string;
  }>;
};

const RANGES: Array<{ key: RangeKey; label: string }> = [
  { key: "today", label: "Bugün" },
  { key: "7d", label: "7 gün" },
  { key: "30d", label: "30 gün" },
  { key: "all", label: "Tümü" },
];

const METHOD_TR: Record<string, string> = {
  shopier: "Kart (Shopier)",
  bank_transfer: "Havale",
  whatsapp: "WhatsApp",
};

function tl(n: number) {
  return `${n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺`;
}

export default function AdminAccountingPage() {
  const [range, setRange] = useState<RangeKey>("30d");
  const [data, setData] = useState<Accounting | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (r: RangeKey) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/accounting?range=${r}`, {
        credentials: "same-origin",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setData(null);
        setError(json.error || "Muhasebe verisi alınamadı");
        return;
      }
      setData(json as Accounting);
    } catch {
      setData(null);
      setError("Bağlantı hatası — tekrar deneyin");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(range);
  }, [load, range]);

  const s = data?.summary;
  const profitTone =
    !s ? "default" : s.profit > 0 ? "ok" : s.profit < 0 ? "err" : "default";

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Muhasebe</h2>
          <p className="muted">
            Satış (üye) − API maliyeti = kâr. Provider bakiyesi canlı API’den.
          </p>
        </div>
        <div className="admin-btn-row" style={{ marginTop: 0 }}>
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              className={`btn ${range === r.key ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setRange(r.key)}
              disabled={loading}
            >
              {r.label}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => void load(range)}
            disabled={loading}
          >
            {loading ? "Yükleniyor…" : "Yenile"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="admin-banner">
          <strong>Uyarı:</strong> {error}
        </div>
      ) : null}

      {data?.markup ? (
        <p className="muted text-sm mb-4">
          Ayarlı kâr oranı: <strong>%{data.markup.configuredPercent}</strong>
          {" · "}
          Gerçekleşen: <strong>%{data.markup.effectivePercent}</strong>
          {" — "}
          {data.markup.note}
        </p>
      ) : null}

      <div className="admin-stat-grid">
        <StatCard
          label="SATIŞ (CİRO)"
          value={s ? tl(s.revenue) : "—"}
          hint={s ? `${s.orderCount} faturalanan sipariş` : undefined}
        />
        <StatCard
          label="API MALİYET"
          value={s ? tl(s.cost) : "—"}
          hint={
            s && s.costEstimated > 0
              ? `Tahmini dahil: ${tl(s.costEstimated)}`
              : "Provider rate × adet"
          }
          tone="warn"
        />
        <StatCard
          label="KÂR / ZARAR"
          value={s ? tl(s.profit) : "—"}
          hint={s ? `Marj %${s.marginPct}` : undefined}
          tone={profitTone}
        />
        <StatCard
          label="PROVIDER BAKİYE"
          value={
            data?.provider.ok && data.provider.balance != null
              ? `${data.provider.balance} ${data.provider.currency}`
              : data?.provider.error
                ? "Alınamadı"
                : "—"
          }
          hint={
            data?.provider.ok
              ? "Canlı SMM API"
              : data?.provider.error || "SMM_API_KEY kontrol et"
          }
          tone={data?.provider.ok ? "ok" : "warn"}
        />
      </div>

      <div className="admin-stat-grid mt-4">
        <StatCard
          label="YÜKLENEN BAKİYE"
          value={data ? tl(data.cash.deposits) : "—"}
          hint={data ? `${data.cash.depositCount} onaylı yükleme` : undefined}
        />
        <StatCard
          label="ÜYE BAKİYE BORCU"
          value={data ? tl(data.cash.memberBalanceLiability) : "—"}
          hint="Aktif üyelerin panellerindeki bakiye"
        />
        <StatCard
          label="BONUS / KUPON"
          value={
            data
              ? tl(data.cash.bonuses + data.cash.coupons)
              : "—"
          }
          hint={
            data
              ? `Bonus ${tl(data.cash.bonuses)} · Kupon ${tl(data.cash.coupons)}`
              : undefined
          }
        />
        <StatCard
          label="İADELER"
          value={data ? tl(data.cash.refunds) : "—"}
          hint={data ? `${data.cash.refundCount} kayıt` : undefined}
          tone={data && data.cash.refunds > 0 ? "warn" : "default"}
        />
      </div>

      <div className="admin-two-col mt-6">
        <div className="admin-panel">
          <MiniChart
            title="Son 14 gün — kâr"
            data={(data?.daily || []).map((d) => ({
              date: d.date,
              value: Math.max(0, d.profit),
            }))}
          />
          <div className="acct-day-table mt-4">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Gün</th>
                  <th>Satış</th>
                  <th>Maliyet</th>
                  <th>Kâr</th>
                  <th>Sipariş</th>
                </tr>
              </thead>
              <tbody>
                {(data?.daily || [])
                  .slice()
                  .reverse()
                  .slice(0, 7)
                  .map((d) => (
                    <tr key={d.date}>
                      <td>{d.date.slice(5)}</td>
                      <td>{tl(d.revenue)}</td>
                      <td>{tl(d.cost)}</td>
                      <td className={d.profit < 0 ? "text-err" : ""}>{tl(d.profit)}</td>
                      <td>{d.orders}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-panel grid gap-4">
          <div>
            <h3>Yükleme kanalları</h3>
            <ul className="admin-usage-list">
              {(data?.cash.depositMethods || []).length === 0 ? (
                <li>
                  <span className="muted">Bu dönemde onaylı yükleme yok</span>
                </li>
              ) : (
                data!.cash.depositMethods.map((m) => (
                  <li key={m.method}>
                    <span>
                      {METHOD_TR[m.method] || m.method} ({m.count})
                    </span>
                    <strong>{tl(m.amount)}</strong>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div>
            <h3>Sipariş durumları</h3>
            <ul className="admin-usage-list">
              {(data?.statusBreakdown || []).length === 0 ? (
                <li>
                  <span className="muted">Kayıt yok</span>
                </li>
              ) : (
                data!.statusBreakdown.map((st) => (
                  <li key={st.status}>
                    <span>
                      {st.status} · {st.count}
                    </span>
                    <span className="muted text-xs">{tl(st.revenue)}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div className="admin-btn-row" style={{ marginTop: 0 }}>
            <Link href="/admin61/api" className="btn btn-ghost">
              API / Shopier
            </Link>
            <Link href="/admin61/orders" className="btn btn-ghost">
              Siparişler
            </Link>
          </div>
        </div>
      </div>

      <div className="admin-panel mt-6">
        <h3>Servis bazlı kâr (ilk 15)</h3>
        <div className="sp-table-wrap mt-3">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Servis</th>
                <th>Adet sipariş</th>
                <th>Satış</th>
                <th>Maliyet</th>
                <th>Kâr</th>
                <th>Marj</th>
              </tr>
            </thead>
            <tbody>
              {(data?.byService || []).map((row) => (
                <tr key={row.name}>
                  <td style={{ maxWidth: 280 }}>{row.name}</td>
                  <td>{row.orders}</td>
                  <td>{tl(row.revenue)}</td>
                  <td>{tl(row.cost)}</td>
                  <td className={row.profit < 0 ? "text-err" : ""}>{tl(row.profit)}</td>
                  <td>%{row.marginPct}</td>
                </tr>
              ))}
              {!loading && (data?.byService || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="muted">
                    Bu dönemde faturalanan sipariş yok.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {(data?.lossOrders || []).length > 0 ? (
        <div className="admin-panel mt-6">
          <h3>Zararlı siparişler (satış &lt; maliyet)</h3>
          <p className="muted text-xs mb-2">Markup veya kur hatası olabilir — kontrol edin.</p>
          <ul className="admin-usage-list">
            {data!.lossOrders.map((o) => (
              <li key={o.id}>
                <span>
                  {o.username} · {o.serviceName.slice(0, 40)}
                </span>
                <span className="text-err">{tl(o.profit)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="admin-panel mt-6">
        <h3>Son siparişler</h3>
        <div className="sp-table-wrap mt-3">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Üye</th>
                <th>Servis</th>
                <th>Satış</th>
                <th>Maliyet</th>
                <th>Kâr</th>
                <th>Durum</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recent || []).map((o) => (
                <tr key={o.id}>
                  <td>{o.username}</td>
                  <td style={{ maxWidth: 220 }}>
                    {o.serviceName.slice(0, 48)}
                    {o.estimated ? (
                      <span className="muted text-xs"> · maliyet tahmini</span>
                    ) : null}
                  </td>
                  <td>{tl(o.charge)}</td>
                  <td>{tl(o.cost)}</td>
                  <td className={o.profit < 0 ? "text-err" : ""}>{tl(o.profit)}</td>
                  <td>{o.status}</td>
                  <td className="muted text-xs">
                    {new Date(o.createdAt).toLocaleString("tr-TR")}
                  </td>
                </tr>
              ))}
              {!loading && (data?.recent || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="muted">
                    Kayıt yok.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
