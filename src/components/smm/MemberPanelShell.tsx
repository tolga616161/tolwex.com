"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { TolwexLogo } from "@/components/brand/TolwexLogo";

const NAV = [
  { href: "/uye", label: "Yeni Sipariş", exact: true },
  { href: "/uye/siparisler", label: "Siparişlerim" },
  { href: "/uye/servisler", label: "Servisler" },
  { href: "/uye/bakiye", label: "Bakiye Yükle" },
  { href: "/uye/islemler", label: "İşlemler" },
  { href: "/uye/istatistik", label: "İstatistik" },
  { href: "/uye/destek", label: "Destek" },
  { href: "/uye/api", label: "API" },
  { href: "/uye/profil", label: "Profil" },
];

export function MemberPanelShell({
  children,
  username,
  email,
  balance,
}: {
  children: ReactNode;
  username: string;
  email: string;
  balance?: number;
}) {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE", credentials: "same-origin" });
    window.location.href = "/uye/giris";
  }

  return (
    <div className="sp-shell">
      <header className="sp-topbar">
        <div className="sp-topbar-inner">
          <Link href="/uye" className="sp-brand" aria-label="TOLWEX Panel">
            <TolwexLogo size="sm" />
          </Link>
          <div className="sp-top-meta">
            {typeof balance === "number" ? (
              <Link href="/uye/bakiye" className="sp-balance-pill" title="Bakiye yükle">
                {balance.toFixed(2)} ₺
              </Link>
            ) : null}
            <Link href="/uye/profil" className="sp-user" title={email}>
              {username}
            </Link>
            <button type="button" className="sp-logout" onClick={logout}>
              Çıkış
            </button>
          </div>
        </div>
        <nav className="sp-nav">
          {NAV.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sp-nav-link ${active ? "is-active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="sp-main">{children}</main>
    </div>
  );
}
