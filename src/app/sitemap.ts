import type { MetadataRoute } from "next";
import { listPublishedPosts } from "@/lib/blog";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const routes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"];
    priority: number;
  }> = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/hizmetler", changeFrequency: "hourly", priority: 0.95 },
    { path: "/blog", changeFrequency: "daily", priority: 0.9 },
    { path: "/uye/kayit", changeFrequency: "weekly", priority: 0.85 },
    { path: "/uye/giris", changeFrequency: "weekly", priority: 0.8 },
    { path: "/sss", changeFrequency: "monthly", priority: 0.7 },
    { path: "/terms", changeFrequency: "monthly", priority: 0.5 },
    { path: "/privacy", changeFrequency: "monthly", priority: 0.5 },
  ];

  const staticEntries = routes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await listPublishedPosts();
    blogEntries = posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt || p.publishedAt || p.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));
  } catch {
    blogEntries = [];
  }

  return [...staticEntries, ...blogEntries];
}
