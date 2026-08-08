import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-shell py-5 flex items-center justify-between gap-4">
      <Link href="/" className="display text-xl font-bold tracking-tight">
        Secure<span style={{ color: "var(--accent)" }}>Link</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm muted">
        <Link href="/instagram/security" className="hover:text-white transition-colors">
          Güvenlik Merkezi
        </Link>
        <Link href="/instagram/guide" className="hover:text-white transition-colors">
          2FA Rehberi
        </Link>
        <Link href="/admin" className="hover:text-white transition-colors">
          Admin
        </Link>
      </nav>
    </header>
  );
}
