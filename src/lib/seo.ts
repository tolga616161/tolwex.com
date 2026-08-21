export const SITE_NAME = "TOLWEX";
export const SITE_TAGLINE = "Sosyal medya uzmanı · kapanan hesap, askı, kullanıcı adı";

export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://tolwex.com";
  return raw.replace(/\/$/, "");
}

export const SEO_KEYWORDS = [
  "teknik destek",
  "kapanan hesap",
  "çalınan hesap",
  "Instagram hesap",
  "reklam kısıtı",
  "influencer",
  "TOLWEX",
  "Instagram yardım",
];

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
