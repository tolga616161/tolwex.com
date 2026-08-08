"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const NAV = [
  { href: "/uye", label: "Dashboard", exact: true },
  { href: "/uye/yeni-siparis", label: "Yeni Sipariş" },
  { href: "/uye/siparisler", label: "Siparişlerim" },
  { href: "/uye/servisler", label: "Servisler" },
  { href: "/uye/bakiye", label: "Bakiye Yükle" },
  { href: "/uye/islemler", label: "İşlem Geçmişi" },
  { href: "/uye/destek", label: "Destek" },
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
    <div className="member-panel site-shell py-8 pb-24">
      <div className="member-panel-grid">
        <aside className="member-sidebar glass-panel rounded-2xl p-4">
          <p className="section-kicker">TOLWEX SMM</p>
          <p className="display text-xl font-bold mb-1">{username}</p>
          <p className="muted text-xs mb-2">{email}</p>
          {typeof balance === "number" ? (
            <p className="member-balance mb-4">
              Bakiye: <strong>{balance.toFixed(2)} ₺</strong>
            </p>
          ) : null}
          <nav className="member-side-nav">
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`member-side-link ${active ? "is-active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button type="button" className="btn btn-ghost w-full mt-4" onClick={logout}>
            Çıkış Yap
          </button>
        </aside>
        <div className="member-panel-main">{children}</div>
      </div>
    </div>
  );
}
