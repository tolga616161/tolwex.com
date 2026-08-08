"use client";

export default function AdminContentsPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>İçerikler</h2>
          <p className="muted">Site içerik / rehber yönetimi</p>
        </div>
      </div>
      <div className="admin-ig-grid">
        {[
          { t: "Gizlilik", h: "/privacy" },
          { t: "Şartlar", h: "/terms" },
          { t: "Veri silme", h: "/data-deletion" },
          { t: "Güvenlik rehberi", h: "/instagram/guide" },
          { t: "Ürün kataloğu", h: "/urunler" },
        ].map((x) => (
          <a key={x.h} href={x.h} className="admin-ig-card" target="_blank" rel="noreferrer">
            <h3>{x.t}</h3>
            <p className="muted text-sm">{x.h}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
