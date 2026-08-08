"use client";

import { useEffect, useState } from "react";
import { MemberPanelShell } from "@/components/smm/MemberPanelShell";

type Me = { username: string; email: string; balance: number };
type Tx = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  note: string;
  createdAt: string;
};

export default function MemberTransactionsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [items, setItems] = useState<Tx[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/member/profile").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/member/transactions").then((r) => (r.ok ? r.json() : null)),
    ]).then(([p, t]) => {
      if (p?.member) {
        setMe({
          username: p.member.username,
          email: p.member.email,
          balance: p.member.balance,
        });
      }
      setItems(t?.items || []);
    });
  }, []);

  if (!me) return <div className="site-shell py-16 muted">Yükleniyor…</div>;

  return (
    <MemberPanelShell username={me.username} email={me.email} balance={me.balance}>
      <div className="member-page">
        <div className="section-head mb-6">
          <p className="section-kicker">İşlem Geçmişi</p>
          <h1 className="section-title">Cüzdan hareketleri</h1>
        </div>
        <div className="admin-table-wrap glass-panel rounded-2xl overflow-hidden">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tür</th>
                <th>Tutar</th>
                <th>Bakiye</th>
                <th>Not</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id}>
                  <td>{t.type}</td>
                  <td>{t.amount.toFixed(2)} ₺</td>
                  <td>{t.balanceAfter.toFixed(2)} ₺</td>
                  <td>{t.note}</td>
                  <td>{new Date(t.createdAt).toLocaleString("tr-TR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 ? <p className="muted p-4 text-sm">İşlem yok.</p> : null}
        </div>
      </div>
    </MemberPanelShell>
  );
}
