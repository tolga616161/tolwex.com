import { whatsappUrl } from "@/lib/contact";

export type AccountHelpKind = "closed" | "stolen" | "fake";

export type AccountHelpTool = {
  kind: AccountHelpKind;
  slug: string;
  title: string;
  short: string;
  description: string;
  steps: string[];
  whenLabel: string;
  whenPlaceholder: string;
  detailLabel: string;
  detailPlaceholder: string;
  emailLabel: string;
  subject: string;
  cta: string;
};

/** Sadece kapanan + çalınan kurtarma — WhatsApp’a düşer */
export const ACCOUNT_HELP_TOOLS: AccountHelpTool[] = [
  {
    kind: "closed",
    slug: "kapanan",
    title: "Kapanan Hesap Kurtarma",
    short: "Kapanan / engellenen hesap",
    description:
      "Ne zaman kapandığını, kapanma sebebini yaz ve ekran görüntüsü yükle. Başvuru kaydı oluşur; tüm bilgiler WhatsApp’a iletilir.",
    steps: ["Görsel yükle", "Ne zaman kapandı", "Kapanma sebebi", "WhatsApp’a gönder"],
    whenLabel: "Ne zaman kapandı?",
    whenPlaceholder: "Örn. bugün sabah, 3 gün önce, 12 Mart…",
    detailLabel: "Kapanma sebebi / ekranda yazan mesaj",
    detailPlaceholder:
      "Örn. Topluluk Kuralları ihlali, kimlik doğrulama, geçici engel, hesap devre dışı… Ekranda ne yazıyorsa aynen yaz.",
    emailLabel: "Hesaba bağlı e-posta (varsa)",
    subject: "Kapanan hesap kurtarma",
    cta: "WhatsApp’a gönder",
  },
  {
    kind: "stolen",
    slug: "calinan",
    title: "Çalınan Hesap Kurtarma",
    short: "Çalınan / ele geçirilen hesap",
    description:
      "Ne zaman çalındığını, ne olduğunu yaz ve ekran görüntüsü yükle. Başvuru kaydı oluşur; tüm bilgiler WhatsApp’a iletilir.",
    steps: ["Görsel yükle", "Ne zaman çalındı", "Ne oldu yaz", "WhatsApp’a gönder"],
    whenLabel: "Ne zaman çalındı?",
    whenPlaceholder: "Örn. dün gece, 2 saat önce, tarih bilmiyorum…",
    detailLabel: "Ne oldu? (detaylı anlat)",
    detailPlaceholder:
      "Şifre mi değişti, e-posta/telefon mu değişti, tanımadığın gönderiler mi var, doğrulama kodu mu geldi… mümkün olduğunca detay yaz.",
    emailLabel: "Eski / bilinen e-posta",
    subject: "Çalınan hesap kurtarma",
    cta: "WhatsApp’a gönder",
  },
];

export function getAccountHelpTool(slug: string): AccountHelpTool | undefined {
  return ACCOUNT_HELP_TOOLS.find((t) => t.slug === slug);
}

export function caseNumberFromTicket(kind: AccountHelpKind | string, ticketId: string): string {
  const prefix =
    kind === "closed" ? "KP" : kind === "stolen" ? "CL" : kind === "fake" ? "FK" : "TW";
  const tail = ticketId.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase();
  return `TW-${prefix}-${tail}`;
}

export function buildRecoveryWhatsAppMessage(input: {
  kind: AccountHelpKind | string;
  caseNumber: string;
  username: string;
  email?: string;
  whenText: string;
  detail: string;
  memberUsername?: string;
  memberEmail?: string;
}): string {
  const title =
    input.kind === "closed"
      ? "KAPANAN HESAP KURTARMA"
      : input.kind === "stolen"
        ? "ÇALINAN HESAP KURTARMA"
        : "HESAP YARDIM";
  const whenLine =
    input.kind === "closed"
      ? `Kapanma zamanı: ${input.whenText}`
      : input.kind === "stolen"
        ? `Çalınma zamanı: ${input.whenText}`
        : `Zaman: ${input.whenText}`;
  const reasonLine =
    input.kind === "closed"
      ? `Kapanma sebebi:\n${input.detail}`
      : `Detay / ne oldu:\n${input.detail}`;

  return [
    `TOLWEX · ${title}`,
    `Başvuru: ${input.caseNumber}`,
    "",
    `Hesap: ${input.username}`,
    input.email ? `Hesap e-posta: ${input.email}` : "",
    whenLine,
    reasonLine,
    "",
    input.memberUsername ? `Panel üye: ${input.memberUsername}` : "",
    input.memberEmail ? `Üye mail: ${input.memberEmail}` : "",
    "Görsel: ekran görüntüsünü bu sohbete ekliyorum.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function recoveryWhatsAppUrl(message: string): string {
  return whatsappUrl(message);
}
