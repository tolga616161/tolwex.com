"use client";

import { useEffect, useState } from "react";

type Acc = {
  id: string;
  username: string | null;
  profilePhoto: null;
  accountType: string | null;
  status: string;
  connectedAt: string;
  lastSync: string;
  analysisCount: number;
  connected: boolean;
};

export default function AdminInstagramPage() {
  const [accounts, setAccounts] = useState<Acc[]>([]);

  useEffect(() => {
    fetch("/api/admin/instagram-accounts")
      .then((r) => (r.ok ? r.json() : { accounts: [] }))
      .then((d) => setAccounts(d.accounts || []));
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Instagram Hesapları</h2>
          <p className="muted">Bağlanan hesaplar — access token gösterilmez.</p>
        </div>
      </div>

      <div className="admin-ig-grid">
        {accounts.length === 0 ? (
          <div className="admin-honest-empty">
            <h3>Henüz bağlı hesap yok</h3>
            <p>
              Kullanıcılar Meta OAuth ile bağlandığında burada gerçek kayıtlar görünür.
            </p>
          </div>
        ) : (
          accounts.map((a) => (
            <article key={a.id} className="admin-ig-card">
              <div className="admin-ig-avatar" aria-hidden>
                {(a.username || "?").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h3>@{a.username || "bilinmiyor"}</h3>
                <p className="muted text-sm">{a.accountType || "account"}</p>
                <ul className="admin-ig-meta">
                  <li>Bağlantı: {new Date(a.connectedAt).toLocaleString("tr-TR")}</li>
                  <li>Son senkron: {new Date(a.lastSync).toLocaleString("tr-TR")}</li>
                  <li>Durum: {a.status}</li>
                  <li>Analiz sayısı: {a.analysisCount}</li>
                </ul>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
