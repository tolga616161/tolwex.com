import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export type RecoveryKind =
  | "closed"
  | "suspended"
  | "username"
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

/** Platform → brand asset (form + hero) */
export const PLATFORM_ICON: Record<Exclude<RecoveryPlatform, "Diğer" | "WhatsApp">, string> & {
  WhatsApp?: string;
  Diğer?: string;
} = {
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
  group: "hesap" | "buyume" | "reklam";
  nav?: boolean;
};

export const RECOVERY_SERVICES: RecoveryService[] = [
  {
    kind: "closed",
    slug: "kapanan",
    href: "/basvuru/kapanan",
    title: "Kapanan Hesap",
    short: "Kapanan hesap çözümü",
    eyebrow: "01",
    description:
      "Instagram, TikTok, X ve diğer platformlarda kapanan hesabın için teknik çözüm başvurusu.",
    whenLabel: "Ne zaman kapandı?",
    whenPlaceholder: "Örn. bugün sabah, 3 gün önce…",
    reasonLabel: "Kapanma sebebi / ekran mesajı",
    reasonPlaceholder: "Ekranda yazan uyarıyı veya kapanma sebebini yaz.",
    imageHint: "Kapanma / giriş ekranı fotoğrafını ekle (istersen)",
    imageRequired: false,
    cta: "WhatsApp’tan gönder",
    group: "hesap",
    nav: true,
  },
  {
    kind: "suspended",
    slug: "aski",
    href: "/basvuru/aski",
    title: "Askıya Alınan Hesap",
    short: "Askı / kısıt çözümü",
    eyebrow: "02",
    description:
      "Hesabın askıya alındıysa veya geçici engellendiyse platform seçip başvurunu ilet.",
    whenLabel: "Ne zaman askıya alındı?",
    whenPlaceholder: "Örn. dün, bu sabah…",
    reasonLabel: "Askı mesajı / detay",
    reasonPlaceholder: "Ekrandaki uyarıyı aynen yaz.",
    imageHint: "Askı ekranı fotoğrafını ekle (istersen)",
    imageRequired: false,
    cta: "WhatsApp’tan gönder",
    group: "hesap",
    nav: true,
  },
  {
    kind: "username",
    slug: "kullanici-adi",
    href: "/basvuru/kullanici-adi",
    title: "Kullanıcı Adı Alma",
    short: "Username / @ alma",
    eyebrow: "03",
    description:
      "İstediğin @kullanıcı adını almak veya boşaltılan username için başvuru.",
    whenLabel: "Hangi kullanıcı adı?",
    whenPlaceholder: "Örn. @markaadi",
    reasonLabel: "Neden bu kullanıcı adı?",
    reasonPlaceholder: "Marka, kişisel isim, önceki hesap… kısaca yaz.",
    imageHint: "İlgili profil veya arama ekranı (istersen)",
    imageRequired: false,
    cta: "WhatsApp’tan gönder",
    group: "hesap",
    nav: true,
  },
  {
    kind: "stolen",
    slug: "calinan",
    href: "/basvuru/calinan",
    title: "Çalınan Hesap",
    short: "Çalıntı / ele geçirme",
    eyebrow: "04",
    description: "Hesabın çalındıysa veya şüpheli giriş varsa teknik destek formu.",
    whenLabel: "Ne zaman çalındı?",
    whenPlaceholder: "Örn. dün gece, 2 saat önce…",
    reasonLabel: "Ne oldu?",
    reasonPlaceholder: "Şifre / e-posta değişimi, şüpheli hareket…",
    imageHint: "Şüpheli giriş ekranı (istersen)",
    imageRequired: false,
    cta: "WhatsApp’tan gönder",
    group: "hesap",
  },
  {
    kind: "fake",
    slug: "fake",
    href: "/basvuru/fake",
    title: "Fake Hesap Şikayeti",
    short: "Sahte hesap",
    eyebrow: "05",
    description: "Adına veya fotoğrafına açılan sahte hesap için şikayet başvurusu.",
    whenLabel: "Ne zaman fark edildi?",
    whenPlaceholder: "Örn. bu sabah…",
    reasonLabel: "Sahte hesap detayı",
    reasonPlaceholder: "Sahte @kullanıcıadı ve neyi taklit ettiği…",
    imageHint: "Fake profil ekranı (istersen)",
    imageRequired: false,
    cta: "WhatsApp’tan gönder",
    group: "hesap",
  },
  {
    kind: "account",
    slug: "hesap-hizmeti",
    href: "/basvuru/hesap-hizmeti",
    title: "Hesap Hizmeti",
    short: "Genel hesap desteği",
    eyebrow: "06",
    description: "Doğrulama, erişim, ayar ve diğer hesap işlemleri için başvuru.",
    whenLabel: "Ne zamandır sorun var?",
    whenPlaceholder: "Örn. 1 haftadır…",
    reasonLabel: "Ne istiyorsun?",
    reasonPlaceholder: "Doğrulama, erişim, ayar… kısa yaz.",
    imageHint: "İlgili ekran (istersen)",
    imageRequired: false,
    cta: "WhatsApp’tan gönder",
    group: "hesap",
  },
  {
    kind: "influencer",
    slug: "influencer",
    href: "/basvuru/influencer",
    title: "Influencer Olmak",
    short: "Creator / influencer",
    eyebrow: "07",
    description: "Profesyonel creator ve influencer süreç desteği.",
    whenLabel: "Hedefin ne?",
    whenPlaceholder: "Örn. marka işbirliği…",
    reasonLabel: "Kısaca kendini anlat",
    reasonPlaceholder: "Niş, takipçi, ne yapmak istediğin…",
    imageHint: "Profil ekranı (istersen)",
    imageRequired: false,
    cta: "WhatsApp’tan gönder",
    group: "buyume",
    nav: true,
  },
  {
    kind: "growth",
    slug: "buyume",
    href: "/basvuru/buyume",
    title: "Büyüme Hizmeti",
    short: "Büyüme danışmanlığı",
    eyebrow: "08",
    description: "İçerik, erişim ve hesap büyüme danışmanlığı başvurusu.",
    whenLabel: "Hangi platform odaklı?",
    whenPlaceholder: "Instagram / TikTok / YouTube…",
    reasonLabel: "Büyüme hedefin",
    reasonPlaceholder: "Takipçi, erişim, satış… hedefi yaz.",
    imageHint: "Profil veya istatistik (istersen)",
    imageRequired: false,
    cta: "WhatsApp’tan gönder",
    group: "buyume",
  },
  {
    kind: "ad_restrict",
    slug: "reklam-kisit",
    href: "/basvuru/reklam-kisit",
    title: "Reklam Kısıtı Kaldırma",
    short: "Reklam kısıtı",
    eyebrow: "09",
    description: "Reklam hesabı kısıtlıysa veya yayınlanmıyorsa başvuru.",
    whenLabel: "Ne zaman kısıtlandı?",
    whenPlaceholder: "Örn. dün…",
    reasonLabel: "Kısıt mesajı / detay",
    reasonPlaceholder: "Ekranda yazan uyarıyı yaz.",
    imageHint: "Kısıt ekranı (istersen)",
    imageRequired: false,
    cta: "WhatsApp’tan gönder",
    group: "reklam",
    nav: true,
  },
  {
    kind: "ad_approve",
    slug: "reklam-onay",
    href: "/basvuru/reklam-onay",
    title: "Reklam Onayları",
    short: "Reklam onay",
    eyebrow: "10",
    description: "Onayda bekleyen veya reddedilen reklamlar için destek.",
    whenLabel: "Ne zamandır onayda?",
    whenPlaceholder: "Örn. 2 gündür…",
    reasonLabel: "Reklam / hesap bilgisi",
    reasonPlaceholder: "Hesap adı, konu, red sebebi varsa…",
    imageHint: "Onay / red ekranı (istersen)",
    imageRequired: false,
    cta: "WhatsApp’tan gönder",
    group: "reklam",
  },
];

export function getRecoveryService(slug: string): RecoveryService | undefined {
  return RECOVERY_SERVICES.find((s) => s.slug === slug);
}

export function navRecoveryLinks() {
  return RECOVERY_SERVICES.filter((s) => s.nav).map((s) => ({
    label: s.short,
    href: s.href,
  }));
}

const KIND_TITLE: Record<RecoveryKind, string> = {
  closed: "KAPANAN HESAP",
  suspended: "ASKIYA ALINAN HESAP",
  username: "KULLANICI ADI ALMA",
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
    input.whenText ? `Zaman / hedef: ${input.whenText}` : "",
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
