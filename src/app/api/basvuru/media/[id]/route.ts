import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Props = { params: Promise<{ id: string }> };

/** Bellek fallback (GitHub raw asıl kaynak) */
export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;
  if (!/^[a-f0-9]{12,64}$/i.test(id)) {
    return NextResponse.json({ error: "Geçersiz" }, { status: 400 });
  }

  const g = globalThis as unknown as {
    __tolwexMedia?: Map<string, { buf: Buffer; mime: string }>;
  };
  const hit = g.__tolwexMedia?.get(id);
  if (!hit) {
    return NextResponse.json(
      { error: "Görsel bulunamadı — WhatsApp mesajındaki linki kullan" },
      { status: 404 }
    );
  }

  return new NextResponse(new Uint8Array(hit.buf), {
    status: 200,
    headers: {
      "Content-Type": hit.mime || "image/jpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
