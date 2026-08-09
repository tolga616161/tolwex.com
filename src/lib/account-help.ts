export type AccountHelpKind = "closed" | "fake" | "stolen";

export type AccountHelpTool = {
  kind: AccountHelpKind;
  slug: string;
  title: string;
  short: string;
  description: string;
  steps: string[];
  /** Required time/when field */
  whenLabel: string;
  whenPlaceholder: string;
  /** Required detail / reason */
  detailLabel: string;
  detailPlaceholder: string;
  /** Optional email on account */
  emailLabel: string;
  subject: string;
  cta: string;
  metaHelpUrl: string;
  metaHelpLabel: string;
};

export const ACCOUNT_HELP_TOOLS: AccountHelpTool[] = [
  {
    kind: "closed",
    slug: "kapanan",
    title: "Kapanan Hesap",
    short: "Kapanan / engellenen hesap",
    description:
      "Kapanma ekranının görselini yükle, kapanma nedenini ve zamanını yaz. Görsel analiz edilir, başvuru numarası verilir ve Meta yardımına aktarılır.",
    steps: ["Görsel yükle", "Kapanma nedeni yaz", "Analiz + numara al", "Meta yardıma geç"],
    whenLabel: "Ne zaman kapandı?",
    whenPlaceholder: "Örn. bugün sabah, 3 gün önce, 12 Mart…",
    detailLabel: "Kapanma nedeni / ekranda yazan mesaj",
    detailPlaceholder:
      "Örn. Topluluk Kuralları ihlali, kimlik doğrulama, geçici engel, hesap devre dışı… Ekranda ne yazıyorsa aynen yaz.",
    emailLabel: "Hesaba bağlı e-posta (varsa)",
    subject: "Kapanan hesap sorgulama",
    cta: "Görseli analiz et ve başvur",
    metaHelpUrl: "https://www.facebook.com/help/instagram/contact/606967319425038",
    metaHelpLabel: "Meta · Devre dışı hesap formu",
  },
  {
    kind: "stolen",
    slug: "calinan",
    title: "Çalınan Hesap",
    short: "Çalınan / ele geçirilen hesap",
    description:
      "Çalıntı / şüpheli giriş ekran görüntüsünü yükle. Ne zaman çalındığını ve ne olduğunu anlat. Analiz + başvuru numarası ile Meta hacked yardımına yönlendirilirsin.",
    steps: ["Görsel yükle", "Çalınma zamanı", "Detaylı anlat", "Meta hacked formu"],
    whenLabel: "Ne zaman çalındı?",
    whenPlaceholder: "Örn. dün gece, 2 saat önce, tarih bilmiyorum…",
    detailLabel: "Ne oldu? (detaylı anlat)",
    detailPlaceholder:
      "Şifre mi değişti, e-posta/telefon mu değişti, tanımadığın gönderiler mi var, doğrulama kodu mu geldi… mümkün olduğunca detay yaz.",
    emailLabel: "Eski / bilinen e-posta",
    subject: "Çalınan hesap başvurusu",
    cta: "Görseli analiz et ve başvur",
    metaHelpUrl: "https://www.facebook.com/hacked",
    metaHelpLabel: "Meta · Hacklenen hesap merkezi",
  },
  {
    kind: "fake",
    slug: "fake",
    title: "Adınıza Açılan Fake Hesap",
    short: "İsminize / fotoğrafınıza sahte hesap",
    description:
      "Sahte profilin ekran görüntüsünü yükle. Ne zaman fark ettiğini ve sahte hesabın kullanıcı adını yaz. Analiz sonrası Meta taklit / şikayet yardımına aktarılır.",
    steps: ["Fake profil görseli", "Ne zaman fark edildi", "Sahte hesap bilgisi", "Meta şikayet"],
    whenLabel: "Ne zaman fark edildi?",
    whenPlaceholder: "Örn. bu sabah, geçen hafta…",
    detailLabel: "Sahte hesap kullanıcı adı ve açıklama",
    detailPlaceholder:
      "Sahte hesabın @kullanıcıadı, hangi fotoğraflarınız / isminiz kullanılmış, sizi mi taklit ediyor — detay yaz.",
    emailLabel: "İletişim e-postanız",
    subject: "Adıma açılan fake hesap",
    cta: "Görseli analiz et ve başvur",
    metaHelpUrl: "https://www.facebook.com/help/instagram/contact/636276399721841",
    metaHelpLabel: "Meta · Hesap taklidi şikayet formu",
  },
];

export function getAccountHelpTool(slug: string): AccountHelpTool | undefined {
  return ACCOUNT_HELP_TOOLS.find((t) => t.slug === slug);
}

export function caseNumberFromTicket(kind: AccountHelpKind, ticketId: string): string {
  const prefix =
    kind === "closed" ? "KP" : kind === "stolen" ? "CL" : kind === "fake" ? "FK" : "TW";
  const tail = ticketId.replace(/[^a-zA-Z0-9]/g, "").slice(-8).toUpperCase();
  return `TW-${prefix}-${tail}`;
}
