"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { TolwexLogo } from "@/components/brand/TolwexLogo";

const NAV = [
  { href: "/uye", label: "Dashboard", exact: true },
  { href: "/uye/yeni-siparis", label: "Yeni Sipariş" },
  { href: "/uye/siparisler", label: "Siparişlerim" },
  { href: "/uye/servisler", label: "Servisler" },
  { href: "/uye/bakiye", label: "Bakiye Yükle" },
  { href: "/uye/islemler", label: "İşlem Geçmişi" },
  { href: "/uye/destek", label: "Destek" },
  { href: "/uye/sss", label: "SSS" },
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
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/uye/giris");
    router.refresh();
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
              <span className="sp-balance-pill">{balance.toFixed(2)} ₺</span>
            ) : null}
            <span className="sp-user">{username}</span>
            <button type="button" className="sp-logout" onClick={logout}>
              Çıkış Yap
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
      <main className="sp-main">
        <p className="sp-email-hint muted">{email}</p>
        {children}
      </main>
    </div>
  );
}
