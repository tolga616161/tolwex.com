"use client";

import { useCallback, useEffect, useState } from "react";
import { StatCard } from "@/components/admin/saas/AdminWidgets";

type Visit = {
  id: string;
  ip: string;
  path: string;
  referrer: string;
  userAgent: string;
  country: string;
  enteredAt: string;
  leftAt: string | null;
  hitCount: number;
  online: boolean;
};

type Payload = {
  summary: { hits: number; hitsAll: number; uniqueIps: number; online: number };
  topPages: Array<{ path: string; hits: number }>;
  topReferrers: Array<{ source: string; hits: number }>;
  visits: Visit[];
  warning?: string;
};

export default function AdminTrafikPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [hours, setHours] = useState(24);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/analytics?hours=${hours}&limit=100`, {
        credentials: "same-origin",
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(json.error || "Yüklenemedi");
        return;
      }
      setData(json);
    } catch {
      setErr("Bağlantı hatası");
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => {
    load();
    const t = window.setInterval(load, 30_000);
    return () => window.clearInterval(t);
  }, [load]);

  const s = data?.summary || { hits: 0, hitsAll: 0, uniqueIps: 0, online: 0 };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Trafik / Ziyaretçiler</h2>
          <p className="muted">IP, sayfa, giriş–çıkış ve referans kaynakları</p>
        </div>
        <div className="admin-btn-row" style={{ marginTop: 0 }}>
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            aria-label="Zaman aralığı"
          >
            <option value={1}>Son 1 saat</option>
            <option value={24}>Son 24 saat</option>
            <option value={72}>Son 3 gün</option>
            <option value={168}>Son 7 gün</option>
          </select>
          <button type="button" className="btn btn-ghost" onClick={load} disabled={loading}>
            {loading ? "Yenileniyor…" : "Yenile"}
          </button>
        </div>
      </div>

      {err ? <div className="admin-banner">{err}</div> : null}
      {data?.warning ? (
        <div className="admin-banner">
          Not: {data.warning} — ilk ziyaretten sonra tablo oluşur.
        </div>
      ) : null}

      <div className="admin-stat-grid">
        <StatCard label="ÇEVRİMİÇİ" value={s.online} tone="ok" />
        <StatCard label="TEKİL IP" value={s.uniqueIps} />
        <StatCard label="HİT (ARALIK)" value={s.hits} />
        <StatCard label="TOPLAM HİT" value={s.hitsAll} />
      </div>

      <div className="admin-two-col mt-6">
        <div className="admin-panel">
          <h3>En çok bakılan sayfalar</h3>
          <ul className="admin-usage-list">
            {(data?.topPages || []).map((p) => (
              <li key={p.path}>
                <span>{p.path}</span>
                <strong>{p.hits}</strong>
              </li>
            ))}
            {!data?.topPages?.length ? (
              <li>
                <span className="muted">Henüz veri yok</span>
              </li>
            ) : null}
          </ul>
        </div>
        <div className="admin-panel">
          <h3>Referans / backlink kaynakları</h3>
          <ul className="admin-usage-list">
            {(data?.topReferrers || []).map((r) => (
              <li key={r.source}>
                <span>{r.source}</span>
                <strong>{r.hits}</strong>
              </li>
            ))}
            {!data?.topReferrers?.length ? (
              <li>
                <span className="muted">Henüz veri yok</span>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="admin-panel mt-6">
        <h3>Son ziyaretler</h3>
        <div className="admin-table-wrap mt-4">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Durum</th>
                <th>IP</th>
                <th>Ülke</th>
                <th>Sayfa</th>
                <th>Kaynak</th>
                <th>Giriş</th>
                <th>Çıkış</th>
                <th>Hit</th>
              </tr>
            </thead>
            <tbody>
              {(data?.visits || []).map((v) => (
                <tr key={v.id}>
                  <td>
                    <span className={`admin-pill ${v.online ? "tone-ok" : "tone-warn"}`}>
                      {v.online ? "İçerde" : "Çıktı"}
                    </span>
                  </td>
                  <td>
                    <code>{v.ip || "—"}</code>
                  </td>
                  <td>{v.country || "—"}</td>
                  <td>{v.path}</td>
                  <td className="muted text-xs" style={{ maxWidth: 160 }}>
                    {v.referrer
                      ? (() => {
                          try {
                            return new URL(v.referrer).hostname;
                          } catch {
                            return v.referrer.slice(0, 40);
                          }
                        })()
                      : "direkt"}
                  </td>
                  <td className="muted text-xs">
                    {new Date(v.enteredAt).toLocaleString("tr-TR")}
                  </td>
                  <td className="muted text-xs">
                    {v.leftAt ? new Date(v.leftAt).toLocaleString("tr-TR") : "—"}
                  </td>
                  <td>{v.hitCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!data?.visits?.length ? (
            <p className="muted p-4 text-sm">Henüz ziyaret kaydı yok. Siteyi bir kez açın.</p>
          ) : null}
        </div>
      </div>

      <div className="admin-panel mt-6">
        <h3>SEO / öne çıkarma ipuçları</h3>
        <ul className="admin-steps">
          <li>
            Google Search Console’a <code>https://tolwex.com/sitemap.xml</code> ekleyin.
          </li>
          <li>
            robots.txt: <code>https://tolwex.com/robots.txt</code>
          </li>
          <li>
            Sosyal paylaşımlarda OG etiketleri otomatik; linkleri Instagram / Telegram’da paylaşın
            (doğal backlink).
          </li>
          <li>Bu paneldeki “Referans” sütunu hangi siteden gelindiğini gösterir.</li>
        </ul>
      </div>
    </div>
  );
}
