"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const NAV: Array<{ href: string; label: string; icon: string }> = [
  { href: "/admin61", label: "Dashboard", icon: "▣" },
  { href: "/admin61/users", label: "Kullanıcılar", icon: "◎" },
  { href: "/admin61/instagram", label: "Instagram Hesapları", icon: "◍" },
  { href: "/admin61/analyses", label: "Analizler", icon: "◫" },
  { href: "/admin61/analyses/profile-visits", label: "Profil Ziyaret Analizi", icon: "◉" },
  { href: "/admin61/analyses/blocking", label: "Engelleme Analizi", icon: "⊘" },
  { href: "/admin61/analyses/unfollowers", label: "Takipten Çıkanlar", icon: "↺" },
  { href: "/admin61/analyses/non-followers", label: "Takip Etmeyenler", icon: "⇄" },
  { href: "/admin61/analyses/fake-risk", label: "Fake Hesap Analizi", icon: "⚠" },
  { href: "/admin61/products", label: "Hizmetler", icon: "▤" },
  { href: "/admin61/contents", label: "İçerikler", icon: "☰" },
  { href: "/admin61/meta", label: "Meta Developer", icon: "⬡" },
  { href: "/admin61/api", label: "API Yönetimi", icon: "⚡" },
  { href: "/admin61/logs", label: "Sistem Logları", icon: "≡" },
  { href: "/admin61/notifications", label: "Bildirimler", icon: "✦" },
  { href: "/admin61/settings", label: "Ayarlar", icon: "⚙" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin/production-checklist").then(async (r) => {
      setAuthed(r.ok);
    });
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
          <p className="admin-brand">TOLWEX ADMIN</p>
          <h1>Yönetim girişi</h1>
          <p className="muted">Premium social intelligence kontrol paneli</p>
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
          <span className="admin-brand">TOLWEX</span>
          <span className="admin-brand-sub">ADMIN</span>
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
                <span className="admin-nav-icon" aria-hidden>
                  {item.icon}
                </span>
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
            <p className="admin-topbar-kicker">Social Intelligence Platform</p>
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
