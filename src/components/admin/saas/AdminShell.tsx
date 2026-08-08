"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { TolwexLogo } from "@/components/brand/TolwexLogo";

const NAV: Array<{ href: string; label: string }> = [
  { href: "/admin61", label: "Dashboard" },
  { href: "/admin61/users", label: "Kullanıcılar" },
  { href: "/admin61/orders", label: "Sipariş Onay" },
  { href: "/admin61/services", label: "Servisler" },
  { href: "/admin61/categories", label: "Kategoriler" },
  { href: "/admin61/balance-requests", label: "Ödeme Bildirimleri" },
  { href: "/admin61/coupons", label: "Kuponlar" },
  { href: "/admin61/support", label: "Destek" },
  { href: "/admin61/api", label: "API Ayarları" },
  { href: "/admin61/settings", label: "Ayarlar" },
  { href: "/admin61/logs", label: "Loglar" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/login")
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Giriş başarısız");
      return;
    }
    setAuthed(true);
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
  }

  if (authed === null) {
    return (
      <div className="admin-saas">
        <div className="admin-loading">Yükleniyor…</div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="admin-saas admin-login-wrap">
        <form onSubmit={login} className="admin-login-card">
          <div className="admin-brand-logo mb-3">
            <TolwexLogo size="md" />
          </div>
          <p className="admin-brand">ADMIN</p>
          <h1>Yönetim girişi</h1>
          <p className="muted">SMM panel kontrol merkezi</p>
          <label htmlFor="admin-pw">Şifre</label>
          <input
            id="admin-pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            autoFocus
            required
          />
          {error ? <p className="admin-error">{error}</p> : null}
          <button type="submit" className="btn btn-primary">
            Giriş Yap
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-saas">
      <button
        type="button"
        className="admin-nav-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menü"
      >
        ☰
      </button>
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <div className="admin-sidebar-head">
          <TolwexLogo size="sm" />
          <span className="admin-brand-sub">SMM ADMIN</span>
        </div>
        <nav className="admin-nav">
          {NAV.map((item) => {
            const active =
              item.href === "/admin61"
                ? pathname === "/admin61"
                : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav-link ${active ? "active" : ""}`}
                onClick={() => setOpen(false)}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="admin-sidebar-foot">
          <Link href="/" className="admin-nav-link">
            ← Siteye dön
          </Link>
          <button type="button" className="admin-nav-link" onClick={logout}>
            Çıkış
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="admin-topbar-kicker">TOLWEX SMM Panel</p>
            <h1 className="admin-topbar-title">Kontrol Merkezi</h1>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </div>
      {open ? (
        <button
          type="button"
          className="admin-backdrop"
          aria-label="Kapat"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
