"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const NAV = [
  { href: "/uye", label: "Yeni Sipariş", exact: true },
  { href: "/uye/servisler", label: "Servisler" },
  { href: "/uye/siparisler", label: "Siparişlerim" },
];

export function MemberPanelShell({
  children,
  username,
  email,
}: {
  children: ReactNode;
  username: string;
  email: string;
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
          <p className="section-kicker">Üye paneli</p>
          <p className="display text-xl font-bold mb-1">{username}</p>
          <p className="muted text-xs mb-4">{email}</p>
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
            Çıkış
          </button>
        </aside>
        <div className="member-panel-main">{children}</div>
      </div>
    </div>
  );
}
