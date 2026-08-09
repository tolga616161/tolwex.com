import { PrismaClient } from "@prisma/client";
import { createTtlGate } from "@/lib/ttl-cache";

const BLOGS_FILE = "blogs.json";
const pullGate = createTtlGate(60_000);

export type DurableBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  author: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

function syncConfig() {
  const gistId = process.env.DB_GIST_ID || "";
  const token = process.env.DB_SYNC_TOKEN || process.env.GITHUB_TOKEN || "";
  return { gistId, token, enabled: Boolean(gistId && token) };
}

function gistHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "tolwex-blog-sync",
  };
}

function newClient() {
  return new PrismaClient({ log: ["error"] });
}

async function readBlogsFromGist(
  gistId: string,
  token: string
): Promise<{ ok: true; list: DurableBlogPost[] } | { ok: false; error: string }> {
  const metaRes = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: gistHeaders(token),
    cache: "no-store",
  });
  if (!metaRes.ok) return { ok: false, error: `gist meta ${metaRes.status}` };

  const meta = (await metaRes.json()) as {
    files?: Record<string, { raw_url?: string; content?: string }>;
  };
  const file = meta.files?.[BLOGS_FILE];
  if (!file) return { ok: true, list: [] };

  let text = file.content || "[]";
  if (file.raw_url) {
    const rawRes = await fetch(file.raw_url, {
      headers: gistHeaders(token),
      cache: "no-store",
    });
    if (rawRes.ok) text = await rawRes.text();
  }
  if (!text.trim()) return { ok: true, list: [] };

  try {
    const list = JSON.parse(text) as DurableBlogPost[];
    if (!Array.isArray(list)) return { ok: false, error: "blogs.json bozuk" };
    return { ok: true, list };
  } catch {
    return { ok: false, error: "blogs.json parse hatası" };
  }
}

async function writeBlogsToGist(
  gistId: string,
  token: string,
  list: DurableBlogPost[]
): Promise<{ ok: boolean; count: number; error?: string }> {
  const body = JSON.stringify({
    files: {
      [BLOGS_FILE]: { content: JSON.stringify(list) },
    },
  });

  let lastError = "";
  for (let attempt = 0; attempt < 4; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, 250 * attempt * attempt));
    }
    const res = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: "PATCH",
      headers: {
        ...gistHeaders(token),
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body,
    });
    if (res.ok) return { ok: true, count: list.length };
    const t = await res.text().catch(() => "");
    lastError = `gist ${res.status} ${t.slice(0, 160)}`;
  }
  return { ok: false, count: 0, error: lastError || "gist yazılamadı" };
}

export async function pullBlogsFromGist(): Promise<{ ok: boolean; count: number; error?: string }> {
  const { gistId, token, enabled } = syncConfig();
  if (!enabled) return { ok: true, count: 0 };

  if (!pullGate.shouldRun()) {
    return { ok: true, count: 0 };
  }

  const remote = await readBlogsFromGist(gistId, token);
  if (!remote.ok) return { ok: false, count: 0, error: remote.error };
  if (remote.list.length === 0) return { ok: true, count: 0 };

  const db = newClient();
  try {
    for (const p of remote.list) {
      if (!p.slug || !p.title) continue;
      await db.blogPost.upsert({
        where: { slug: p.slug },
        create: {
          id: p.id || undefined,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt || "",
          content: p.content || "",
          coverImage: p.coverImage || "",
          tags: JSON.stringify(Array.isArray(p.tags) ? p.tags : []),
          seoTitle: p.seoTitle || p.title,
          seoDescription: p.seoDescription || p.excerpt || "",
          author: p.author || "TOLWEX",
          published: Boolean(p.published),
          publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
          createdAt: p.createdAt ? new Date(p.createdAt) : undefined,
        },
        update: {
          title: p.title,
          excerpt: p.excerpt || "",
          content: p.content || "",
          coverImage: p.coverImage || "",
          tags: JSON.stringify(Array.isArray(p.tags) ? p.tags : []),
          seoTitle: p.seoTitle || p.title,
          seoDescription: p.seoDescription || p.excerpt || "",
          author: p.author || "TOLWEX",
          published: Boolean(p.published),
          publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
        },
      });
    }
    return { ok: true, count: remote.list.length };
  } catch (e) {
    return { ok: false, count: 0, error: e instanceof Error ? e.message : "pull failed" };
  } finally {
    await db.$disconnect();
  }
}

export async function pushBlogsToGist(): Promise<{ ok: boolean; count: number; error?: string }> {
  const { gistId, token, enabled } = syncConfig();
  if (!enabled) return { ok: true, count: 0 };

  const db = newClient();
  try {
    const rows = await db.blogPost.findMany({ orderBy: { updatedAt: "desc" } });
    const list: DurableBlogPost[] = rows.map((r) => {
      let tags: string[] = [];
      try {
        const parsed = JSON.parse(r.tags || "[]");
        tags = Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        tags = [];
      }
      return {
        id: r.id,
        slug: r.slug,
        title: r.title,
        excerpt: r.excerpt,
        content: r.content,
        coverImage: r.coverImage,
        tags,
        seoTitle: r.seoTitle,
        seoDescription: r.seoDescription,
        author: r.author,
        published: r.published,
        publishedAt: r.publishedAt?.toISOString() ?? null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      };
    });
    return writeBlogsToGist(gistId, token, list);
  } catch (e) {
    return { ok: false, count: 0, error: e instanceof Error ? e.message : "push failed" };
  } finally {
    await db.$disconnect();
  }
}
