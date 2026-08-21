import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

type Store = Map<string, { buf: Buffer; mime: string; at: number }>;

function mediaStore(): Store {
  const g = globalThis as unknown as { __tolwexMedia?: Store };
  if (!g.__tolwexMedia) g.__tolwexMedia = new Map();
  return g.__tolwexMedia;
}

type Props = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;
  if (!/^[a-f0-9]{16,64}$/i.test(id)) {
    return NextResponse.json({ error: "Geçersiz" }, { status: 400 });
  }

  let buf: Buffer | null = null;
  let mime = "image/jpeg";

  const mem = mediaStore().get(id);
  if (mem) {
    buf = mem.buf;
    mime = mem.mime;
  } else {
    try {
      const dir = path.join("/tmp", "tolwex-basvuru-media");
      const bin = path.join(dir, `${id}.bin`);
      const mimePath = path.join(dir, `${id}.mime`);
      if (fs.existsSync(bin)) {
        buf = fs.readFileSync(bin);
        if (fs.existsSync(mimePath)) mime = fs.readFileSync(mimePath, "utf8").trim() || mime;
      }
    } catch {
      /* */
    }
  }

  if (!buf) {
    return NextResponse.json({ error: "Görsel bulunamadı veya süresi doldu" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(buf), {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=7200",
      "Content-Disposition": "inline; filename=\"tolwex-ekran.jpg\"",
    },
  });
}
