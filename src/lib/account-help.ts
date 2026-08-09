export type AccountHelpKind = "closed" | "fake" | "stolen";

export type AccountHelpTool = {
  kind: AccountHelpKind;
  slug: string;
  title: string;
  short: string;
  description: string;
  /** Extra field label — e.g. when stolen */
  whenLabel?: string;
  whenPlaceholder?: string;
  subject: string;
  cta: string;
};

export const ACCOUNT_HELP_TOOLS: AccountHelpTool[] = [
  {
    kind: "closed",
    slug: "kapanan",
    title: "Kapanan Hesap Sorgulama",
    short: "Kapanan / engellenen hesap",
    description:
      "Hesap kapanma veya engel ekranının görselini yükle. Görsel okuyucu kaydı oluşturur ve seni doğrudan yardım merkezine yönlendirir.",
    subject: "Kapanan hesap sorgulama",
    cta: "Görseli oku → Yardım merkezi",
  },
  {
    kind: "fake",
    slug: "fake",
    title: "Adıma Açılan Fake Hesap",
    short: "İsmine açılmış sahte hesap",
    description:
      "Adına / bilgilerinle açılmış sahte hesabın ekran görüntüsünü yükle. Ne zaman fark edildiğini yaz, yardım merkezi incelesin.",
    whenLabel: "Ne zaman fark edildi / açıldı?",
    whenPlaceholder: "Örn. 12 Mart 2026 veya geçen hafta",
    subject: "Adıma açılan fake hesap",
    cta: "Görsel yükle → Destek talebi",
  },
  {
    kind: "stolen",
    slug: "calinan",
    title: "Çalınan Hesaplar İçin",
    short: "Çalınan / ele geçirilen hesap",
    description:
      "Çalınan hesabına ait ekran görüntüsünü yükle. Çalınma zamanını belirt; kayıt yardım merkezine düşer.",
    whenLabel: "Ne zaman çalındı?",
    whenPlaceholder: "Örn. 3 gün önce, tarih bilmiyorum…",
    subject: "Çalınan hesap başvurusu",
    cta: "Görsel yükle → Yardım merkezi",
  },
];

export function getAccountHelpTool(slug: string): AccountHelpTool | undefined {
  return ACCOUNT_HELP_TOOLS.find((t) => t.slug === slug);
}
