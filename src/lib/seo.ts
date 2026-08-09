export const SITE_NAME = "TOLWEX";
export const SITE_TAGLINE = "Dijitalde karşınıza çıkan sorunları birlikte çözüyoruz";

export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://tolwex.com";
  return raw.replace(/\/$/, "");
}

export const SEO_KEYWORDS = [
  "SMM panel",
  "Instagram takipçi",
  "TikTok izlenme",
  "YouTube izlenme",
  "SMM panel Türkiye",
  "ucuz takipçi",
  "beğeni satın al",
  "TOLWEX",
  "sosyal medya paneli",
  "PerfectPanel",
  "SMM blog",
  "Instagram takipçi nasıl artırılır",
  "güvenilir SMM panel",
];

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
