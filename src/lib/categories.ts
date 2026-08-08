export type CategoryFilter =
  | "all"
  | "social"
  | "ads"
  | "seo"
  | "design"
  | "digital";

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
  { id: "social", label: "Sosyal Medya" },
  { id: "ads", label: "Reklam" },
  { id: "seo", label: "SEO" },
  { id: "design", label: "Tasarım" },
  { id: "digital", label: "Dijital" },
];

export const CATEGORIES: CategoryItem[] = [
  {
    id: "instagram",
    name: "Instagram",
    short: "Hesap güvenliği & OAuth",
    description: "Resmi Meta OAuth ile hesabınızı bağlayın, izinleri ve API durumunu kontrol edin.",
    filter: ["social", "digital"],
    accent: "#f58529",
    accent2: "#dd2a7b",
    href: "/instagram/connect",
    meta: "OAuth · Güvenlik",
    icon: "instagram",
  },
  {
    id: "facebook",
    name: "Facebook",
    short: "Meta ekosistemi",
    description: "Facebook / Meta bağlantısı üzerinden sayfa ve izin yönetimine hazır altyapı.",
    filter: ["social", "ads"],
    accent: "#1877f2",
    accent2: "#0a54c2",
    href: "/instagram/connect",
    meta: "Meta · Bağlantı",
    icon: "facebook",
  },
  {
    id: "tiktok",
    name: "TikTok",
    short: "Kısa video stratejisi",
    description: "İçerik ritmi, trend uyumu ve büyüme odaklı TikTok danışmanlığı.",
    filter: ["social", "ads"],
    accent: "#25f4ee",
    accent2: "#fe2c55",
    href: "/#categories",
    meta: "İçerik · Büyüme",
    icon: "tiktok",
  },
  {
    id: "google",
    name: "Google",
    short: "Arama & Ads",
    description: "Google Ads ve arama görünürlüğü için ölçülebilir dijital performans.",
    filter: ["ads", "seo", "digital"],
    accent: "#4285f4",
    accent2: "#34a853",
    href: "/#categories",
    meta: "Ads · Analytics",
    icon: "google",
  },
  {
    id: "seo",
    name: "SEO",
    short: "Organik büyüme",
    description: "Teknik SEO, içerik mimarisi ve arama niyeti odaklı görünürlük.",
    filter: ["seo", "digital"],
    accent: "#2ec4b6",
    accent2: "#7c5cff",
    href: "/#categories",
    meta: "Teknik · İçerik",
    icon: "seo",
  },
  {
    id: "social",
    name: "Sosyal Medya",
    short: "Marka varlığı",
    description: "Çok kanallı içerik planı, topluluk yönetimi ve raporlama.",
    filter: ["social", "digital"],
    accent: "#a78bfa",
    accent2: "#2ec4b6",
    href: "/instagram/security",
    meta: "Strateji · Yönetim",
    icon: "social",
  },
  {
    id: "ads",
    name: "Reklam",
    short: "Meta · Google · TikTok",
    description: "Hedefleme, kreatif test ve ROAS odaklı performans reklamcılığı.",
    filter: ["ads", "digital"],
    accent: "#e9a319",
    accent2: "#e4574d",
    href: "/#categories",
    meta: "Performance",
    icon: "ads",
  },
  {
    id: "design",
    name: "Tasarım",
    short: "Görsel kimlik",
    description: "Dijital arayüz, kreatif asset ve marka tasarım sistemleri.",
    filter: ["design", "digital"],
    accent: "#ff6bcb",
    accent2: "#7c5cff",
    href: "/#categories",
    meta: "UI · Brand",
    icon: "design",
  },
];

export const MEGA_MENU = [
  {
    title: "Ürün Kataloğu",
    items: [
      {
        label: "Tüm Ürünler",
        href: "/urunler",
        desc: "Mağaza vitrini",
      },
      {
        label: "Instagram Güvenlik",
        href: "/urunler/instagram-hesap-guvenlik-kontrolu",
        desc: "₺499 · OAuth kontrol",
      },
      {
        label: "Instagram Yönetim",
        href: "/urunler/instagram-yonetim-paketi",
        desc: "₺4.990 · Aylık paket",
      },
      {
        label: "Kurumsal Sosyal",
        href: "/urunler/sosyal-medya-kurumsal",
        desc: "₺8.990 · 3 kanal",
      },
    ],
  },
  {
    title: "Reklam Ürünleri",
    items: [
      {
        label: "Meta Ads",
        href: "/urunler/meta-ads-baslangic",
        desc: "₺3.490 · FB + IG",
      },
      {
        label: "Google Ads",
        href: "/urunler/google-ads-arama",
        desc: "₺3.990 · Arama ağı",
      },
      {
        label: "TikTok İçerik",
        href: "/urunler/tiktok-icerik-paketi",
        desc: "₺2.990 · Senaryo paketi",
      },
    ],
  },
  {
    title: "Dijital",
    items: [
      {
        label: "SEO Denetim",
        href: "/urunler/seo-baslangic-denetimi",
        desc: "₺2.490 · Teknik rapor",
      },
      {
        label: "Landing Tasarım",
        href: "/urunler/web-tasarim-landing",
        desc: "₺7.500 · Premium UI",
      },
      {
        label: "Instagram Bağla",
        href: "/instagram/connect",
        desc: "Resmi Meta OAuth",
      },
      {
        label: "Güvenlik Merkezi",
        href: "/instagram/security",
        desc: "Checklist + rehber",
      },
    ],
  },
];
