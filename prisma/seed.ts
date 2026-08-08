import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PRODUCTS = [
  {
    slug: "instagram-hesap-guvenlik-kontrolu",
    name: "Instagram Hesap Güvenlik Kontrolü",
    shortDesc: "Resmi Meta OAuth ile bağlantı + güvenlik checklist",
    description:
      "Instagram hesabınızı resmi Meta bağlantısı üzerinden kontrol edin. Token güvenli saklanır; şifre istenmez. Dashboard + checklist + 2FA rehberi dahildir.",
    price: 499,
    category: "instagram",
    badge: "Popüler",
    icon: "instagram",
    accent: "#f58529",
    accent2: "#dd2a7b",
    features: ["Resmi OAuth bağlantısı", "İzin & API durumu", "Güvenlik checklist", "2FA rehberi"],
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "instagram-yonetim-paketi",
    name: "Instagram Yönetim Paketi",
    shortDesc: "Aylık içerik + büyüme planı",
    description:
      "Profil düzeni, içerik takvimi, hashtag/strateji ve haftalık rapor. Markanız için sürdürülebilir Instagram yönetimi.",
    price: 4990,
    category: "instagram",
    badge: "Aylık",
    icon: "instagram",
    accent: "#dd2a7b",
    accent2: "#8134af",
    features: ["12 içerik / ay", "Caption & plan", "Story setleri", "Haftalık rapor"],
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "meta-ads-baslangic",
    name: "Meta Ads Başlangıç",
    shortDesc: "Facebook & Instagram reklam kurulumu",
    description:
      "Pixel/olay kontrolü, kampanya iskeleti, hedef kitle ve kreatif brief. Performans odaklı Meta Ads başlangıç paketi.",
    price: 3490,
    category: "reklam",
    badge: "Reklam",
    icon: "ads",
    accent: "#1877f2",
    accent2: "#e9a319",
    features: ["Kampanya kurulumu", "Hedef kitle", "Kreatif brief", "7 gün optimizasyon"],
    featured: true,
    sortOrder: 3,
  },
  {
    slug: "tiktok-icerik-paketi",
    name: "TikTok İçerik Paketi",
    shortDesc: "Kısa video senaryo + yayın planı",
    description:
      "Trend uyumlu senaryolar, kapak metinleri ve yayın takvimi. TikTok’ta düzenli görünürlük için pratik paket.",
    price: 2990,
    category: "tiktok",
    badge: "Yeni",
    icon: "tiktok",
    accent: "#25f4ee",
    accent2: "#fe2c55",
    features: ["8 senaryo", "Hook önerileri", "Yayın takvimi", "Hashtag seti"],
    featured: true,
    sortOrder: 4,
  },
  {
    slug: "google-ads-arama",
    name: "Google Ads Arama Kampanyası",
    shortDesc: "Arama ağı kurulum + dönüşüm takibi",
    description:
      "Anahtar kelime yapısı, reklam metinleri, dönüşüm izleme ve ilk hafta optimizasyonu.",
    price: 3990,
    category: "reklam",
    badge: "",
    icon: "google",
    accent: "#4285f4",
    accent2: "#34a853",
    features: ["Arama kampanyası", "Negatif kelimeler", "Dönüşüm kurulumu", "Rapor"],
    featured: false,
    sortOrder: 5,
  },
  {
    slug: "seo-baslangic-denetimi",
    name: "SEO Başlangıç Denetimi",
    shortDesc: "Teknik + içerik görünürlük raporu",
    description:
      "Site tarama, temel teknik hatalar, içerik boşlukları ve 30 günlük aksiyon listesi.",
    price: 2490,
    category: "seo",
    badge: "",
    icon: "seo",
    accent: "#2ec4b6",
    accent2: "#7c5cff",
    features: ["Teknik tarama", "İçerik boşlukları", "Öncelik listesi", "PDF rapor"],
    featured: true,
    sortOrder: 6,
  },
  {
    slug: "web-tasarim-landing",
    name: "Landing Page Tasarım",
    shortDesc: "Tek sayfa premium dönüşüm odaklı tasarım",
    description:
      "Mobil uyumlu, animasyonlu landing page tasarımı. Marka mesajı + CTA + ürün vitrini.",
    price: 7500,
    category: "tasarim",
    badge: "Premium",
    icon: "design",
    accent: "#ff6bcb",
    accent2: "#7c5cff",
    features: ["UI tasarım", "Mobil uyum", "Animasyon dili", "Teslim notları"],
    featured: false,
    sortOrder: 7,
  },
  {
    slug: "sosyal-medya-kurumsal",
    name: "Sosyal Medya Kurumsal Paket",
    shortDesc: "Instagram + Facebook + TikTok birlikte",
    description:
      "Çok kanallı içerik üretimi, yayın takvimi ve aylık performans özeti. Markalar için kapsamlı paket.",
    price: 8990,
    category: "sosyal",
    badge: "Kurumsal",
    icon: "social",
    accent: "#a78bfa",
    accent2: "#2ec4b6",
    features: ["3 kanal", "20 içerik / ay", "Topluluk yönetimi", "Aylık rapor"],
    featured: true,
    sortOrder: 8,
  },
];

async function main() {
  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      create: {
        ...p,
        features: JSON.stringify(p.features),
        active: true,
      },
      update: {
        name: p.name,
        shortDesc: p.shortDesc,
        description: p.description,
        price: p.price,
        category: p.category,
        badge: p.badge,
        icon: p.icon,
        accent: p.accent,
        accent2: p.accent2,
        features: JSON.stringify(p.features),
        featured: p.featured,
        sortOrder: p.sortOrder,
        active: true,
      },
    });
  }
  console.log(`Seeded ${PRODUCTS.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
