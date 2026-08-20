export const SITE_NAME = "TOLWEX";
export const SITE_TAGLINE = "Kapanan ve çalınan hesap kurtarma";

export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://tolwex.com";
  return raw.replace(/\/$/, "");
}

export const SEO_KEYWORDS = [
  "kapanan hesap kurtarma",
  "çalınan hesap kurtarma",
  "Instagram hesap kurtarma",
  "hesap kapandı",
  "hesap çalındı",
  "TOLWEX",
  "Instagram yardım",
];

export function absoluteUrl(path = "/"): string {
  if (path.startsWith("http")) return path;
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
