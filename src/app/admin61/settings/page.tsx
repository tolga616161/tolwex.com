"use client";

import Link from "next/link";

export default function AdminSettingsPage() {
  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <div>
          <h2>Ayarlar</h2>
          <p className="muted">Sistem ve entegrasyon ayarları</p>
        </div>
      </div>
      <div className="admin-two-col">
        <div className="admin-panel">
          <h3>Entegrasyonlar</h3>
          <ul className="admin-usage-list">
            <li>
              <span>Meta Developer</span>
              <Link href="/admin61/meta">Aç</Link>
            </li>
            <li>
              <span>Hizmetler / ürünler</span>
              <Link href="/admin61/products">Aç</Link>
            </li>
            <li>
              <span>Kurulum sihirbazı</span>
              <Link href="/admin61/setup">Aç</Link>
            </li>
          </ul>
        </div>
        <div className="admin-panel">
          <h3>Güvenlik</h3>
          <p className="muted text-sm">
            Admin şifresi <code>ADMIN_PASSWORD</code> env ile yönetilir. Access token’lar
            AES-GCM ile şifreli saklanır ve UI’da asla gösterilmez.
          </p>
        </div>
      </div>
    </div>
  );
}
