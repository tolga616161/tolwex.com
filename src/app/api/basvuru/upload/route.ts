import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";
import { siteUrl } from "@/lib/seo";

export const runtime = "nodejs";
export const maxDuration = 30;

type Store = Map<string, { buf: Buffer; mime: string; at: number }>;

function mediaStore(): Store {
  const g = globalThis as unknown as { __tolwexMedia?: Store };
  if (!g.__tolwexMedia) g.__tolwexMedia = new Map();
  return g.__tolwexMedia;
}

function mediaDir() {
  const dir = path.join("/tmp", "tolwex-basvuru-media");
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {
    /* */
  }
  return dir;
}

/** Görseli kaydet → public link (WhatsApp mesajına konur) */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "Dosya yok" }, { status: 400 });
    }
    if (file.size > 6 * 1024 * 1024) {
      return NextResponse.json({ error: "Görsel max 6MB" }, { status: 400 });
    }

    const ab = await file.arrayBuffer();
    const buf = Buffer.from(ab);
    const mime = file.type || "image/jpeg";
    const id = randomBytes(12).toString("hex");

    mediaStore().set(id, { buf, mime, at: Date.now() });
    try {
      fs.writeFileSync(path.join(mediaDir(), `${id}.bin`), buf);
      fs.writeFileSync(path.join(mediaDir(), `${id}.mime`), mime);
    } catch {
      /* memory yeterli */
    }

    // Eski kayıtları temizle (~2 saat)
    const cutoff = Date.now() - 2 * 60 * 60 * 1000;
    for (const [k, v] of mediaStore()) {
      if (v.at < cutoff) mediaStore().delete(k);
    }

    const url = `${siteUrl()}/api/basvuru/media/${id}`;
    return NextResponse.json({ ok: true, url, id });
  } catch (e) {
    console.error("basvuru_upload", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Yükleme hatası" }, { status: 500 });
  }
}
