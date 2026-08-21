import type { Metadata } from "next";
import Link from "next/link";
import { GUIDE_ARTICLES } from "@/lib/guides";

export const metadata: Metadata = {
  title: "Yardımcı Makaleler",
  description:
    "Kapanan hesap, askıya alınan hesap, kullanıcı adı alma ve reklam süreçleri için pratik rehberler.",
};

export default function MakalelerPage() {
  return (
    <div className="guide-page">
      <div className="site-shell guide-hero">
        <p className="guide-kicker">Rehber</p>
        <h1 className="display">Yardımcı makaleler</h1>
        <p>Sosyal medya hesap sorunlarında ilk okuman gereken kısa notlar.</p>
      </div>
      <div className="site-shell guide-list">
        {GUIDE_ARTICLES.map((a) => (
          <article key={a.slug} className="guide-card">
            <div className="guide-tags">
              {a.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <h2>
              <Link href={`/makaleler/${a.slug}`}>{a.title}</Link>
            </h2>
            <p>{a.excerpt}</p>
            <Link href={`/makaleler/${a.slug}`} className="guide-read">
              Oku →
            </Link>
          </article>
        ))}
      </div>
      <div className="site-shell guide-cta">
        <Link href="/#kategoriler" className="btn btn-primary">
          Menülere dön
        </Link>
      </div>
    </div>
  );
}
