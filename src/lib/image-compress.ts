/** Soft image prepare — asla sert hata fırlatmaz; başarısızsa orijinal File kalır. */
export type ImagePrepareResult = {
  ok: boolean;
  previewUrl: string | null;
  warning?: string;
};

export async function prepareImagePreview(file: File): Promise<ImagePrepareResult> {
  if (!file) return { ok: false, previewUrl: null, warning: "Dosya seçilmedi" };

  const isImage =
    file.type.startsWith("image/") ||
    /\.(jpe?g|png|webp|heic|heif|gif|bmp)$/i.test(file.name);

  if (!isImage) {
    return {
      ok: false,
      previewUrl: null,
      warning: "JPG, PNG veya WEBP seç — yine de WhatsApp’tan foto gönderebilirsin.",
    };
  }

  // Object URL her zaman çalışır (HEIC dahil çoğu telefonda)
  const objectUrl = URL.createObjectURL(file);

  try {
    if (file.size > 20 * 1024 * 1024) {
      return {
        ok: true,
        previewUrl: objectUrl,
        warning: "Dosya büyük — WhatsApp’ta gönderirken sıkıştırılabilir.",
      };
    }

    // Canvas compress dene; olmazsa object URL ile devam
    if (typeof createImageBitmap === "function" && file.type && !/heic|heif/i.test(file.type)) {
      try {
        const bitmap = await createImageBitmap(file);
        const maxEdge = 1400;
        const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
        const w = Math.max(1, Math.round(bitmap.width * scale));
        const h = Math.max(1, Math.round(bitmap.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(bitmap, 0, 0, w, h);
          bitmap.close();
          const dataUrl = canvas.toDataURL("image/jpeg", 0.78);
          URL.revokeObjectURL(objectUrl);
          return { ok: true, previewUrl: dataUrl };
        }
        bitmap.close();
      } catch {
        /* object URL ile devam */
      }
    }

    return { ok: true, previewUrl: objectUrl };
  } catch {
    return {
      ok: true,
      previewUrl: objectUrl,
      warning: "Önizleme sınırlı — dosya yine de eklendi.",
    };
  }
}

/** Eski API — soft wrapper (throw etmez, boş string döner) */
export async function compressImageToDataUrl(
  file: File,
  _opts?: { maxEdge?: number; quality?: number }
): Promise<string> {
  const r = await prepareImagePreview(file);
  if (r.ok && r.previewUrl) return r.previewUrl;
  throw new Error(r.warning || "Görsel işlenemedi");
}

