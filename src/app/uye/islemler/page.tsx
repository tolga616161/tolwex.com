"use client";

import { useEffect, useState } from "react";
import { MemberGate } from "@/components/smm/MemberGate";

type Tx = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  note: string;
  createdAt: string;
};

const TYPE_TR: Record<string, string> = {
  deposit: "Bakiye yükleme",
  coupon: "Kupon",
  order: "Sipariş",
  refund: "İade",
  adjust: "Düzeltme",
};

export default function MemberTransactionsPage() {
  const [items, setItems] = useState<Tx[]>([]);

  useEffect(() => {
    fetch("/api/member/transactions", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((t) => setItems(t?.items || []));
  }, []);

  return (
    <MemberGate>
      {() => (
        <div className="sp-page">
          <div className="sp-page-title">
            <h1>İşlem Geçmişi</h1>
            <p>Cüzdan hareketleri</p>
          </div>
          <div className="sp-card">
            <div className="sp-table-wrap">
              <table className="sp-table">
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
                      <td>{TYPE_TR[t.type] || t.type}</td>
                      <td style={{ color: t.amount >= 0 ? "#6ee7a8" : "#f87171" }}>
                        {t.amount >= 0 ? "+" : ""}
                        {t.amount.toFixed(2)} ₺
                      </td>
                      <td>{t.balanceAfter.toFixed(2)} ₺</td>
                      <td className="muted text-sm">{t.note || "—"}</td>
                      <td className="muted text-xs">
                        {new Date(t.createdAt).toLocaleString("tr-TR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {items.length === 0 ? (
                <p className="muted p-4 text-sm">Henüz işlem yok.</p>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </MemberGate>
  );
}
