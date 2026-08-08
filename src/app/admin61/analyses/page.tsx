"use client";

import Link from "next/link";
import { ANALYSIS_CATALOG } from "@/lib/analysis/honest";

function slug(type: string) {
  const map: Record<string, string> = {
    profile_visit: "profile-visits",
    blocking: "blocking",
    unfollowers: "unfollowers",
    non_followers: "non-followers",
    fake_risk: "fake-risk",
  };
  return map[type] || type;
}

export default function AnalysesIndexPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Analizler</h2>
          <p className="muted">Tüm analiz modülleri — sahte kullanıcı listesi yok.</p>
        </div>
      </div>
      <div className="admin-ig-grid">
        {ANALYSIS_CATALOG.map((a) => (
          <Link
            key={a.type}
            href={`/admin61/analyses/${slug(a.type)}`}
            className="admin-ig-card"
          >
            <div>
              <h3>{a.title}</h3>
              <p className="muted text-sm">{a.headline}</p>
              <p className="admin-badge" style={{ marginTop: 8 }}>
                {a.mode.toUpperCase()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
