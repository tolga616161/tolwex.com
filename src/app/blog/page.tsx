import type { Metadata } from "next";
import Link from "next/link";
import { listPublishedPosts } from "@/lib/blog";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — SMM Panel Rehberleri",
  description:
    "Instagram takipçi, TikTok izlenme, YouTube büyüme ve güvenilir SMM panel rehberleri. TOLWEX blog.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: `Blog | ${SITE_NAME}`,
    description: "SMM panel ve sosyal medya büyüme rehberleri",
    url: absoluteUrl("/blog"),
    type: "website",
  },
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogIndexPage() {
  const posts = await listPublishedPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Blog`,
    url: absoluteUrl("/blog"),
    description: "SMM panel ve sosyal medya büyüme rehberleri",
    blogPost: posts.slice(0, 20).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: absoluteUrl(`/blog/${p.slug}`),
      datePublished: p.publishedAt || p.createdAt,
      description: p.excerpt,
    })),
  };

  return (
    <div className="blog-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="site-shell blog-hero">
        <p className="section-kicker">Blog</p>
        <h1 className="section-title">SMM ve sosyal medya rehberleri</h1>
        <p className="section-sub">
          Instagram, TikTok, YouTube ve güvenilir SMM panel kullanımı hakkında SEO uyumlu
          yazılar.
        </p>
      </div>

      <div className="site-shell blog-list">
        {posts.length === 0 ? (
          <p className="muted">Henüz yayınlanmış yazı yok.</p>
        ) : (
          posts.map((p) => (
            <article key={p.slug} className="blog-card">
              <div className="blog-card-meta">
                <time dateTime={p.publishedAt || p.createdAt}>
                  {formatDate(p.publishedAt || p.createdAt)}
                </time>
                {p.tags[0] ? <span className="blog-tag">{p.tags[0]}</span> : null}
              </div>
              <h2>
                <Link href={`/blog/${p.slug}`}>{p.title}</Link>
              </h2>
              <p>{p.excerpt}</p>
              <Link href={`/blog/${p.slug}`} className="blog-read">
                Devamını oku
              </Link>
            </article>
          ))
        )}
      </div>

      <div className="site-shell blog-cta">
        <p>Hizmetlere göz atın veya hemen üye olun.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/hizmetler" className="btn btn-ghost">
            Servisler
          </Link>
          <Link href="/uye/kayit" className="btn btn-primary">
            Üye ol
          </Link>
        </div>
      </div>
    </div>
  );
}
