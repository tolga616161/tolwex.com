"use client";

import Link from "next/link";
import { ACCOUNT_HELP_TOOLS } from "@/lib/account-help";

export function AccountHelpHub() {
  return (
    <div className="account-help-hub">
      <div className="sp-page-title">
        <h1>Hesap Kurtarma</h1>
        <p>
          Kapanan veya çalınan hesap · ne zaman oldu · sebep · görsel yükle · her şey WhatsApp’a
          gider
        </p>
      </div>

      <div className="account-help-grid">
        {ACCOUNT_HELP_TOOLS.map((t, i) => (
          <Link
            key={t.slug}
            href={`/uye/hesap-yardim/${t.slug}`}
            className="account-help-card security-topic-card"
          >
            <span className="account-help-num">Servis 0{i + 1}</span>
            <h2>{t.title}</h2>
            <p>{t.description}</p>
            <ul className="account-help-card-steps">
              {t.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <span className="account-help-go">Başvuruyu başlat →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
