import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export type RecoveryKind = "closed" | "stolen";

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
      "Hesabın kapandıysa veya engellendiyse başvur. Kapanma zamanı, sebep ve ekran görüntüsüyle WhatsApp’tan bize ulaş.",
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
      "Hesabın çalındıysa veya şüpheli giriş varsa başvur. Ne zaman çalındığını, ne olduğunu ve ekran görüntüsünü WhatsApp’tan ilet.",
    whenLabel: "Ne zaman çalındı?",
    whenPlaceholder: "Örn. dün gece, 2 saat önce, tarih bilmiyorum…",
    reasonLabel: "Ne oldu? / çalıntı detayı",
    reasonPlaceholder:
      "Şifre değişti mi, e-posta/telefon değişti mi, tanımadığın gönderiler var mı — detay yaz.",
    imageHint: "Şüpheli giriş / hesap ekranı resmini buraya ekle",
    cta: "WhatsApp’tan başvur",
  },
];

export function getRecoveryService(slug: string): RecoveryService | undefined {
  return RECOVERY_SERVICES.find((s) => s.slug === slug);
}

export function buildRecoveryWhatsAppText(input: {
  kind: RecoveryKind;
  username: string;
  email?: string;
  whenText: string;
  reason: string;
}): string {
  const title = input.kind === "closed" ? "KAPANAN HESAP BAŞVURUSU" : "ÇALINAN HESAP BAŞVURUSU";
  const when =
    input.kind === "closed"
      ? `Kapanma zamanı: ${input.whenText}`
      : `Çalınma zamanı: ${input.whenText}`;
  const reason =
    input.kind === "closed"
      ? `Kapanma sebebi:\n${input.reason}`
      : `Çalıntı / ne oldu:\n${input.reason}`;

  return [
    `TOLWEX · ${title}`,
    "",
    `Hesap: ${input.username}`,
    input.email ? `E-posta: ${input.email}` : "",
    when,
    reason,
    "",
    "Ekran görüntüsünü bu sohbete ekliyorum.",
    `İletişim: ${CONTACT_PHONE_DISPLAY}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function recoveryWhatsAppHref(message: string): string {
  return whatsappUrl(message);
}
