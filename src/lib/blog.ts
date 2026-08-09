import { prisma } from "@/lib/db";
import { BLOG_SEED } from "@/lib/blog-seed";
import { pullBlogsFromGist, pushBlogsToGist } from "@/lib/blog-durable";

export type BlogSeedInput = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  coverImage?: string;
};

export type BlogPostPublic = {
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

export function slugify(input: string): string {
  return input
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseTags(raw: string): string[] {
  try {
    const v = JSON.parse(raw || "[]");
    return Array.isArray(v) ? v.map(String).filter(Boolean).slice(0, 12) : [];
  } catch {
    return [];
  }
}

export function toPublic(row: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  tags: string;
  seoTitle: string;
  seoDescription: string;
  author: string;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): BlogPostPublic {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.coverImage || "",
    tags: parseTags(row.tags),
    seoTitle: row.seoTitle || row.title,
    seoDescription: row.seoDescription || row.excerpt,
    author: row.author || "TOLWEX",
    published: row.published,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Minimal markdown → safe HTML for blog bodies. */
export function renderBlogHtml(md: string): string {
  const escaped = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = escaped.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inUl = false;
  let inTable = false;

  const closeUl = () => {
    if (inUl) {
      out.push("</ul>");
      inUl = false;
    }
  };
  const closeTable = () => {
    if (inTable) {
      out.push("</tbody></table>");
      inTable = false;
    }
  };

  const inline = (s: string) =>
    s
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
        const safe = String(href).startsWith("/") || String(href).startsWith("https://")
          ? href
          : "#";
        return `<a href="${safe}">${label}</a>`;
      })
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      closeUl();
      closeTable();
      continue;
    }

    if (line.startsWith("|") && line.endsWith("|")) {
      closeUl();
      const cells = line
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) continue;
      if (!inTable) {
        out.push("<table><tbody>");
        inTable = true;
        out.push(`<tr>${cells.map((c) => `<th>${inline(c)}</th>`).join("")}</tr>`);
      } else {
        out.push(`<tr>${cells.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`);
      }
      continue;
    }

    closeTable();

    if (line.startsWith("### ")) {
      closeUl();
      out.push(`<h3>${inline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith("## ")) {
      closeUl();
      out.push(`<h2>${inline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!inUl) {
        out.push("<ul>");
        inUl = true;
      }
      out.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      closeUl();
      out.push(`<p>${inline(line.replace(/^\d+\.\s/, ""))}</p>`);
      continue;
    }

    closeUl();
    out.push(`<p>${inline(line.trim())}</p>`);
  }
  closeUl();
  closeTable();
  return out.join("\n");
}

function rowFromSeed(s: BlogSeedInput) {
  const now = new Date();
  return {
    slug: s.slug,
    title: s.title,
    excerpt: s.excerpt,
    content: s.content,
    coverImage: s.coverImage || "",
    tags: JSON.stringify(s.tags),
    seoTitle: s.seoTitle,
    seoDescription: s.seoDescription,
    author: "TOLWEX",
    published: true,
    publishedAt: now,
  };
}

export async function ensureBlogSeeded(): Promise<void> {
  try {
    await pullBlogsFromGist();
  } catch {
    // gist optional in local/dev
  }

  const count = await prisma.blogPost.count();
  if (count > 0) return;

  for (const s of BLOG_SEED) {
    await prisma.blogPost.upsert({
      where: { slug: s.slug },
      create: rowFromSeed(s),
      update: {},
    });
  }
  try {
    await pushBlogsToGist();
  } catch {
    // ignore
  }
}

export async function listPublishedPosts(): Promise<BlogPostPublic[]> {
  await ensureBlogSeeded();
  const rows = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
  return rows.map(toPublic);
}

export async function listAllPosts(): Promise<BlogPostPublic[]> {
  await ensureBlogSeeded();
  const rows = await prisma.blogPost.findMany({
    orderBy: [{ updatedAt: "desc" }],
  });
  return rows.map(toPublic);
}

export async function getPostBySlug(
  slug: string,
  opts?: { includeDraft?: boolean }
): Promise<BlogPostPublic | null> {
  await ensureBlogSeeded();
  const row = await prisma.blogPost.findUnique({ where: { slug } });
  if (!row) return null;
  if (!row.published && !opts?.includeDraft) return null;
  return toPublic(row);
}

export async function getPostById(id: string): Promise<BlogPostPublic | null> {
  const row = await prisma.blogPost.findUnique({ where: { id } });
  return row ? toPublic(row) : null;
}

export type BlogWriteInput = {
  slug?: string;
  title: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  tags?: string[] | string;
  seoTitle?: string;
  seoDescription?: string;
  author?: string;
  published?: boolean | string;
};

function normalizeTags(tags?: string[] | string): string {
  if (Array.isArray(tags)) return JSON.stringify(tags.map(String).slice(0, 12));
  if (typeof tags === "string") {
    if (tags.trim().startsWith("[")) {
      try {
        return JSON.stringify(parseTags(tags));
      } catch {
        /* fallthrough */
      }
    }
    return JSON.stringify(
      tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 12)
    );
  }
  return "[]";
}

export async function createPost(input: BlogWriteInput): Promise<BlogPostPublic> {
  const title = input.title.trim();
  if (!title) throw new Error("Başlık gerekli");
  let slug = slugify(input.slug || title);
  if (!slug) slug = `yazi-${Date.now().toString(36)}`;

  const exists = await prisma.blogPost.findUnique({ where: { slug } });
  if (exists) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  const published =
    input.published === true || input.published === "1" || input.published === "true";

  const row = await prisma.blogPost.create({
    data: {
      slug,
      title,
      excerpt: (input.excerpt || "").trim().slice(0, 320),
      content: input.content || "",
      coverImage: (input.coverImage || "").trim(),
      tags: normalizeTags(input.tags),
      seoTitle: (input.seoTitle || title).trim().slice(0, 70),
      seoDescription: (input.seoDescription || input.excerpt || title).trim().slice(0, 160),
      author: (input.author || "TOLWEX").trim().slice(0, 60),
      published,
      publishedAt: published ? new Date() : null,
    },
  });
  await pushBlogsToGist().catch(() => null);
  return toPublic(row);
}

export async function updatePost(
  id: string,
  input: BlogWriteInput
): Promise<BlogPostPublic> {
  const current = await prisma.blogPost.findUnique({ where: { id } });
  if (!current) throw new Error("Yazı bulunamadı");

  const title = (input.title ?? current.title).trim();
  let slug = slugify(input.slug || current.slug);
  if (!slug) slug = current.slug;

  if (slug !== current.slug) {
    const clash = await prisma.blogPost.findUnique({ where: { slug } });
    if (clash && clash.id !== id) throw new Error("Bu slug kullanımda");
  }

  const published =
    input.published !== undefined
      ? input.published === true || input.published === "1" || input.published === "true"
      : current.published;

  let publishedAt = current.publishedAt;
  if (published && !publishedAt) publishedAt = new Date();
  if (!published) publishedAt = null;

  const row = await prisma.blogPost.update({
    where: { id },
    data: {
      slug,
      title,
      excerpt:
        input.excerpt !== undefined
          ? String(input.excerpt).trim().slice(0, 320)
          : current.excerpt,
      content: input.content !== undefined ? String(input.content) : current.content,
      coverImage:
        input.coverImage !== undefined
          ? String(input.coverImage).trim()
          : current.coverImage,
      tags: input.tags !== undefined ? normalizeTags(input.tags) : current.tags,
      seoTitle:
        input.seoTitle !== undefined
          ? String(input.seoTitle).trim().slice(0, 70)
          : current.seoTitle,
      seoDescription:
        input.seoDescription !== undefined
          ? String(input.seoDescription).trim().slice(0, 160)
          : current.seoDescription,
      author:
        input.author !== undefined
          ? String(input.author).trim().slice(0, 60)
          : current.author,
      published,
      publishedAt,
    },
  });
  await pushBlogsToGist().catch(() => null);
  return toPublic(row);
}

export async function deletePost(id: string): Promise<void> {
  await prisma.blogPost.delete({ where: { id } });
  await pushBlogsToGist().catch(() => null);
}
