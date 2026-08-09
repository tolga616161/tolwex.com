import { NextResponse } from "next/server";
import { listPublishedPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const posts = await listPublishedPosts();
    return NextResponse.json({
      ok: true,
      posts: posts.map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        tags: p.tags,
        author: p.author,
        publishedAt: p.publishedAt,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Blog yüklenemedi", posts: [] },
      { status: 500 }
    );
  }
}
