export const SITE_NAME = "TOLWEX";
export const SITE_TAGLINE =
  "TOLWEX Sosyal Medya Uzmanı · kapanan, çalınan, fake hesap, reklam kısıtı";

export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://tolwex.com";
  return raw.replace(/\/$/, "");
}

export const SEO_KEYWORDS = [
  "TOLWEX",
  "TOLWEX Sosyal Medya Uzmanı",
  "sosyal medya uzmanı",
  "teknik destek",
  "kapanan hesap",
  "çalınan hesap",
  "fake hesap",
  "fake hesap kapatma",
  "fake hesap tespit",
  "Instagram hesap",
  "reklam kısıtı",
  "influencer",
  "Instagram yardım",
];

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
