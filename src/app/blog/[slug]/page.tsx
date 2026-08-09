import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, listPublishedPosts, renderBlogHtml } from "@/lib/blog";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Yazı bulunamadı" };

  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const url = absoluteUrl(`/blog/${post.slug}`);

  return {
    title,
    description,
    keywords: post.tags,
    authors: [{ name: post.author || SITE_NAME }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "tr_TR",
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author || SITE_NAME],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const html = renderBlogHtml(post.content);
  const others = (await listPublishedPosts()).filter((p) => p.slug !== post.slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: post.author || SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/icon.png"),
      },
    },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    keywords: post.tags.join(", "),
    inLanguage: "tr-TR",
  };

  return (
    <article className="blog-page blog-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="site-shell blog-article-head">
        <nav className="blog-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/blog">Blog</Link>
          <span>/</span>
          <span aria-current="page">{post.title}</span>
        </nav>
        <p className="section-kicker">{post.tags[0] || "Blog"}</p>
        <h1 className="section-title">{post.title}</h1>
        <p className="blog-article-meta">
          <span>{post.author}</span>
          <span>·</span>
          <time dateTime={post.publishedAt || post.createdAt}>
            {formatDate(post.publishedAt || post.createdAt)}
          </time>
        </p>
        {post.excerpt ? <p className="blog-article-dek">{post.excerpt}</p> : null}
      </div>

      <div
        className="site-shell blog-prose"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="site-shell blog-article-foot">
        <div className="blog-tags">
          {post.tags.map((t) => (
            <span key={t} className="blog-tag">
              {t}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-6">
          <Link href="/blog" className="btn btn-ghost">
            Tüm yazılar
          </Link>
          <Link href="/uye/kayit" className="btn btn-primary">
            TOLWEX’e üye ol
          </Link>
        </div>
      </div>

      {others.length > 0 ? (
        <div className="site-shell blog-related">
          <h2>İlgili yazılar</h2>
          <div className="blog-related-grid">
            {others.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="blog-related-item">
                <strong>{p.title}</strong>
                <span>{p.excerpt}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
