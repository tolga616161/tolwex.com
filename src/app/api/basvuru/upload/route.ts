import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { siteUrl } from "@/lib/seo";

export const runtime = "nodejs";
export const maxDuration = 30;

const REPO = process.env.GITHUB_MEDIA_REPO || "tolga616161/tolwex.com";
const BRANCH = process.env.GITHUB_MEDIA_BRANCH || "media-uploads";

function githubToken() {
  return process.env.DB_SYNC_TOKEN || process.env.GITHUB_TOKEN || "";
}

async function ensureBranch(token: string): Promise<void> {
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "tolwex-media",
  };
  const refRes = await fetch(`https://api.github.com/repos/${REPO}/git/ref/heads/${BRANCH}`, {
    headers,
  });
  if (refRes.ok) return;

  const mainRes = await fetch(`https://api.github.com/repos/${REPO}/git/ref/heads/app`, { headers });
  const mainJson = (await mainRes.json().catch(() => null)) as { object?: { sha?: string } } | null;
  const sha = mainJson?.object?.sha;
  if (!sha) return;

  await fetch(`https://api.github.com/repos/${REPO}/git/refs`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ ref: `refs/heads/${BRANCH}`, sha }),
  });
}

async function uploadToGithub(buf: Buffer, id: string, token: string): Promise<string | null> {
  await ensureBranch(token);
  const filePath = `basvuru/${id}.jpg`;
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${filePath}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "tolwex-media",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `basvuru görsel ${id}`,
      content: buf.toString("base64"),
      branch: BRANCH,
    }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    console.error("github_media_upload", res.status, err.slice(0, 200));
    return null;
  }
  // raw.githubusercontent.com — WhatsApp’ta açılır
  return `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${filePath}`;
}

/** Görseli yükle → WhatsApp mesajına konacak kalıcı link */
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

    const buf = Buffer.from(await file.arrayBuffer());
    const id = randomBytes(10).toString("hex");
    const token = githubToken();

    let url: string | null = null;
    if (token) {
      url = await uploadToGithub(buf, id, token);
    }

    // Token yoksa / github fail → tmpfiles dene
    if (!url) {
      try {
        const out = new FormData();
        out.append("file", new Blob([buf], { type: "image/jpeg" }), `tolwex-${id}.jpg`);
        const up = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: out });
        const json = (await up.json().catch(() => null)) as { data?: { url?: string } } | null;
        const page = json?.data?.url;
        if (page?.startsWith("http")) {
          // dl linki
          url = page.replace("tmpfiles.org/", "tmpfiles.org/dl/");
        }
      } catch {
        /* */
      }
    }

    if (!url) {
      // Son çare: kendi domain (aynı instance için) — yine de dene
      const g = globalThis as unknown as {
        __tolwexMedia?: Map<string, { buf: Buffer; mime: string }>;
      };
      if (!g.__tolwexMedia) g.__tolwexMedia = new Map();
      g.__tolwexMedia.set(id, { buf, mime: file.type || "image/jpeg" });
      url = `${siteUrl()}/api/basvuru/media/${id}`;
    }

    return NextResponse.json({ ok: true, url, id });
  } catch (e) {
    console.error("basvuru_upload", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Yükleme hatası" }, { status: 500 });
  }
}
