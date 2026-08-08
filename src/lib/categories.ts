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
  { id: "hesap", label: "Eski / Projeli" },
  { id: "kurtarma", label: "Kurtarma" },
  { id: "itibar", label: "İtibar" },
  { id: "sosyal", label: "Sosyal Medya" },
];

export const CATEGORIES: CategoryItem[] = [
  {
    id: "eski-hesap",
    name: "Meta Eski Hesaplar",
    short: "Yaşlı hesap çözümleri",
    description: "Instagram / Meta eski tarihli hesap seçenekleri.",
    filter: ["hesap", "sosyal"],
    accent: "#f58529",
    accent2: "#dd2a7b",
    href: "/urunler/eski-tarihli-hesaplar",
    meta: "Hesap · Teslim",
    icon: "instagram",
  },
  {
    id: "projeli",
    name: "Projeli Hesaplar",
    short: "Marka & kampanya",
    description: "Proje ve marka için hazır / yaşlı hesap paketleri.",
    filter: ["hesap", "sosyal"],
    accent: "#2ec4b6",
    accent2: "#1877f2",
    href: "/urunler/projeli-hesaplar",
    meta: "Proje · Paket",
    icon: "social",
  },
  {
    id: "aktif-etme",
    name: "Kapanan Hesap Açma",
    short: "Görsel + neden",
    description: "Kapanma ekranını yükle, nedeni yaz — itiraz süreci.",
    filter: ["kurtarma"],
    accent: "#e4574d",
    accent2: "#e9a319",
    href: "/urunler/kapanan-hesap-aktif-etme",
    meta: "Yükle · WhatsApp",
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
];

export const MEGA_MENU = [
  {
    title: "Hesap Hizmetleri",
    items: [
      {
        label: "Meta Eski Hesaplar",
        href: "/urunler/eski-tarihli-hesaplar",
        desc: "Yaşlı hesap seçenekleri",
      },
      {
        label: "Projeli Hesaplar",
        href: "/urunler/projeli-hesaplar",
        desc: "Marka / kampanya paketleri",
      },
      {
        label: "Kapanan Hesap Açma",
        href: "/urunler/kapanan-hesap-aktif-etme",
        desc: "Görsel yükle · neden yaz",
      },
      {
        label: "Facebook Eski Hesap",
        href: "/urunler/facebook-eski-tarihli-hesaplar",
        desc: "FB hesap / sayfa",
      },
    ],
  },
  {
    title: "Kurtarma & İtibar",
    items: [
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
      {
        label: "Tüm Ürünler",
        href: "/urunler",
        desc: "Katalog",
      },
    ],
  },
];
