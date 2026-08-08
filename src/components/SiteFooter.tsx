import Link from "next/link";
import { TolwexLogo } from "@/components/brand/TolwexLogo";

const LINKS = [
  { label: "Hizmetler", href: "/hizmetler" },
  { label: "Üye Girişi", href: "/uye/giris" },
  { label: "Kayıt Ol", href: "/uye/kayit" },
  { label: "Gizlilik", href: "/privacy" },
  { label: "Kullanım Koşulları", href: "/terms" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-inner">
        <div className="footer-brand">
          <TolwexLogo size="md" />
          <p className="footer-tag">Profesyonel SMM Panel</p>
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
