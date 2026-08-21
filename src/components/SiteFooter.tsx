"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TolwexLogo } from "@/components/brand/TolwexLogo";

const LINKS = [
  { label: "Kapanan hesaplar", href: "/basvuru/kapanan" },
  { label: "Çalınan hesaplar", href: "/basvuru/calinan" },
  { label: "Fake Hesaplar", href: "/basvuru/fake-kapatma" },
  { label: "Fake Hesap Tespiti", href: "/basvuru/fake-tespit" },
  { label: "Kısıtlanan reklam", href: "/basvuru/reklam-kisit" },
  { label: "Makaleler", href: "/makaleler" },
  { label: "Gizlilik", href: "/privacy" },
  { label: "Kullanım Koşulları", href: "/terms" },
];

export function SiteFooter() {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/admin61")) return null;

  return (
    <footer className="site-footer">
      <div className="site-shell footer-inner">
        <div className="footer-brand">
          <TolwexLogo size="md" />
          <p className="footer-tag">TOLWEX Sosyal Medya Uzmanı · 2020’den beri</p>
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
        <p>© 2020 TOLWEX Sosyal Medya Uzmanı. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
}
