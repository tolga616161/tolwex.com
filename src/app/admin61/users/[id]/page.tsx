"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/admin/users/${params.id}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Bulunamadı");
        return r.json();
      })
      .then(setData)
      .catch(() => setErr("Kullanıcı bulunamadı"));
  }, [params.id]);

  if (err) return <p className="admin-error">{err}</p>;
  if (!data) return <p className="muted">Yükleniyor…</p>;

  const profile = data.profile as {
    id: string;
    createdAt: string;
    lastSeen: string;
    platform: string | null;
  };
  const connections = (data.connections as Array<Record<string, unknown>>) || [];
  const history = (data.analysisHistory as Array<Record<string, unknown>>) || [];
  const activity = (data.activity as Array<Record<string, unknown>>) || [];
  const services = (data.servicesUsed as string[]) || [];

  return (
    <div className="admin-page">
      <Link href="/admin61/users" className="muted text-sm">
        ← Kullanıcılar
      </Link>
      <div className="admin-page-head">
        <div>
          <h2>Kullanıcı detayı</h2>
          <p className="muted">
            <code>{profile.id}</code> — şifre / access token asla gösterilmez.
          </p>
        </div>
      </div>

      <div className="admin-stat-grid">
        <div className="admin-stat">
          <p className="admin-stat-label">Profil</p>
          <p className="admin-stat-value text-base">{profile.platform || "—"}</p>
          <p className="admin-stat-hint">
            Oluşturma: {new Date(profile.createdAt).toLocaleString("tr-TR")}
          </p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat-label">Son giriş / görülme</p>
          <p className="admin-stat-value text-base">
            {new Date(profile.lastSeen).toLocaleString("tr-TR")}
          </p>
        </div>
        <div className="admin-stat">
          <p className="admin-stat-label">Kullanılan hizmetler</p>
          <p className="admin-stat-value text-base">
            {services.length ? services.join(", ") : "—"}
          </p>
        </div>
      </div>

      <div className="admin-two-col">
        <div className="admin-panel">
          <h3>Bağlantılar</h3>
          {connections.length === 0 ? (
            <p className="muted text-sm">Instagram bağlantısı yok.</p>
          ) : (
            <ul className="admin-usage-list">
              {connections.map((c) => (
                <li key={String(c.id)}>
                  <span>
                    @{String(c.igUsername || "—")} · {String(c.accountType || "")}
                  </span>
                  <strong>{c.connected ? "bağlı" : "kopuk"}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="admin-panel">
          <h3>Analiz geçmişi</h3>
          {history.length === 0 ? (
            <p className="muted text-sm">Analiz yok.</p>
          ) : (
            <ul className="admin-usage-list">
              {history.map((a) => (
                <li key={String(a.id)}>
                  <span>
                    {String(a.type)} · {String(a.status)}
                  </span>
                  <strong>{String(a.mode)}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="admin-panel mt-6">
        <h3>Aktivite</h3>
        {activity.length === 0 ? (
          <p className="muted text-sm">Aktivite kaydı yok.</p>
        ) : (
          <ul className="admin-usage-list">
            {activity.map((a) => (
              <li key={String(a.id)}>
                <span>{String(a.action)}</span>
                <strong>{new Date(String(a.createdAt)).toLocaleString("tr-TR")}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
