"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TolwexLogo } from "@/components/brand/TolwexLogo";

const LINKS = [
  { label: "Hizmetler", href: "/hizmetler" },
  { label: "Blog", href: "/blog" },
  { label: "İade Koşulları", href: "/sss" },
  { label: "Üye Girişi", href: "/uye/giris" },
  { label: "Kayıt Ol", href: "/uye/kayit" },
  { label: "Gizlilik", href: "/privacy" },
  { label: "Kullanım Koşulları", href: "/terms" },
  { label: "Sitemap", href: "/sitemap.xml" },
];

export function SiteFooter() {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/admin61")) return null;
  if (
    pathname.startsWith("/uye") &&
    !pathname.startsWith("/uye/giris") &&
    !pathname.startsWith("/uye/kayit") &&
    !pathname.startsWith("/uye/dogrula")
  ) {
    return null;
  }

  return (
    <footer className="site-footer">
      <div className="site-shell footer-inner">
        <div className="footer-brand">
          <TolwexLogo size="md" />
          <p className="footer-tag">Dijitalde sorunlarını birlikte çözüyoruz</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="site-shell footer-bottom">
        <p>© {new Date().getFullYear()} TOLWEX. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
}
