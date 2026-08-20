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
    short: "Kapanış / engel başvurusu",
    eyebrow: "Hizmet 01",
    description:
      "Hesabın kapandıysa veya engellendiyse başvur. Platformu seç, kapanma zamanı + sebep yaz, ekran görüntüsü ekle — WhatsApp’tan gelsin.",
    whenLabel: "Ne zaman kapandı?",
    whenPlaceholder: "Örn. bugün sabah, 3 gün önce, 12 Mart…",
    reasonLabel: "Kapanma sebebi",
    reasonPlaceholder:
      "Ekranda ne yazıyor? Topluluk kuralları, kimlik doğrulama, geçici engel… aynen yaz.",
    imageHint: "Hesaba giriş yap / kapanma ekranı resmini buraya ekle",
    cta: "WhatsApp’tan başvur",
  },
  {
    kind: "stolen",
    slug: "calinan",
    href: "/basvuru/calinan",
    title: "Çalınan Hesap",
    short: "Çalıntı / ele geçirme başvurusu",
    eyebrow: "Hizmet 02",
    description:
      "Hesabın çalındıysa başvur. Hangi platform, ne zaman çalındı, ne oldu + ekran görüntüsü — doğrudan WhatsApp’a.",
    whenLabel: "Ne zaman çalındı?",
    whenPlaceholder: "Örn. dün gece, 2 saat önce, tarih bilmiyorum…",
    reasonLabel: "Ne oldu? / çalıntı detayı",
    reasonPlaceholder:
      "Şifre değişti mi, e-posta/telefon değişti mi, tanımadığın gönderiler var mı — detay yaz.",
    imageHint: "Şüpheli giriş / hesap ekranı resmini buraya ekle",
    cta: "WhatsApp’tan başvur",
  },
  {
    kind: "fake",
    slug: "fake",
    href: "/basvuru/fake",
    title: "Adınıza Açılan Fake Hesap",
    short: "Sahte hesap / isim-foto şikayeti",
    eyebrow: "Hizmet 03",
    description:
      "Adınıza, fotoğrafınıza veya markanıza sahte hesap açıldıysa şikayet formu. Platform + fake hesap + ekran görüntüsü WhatsApp’a gider.",
    whenLabel: "Ne zaman fark edildi?",
    whenPlaceholder: "Örn. bu sabah, geçen hafta…",
    reasonLabel: "Sahte hesap bilgisi / şikayet detayı",
    reasonPlaceholder:
      "Sahte hesabın @kullanıcıadı, hangi isim/foto kullanılmış, sizi mi taklit ediyor — detay yaz.",
    imageHint: "Fake profil / şikayet ekranı resmini buraya ekle",
    cta: "WhatsApp’tan şikayet et",
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
