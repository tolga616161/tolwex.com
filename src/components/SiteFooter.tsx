import Link from "next/link";
import { CONTACT_PHONE_DISPLAY, telUrl, whatsappUrl } from "@/lib/contact";

export function SiteFooter() {
  return (
    <footer className="site-shell py-10 mt-8 border-t border-white/10 text-sm muted">
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <p>
            TOL<span style={{ color: "var(--accent)" }}>WEX</span> — Dijital
            itibar & Instagram güvenlik
          </p>
          <p className="mt-2">
            WhatsApp / Tel:{" "}
            <a href={telUrl()} className="underline" style={{ color: "var(--ink)" }}>
              {CONTACT_PHONE_DISPLAY}
            </a>
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/urunler">Hizmetler</Link>
          <Link href="/urunler/eski-tarihli-hesaplar">Eski Hesaplar</Link>
          <Link href="/urunler/kapanan-hesap-aktif-etme">Hesap Aktif Etme</Link>
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
            WhatsApp
          </a>
          <Link href="/privacy">Gizlilik</Link>
          <Link href="/terms">Koşullar</Link>
        </div>
      </div>
    </footer>
  );
}
