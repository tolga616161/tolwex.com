export type PlatformId =
  | "ig"
  | "tt"
  | "yt"
  | "tw"
  | "fb"
  | "sc"
  | "in"
  | "pt"
  | "tg"
  | "web"
  | "other";

export type Platform = {
  id: PlatformId;
  name: string;
  src: string;
  /** Match against category / service name (lowercase). */
  match: RegExp[];
};

export const PLATFORMS: Platform[] = [
  {
    id: "ig",
    name: "Instagram",
    src: "/brand/social/ig.png",
    match: [/instagram/, /\binsta\b/],
  },
  {
    id: "tt",
    name: "TikTok",
    src: "/brand/social/tt.svg",
    match: [/tik\s*tok/],
  },
  {
    id: "yt",
    name: "YouTube",
    src: "/brand/social/yt.png",
    match: [/youtube/, /youtu\.?be/],
  },
  {
    id: "tw",
    name: "X / Twitter",
    src: "/brand/social/tw.png",
    match: [/twitter/, /\btweet/, /\bx\s*\/\s*twitter/],
  },
  {
    id: "fb",
    name: "Facebook",
    src: "/brand/social/fb.png",
    match: [/facebook/, /\bfb\b/],
  },
  {
    id: "tg",
    name: "Telegram",
    src: "/brand/social/tg.svg",
    match: [/telegram/, /\btg\b/],
  },
  {
    id: "sc",
    name: "Snapchat",
    src: "/brand/social/sc.png",
    match: [/snapchat/, /\bsnap\b/],
  },
  {
    id: "in",
    name: "LinkedIn",
    src: "/brand/social/in.png",
    match: [/linkedin/],
  },
  {
    id: "pt",
    name: "Pinterest",
    src: "/brand/social/pt.png",
    match: [/pinterest/],
  },
  {
    id: "web",
    name: "Website",
    src: "/brand/social/web.svg",
    match: [/website/, /\btraffic\b/, /\bseo\b/],
  },
];

const OTHER: Platform = {
  id: "other",
  name: "Diğer",
  src: "/brand/social/other.svg",
  match: [],
};

export function detectPlatform(text: string): PlatformId {
  const t = text.toLowerCase();
  for (const p of PLATFORMS) {
    if (p.match.some((re) => re.test(t))) return p.id;
  }
  return "other";
}

export function getPlatform(id: PlatformId): Platform {
  if (id === "other") return OTHER;
  return PLATFORMS.find((p) => p.id === id) || OTHER;
}

export function allPlatformsWithOther(): Platform[] {
  return [...PLATFORMS, OTHER];
}

export type CatCount = { name: string; count: number };

/** Sum service counts per platform from category list. */
export function groupCategoriesByPlatform(categories: CatCount[]): Map<PlatformId, CatCount[]> {
  const map = new Map<PlatformId, CatCount[]>();
  for (const c of categories) {
    const id = detectPlatform(c.name);
    const list = map.get(id) || [];
    list.push(c);
    map.set(id, list);
  }
  return map;
}

export function platformTotals(
  categories: CatCount[]
): { id: PlatformId; name: string; src: string; count: number }[] {
  const grouped = groupCategoriesByPlatform(categories);
  const rows: { id: PlatformId; name: string; src: string; count: number }[] = [];
  for (const p of allPlatformsWithOther()) {
    const cats = grouped.get(p.id) || [];
    const count = cats.reduce((s, c) => s + c.count, 0);
    if (count > 0) rows.push({ id: p.id, name: p.name, src: p.src, count });
  }
  return rows.sort((a, b) => b.count - a.count);
}

export function filterCategoriesForPlatform(
  categories: CatCount[],
  platform: PlatformId | ""
): CatCount[] {
  if (!platform) return categories;
  return categories.filter((c) => detectPlatform(c.name) === platform);
}
