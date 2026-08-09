import type { AccountHelpKind } from "@/lib/account-help";

export type ImageSignals = {
  width: number;
  height: number;
  aspect: number;
  likelyPhoneScreenshot: boolean;
  darkUi: boolean;
  brightUi: boolean;
};

export type AnalyzeInput = {
  kind: AccountHelpKind;
  username: string;
  whenText: string;
  detail: string;
  email?: string;
  signals: ImageSignals;
};

/** Lightweight visual heuristics from a data-URL (no external OCR API). */
export async function extractImageSignals(dataUrl: string): Promise<ImageSignals> {
  const img = await loadImage(dataUrl);
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  const aspect = width / Math.max(1, height);
  const likelyPhoneScreenshot = aspect < 0.72 || (aspect > 0.4 && aspect < 0.65) || height > width * 1.3;

  const canvas = document.createElement("canvas");
  const sampleW = 48;
  const sampleH = Math.max(24, Math.round((48 * height) / Math.max(1, width)));
  canvas.width = sampleW;
  canvas.height = sampleH;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { width, height, aspect, likelyPhoneScreenshot, darkUi: false, brightUi: false };
  }
  ctx.drawImage(img, 0, 0, sampleW, sampleH);
  const data = ctx.getImageData(0, 0, sampleW, sampleH).data;
  let sum = 0;
  const n = sampleW * sampleH;
  for (let i = 0; i < data.length; i += 4) {
    sum += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }
  const avg = sum / n;
  return {
    width,
    height,
    aspect,
    likelyPhoneScreenshot,
    darkUi: avg < 90,
    brightUi: avg > 170,
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Görsel okunamadı"));
    img.src = src;
  });
}

/** Build Turkish analysis commentary for the member + ticket. */
export function buildAnalysis(input: AnalyzeInput): {
  summary: string;
  points: string[];
  metaHint: string;
  closureGuess: string;
} {
  const u = input.username.trim() || "belirtilmeyen hesap";
  const when = input.whenText.trim() || "belirtilmedi";
  const detail = input.detail.trim().toLowerCase();
  const points: string[] = [];

  if (input.signals.likelyPhoneScreenshot) {
    points.push("Görsel telefon ekran görüntüsü oranına uyuyor — inceleme için uygun.");
  } else {
    points.push("Görsel yüklendi; mümkünse tam ekran görüntüsü (tüm uyarı metni görünsün) daha iyi olur.");
  }
  if (input.signals.darkUi) {
    points.push("Koyu arayüz tespit edildi (Instagram / Meta uyarı ekranlarında sık görülür).");
  } else if (input.signals.brightUi) {
    points.push("Açık arayüz / tarayıcı ekranı tespit edildi.");
  }
  points.push(`Zaman bilgisi: ${when}`);
  if (input.email?.trim()) points.push(`İletişim / hesap e-postası not edildi.`);

  let closureGuess = "Belirsiz — Meta formunda ekran metnini aynen ilet.";
  if (/topluluk|community|guideline|ihlal|violation/.test(detail)) {
    closureGuess = "Topluluk Kuralları / içerik ihlali ihtimali yüksek.";
  } else if (/kimlik|selfie|video|doğrulama|verify|identity/.test(detail)) {
    closureGuess = "Kimlik / video doğrulama isteği görünüyor.";
  } else if (/geçici|disabled|devre dışı|suspend|ban/.test(detail)) {
    closureGuess = "Geçici veya kalıcı devre dışı bırakma mesajı.";
  } else if (/şifre|password|giriş|login|kod|sms|mail/.test(detail)) {
    closureGuess = "Yetkisiz giriş / şifre-e-posta değişimi şüphesi.";
  } else if (/taklit|fake|sahte|imperson/.test(detail)) {
    closureGuess = "Hesap taklidi / sahte profil şikayeti.";
  }

  let summary = "";
  let metaHint = "";

  if (input.kind === "closed") {
    summary = `@${u.replace(/^@/, "")} için kapanan hesap görseli incelendi. Tahmini durum: ${closureGuess}`;
    points.push("Kapanma nedeni alanındaki metin Meta formuna birebir yapıştırılmalı.");
    metaHint =
      "Sonraki adım: Meta “devre dışı hesap” formuna geç. Başvuru numaranı not et; formda ekran görüntüsü ve neden metnini ekle.";
  } else if (input.kind === "stolen") {
    summary = `@${u.replace(/^@/, "")} çalınan hesap başvurusu — görsel ve zaman çizelgesi alındı. ${closureGuess}`;
    points.push("Hemen şifreleri değiştirme / 2FA açma Meta formundan sonra da önerilir.");
    metaHint =
      "Sonraki adım: Meta Hacked merkezi. Formda çalınma zamanını ve e-posta/telefon değişimini belirt.";
  } else {
    summary = `Adınıza açılan sahte hesap için görsel alındı (@${u.replace(/^@/, "")}). ${closureGuess}`;
    points.push("Sahte profilin kullanıcı adını ve kanıt görselini Meta şikayet formuna ekle.");
    metaHint =
      "Sonraki adım: Meta hesap taklidi formu. Kendi hesabınla giriş yapıp sahte profili bildir.";
  }

  return { summary, points, metaHint, closureGuess };
}
