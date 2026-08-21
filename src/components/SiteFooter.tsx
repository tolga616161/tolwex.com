"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TolwexLogo } from "@/components/brand/TolwexLogo";

const LINKS = [
  { label: "Kapanan hesap", href: "/basvuru/kapanan" },
  { label: "Askıya alınan", href: "/basvuru/aski" },
  { label: "Kullanıcı adı", href: "/basvuru/kullanici-adi" },
  { label: "Makaleler", href: "/makaleler" },
  { label: "Influencer", href: "/basvuru/influencer" },
  { label: "Reklam", href: "/basvuru/reklam-kisit" },
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
          <p className="footer-tag">Sosyal medya uzmanı · teknik çözümler</p>
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
