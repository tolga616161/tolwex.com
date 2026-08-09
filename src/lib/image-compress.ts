/** Client-side: resize + JPEG compress for support uploads (no server crash on big photos). */
export async function compressImageToDataUrl(
  file: File,
  opts?: { maxEdge?: number; quality?: number }
): Promise<string> {
  const maxEdge = opts?.maxEdge ?? 1280;
  const quality = opts?.quality ?? 0.72;

  if (!file.type.startsWith("image/")) {
    throw new Error("Lütfen bir görsel dosyası seç (JPG, PNG, WEBP)");
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error("Görsel en fazla 12 MB olabilir");
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Görsel işlenemedi — başka bir dosya dene");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const dataUrl = canvas.toDataURL("image/jpeg", quality);
  // Cap ~1.4MB data URL
  if (dataUrl.length > 1_800_000) {
    return canvas.toDataURL("image/jpeg", 0.55);
  }
  return dataUrl;
}
