"use client";

import { useEffect, useState } from "react";

type Service = {
  id: string;
  providerServiceId: number;
  name: string;
  category: string;
  rate: number;
  sellRate: number;
  min: number;
  max: number;
  active: boolean;
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [q, setQ] = useState("");

  async function load(query = q) {
    const sp = query ? `?q=${encodeURIComponent(query)}` : "";
    const d = await fetch(`/api/admin/services${sp}`).then((r) => (r.ok ? r.json() : null));
    setServices(d?.services || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle(id: string, active: boolean) {
    await fetch("/api/admin/services", {
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
          <h2>Servisler</h2>
          <p className="muted">{services.length} kayıt</p>
        </div>
      </div>
      <div className="admin-toolbar">
        <input
          placeholder="Ara…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && load()}
        />
        <button type="button" className="btn btn-ghost" onClick={() => load()}>
          Ara
        </button>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ad</th>
              <th>Kategori</th>
              <th>Alış</th>
              <th>Satış</th>
              <th>Min/Max</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {services.slice(0, 500).map((s) => (
              <tr key={s.id}>
                <td>{s.providerServiceId}</td>
                <td>{s.name}</td>
                <td>{s.category}</td>
                <td>{s.rate}</td>
                <td>{Number(s.sellRate).toFixed(2)}</td>
                <td>
                  {s.min}/{s.max}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => toggle(s.id, !s.active)}
                  >
                    {s.active ? "Pasif" : "Aktif"}
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
