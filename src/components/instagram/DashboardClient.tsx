"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusCard } from "@/components/instagram/StatusCard";
import { DisconnectButton } from "@/components/instagram/DisconnectButton";
import { SecurityChecklist } from "@/components/instagram/SecurityChecklist";
import { ConnectButton } from "@/components/ConnectButton";

type DashboardData = {
  metaConfigured: boolean;
  connected: boolean;
  message: string;
  privacyNotice: string;
  connectionCard: { status: string; label: string };
  apiCard: { status: string; label: string };
  securityChecks: Array<{ id: string; label: string; status: string; detail: string }>;
  permissions: Array<{ permission: string; status: string }>;
  account: null | Record<string, unknown>;
  tokenStatus: string;
  lastCheckedAt: string | null;
  apiError: string | null;
  notProvided: Record<string, string>;
  securitySummary: Array<{ status: string; text: string }>;
  suspiciousGuidance?: string;
  error?: boolean;
};

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/meta/dashboard")
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.message || "Yüklenemedi");
        setData(json);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="surface rounded-2xl p-6">
        <p>{error}</p>
        <div className="mt-4">
          <ConnectButton label="Yeniden bağlan" />
        </div>
      </div>
    );
  }

  if (!data) {
    return <p className="muted">Kontrol ekranı yükleniyor…</p>;
  }

  const lastCheck = data.lastCheckedAt
    ? new Date(data.lastCheckedAt).toLocaleString("tr-TR")
    : "Henüz kontrol edilmedi";

  return (
    <div className="space-y-8">
      <div className="fade-up">
        <h1 className="display text-3xl md:text-5xl font-bold mb-3">
          Instagram Hesap Kontrolü
        </h1>
        <p className="muted max-w-2xl">{data.message}</p>
      </div>

      <div className="surface rounded-2xl p-4 text-sm fade-up-delay">
        {data.privacyNotice}
      </div>

      {!data.metaConfigured ? (
        <div className="surface rounded-2xl p-6">
          <p className="mb-4">Meta entegrasyonu henüz yapılandırılmadı.</p>
          <Link href="/admin/setup" className="btn btn-primary">
            Meta API Kurulum
          </Link>
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 fade-up-delay">
        <StatusCard
          title="Bağlantı"
          label={data.connectionCard.label}
          status={data.connectionCard.status as "active"}
        />
        <StatusCard
          title="API Durumu"
          label={data.apiCard.label}
          status={data.apiCard.status as "active"}
        />
        <StatusCard
          title="Token Durumu"
          label={
            data.tokenStatus === "active"
              ? "Token durumu: aktif"
              : data.tokenStatus === "expired"
                ? "Token süresi dolmuş olabilir"
                : data.tokenStatus === "none"
                  ? "Token yok"
                  : `Token durumu: ${data.tokenStatus}`
          }
          status={
            data.tokenStatus === "active"
              ? "ok"
              : data.tokenStatus === "none"
                ? "idle"
                : "warn"
          }
        />
        <StatusCard title="Son Kontrol" label={lastCheck} status="idle" />
        <StatusCard
          title="API Hata"
          label={
            data.apiError
              ? "API hatası algılandı — teknik detay gizlendi"
              : "Aktif API hatası yok"
          }
          status={data.apiError ? "warn" : "ok"}
        />
      </div>

      <section className="surface rounded-2xl p-6 fade-up-delay-2">
        <h2 className="display text-2xl mb-2">Güvenlik Kontrolü</h2>
        <p className="muted text-sm mb-5">
          Skor üretilmez. Yalnızca ölçülebilir API bulguları ve API’nin
          sağlamadığı alanlar listelenir.
        </p>
        <ul className="space-y-3">
          {data.securitySummary.map((s) => (
            <li key={s.text} className="flex items-center gap-3">
              <span
                className={`status-dot ${
                  s.status === "ok" ? "status-ok" : "status-warn"
                }`}
              />
              <span>{s.text}</span>
            </li>
          ))}
        </ul>
        {data.suspiciousGuidance ? (
          <p className="mt-5 text-sm muted border-t border-white/10 pt-4">
            İncelemeniz önerilir. {data.suspiciousGuidance}
          </p>
        ) : null}
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <div className="surface rounded-2xl p-6">
          <h2 className="display text-xl mb-4">Hesap Bilgileri</h2>
          {data.account ? (
            <dl className="space-y-2 text-sm">
              {Object.entries(data.account).map(([k, v]) =>
                v === null || v === undefined ? null : (
                  <div key={k} className="flex justify-between gap-4 border-b border-white/10 py-2">
                    <dt className="muted">{k}</dt>
                    <dd className="text-right break-all">
                      {Array.isArray(v) ? v.join(", ") : String(v)}
                    </dd>
                  </div>
                )
              )}
            </dl>
          ) : (
            <p className="muted text-sm">
              Bu bilgi resmi Meta API tarafından sağlanmıyor veya henüz alınamadı.
            </p>
          )}
        </div>

        <div className="surface rounded-2xl p-6">
          <h2 className="display text-xl mb-4">İzinler</h2>
          {data.permissions?.length ? (
            <ul className="space-y-2 text-sm">
              {data.permissions.map((p) => (
                <li
                  key={p.permission}
                  className="flex items-center justify-between gap-3 border-b border-white/10 py-2"
                >
                  <span>{p.permission}</span>
                  <span className="muted">{p.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted text-sm">
              İzin listesi henüz yok. Bağlantı sonrası Meta tarafından verilen
              izinler burada görünür.
            </p>
          )}
        </div>
      </section>

      <section className="surface rounded-2xl p-6">
        <h2 className="display text-xl mb-4">API Tarafından Sağlanmayan Bilgiler</h2>
        <ul className="space-y-3 text-sm">
          {Object.values(data.notProvided || {}).map((msg) => (
            <li key={msg} className="flex gap-3">
              <span className="status-dot status-idle mt-1.5" />
              <span className="muted">{msg}</span>
            </li>
          ))}
        </ul>
      </section>

      <SecurityChecklist />

      <div className="flex flex-wrap gap-3">
        {!data.connected ? <ConnectButton label="Instagram Hesabını Bağla" /> : null}
        {data.connected ? <DisconnectButton /> : null}
        <Link href="/instagram/guide" className="btn btn-ghost">
          2FA Güvenlik Rehberi
        </Link>
        <Link href="/instagram/security" className="btn btn-ghost">
          Güvenlik Merkezi
        </Link>
      </div>
    </div>
  );
}
