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
    id: "analytics",
    number: "01",
    title: "INSTAGRAM ANALYTICS",
    description: "Erişilebilen gerçek verilerden hesap performansı ve etkileşim içgörüleri.",
    href: "/instagram/dashboard",
    icon: "analytics",
  },
  {
    id: "profile-visit",
    number: "02",
    title: "PROFİL ZİYARET ANALİZİ",
    description: "Tahmini profil ziyaret yoğunluğu — kesin ziyaretçi listesi üretilmez.",
    href: "/analiz/profilime-kim-bakti",
    icon: "eye",
  },
  {
    id: "blocking",
    number: "03",
    title: "ENGELLEME ANALİZİ",
    description: "Muhtemel engelleme sinyalleri — resmi engelleyen listesi değildir.",
    href: "/analiz/beni-engelleyenler",
    icon: "block",
  },
  {
    id: "takipten-cikanlar",
    number: "04",
    title: "TAKİPTEN ÇIKANLAR",
    description: "Önceki kayıt ile yeni veri karşılaştırıldığında değişen hesaplar.",
    href: "/analiz/takipten-cikanlar",
    icon: "unfollow",
  },
  {
    id: "takip-etmeyenler",
    number: "05",
    title: "TAKİP ETMEYENLER",
    description: "Erişilebilen listeler üzerinden karşılıklı takip sinyallerinin analizi.",
    href: "/analiz/takip-etmeyenler",
    icon: "nonfollow",
  },
  {
    id: "fake",
    number: "06",
    title: "FAKE HESAP ANALİZİ",
    description: "0–100 risk skoru — kesin fake hükmü yok.",
    href: "/analiz/fake-hesap",
    icon: "fake",
  },
  {
    id: "fake-rehber",
    number: "07",
    title: "FAKE HESAP RAPORLAMA",
    description: "Sahte hesap bildirim süreçleri için resmi adımlara uygun rehberlik.",
    href: "/urunler/fake-hesap-kapatma",
    icon: "report",
  },
  {
    id: "haber",
    number: "08",
    title: "HABER / İÇERİK KALDIRMA",
    description: "Uygun başvuru ve kaldırma süreçlerinde profesyonel yönlendirme.",
    href: "/urunler/haber-silme",
    icon: "news",
  },
  {
    id: "guvenlik",
    number: "09",
    title: "SOSYAL MEDYA GÜVENLİĞİ",
    description: "Meta OAuth, izin durumu ve güvenlik checklist ile kontrol paneli.",
    href: "/instagram/security",
    icon: "security",
  },
  {
    id: "hesap-analiz",
    number: "10",
    title: "HESAP ANALİZİ",
    description: "Çok kanallı hesap verilerini tek istihbarat katmanında birleştirir.",
    href: "/urunler",
    icon: "social",
  },
];
