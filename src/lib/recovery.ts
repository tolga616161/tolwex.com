import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export type RecoveryKind =
  | "closed"
  | "stolen"
  | "ad_restrict"
  | "fake_detect"
  | "fake_close";

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
  WhatsApp: "/brand/social/wa.svg",
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
  group: "hesap" | "reklam" | "fake";
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
    cta: "WhatsApp’a gönder",
    group: "hesap",
  },
  {
    kind: "stolen",
    slug: "calinan",
    href: "/basvuru/calinan",
    title: "Çalınan Hesaplar",
    short: "Çalınan hesaplar",
    eyebrow: "02",
    description: "Hesabın çalındıysa veya şüpheli giriş varsa teknik destek.",
    whenLabel: "Ne zaman çalındı?",
    whenPlaceholder: "Örn. dün gece…",
    reasonLabel: "Ne oldu?",
    reasonPlaceholder: "Şifre / e-posta değişimi, şüpheli hareket…",
    imageHint: "Şüpheli giriş ekranı — galeriden seç (opsiyonel)",
    imageRequired: false,
    cta: "WhatsApp’a gönder",
    group: "hesap",
  },
  {
    kind: "ad_restrict",
    slug: "reklam-kisit",
    href: "/basvuru/reklam-kisit",
    title: "Kısıtlanan Reklam Hesabı",
    short: "Kısıtlanan reklam",
    eyebrow: "03",
    description:
      "Reklam hesabın kısıtlandıysa, reklamlar yayınlanmıyorsa teknik başvuru.",
    whenLabel: "Ne zaman kısıtlandı?",
    whenPlaceholder: "Örn. dün, bu sabah…",
    reasonLabel: "Kısıt mesajı / detay",
    reasonPlaceholder: "Ekranda yazan uyarıyı aynen yaz.",
    imageHint: "Kısıt ekranı — galeriden seç (opsiyonel)",
    imageRequired: false,
    cta: "WhatsApp’a gönder",
    group: "reklam",
  },
  {
    kind: "fake_detect",
    slug: "fake-tespit",
    href: "/basvuru/fake-tespit",
    title: "Fake Hesap Tespit",
    short: "Fake hesap tespit",
    eyebrow: "04",
    description:
      "Taklit / sahte hesap şüphesinde tespit ve doğrulama. Detaylı bilgi için başvur.",
    whenLabel: "Ne zaman fark ettin?",
    whenPlaceholder: "Örn. bugün, geçen hafta…",
    reasonLabel: "Şüpheli hesap / ne gördün?",
    reasonPlaceholder: "Sahte hesabın @’si, profil linki, ne yaptığını yaz.",
    imageHint: "Sahte profil / mesaj ekranı — galeriden seç (opsiyonel)",
    imageRequired: false,
    cta: "WhatsApp’a gönder",
    group: "fake",
  },
  {
    kind: "fake_close",
    slug: "fake-kapatma",
    href: "/basvuru/fake-kapatma",
    title: "Fake Hesap Kapatma",
    short: "Fake hesap kapatma",
    eyebrow: "05",
    description:
      "Adını / markanı kullanan fake hesapların kapatılması için teknik başvuru.",
    whenLabel: "Ne zamandır aktif?",
    whenPlaceholder: "Örn. 1 haftadır, yeni açılmış…",
    reasonLabel: "Kapatılmasını istediğin hesap",
    reasonPlaceholder: "Fake hesabın @’si, linki ve neden kapanması gerektiği.",
    imageHint: "Fake profil ekranı — galeriden seç (opsiyonel)",
    imageRequired: false,
    cta: "WhatsApp’a gönder",
    group: "fake",
  },
];

export function getRecoveryService(slug: string): RecoveryService | undefined {
  return RECOVERY_SERVICES.find((s) => s.slug === slug);
}

const KIND_TITLE: Record<RecoveryKind, string> = {
  closed: "KAPANAN HESAP",
  stolen: "ÇALINAN HESAP",
  ad_restrict: "KISITLANAN REKLAM HESABI",
  fake_detect: "FAKE HESAP TESPİT",
  fake_close: "FAKE HESAP KAPATMA",
};

export function buildRecoveryWhatsAppText(input: {
  kind: RecoveryKind;
  platform: string;
  username: string;
  email?: string;
  whenText: string;
  reason: string;
  imageUrl?: string;
}): string {
  const title = KIND_TITLE[input.kind] || "BAŞVURU";
  return [
    `TOLWEX Sosyal Medya Uzmanı · ${title}`,
    "",
    `Platform: ${input.platform}`,
    `Hesap / kullanıcı: ${input.username}`,
    input.email ? `E-posta: ${input.email}` : "",
    input.whenText ? `Zaman: ${input.whenText}` : "",
    `Detay:\n${input.reason}`,
    input.imageUrl ? `\nGörsel:\n${input.imageUrl}` : "",
    "",
    `İletişim: ${CONTACT_PHONE_DISPLAY}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function recoveryWhatsAppHref(message: string): string {
  return whatsappUrl(message);
}
