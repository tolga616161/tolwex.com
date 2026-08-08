export type CategoryFilter =
  | "all"
  | "hesap"
  | "kurtarma"
  | "guvenlik"
  | "itibar"
  | "sosyal";

export type CategoryItem = {
  id: string;
  name: string;
  short: string;
  description: string;
  filter: CategoryFilter[];
  accent: string;
  accent2: string;
  href: string;
  meta?: string;
  icon: "instagram" | "facebook" | "tiktok" | "google" | "seo" | "social" | "ads" | "design";
};

export const FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "hesap", label: "Eski Hesaplar" },
  { id: "kurtarma", label: "Kurtarma" },
  { id: "guvenlik", label: "Güvenlik" },
  { id: "itibar", label: "İtibar" },
  { id: "sosyal", label: "Sosyal Medya" },
];

export const CATEGORIES: CategoryItem[] = [
  {
    id: "eski-hesap",
    name: "Eski Tarihli Hesaplar",
    short: "Yaşlı hesap çözümleri",
    description: "Instagram ve diğer platformlar için eski tarihli hesap seçenekleri.",
    filter: ["hesap", "sosyal"],
    accent: "#f58529",
    accent2: "#dd2a7b",
    href: "/urunler/eski-tarihli-hesaplar",
    meta: "Hesap · Teslim",
    icon: "instagram",
  },
  {
    id: "facebook-eski",
    name: "Facebook Eski Hesap",
    short: "FB hesap & sayfa",
    description: "Eski tarihli Facebook hesap ve sayfa desteği.",
    filter: ["hesap", "sosyal"],
    accent: "#1877f2",
    accent2: "#0a54c2",
    href: "/urunler/facebook-eski-tarihli-hesaplar",
    meta: "Facebook · Meta",
    icon: "facebook",
  },
  {
    id: "aktif-etme",
    name: "Hesap Aktif Etme",
    short: "Kapanan hesaplar",
    description: "Askıya alınan veya kapanan hesapları yeniden açma desteği.",
    filter: ["kurtarma"],
    accent: "#e4574d",
    accent2: "#e9a319",
    href: "/urunler/kapanan-hesap-aktif-etme",
    meta: "İtiraz · Takip",
    icon: "instagram",
  },
  {
    id: "meta-verified",
    name: "Meta Verified",
    short: "Onay & hata çözümü",
    description: "Meta Verified başvuru redleri ve hata mesajları için destek.",
    filter: ["guvenlik", "sosyal"],
    accent: "#1877f2",
    accent2: "#f58529",
    href: "/urunler/meta-verified-hatalari",
    meta: "Verified · Meta",
    icon: "facebook",
  },
  {
    id: "instagram-guvenlik",
    name: "Instagram Güvenlik",
    short: "Hesap kontrolü",
    description: "2FA, cihaz, şifre ve bağlı uygulamalar için güvenlik rehberi.",
    filter: ["guvenlik", "sosyal"],
    accent: "#dd2a7b",
    accent2: "#8134af",
    href: "/instagram/security",
    meta: "2FA · Kontrol listesi",
    icon: "instagram",
  },
  {
    id: "itibar",
    name: "İtibar",
    short: "Haber & fake hesap",
    description: "Haber silme ve sahte hesap kapatma hizmetleri.",
    filter: ["itibar"],
    accent: "#e4574d",
    accent2: "#e9a319",
    href: "/urunler/haber-silme",
    meta: "Silme · Bildirim",
    icon: "seo",
  },
  {
    id: "tiktok",
    name: "TikTok",
    short: "Hesap & büyüme",
    description: "TikTok hesap, güvenlik ve içerik hizmetleri.",
    filter: ["sosyal", "hesap"],
    accent: "#25f4ee",
    accent2: "#fe2c55",
    href: "/urunler/tiktok-hesap-hizmetleri",
    meta: "Hesap · İçerik",
    icon: "tiktok",
  },
  {
    id: "sosyal-yonetim",
    name: "Sosyal Medya Yönetimi",
    short: "Çok kanallı yönetim",
    description: "Instagram, Facebook ve TikTok için içerik ve hesap yönetimi.",
    filter: ["sosyal"],
    accent: "#a78bfa",
    accent2: "#2ec4b6",
    href: "/urunler/sosyal-medya-yonetimi",
    meta: "Yönetim · Plan",
    icon: "social",
  },
];

export const MEGA_MENU = [
  {
    title: "Hesap Hizmetleri",
    items: [
      {
        label: "Eski Tarihli Hesaplar",
        href: "/urunler/eski-tarihli-hesaplar",
        desc: "Yaşlı hesap seçenekleri",
      },
      {
        label: "Facebook Eski Hesap",
        href: "/urunler/facebook-eski-tarihli-hesaplar",
        desc: "FB hesap / sayfa",
      },
      {
        label: "Kapanan Hesap Aktif Etme",
        href: "/urunler/kapanan-hesap-aktif-etme",
        desc: "Askı · kapanma itirazı",
      },
      {
        label: "Meta Verified Hataları",
        href: "/urunler/meta-verified-hatalari",
        desc: "Onay & red çözümleri",
      },
    ],
  },
  {
    title: "Güvenlik & İtibar",
    items: [
      {
        label: "Instagram Güvenlik",
        href: "/instagram/dashboard",
        desc: "Hesap kontrol paneli",
      },
      {
        label: "Hesap Kurtarma",
        href: "/urunler/instagram-hesap-kurtarma",
        desc: "Hack / erişim kaybı",
      },
      {
        label: "Haber Silme",
        href: "/urunler/haber-silme",
        desc: "İçerik kaldırma",
      },
      {
        label: "Fake Hesap Kapatma",
        href: "/urunler/fake-hesap-kapatma",
        desc: "Sahte hesap bildirimi",
      },
    ],
  },
  {
    title: "Sosyal Medya",
    items: [
      {
        label: "Tüm Hizmetler",
        href: "/urunler",
        desc: "Hizmet kataloğu",
      },
      {
        label: "TikTok Hizmetleri",
        href: "/urunler/tiktok-hesap-hizmetleri",
        desc: "Hesap & büyüme",
      },
      {
        label: "YouTube Hizmetleri",
        href: "/urunler/youtube-hesap-hizmetleri",
        desc: "Kanal & doğrulama",
      },
      {
        label: "Sosyal Medya Yönetimi",
        href: "/urunler/sosyal-medya-yonetimi",
        desc: "Çok kanallı yönetim",
      },
    ],
  },
];
