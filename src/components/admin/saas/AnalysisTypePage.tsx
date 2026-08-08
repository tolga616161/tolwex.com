"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HonestEmpty } from "@/components/admin/saas/AdminWidgets";
import { ANALYSIS_CATALOG } from "@/lib/analysis/honest";

export function AnalysisTypePage({ type }: { type: string }) {
  const meta = ANALYSIS_CATALOG.find((a) => a.type === type);
  const [runs, setRuns] = useState<Array<Record<string, unknown>>>([]);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    const res = await fetch(`/api/admin/analyses?type=${type}`);
    if (!res.ok) return;
    const data = await res.json();
    setRuns(data.runs || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  async function start() {
    setMsg(null);
    const res = await fetch("/api/admin/analyses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsg(data.error || "Hata");
      return;
    }
    setMsg("Kayıt oluşturuldu — API liste vermediği için sahte sonuç yok.");
    await load();
  }

  if (!meta) return <p>Geçersiz analiz</p>;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>{meta.title}</h2>
          <p className="muted">{meta.headline}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={start}>
          Analiz kaydı oluştur
        </button>
      </div>

      <HonestEmpty
        title={meta.headline}
        explanation={meta.explanation}
        bullets={[...meta.whatWeShow, ...meta.whatWeNeverShow.map((x) => `✗ ${x}`)]}
      />

      {msg ? <p className="admin-msg">{msg}</p> : null}

      <div className="admin-panel mt-6">
        <h3>Çalıştırma kayıtları</h3>
        {runs.length === 0 ? (
          <p className="muted text-sm">Henüz kayıt yok.</p>
        ) : (
          <ul className="admin-usage-list">
            {runs.map((r) => (
              <li key={String(r.id)}>
                <span>
                  {String(r.status)} · {String(r.mode)} · {String(r.summary)}
                </span>
                <strong>{new Date(String(r.createdAt)).toLocaleString("tr-TR")}</strong>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="muted text-sm mt-4">
        Public sayfa:{" "}
        <Link href={publicPath(type)} className="underline">
          {publicPath(type)}
        </Link>
      </p>
    </div>
  );
}

function publicPath(type: string) {
  const map: Record<string, string> = {
    profile_visit: "/analiz/profilime-kim-bakti",
    blocking: "/analiz/beni-engelleyenler",
    unfollowers: "/analiz/takipten-cikanlar",
    non_followers: "/analiz/takip-etmeyenler",
    fake_risk: "/analiz/fake-hesap",
  };
  return map[type] || "/instagram/dashboard";
}
