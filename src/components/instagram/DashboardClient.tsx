"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatusCard } from "@/components/instagram/StatusCard";
import { DisconnectButton } from "@/components/instagram/DisconnectButton";
import { SecurityChecklist } from "@/components/instagram/SecurityChecklist";
import { ConnectButton } from "@/components/ConnectButton";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

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

const ACCOUNT_LABELS: Record<string, string> = {
  username: "Kullanıcı adı",
  igUsername: "Instagram kullanıcı adı",
  name: "Ad",
  id: "Hesap kimliği",
  igUserId: "Instagram kimliği",
  metaUserId: "Meta kullanıcı kimliği",
  accountType: "Hesap türü",
  account_type: "Hesap türü",
  tokenValidated: "Bağlantı doğrulandı",
  followers_count: "Takipçi",
  follows_count: "Takip",
  media_count: "Medya sayısı",
};

function labelKey(k: string) {
  return ACCOUNT_LABELS[k] || k;
}

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
        <div className="mt-4 flex flex-wrap gap-3">
          <ConnectButton label="Yeniden bağlan" />
          <a
            href={whatsappUrl("Dashboard yüklenemedi, destek istiyorum.")}
            className="btn btn-ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp destek
          </a>
        </div>
      </div>
    );
  }

  if (!data) {
    return <p className="muted">Hesap kontrolü yükleniyor…</p>;
  }

  const lastCheck = data.lastCheckedAt
    ? new Date(data.lastCheckedAt).toLocaleString("tr-TR")
    : "Henüz kontrol edilmedi";

  const connectionHealth =
    data.tokenStatus === "active"
      ? data.account && (data.account as { tokenValidated?: boolean }).tokenValidated
        ? "Bağlantı doğrulandı"
        : "Bağlantı aktif"
      : data.tokenStatus === "expired"
        ? "Bağlantı süresi dolmuş olabilir — yeniden bağlanın"
        : data.tokenStatus === "none"
          ? "Henüz bağlanmadı"
          : `Bağlantı durumu: ${data.tokenStatus}`;

  return (
    <div className="space-y-8">
      <div className="fade-up">
        <h1 className="display text-3xl md:text-5xl font-bold mb-3">
          Instagram Hesap Güvenliği
        </h1>
        <p className="muted max-w-2xl">{data.message}</p>
      </div>

      <div className="surface rounded-2xl p-4 text-sm fade-up-delay">
        {data.privacyNotice}
      </div>

      {!data.metaConfigured ? (
        <div className="surface rounded-2xl p-6">
          <p className="mb-4">
            Bağlantı henüz hazır değil. Destek: {CONTACT_PHONE_DISPLAY}
          </p>
          <a
            href={whatsappUrl("Instagram bağlantısı için yazıyorum.")}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp ile yaz
          </a>
        </div>
      ) : null}

      {!data.connected ? (
        <div className="surface rounded-2xl p-6 fade-up-delay">
          <h2 className="display text-2xl mb-2">Hesabını bağla</h2>
          <p className="muted text-sm mb-4">
            Resmi Meta ekranından Instagram’ı onaylayın. Şifre istemeyiz.
            Bağlandıktan sonra izinler ve hesap durumu burada görünür.
          </p>
          <ConnectButton label="Instagram Hesabımı Bağla" force />
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 fade-up-delay">
        <StatusCard
          title="Bağlantı"
          label={data.connectionCard.label}
          status={data.connectionCard.status as "active"}
        />
        <StatusCard
          title="Hesap erişimi"
          label={data.apiCard.label.replace(/^API\s*/i, "").trim() || data.apiCard.label}
          status={data.apiCard.status as "active"}
        />
        <StatusCard
          title="Bağlantı sağlığı"
          label={connectionHealth}
          status={
            data.tokenStatus === "active"
              ? "ok"
              : data.tokenStatus === "none"
                ? "idle"
                : "warn"
          }
        />
        <StatusCard title="Son kontrol" label={lastCheck} status="idle" />
        <StatusCard
          title="Durum uyarısı"
          label={
            data.apiError
              ? "Bağlantıda sorun var — yeniden bağlanmayı deneyin"
              : "Aktif uyarı yok"
          }
          status={data.apiError ? "warn" : "ok"}
        />
      </div>

      <section className="surface rounded-2xl p-6 fade-up-delay-2">
        <h2 className="display text-2xl mb-2">Güvenlik özeti</h2>
        <p className="muted text-sm mb-5">
          Uydurma skor yok. Yalnızca ölçülebilir bulgular ve platformun vermediği
          alanlar listelenir.
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
          <h2 className="display text-xl mb-4">Hesap bilgileri</h2>
          {data.account ? (
            <dl className="space-y-2 text-sm">
              {Object.entries(data.account).map(([k, v]) =>
                v === null || v === undefined ? null : (
                  <div
                    key={k}
                    className="flex justify-between gap-4 border-b border-white/10 py-2"
                  >
                    <dt className="muted">{labelKey(k)}</dt>
                    <dd className="text-right break-all">
                      {typeof v === "boolean"
                        ? v
                          ? "Evet"
                          : "Hayır"
                        : Array.isArray(v)
                          ? v.join(", ")
                          : String(v)}
                    </dd>
                  </div>
                )
              )}
            </dl>
          ) : (
            <p className="muted text-sm">
              Hesap bilgisi henüz alınamadı. Bağlantıyı tamamlayın.
            </p>
          )}
        </div>

        <div className="surface rounded-2xl p-6">
          <h2 className="display text-xl mb-4">Verilen izinler</h2>
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
              İzin listesi henüz yok. Bağlantı sonrası Meta’nın verdiği izinler
              burada görünür.
            </p>
          )}
        </div>
      </section>

      <section className="surface rounded-2xl p-6">
        <h2 className="display text-xl mb-4">Platformun vermediği bilgiler</h2>
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
        <ConnectButton
          label={data.connected ? "Yeniden Bağlan" : "Instagram Hesabını Bağla"}
          force
        />
        {data.connected ? <DisconnectButton /> : null}
        <Link href="/instagram/guide" className="btn btn-ghost">
          2FA Güvenlik Rehberi
        </Link>
        <Link href="/instagram/security" className="btn btn-ghost">
          Güvenlik Merkezi
        </Link>
        <a
          href={whatsappUrl("Instagram güvenlik kontrolü hakkında yazıyorum.")}
          className="btn btn-ghost"
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp {CONTACT_PHONE_DISPLAY}
        </a>
      </div>
    </div>
  );
}
