"use client";

import { useState } from "react";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "ok" | "warn" | "err";
}) {
  return (
    <div className={`admin-stat tone-${tone}`}>
      <p className="admin-stat-label">{label}</p>
      <p className="admin-stat-value">{value}</p>
      {hint ? <p className="admin-stat-hint">{hint}</p> : null}
    </div>
  );
}

export function MiniChart({
  title,
  data,
}: {
  title: string;
  data: Array<{ date: string; value: number }>;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="admin-chart">
      <div className="admin-chart-head">
        <h3>{title}</h3>
        <span className="muted text-xs">Son 14 gün · gerçek veri</span>
      </div>
      <div className="admin-chart-bars" role="img" aria-label={title}>
        {data.map((d) => (
          <div key={d.date} className="admin-bar-col" title={`${d.date}: ${d.value}`}>
            <div
              className="admin-bar"
              style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
            />
            <span className="admin-bar-label">{d.date.slice(5)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivityTimeline({
  items,
}: {
  items: Array<{ id: string; label: string; createdAt: string; action: string }>;
}) {
  return (
    <div className="admin-timeline">
      <h3>Son aktiviteler</h3>
      {items.length === 0 ? (
        <p className="muted text-sm">Henüz aktivite yok.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <span className="admin-tl-dot" />
              <div>
                <p className="admin-tl-label">{item.label}</p>
                <p className="admin-tl-meta">
                  {item.action} · {new Date(item.createdAt).toLocaleString("tr-TR")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="admin-copy-field">
      <label>{label}</label>
      <div className="admin-copy-row">
        <code>{value || "—"}</code>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={async () => {
            if (!value) return;
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "Kopyalandı" : "COPY"}
        </button>
      </div>
    </div>
  );
}

export function StatusPill({
  status,
}: {
  status: "CONNECTED" | "NOT CONNECTED" | "ERROR" | string;
}) {
  const tone =
    status === "CONNECTED" ? "ok" : status === "ERROR" ? "err" : "warn";
  return <span className={`admin-pill tone-${tone}`}>{status}</span>;
}

export function HonestEmpty({
  title,
  explanation,
  bullets,
}: {
  title: string;
  explanation: string;
  bullets?: string[];
}) {
  return (
    <div className="admin-honest-empty">
      <p className="admin-badge">TAHMİNİ / SİNYAL · SAHTE LİSTE YOK</p>
      <h3>{title}</h3>
      <p>{explanation}</p>
      {bullets?.length ? (
        <ul>
          {bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
