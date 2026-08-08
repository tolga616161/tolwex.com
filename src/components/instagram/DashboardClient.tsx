"use client";

import { useCallback, useEffect, useState } from "react";
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
  tokenType: "Token türü",
  mediaCount: "Medya sayısı",
  followers_count: "Takipçi",
  follows_count: "Takip",
  media_count: "Medya sayısı",
  fieldsFromApi: "API alanları",
};

function labelKey(k: string) {
  return ACCOUNT_LABELS[k] || k;
}

function formatValue(v: unknown): string {
  if (typeof v === "boolean") return v ? "Evet" : "Hayır";
  if (Array.isArray(v)) return v.join(", ");
  if (v === null || v === undefined) return "—";
  return String(v);
}

function statusTone(status: string): "ok" | "warn" | "idle" | "active" {
  if (status === "ok" || status === "active" || status === "granted") return "ok";
  if (status === "warn" || status === "error" || status === "expired") return "warn";
  return "idle";
}

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/meta/dashboard");
      const json = await r.json();
      if (!r.ok) throw new Error(json.message || "Yüklenemedi");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Yüklenemedi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  if (loading) {
    return <p className="muted">Hesap güvenlik kontrolü yükleniyor…</p>;
  }

  if (error) {
    return (
      <div className="surface rounded-2xl p-6">
        <h1 className="display text-3xl font-bold mb-3">Kontrol yüklenemedi</h1>
        <p className="mb-4">{error}</p>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary" onClick={() => load(false)}>
            Tekrar dene
          </button>
          <ConnectButton label="Instagram’ı Bağla" force />
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

  if (!data) return null;

  const lastCheck = data.lastCheckedAt
    ? new Date(data.lastCheckedAt).toLocaleString("tr-TR")
    : "Henüz kontrol edilmedi";

  const connectionHealth =
    data.tokenStatus === "active"
      ? data.account && (data.account as { tokenValidated?: boolean }).tokenValidated
        ? "Bağlantı Meta tarafından doğrulandı"
        : "Bağlantı aktif"
      : data.tokenStatus === "expired"
        ? "Bağlantı süresi dolmuş — yeniden bağlanın"
        : data.tokenStatus === "none"
          ? "Henüz bağlanmadı"
          : `Bağlantı durumu: ${data.tokenStatus}`;

  const grantedCount = data.permissions.filter((p) => p.status === "granted").length;

  return (
    <div className="space-y-8">
      <div className="fade-up flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: "var(--accent)" }}>
            Instagram güvenlik paneli
          </p>
          <h1 className="display text-3xl md:text-5xl font-bold mb-3">
            Hesap Güvenlik Kontrolü
          </h1>
          <p className="muted max-w-2xl">{data.message}</p>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={refreshing || !data.connected}
          onClick={() => load(true)}
        >
          {refreshing ? "Kontrol ediliyor…" : "Yeniden kontrol et"}
        </button>
      </div>

      <div className="surface rounded-2xl p-4 text-sm fade-up-delay">{data.privacyNotice}</div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 fade-up-delay">
        {[
          { href: "/analiz/profilime-kim-bakti", t: "Profilime Kim Baktı?", s: "Tahmini analiz" },
          { href: "/analiz/beni-engelleyenler", t: "Engelleme Analizi", s: "Muhtemel sinyaller" },
          { href: "/analiz/takipten-cikanlar", t: "Takipten Çıkanlar", s: "Karşılaştırmalı" },
          { href: "/analiz/takip-etmeyenler", t: "Takip Etmeyenler", s: "Karşılaştırmalı" },
          { href: "/analiz/fake-hesap", t: "Fake Hesap Analizi", s: "Risk skoru 0–100" },
          { href: "/instagram/security", t: "Güvenlik Merkezi", s: "Checklist + OAuth" },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="surface rounded-2xl p-4 hover:border-white/30 transition-colors">
            <p className="font-semibold text-white mb-1">{c.t}</p>
            <p className="muted text-sm">{c.s}</p>
          </Link>
        ))}
      </div>

      {!data.metaConfigured ? (
        <div className="surface rounded-2xl p-6">
          <p className="mb-4">
            Meta API henüz yapılandırılmadı. Destek için WhatsApp’tan yazın.
          </p>
          <a
            href={whatsappUrl("Meta API kurulumu için yazıyorum.")}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp destek
          </a>
        </div>
      ) : null}

      {!data.connected ? (
        <div className="surface rounded-2xl p-6 md:p-8 fade-up-delay">
          <h2 className="display text-2xl mb-2">1. Instagram hesabını bağla</h2>
          <p className="muted text-sm mb-5 max-w-xl">
            Resmi Meta ekranından onay verin. Şifre bu sitede yazılmaz. Bağlandıktan
            sonra izinler, hesap bilgileri ve güvenlik kontrolleri burada listelenir.
          </p>
          <ConnectButton label="Instagram Hesabımı Bağla" force />
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 fade-up-delay">
        <StatusCard
          title="Bağlantı"
          label={data.connectionCard.label}
          status={statusTone(data.connectionCard.status)}
        />
        <StatusCard
          title="Hesap erişimi"
          label={data.apiCard.label}
          status={statusTone(data.apiCard.status)}
        />
        <StatusCard
          title="Bağlantı sağlığı"
          label={connectionHealth}
          status={
            data.tokenStatus === "active" ? "ok" : data.tokenStatus === "none" ? "idle" : "warn"
          }
        />
        <StatusCard title="Son kontrol" label={lastCheck} status="idle" />
        <StatusCard
          title="Verilen izinler"
          label={
            data.permissions.length
              ? `${grantedCount} / ${data.permissions.length} izin aktif`
              : "İzin listesi yok"
          }
          status={grantedCount ? "ok" : "idle"}
        />
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
          Uydurma skor yok. Yalnızca Meta API’nin verdiği ölçülebilir bulgular ve
          platformun sağlamadığı alanlar listelenir.
        </p>
        <ul className="space-y-3 mb-6">
          {data.securitySummary.map((s) => (
            <li key={s.text} className="flex items-center gap-3">
              <span className={`status-dot ${s.status === "ok" ? "status-ok" : "status-warn"}`} />
              <span>{s.text}</span>
            </li>
          ))}
        </ul>
        {data.securityChecks?.length ? (
          <div className="grid md:grid-cols-2 gap-3 border-t border-white/10 pt-5">
            {data.securityChecks.map((c) => (
              <div key={c.id} className="rounded-xl border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`status-dot ${
                      c.status === "ok"
                        ? "status-ok"
                        : c.status === "warn"
                          ? "status-warn"
                          : "status-idle"
                    }`}
                  />
                  <p className="font-semibold text-sm">{c.label}</p>
                </div>
                <p className="muted text-sm leading-relaxed">{c.detail}</p>
              </div>
            ))}
          </div>
        ) : null}
        {data.suspiciousGuidance ? (
          <p className="mt-5 text-sm muted border-t border-white/10 pt-4">
            İncelemeniz önerilir. {data.suspiciousGuidance}{" "}
            <Link href="/instagram/guide" className="underline" style={{ color: "var(--accent)" }}>
              2FA rehberi
            </Link>
          </p>
        ) : null}
      </section>

      <section className="grid lg:grid-cols-2 gap-5">
        <div className="surface rounded-2xl p-6">
          <h2 className="display text-xl mb-4">Hesap bilgileri</h2>
          {data.account ? (
            <dl className="space-y-2 text-sm">
              {Object.entries(data.account)
                .filter(([k]) => k !== "fieldsFromApi")
                .map(([k, v]) =>
                  v === null || v === undefined ? null : (
                    <div
                      key={k}
                      className="flex justify-between gap-4 border-b border-white/10 py-2"
                    >
                      <dt className="muted">{labelKey(k)}</dt>
                      <dd className="text-right break-all font-medium">{formatValue(v)}</dd>
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
                  <span className="break-all">{p.permission}</span>
                  <span
                    className={`text-xs uppercase tracking-wide ${
                      p.status === "granted" ? "" : "muted"
                    }`}
                    style={p.status === "granted" ? { color: "var(--ok)" } : undefined}
                  >
                    {p.status === "granted" ? "Verildi" : p.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted text-sm">
              İzin listesi henüz yok. Bağlantı sonrası Meta’nın verdiği izinler burada
              görünür.
            </p>
          )}
        </div>
      </section>

      <section className="surface rounded-2xl p-6">
        <h2 className="display text-xl mb-4">Platformun vermediği bilgiler</h2>
        <p className="muted text-sm mb-4">
          Bunlar Meta API’de yoktur; uydurulmaz. Resmi Instagram ayarlarından kontrol edin.
        </p>
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
