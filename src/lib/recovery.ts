import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export type RecoveryKind = "closed" | "stolen" | "fake" | "ad_restrict";

export type RecoveryPlatform =
  | "Instagram"
  | "Facebook"
  | "TikTok"
  | "X / Twitter"
  | "YouTube"
  | "Telegram"
  | "Snapchat"
  | "LinkedIn"
  | "Pinterest"
  | "WhatsApp"
  | "Diğer";

export const RECOVERY_PLATFORMS: RecoveryPlatform[] = [
  "Instagram",
  "Facebook",
  "TikTok",
  "X / Twitter",
  "YouTube",
  "Telegram",
  "Snapchat",
  "LinkedIn",
  "Pinterest",
  "WhatsApp",
  "Diğer",
];

export const PLATFORM_ICON: Partial<Record<RecoveryPlatform, string>> = {
  Instagram: "/brand/social/ig.png",
  Facebook: "/brand/social/fb.png",
  TikTok: "/brand/social/tt.svg",
  "X / Twitter": "/brand/social/tw.png",
  YouTube: "/brand/social/yt.png",
  Telegram: "/brand/social/tg.svg",
  Snapchat: "/brand/social/sc.png",
  LinkedIn: "/brand/social/in.png",
  Pinterest: "/brand/social/pt.png",
  WhatsApp: "/brand/social/other.svg",
  Diğer: "/brand/social/other.svg",
};

export type RecoveryService = {
  kind: RecoveryKind;
  slug: string;
  href: string;
  title: string;
  short: string;
  eyebrow: string;
  description: string;
  whenLabel: string;
  whenPlaceholder: string;
  reasonLabel: string;
  reasonPlaceholder: string;
  imageHint: string;
  imageRequired?: boolean;
  cta: string;
};

export const RECOVERY_SERVICES: RecoveryService[] = [
  {
    kind: "closed",
    slug: "kapanan",
    href: "/basvuru/kapanan",
    title: "Kapanan Hesaplar",
    short: "Kapanan hesaplar",
    eyebrow: "01",
    description:
      "Instagram, TikTok, X ve diğer platformlarda kapanan hesabın için teknik çözüm.",
    whenLabel: "Ne zaman kapandı?",
    whenPlaceholder: "Örn. bugün sabah, 3 gün önce…",
    reasonLabel: "Kapanma sebebi / ekran mesajı",
    reasonPlaceholder: "Ekranda yazan uyarıyı veya kapanma sebebini yaz.",
    imageHint: "Kapanma ekranı — galeriden seç (opsiyonel)",
    imageRequired: false,
    cta: "WhatsApp’tan gönder",
  },
  {
    kind: "ad_restrict",
    slug: "reklam-kisit",
    href: "/basvuru/reklam-kisit",
    title: "Reklam Kısıtları",
    short: "Reklam kısıtları",
    eyebrow: "02",
    description: "Reklam hesabı kısıtlıysa veya yayınlanmıyorsa başvuru formu.",
    whenLabel: "Ne zaman kısıtlandı?",
    whenPlaceholder: "Örn. dün, bu sabah…",
    reasonLabel: "Kısıt mesajı / detay",
    reasonPlaceholder: "Ekranda yazan uyarıyı aynen yaz.",
    imageHint: "Kısıt ekranı — galeriden seç (opsiyonel)",
    imageRequired: false,
    cta: "WhatsApp’tan gönder",
  },
  {
    kind: "stolen",
    slug: "calinan",
    href: "/basvuru/calinan",
    title: "Çalınan Hesaplar",
    short: "Çalınan hesaplar",
    eyebrow: "03",
    description: "Hesabın çalındıysa veya şüpheli giriş varsa teknik destek.",
    whenLabel: "Ne zaman çalındı?",
    whenPlaceholder: "Örn. dün gece…",
    reasonLabel: "Ne oldu?",
    reasonPlaceholder: "Şifre / e-posta değişimi, şüpheli hareket…",
    imageHint: "Şüpheli giriş ekranı — galeriden seç (opsiyonel)",
    imageRequired: false,
    cta: "WhatsApp’tan gönder",
  },
  {
    kind: "fake",
    slug: "fake",
    href: "/basvuru/fake",
    title: "Fake Hesaplar",
    short: "Fake hesaplar",
    eyebrow: "04",
    description: "Adına veya fotoğrafına açılan sahte hesap için şikayet.",
    whenLabel: "Ne zaman fark edildi?",
    whenPlaceholder: "Örn. bu sabah…",
    reasonLabel: "Sahte hesap detayı",
    reasonPlaceholder: "Sahte @kullanıcıadı ve neyi taklit ettiği…",
    imageHint: "Fake profil ekranı — galeriden seç (opsiyonel)",
    imageRequired: false,
    cta: "WhatsApp’tan gönder",
  },
];

export function getRecoveryService(slug: string): RecoveryService | undefined {
  return RECOVERY_SERVICES.find((s) => s.slug === slug);
}

const KIND_TITLE: Record<RecoveryKind, string> = {
  closed: "KAPANAN HESAP",
  ad_restrict: "REKLAM KISITI",
  stolen: "ÇALINAN HESAP",
  fake: "FAKE HESAP",
};

export function buildRecoveryWhatsAppText(input: {
  kind: RecoveryKind;
  platform: string;
  username: string;
  email?: string;
  whenText: string;
  reason: string;
}): string {
  const title = KIND_TITLE[input.kind] || "BAŞVURU";
  return [
    `TOLWEX · ${title}`,
    "",
    `Platform: ${input.platform}`,
    `Hesap / kullanıcı: ${input.username}`,
    input.email ? `E-posta: ${input.email}` : "",
    input.whenText ? `Zaman: ${input.whenText}` : "",
    `Detay:\n${input.reason}`,
    "",
    "Görsel varsa bu sohbete ekliyorum.",
    `İletişim: ${CONTACT_PHONE_DISPLAY}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function recoveryWhatsAppHref(message: string): string {
  return whatsappUrl(message);
}
