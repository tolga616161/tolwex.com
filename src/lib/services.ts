export type ServiceCard = {
  id: string;
  number: string;
  title: string;
  description: string;
  href: string;
  icon: "analytics" | "instagram" | "followers" | "unfollow" | "nonfollow" | "fake" | "report" | "news" | "security" | "social";
};

export const SERVICES: ServiceCard[] = [
  {
    id: "analytics",
    number: "01",
    title: "SOCIAL MEDIA ANALYTICS",
    description: "Erişilebilen gerçek verilerden hesap performansı ve etkileşim içgörüleri.",
    href: "/instagram/dashboard",
    icon: "analytics",
  },
  {
    id: "ig-analiz",
    number: "02",
    title: "INSTAGRAM ANALİZİ",
    description: "Resmi Meta bağlantısı ile profil, izin ve hesap durumu analizi.",
    href: "/instagram/connect",
    icon: "instagram",
  },
  {
    id: "takipci",
    number: "03",
    title: "TAKİPÇİ ANALİZİ",
    description: "Takipçi yapısı ve erişilebilen metrikler üzerinden anlaşılır özet.",
    href: "/instagram/dashboard",
    icon: "followers",
  },
  {
    id: "takipten-cikanlar",
    number: "04",
    title: "TAKİPTEN ÇIKANLAR",
    description: "Önceki kayıt ile yeni veri karşılaştırıldığında değişen hesaplar.",
    href: "/#takipten-cikanlar",
    icon: "unfollow",
  },
  {
    id: "takip-etmeyenler",
    number: "05",
    title: "TAKİP ETMEYENLER",
    description: "Erişilebilen listeler üzerinden karşılıklı takip sinyallerinin analizi.",
    href: "/#analiz",
    icon: "nonfollow",
  },
  {
    id: "fake",
    number: "06",
    title: "FAKE HESAP TESPİTİ",
    description: "Risk skoruna dayalı sinyal analizi — kesin hüküm vermeden değerlendirme.",
    href: "/#fake-hesap",
    icon: "fake",
  },
  {
    id: "fake-rehber",
    number: "07",
    title: "FAKE HESAP RAPORLAMA REHBERİ",
    description: "Sahte hesap bildirim süreçleri için resmi adımlara uygun rehberlik.",
    href: "/urunler/fake-hesap-kapatma",
    icon: "report",
  },
  {
    id: "haber",
    number: "08",
    title: "HABER & İÇERİK KALDIRMA REHBERİ",
    description: "Uygun başvuru ve kaldırma süreçlerinde profesyonel yönlendirme.",
    href: "/urunler/haber-silme",
    icon: "news",
  },
  {
    id: "guvenlik",
    number: "09",
    title: "HESAP GÜVENLİĞİ",
    description: "Meta OAuth, izin durumu ve güvenlik checklist ile kontrol paneli.",
    href: "/instagram/security",
    icon: "security",
  },
  {
    id: "sosyal-analiz",
    number: "10",
    title: "SOSYAL MEDYA HESAP ANALİZİ",
    description: "Çok kanallı hesap verilerini tek bir istihbarat katmanında birleştirir.",
    href: "/urunler",
    icon: "social",
  },
];
