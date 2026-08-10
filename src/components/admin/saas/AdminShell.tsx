"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { TolwexLogo } from "@/components/brand/TolwexLogo";
import { AdminErrorBoundary } from "@/components/admin/saas/AdminErrorBoundary";

const NAV_GROUPS: Array<{
  label: string;
  items: Array<{ href: string; label: string; badgeKey?: "pendingBalance" | "openTickets" | "pendingOrders" }>;
}> = [
  {
    label: "Genel",
    items: [
      { href: "/admin61", label: "Dashboard" },
      { href: "/admin61/muhasebe", label: "Muhasebe" },
      { href: "/admin61/trafik", label: "Trafik / IP" },
    ],
  },
  {
    label: "Operasyon",
    items: [
      { href: "/admin61/orders", label: "Sipariş Onay", badgeKey: "pendingOrders" },
      { href: "/admin61/balance-requests", label: "Ödeme Bildirimleri", badgeKey: "pendingBalance" },
      { href: "/admin61/support", label: "Destek", badgeKey: "openTickets" },
      { href: "/admin61/users", label: "Kullanıcılar" },
    ],
  },
  {
    label: "Katalog",
    items: [
      { href: "/admin61/services", label: "Servisler" },
      { href: "/admin61/categories", label: "Kategoriler" },
      { href: "/admin61/coupons", label: "Kuponlar" },
    ],
  },
  {
    label: "İçerik",
    items: [{ href: "/admin61/blog", label: "Blog" }],
  },
  {
    label: "Sistem",
    items: [
      { href: "/admin61/api", label: "API Ayarları" },
      { href: "/admin61/settings", label: "Ayarlar" },
      { href: "/admin61/logs", label: "Loglar" },
    ],
  },
];

const TITLE_BY_PATH: Record<string, string> = {
  "/admin61": "Dashboard",
  "/admin61/muhasebe": "Muhasebe",
  "/admin61/trafik": "Trafik / IP",
  "/admin61/users": "Kullanıcılar",
  "/admin61/orders": "Sipariş Onay",
  "/admin61/services": "Servisler",
  "/admin61/categories": "Kategoriler",
  "/admin61/balance-requests": "Ödeme Bildirimleri",
  "/admin61/coupons": "Kuponlar",
  "/admin61/support": "Destek",
  "/admin61/api": "API Ayarları",
  "/admin61/settings": "Ayarlar",
  "/admin61/blog": "Blog",
  "/admin61/logs": "Loglar",
};

type AlertStats = {
  pendingBalance: number;
  openTickets: number;
  pendingOrders: number;
};

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/admin61";
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertStats>({
    pendingBalance: 0,
    openTickets: 0,
    pendingOrders: 0,
  });

  const pageTitle = useMemo(() => {
    if (TITLE_BY_PATH[pathname]) return TITLE_BY_PATH[pathname];
    const hit = Object.keys(TITLE_BY_PATH).find(
      (k) => k !== "/admin61" && pathname.startsWith(k)
    );
    return hit ? TITLE_BY_PATH[hit] : "Kontrol Merkezi";
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/login")
      .then((r) => {
        if (!cancelled) setAuthed(r.ok);
      })
      .catch(() => {
        if (!cancelled) setAuthed(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    const load = () => {
      fetch("/api/admin/stats")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (cancelled || !d) return;
          setAlerts({
            pendingBalance: Number(d.pendingBalance) || 0,
            openTickets: Number(d.openTickets) || 0,
            pendingOrders: Number(d.pendingOrders) || 0,
          });
        })
        .catch(() => {});
    };
    load();
    const id = window.setInterval(load, 45_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [authed]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
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
      setPassword("");
    } catch {
      setError("Bağlantı hatası — tekrar deneyin");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
    } catch {
      /* ignore */
    }
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
          <p className="muted">TOLWEX kontrol merkezi</p>
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
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Giriş yapılıyor…" : "Giriş Yap"}
          </button>
        </form>
      </div>
    );
  }

  const attention =
    alerts.pendingBalance + alerts.openTickets + alerts.pendingOrders;

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
          <span className="admin-brand-sub">KONTROL</span>
        </div>
        <nav className="admin-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="admin-nav-group">
              <p className="admin-nav-group-label">{group.label}</p>
              {group.items.map((item) => {
                const active =
                  item.href === "/admin61"
                    ? pathname === "/admin61"
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                const badge = item.badgeKey ? alerts[item.badgeKey] : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`admin-nav-link ${active ? "active" : ""}`}
                    onClick={() => setOpen(false)}
                  >
                    <span>{item.label}</span>
                    {badge > 0 ? <span className="admin-nav-badge">{badge}</span> : null}
                  </Link>
                );
              })}
            </div>
          ))}
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
            <p className="admin-topbar-kicker">TOLWEX Admin</p>
            <h1 className="admin-topbar-title">{pageTitle}</h1>
          </div>
          <div className="admin-topbar-meta">
            {attention > 0 ? (
              <span className="admin-pill tone-warn">{attention} bekleyen</span>
            ) : (
              <span className="admin-pill tone-ok">Güncel</span>
            )}
          </div>
        </header>
        <div className="admin-content">
          <AdminErrorBoundary key={pathname}>{children}</AdminErrorBoundary>
        </div>
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
