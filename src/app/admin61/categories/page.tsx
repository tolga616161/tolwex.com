"use client";

import { useEffect, useState } from "react";

type Cat = { name: string; total: number; active: number };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Cat[]>([]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setCategories(d?.categories || []));
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Kategoriler</h2>
          <p className="muted">Servis kategorileri özeti</p>
        </div>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Kategori</th>
              <th>Toplam</th>
              <th>Aktif</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.name}>
                <td>{c.name}</td>
                <td>{c.total}</td>
                <td>{c.active}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
