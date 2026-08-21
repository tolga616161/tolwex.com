import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, GUIDE_ARTICLES } from "@/lib/guides";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return GUIDE_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const a = getGuide(slug);
  if (!a) return { title: "Makale" };
  return { title: a.title, description: a.excerpt };
}

export default async function MakaleDetailPage({ params }: Props) {
  const { slug } = await params;
  const a = getGuide(slug);
  if (!a) notFound();

  const wa = whatsappUrl(
    `Merhaba, TOLWEX Sosyal Medya Uzmanı — “${a.title}” hakkında bilgi almak istiyorum.`
  );

  return (
    <article className="guide-page guide-article">
      <div className="site-shell guide-article-head">
        <nav className="guide-crumb" aria-label="Breadcrumb">
          <Link href="/">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/makaleler">Makaleler</Link>
        </nav>
        <div className="guide-tags">
          {a.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <h1 className="display">{a.title}</h1>
        <p className="guide-dek">{a.excerpt}</p>
      </div>
      <div className="site-shell guide-body">
        {a.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
        <p className="guide-cta-note">
          Bu yazı genel bilgilendirmedir. Senin durumuna özel adımlar için{" "}
          <strong>TOLWEX Sosyal Medya Uzmanı</strong>’ndan bilgi al — {CONTACT_PHONE_DISPLAY}
        </p>
      </div>
      <div className="site-shell guide-article-foot">
        {a.relatedHref ? (
          <Link href={a.relatedHref} className="btn btn-ghost">
            Başvuru formu →
          </Link>
        ) : null}
        <a href={wa} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
          WhatsApp’tan bilgi al
        </a>
        <Link href="/makaleler" className="btn btn-ghost">
          Tüm makaleler
        </Link>
      </div>
    </article>
  );
}
