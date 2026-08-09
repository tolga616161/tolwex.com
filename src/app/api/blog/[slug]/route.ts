import { NextResponse } from "next/server";
import { getPostBySlug, renderBlogHtml } from "@/lib/blog";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  try {
    const post = await getPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ ok: false, error: "Yazı bulunamadı" }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      post: {
        ...post,
        html: renderBlogHtml(post.content),
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Hata" },
      { status: 500 }
    );
  }
}
