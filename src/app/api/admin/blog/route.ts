import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { createPost, listAllPosts, type BlogWriteInput } from "@/lib/blog";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  try {
    const posts = await listAllPosts();
    return NextResponse.json({ ok: true, posts });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Hata", posts: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  const body = (await request.json().catch(() => ({}))) as BlogWriteInput;
  try {
    const post = await createPost(body);
    return NextResponse.json({ ok: true, post });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Kayıt başarısız" },
      { status: 400 }
    );
  }
}
