import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export type RecoveryKind = "closed" | "stolen" | "fake";

export type RecoveryPlatform =
  | "Instagram"
  | "Facebook"
  | "TikTok"
  | "X / Twitter"
  | "WhatsApp"
  | "Diğer";

export const RECOVERY_PLATFORMS: RecoveryPlatform[] = [
  "Instagram",
  "Facebook",
  "TikTok",
  "X / Twitter",
  "WhatsApp",
  "Diğer",
];

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
  cta: string;
};

export const RECOVERY_SERVICES: RecoveryService[] = [
  {
    kind: "closed",
    slug: "kapanan",
    href: "/basvuru/kapanan",
    title: "Kapanan Hesap",
    short: "Kapanış / engel",
    eyebrow: "01",
    description: "Hesabın kapandıysa veya engellendiyse bu formu doldur.",
    whenLabel: "Ne zaman kapandı?",
    whenPlaceholder: "Örn. bugün sabah, 3 gün önce…",
    reasonLabel: "Kapanma sebebi",
    reasonPlaceholder: "Ekranda yazan mesajı veya kapanma sebebini yaz.",
    imageHint: "Giriş / kapanma ekranı fotoğrafını ekle",
    cta: "WhatsApp’tan gönder",
  },
  {
    kind: "stolen",
    slug: "calinan",
    href: "/basvuru/calinan",
    title: "Çalınan Hesap",
    short: "Çalıntı / ele geçirme",
    eyebrow: "02",
    description: "Hesabın çalındıysa veya şüpheli giriş varsa bu formu doldur.",
    whenLabel: "Ne zaman çalındı?",
    whenPlaceholder: "Örn. dün gece, 2 saat önce…",
    reasonLabel: "Ne oldu?",
    reasonPlaceholder: "Şifre değişimi, e-posta/telefon değişimi, şüpheli hareket…",
    imageHint: "Şüpheli giriş / hesap ekranı fotoğrafını ekle",
    cta: "WhatsApp’tan gönder",
  },
  {
    kind: "fake",
    slug: "fake",
    href: "/basvuru/fake",
    title: "Fake Hesap Şikayeti",
    short: "Sahte hesap şikayeti",
    eyebrow: "03",
    description: "Adınıza veya fotoğrafınıza açılan sahte hesap için şikayet formu.",
    whenLabel: "Ne zaman fark edildi?",
    whenPlaceholder: "Örn. bu sabah, geçen hafta…",
    reasonLabel: "Sahte hesap / şikayet detayı",
    reasonPlaceholder: "Sahte @kullanıcıadı ve neyi taklit ettiği…",
    imageHint: "Fake profil ekran görüntüsünü ekle",
    cta: "WhatsApp’tan gönder",
  },
];

export function getRecoveryService(slug: string): RecoveryService | undefined {
  return RECOVERY_SERVICES.find((s) => s.slug === slug);
}

export function buildRecoveryWhatsAppText(input: {
  kind: RecoveryKind;
  platform: string;
  username: string;
  email?: string;
  whenText: string;
  reason: string;
}): string {
  const title =
    input.kind === "closed"
      ? "KAPANAN HESAP BAŞVURUSU"
      : input.kind === "stolen"
        ? "ÇALINAN HESAP BAŞVURUSU"
        : "FAKE HESAP ŞİKAYETİ";
  const when =
    input.kind === "closed"
      ? `Kapanma zamanı: ${input.whenText}`
      : input.kind === "stolen"
        ? `Çalınma zamanı: ${input.whenText}`
        : `Fark edilme: ${input.whenText}`;
  const reason =
    input.kind === "closed"
      ? `Kapanma sebebi:\n${input.reason}`
      : input.kind === "stolen"
        ? `Çalıntı / ne oldu:\n${input.reason}`
        : `Fake hesap / şikayet:\n${input.reason}`;

  return [
    `TOLWEX · ${title}`,
    "",
    `Platform: ${input.platform}`,
    `Hesap: ${input.username}`,
    input.email ? `E-posta: ${input.email}` : "",
    when,
    reason,
    "",
    "Ekran görüntüsünü / fotoğrafı bu sohbete ekliyorum.",
    `İletişim: ${CONTACT_PHONE_DISPLAY}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function recoveryWhatsAppHref(message: string): string {
  return whatsappUrl(message);
}
