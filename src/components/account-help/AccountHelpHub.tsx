"use client";

import Link from "next/link";
import { ACCOUNT_HELP_TOOLS } from "@/lib/account-help";

export function AccountHelpHub() {
  return (
    <div className="account-help-hub">
      <div className="sp-page-title">
        <h1>Hesap Yardım</h1>
        <p>Görsel yükle → kayıt açılsın → yardım merkezine yönlendirilirsin. 3 kategori:</p>
      </div>

      <div className="account-help-grid">
        {ACCOUNT_HELP_TOOLS.map((t, i) => (
          <Link
            key={t.slug}
            href={`/uye/hesap-yardim/${t.slug}`}
            className="account-help-card security-topic-card"
          >
            <span className="account-help-num">0{i + 1}</span>
            <h2>{t.title}</h2>
            <p>{t.description}</p>
            <span className="account-help-go">Görsel yükle →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
