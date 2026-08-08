import Link from "next/link";
import { TolwexLogo } from "@/components/brand/TolwexLogo";

const LINKS = [
  { label: "Hizmetler", href: "/#hizmetler" },
  { label: "Güvenlik", href: "/#guvenlik" },
  { label: "Gizlilik", href: "/privacy" },
  { label: "Kullanım Koşulları", href: "/terms" },
  { label: "SSS", href: "/instagram/guide" },
  { label: "İletişim", href: "/instagram/connect" },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-shell footer-inner">
        <div className="footer-brand">
          <TolwexLogo size="md" />
          <p className="footer-tag">Social Intelligence & Digital Analytics</p>
        </div>
        <nav className="footer-links" aria-label="Footer">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="footer-social" aria-label="Sosyal">
          <span className="footer-social-icon" aria-hidden>
            IG
          </span>
          <span className="footer-social-icon" aria-hidden>
            X
          </span>
          <span className="footer-social-icon" aria-hidden>
            YT
          </span>
        </div>
      </div>
      <div className="site-shell footer-bottom">
        <p>© {new Date().getFullYear()} TOLWEX. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
}
