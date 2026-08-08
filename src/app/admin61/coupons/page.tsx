"use client";

import { FormEvent, useEffect, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  amount: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("50");
  const [maxUses, setMaxUses] = useState("10");

  async function load() {
    const d = await fetch("/api/admin/coupons").then((r) => (r.ok ? r.json() : null));
    setCoupons(d?.coupons || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        amount: Number(amount),
        maxUses: Number(maxUses),
      }),
    });
    setCode("");
    load();
  }

  async function toggle(id: string, active: boolean) {
    await fetch("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, active }),
    });
    load();
  }

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Kuponlar</h2>
          <p className="muted">Bakiye kuponları</p>
        </div>
      </div>

      <form onSubmit={create} className="admin-panel grid gap-3 mb-6 max-w-md">
        <input
          placeholder="Kod"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Tutar"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Max kullanım"
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
          required
        />
        <button type="submit" className="btn btn-primary">
          Kupon oluştur
        </button>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Kod</th>
              <th>Tutar</th>
              <th>Kullanım</th>
              <th>Durum</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id}>
                <td>
                  <code>{c.code}</code>
                </td>
                <td>{c.amount.toFixed(2)} ₺</td>
                <td>
                  {c.usedCount}/{c.maxUses}
                </td>
                <td>{c.active ? "aktif" : "pasif"}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => toggle(c.id, !c.active)}
                  >
                    {c.active ? "Pasifleştir" : "Aktifleştir"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
