import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { deletePost, updatePost, type BlogWriteInput } from "@/lib/blog";

export const dynamic = "force-dynamic";

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  const { id } = await ctx.params;
  const body = (await request.json().catch(() => ({}))) as BlogWriteInput;
  try {
    const post = await updatePost(id, body);
    return NextResponse.json({ ok: true, post });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Güncelleme başarısız" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const gate = await requireAdminApi();
  if (!gate.ok) return gate.response;
  const { id } = await ctx.params;
  try {
    await deletePost(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Silinemedi" },
      { status: 400 }
    );
  }
}
