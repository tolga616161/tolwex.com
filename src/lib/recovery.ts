import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export type RecoveryKind =
  | "closed"
  | "stolen"
  | "fake"
  | "influencer"
  | "account"
  | "growth"
  | "ad_restrict"
  | "ad_approve";

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
  imageRequired?: boolean;
  cta: string;
  group: "hesap" | "buyume" | "reklam";
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
    imageRequired: true,
    cta: "WhatsApp’tan gönder",
    group: "hesap",
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
    reasonPlaceholder: "Şifre / e-posta değişimi, şüpheli hareket…",
    imageHint: "Şüpheli giriş ekranı fotoğrafını ekle",
    imageRequired: true,
    cta: "WhatsApp’tan gönder",
    group: "hesap",
  },
  {
    kind: "fake",
    slug: "fake",
    href: "/basvuru/fake",
    title: "Fake Hesap Şikayeti",
    short: "Sahte hesap şikayeti",
    eyebrow: "03",
    description: "Adınıza veya fotoğrafınıza açılan sahte hesap için şikayet.",
    whenLabel: "Ne zaman fark edildi?",
    whenPlaceholder: "Örn. bu sabah, geçen hafta…",
    reasonLabel: "Sahte hesap detayı",
    reasonPlaceholder: "Sahte @kullanıcıadı ve neyi taklit ettiği…",
    imageHint: "Fake profil ekran görüntüsünü ekle",
    imageRequired: true,
    cta: "WhatsApp’tan gönder",
    group: "hesap",
  },
  {
    kind: "account",
    slug: "hesap-hizmeti",
    href: "/basvuru/hesap-hizmeti",
    title: "Hesap Hizmeti",
    short: "Genel hesap desteği",
    eyebrow: "04",
    description: "Hesap ayarı, doğrulama, erişim ve diğer hesap işlemleri.",
    whenLabel: "Ne zamandır sorun var?",
    whenPlaceholder: "Örn. 1 haftadır, bugün…",
    reasonLabel: "Ne istiyorsun?",
    reasonPlaceholder: "Doğrulama, erişim, ayar, diğer… kısa yaz.",
    imageHint: "İlgili ekran görüntüsünü ekle (önerilir)",
    imageRequired: false,
    cta: "WhatsApp’tan gönder",
    group: "hesap",
  },
  {
    kind: "influencer",
    slug: "influencer",
    href: "/basvuru/influencer",
    title: "Influencer Olmak",
    short: "Influencer başvurusu",
    eyebrow: "05",
    description: "Profesyonel / creator büyüme ve influencer süreç desteği.",
    whenLabel: "Hedefin ne?",
    whenPlaceholder: "Örn. marka işbirliği, profesyonel hesap…",
    reasonLabel: "Kısaca kendini anlat",
    reasonPlaceholder: "Niş, takipçi, ne yapmak istediğin…",
    imageHint: "Profil ekran görüntüsü (önerilir)",
    imageRequired: false,
    cta: "WhatsApp’tan gönder",
    group: "buyume",
  },
  {
    kind: "growth",
    slug: "buyume",
    href: "/basvuru/buyume",
    title: "Büyüme Hizmeti",
    short: "Organik / stratejik büyüme",
    eyebrow: "06",
    description: "İçerik, erişim ve hesap büyüme danışmanlığı başvurusu.",
    whenLabel: "Hangi platform?",
    whenPlaceholder: "Instagram / TikTok / YouTube…",
    reasonLabel: "Büyüme hedefin",
    reasonPlaceholder: "Takipçi, erişim, satış… hedefi yaz.",
    imageHint: "Profil veya istatistik ekranı (önerilir)",
    imageRequired: false,
    cta: "WhatsApp’tan gönder",
    group: "buyume",
  },
  {
    kind: "ad_restrict",
    slug: "reklam-kisit",
    href: "/basvuru/reklam-kisit",
    title: "Reklam Kısıtı Kaldırma",
    short: "Reklam hesabı kısıtı",
    eyebrow: "07",
    description: "Reklam hesabı kısıtlıysa veya yayınlanmıyorsa başvuru formu.",
    whenLabel: "Ne zaman kısıtlandı?",
    whenPlaceholder: "Örn. dün, bu sabah…",
    reasonLabel: "Kısıt mesajı / detay",
    reasonPlaceholder: "Ekranda yazan uyarıyı aynen yaz.",
    imageHint: "Kısıt ekranı fotoğrafını ekle",
    imageRequired: true,
    cta: "WhatsApp’tan gönder",
    group: "reklam",
  },
  {
    kind: "ad_approve",
    slug: "reklam-onay",
    href: "/basvuru/reklam-onay",
    title: "Reklam Onayları",
    short: "Reklam onay / inceleme",
    eyebrow: "08",
    description: "Onayda bekleyen veya reddedilen reklamlar için destek.",
    whenLabel: "Ne zamandır onayda?",
    whenPlaceholder: "Örn. 2 gündür, bugün…",
    reasonLabel: "Reklam / hesap bilgisi",
    reasonPlaceholder: "Hesap adı, reklam konusu, red sebebi varsa…",
    imageHint: "Onay / red ekranı fotoğrafını ekle",
    imageRequired: true,
    cta: "WhatsApp’tan gönder",
    group: "reklam",
  },
];

export function getRecoveryService(slug: string): RecoveryService | undefined {
  return RECOVERY_SERVICES.find((s) => s.slug === slug);
}

const KIND_TITLE: Record<RecoveryKind, string> = {
  closed: "KAPANAN HESAP",
  stolen: "ÇALINAN HESAP",
  fake: "FAKE HESAP ŞİKAYETİ",
  account: "HESAP HİZMETİ",
  influencer: "INFLUENCER BAŞVURUSU",
  growth: "BÜYÜME HİZMETİ",
  ad_restrict: "REKLAM KISITI KALDIRMA",
  ad_approve: "REKLAM ONAYLARI",
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
    `${input.whenText ? `Zaman / hedef: ${input.whenText}` : ""}`,
    `Detay:\n${input.reason}`,
    "",
    "Görseli bu sohbete ekliyorum (varsa).",
    `İletişim: ${CONTACT_PHONE_DISPLAY}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function recoveryWhatsAppHref(message: string): string {
  return whatsappUrl(message);
}
