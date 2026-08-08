export type ServiceCard = {
  id: string;
  number: string;
  title: string;
  description: string;
  href: string;
  icon:
    | "analytics"
    | "instagram"
    | "followers"
    | "unfollow"
    | "nonfollow"
    | "fake"
    | "report"
    | "news"
    | "security"
    | "social"
    | "eye"
    | "block";
};

export const SERVICES: ServiceCard[] = [
  {
    id: "eski-hesap",
    number: "01",
    title: "META ESKİ HESAPLAR",
    description: "Instagram / Meta eski tarihli hesap seçenekleri ve güvenli teslim.",
    href: "/urunler/eski-tarihli-hesaplar",
    icon: "instagram",
  },
  {
    id: "projeli",
    number: "02",
    title: "PROJELİ HESAPLAR",
    description: "Marka ve proje için hazır / yaşlı hesap paketleri.",
    href: "/urunler/projeli-hesaplar",
    icon: "social",
  },
  {
    id: "kapanan",
    number: "03",
    title: "KAPANAN HESAP AÇMA",
    description: "Askı / kapanma ekranını yükle, nedeni yaz — itiraz süreci başlasın.",
    href: "/urunler/kapanan-hesap-aktif-etme",
    icon: "security",
  },
  {
    id: "facebook-eski",
    number: "04",
    title: "FACEBOOK ESKİ HESAP",
    description: "Eski tarihli Facebook hesap ve sayfa desteği.",
    href: "/urunler/facebook-eski-tarihli-hesaplar",
    icon: "followers",
  },
  {
    id: "kurtarma",
    number: "05",
    title: "HESAP KURTARMA",
    description: "Hack / erişim kaybı sonrası resmi kurtarma adımları.",
    href: "/urunler/instagram-hesap-kurtarma",
    icon: "report",
  },
  {
    id: "haber",
    number: "06",
    title: "HABER / İÇERİK KALDIRMA",
    description: "Olumsuz haber ve içerik kaldırma süreçlerinde yönlendirme.",
    href: "/urunler/haber-silme",
    icon: "news",
  },
];
