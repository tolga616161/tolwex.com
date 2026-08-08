import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-shell py-10 mt-16 border-t border-white/10 text-sm muted">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <p>SecureLink — Resmi Meta OAuth ile Instagram bağlantısı</p>
        <div className="flex flex-wrap gap-4">
          <Link href="/privacy">Gizlilik</Link>
          <Link href="/terms">Koşullar</Link>
          <Link href="/data-deletion">Veri Silme</Link>
        </div>
      </div>
    </footer>
  );
}
