import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** price kept as 0 — UI never shows prices */
const PRODUCTS = [
  {
    slug: "eski-tarihli-hesaplar",
    name: "Eski Tarihli Hesaplar",
    shortDesc: "Yaşlı / eski tarihli sosyal medya hesap çözümleri",
    description:
      "İhtiyacınıza uygun eski tarihli hesap seçenekleri ve güvenli teslim süreci. Instagram ve diğer platformlar için danışmanlık + yönlendirme.",
    price: 0,
    category: "hesap",
    badge: "Popüler",
    icon: "instagram",
    accent: "#f58529",
    accent2: "#dd2a7b",
    features: ["Platform seçimi", "Tarih / yaş filtresi", "Güvenli teslim", "WhatsApp destek"],
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "facebook-eski-tarihli-hesaplar",
    name: "Facebook Eski Tarihli Hesaplar",
    shortDesc: "Eski tarihli Facebook hesap ve sayfa desteği",
    description:
      "Eski tarihli Facebook hesap / sayfa ihtiyaçlarınız için ön görüşme, uygun seçenek ve teslim süreci yönetimi.",
    price: 0,
    category: "hesap",
    badge: "Facebook",
    icon: "facebook",
    accent: "#1877f2",
    accent2: "#0a54c2",
    features: ["Eski tarihli seçenek", "Sayfa / profil", "Kontrol listesi", "Teslim desteği"],
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "kapanan-hesap-aktif-etme",
    name: "Kapanan Hesap Aktif Etme",
    shortDesc: "Askıya alınan veya kapanan hesapları yeniden açma desteği",
    description:
      "Instagram, Facebook ve diğer platformlarda kapanan / askıya alınan hesaplar için resmi itiraz ve aktifleştirme süreci takibi.",
    price: 0,
    category: "kurtarma",
    badge: "Acil",
    icon: "instagram",
    accent: "#e4574d",
    accent2: "#e9a319",
    features: ["Durum analizi", "İtiraz dosyası", "Süreç takibi", "Sonuç bilgilendirme"],
    featured: true,
    sortOrder: 3,
  },
  {
    slug: "meta-verified-hatalari",
    name: "Meta Verified Hataları",
    shortDesc: "Meta Verified başvuru ve hata çözüm desteği",
    description:
      "Meta Verified onay, red ve hata mesajları için inceleme + düzeltme önerileri. Profil ve belge uyumu kontrolü.",
    price: 0,
    category: "meta",
    badge: "Meta",
    icon: "facebook",
    accent: "#1877f2",
    accent2: "#f58529",
    features: ["Hata analizi", "Profil uyumu", "Belge kontrolü", "Yeniden başvuru planı"],
    featured: true,
    sortOrder: 4,
  },
  {
    slug: "instagram-hesap-guvenlik-kontrolu",
    name: "Instagram Hesap Güvenlik Kontrolü",
    shortDesc: "Resmi Meta bağlantısı ile hesap durumu kontrolü",
    description:
      "Instagram hesabınızı resmi Meta OAuth ile bağlayın. İzinler, bağlantı sağlığı ve güvenlik checklist — uydurma skor yok.",
    price: 0,
    category: "guvenlik",
    badge: "Güvenlik",
    icon: "instagram",
    accent: "#f58529",
    accent2: "#dd2a7b",
    features: ["Resmi OAuth", "İzin durumu", "Güvenlik checklist", "2FA rehberi"],
    featured: true,
    sortOrder: 5,
  },
  {
    slug: "haber-silme",
    name: "Haber / İçerik Silme",
    shortDesc: "Olumsuz haber ve içerik kaldırma desteği",
    description:
      "İnternetteki istenmeyen haber / içerikler için platform ve site süreçlerine uygun kaldırma talebi yönetimi.",
    price: 0,
    category: "itibar",
    badge: "İtibar",
    icon: "seo",
    accent: "#e4574d",
    accent2: "#e9a319",
    features: ["URL analizi", "Başvuru süreci", "Takip", "WhatsApp destek"],
    featured: true,
    sortOrder: 6,
  },
  {
    slug: "fake-hesap-kapatma",
    name: "Fake Hesap Kapatma",
    shortDesc: "Sahte Instagram / Facebook hesap bildirimi",
    description:
      "Adınıza veya markanıza açılmış sahte hesaplar için resmi bildirim dosyası ve süreç takibi.",
    price: 0,
    category: "itibar",
    badge: "Hızlı",
    icon: "instagram",
    accent: "#dd2a7b",
    accent2: "#f58529",
    features: ["Tespit", "Bildirim dosyası", "Kanıt listesi", "Takip"],
    featured: true,
    sortOrder: 7,
  },
  {
    slug: "instagram-hesap-kurtarma",
    name: "Instagram Hesap Kurtarma",
    shortDesc: "Hack / erişim kaybı sonrası kurtarma desteği",
    description:
      "Hesabınıza giremiyorsanız resmi kurtarma adımları, e-posta/telefon güncelleme ve Meta süreç takibi.",
    price: 0,
    category: "kurtarma",
    badge: "Kurtarma",
    icon: "instagram",
    accent: "#dd2a7b",
    accent2: "#8134af",
    features: ["Erişim analizi", "Kurtarma adımları", "Meta süreç", "Destek hattı"],
    featured: true,
    sortOrder: 8,
  },
  {
    slug: "tiktok-hesap-hizmetleri",
    name: "TikTok Hesap Hizmetleri",
    shortDesc: "TikTok hesap, güvenlik ve büyüme desteği",
    description:
      "TikTok hesap açılışı, güvenlik, içerik planı ve kısıtlama / itiraz süreçlerinde danışmanlık.",
    price: 0,
    category: "sosyal",
    badge: "TikTok",
    icon: "tiktok",
    accent: "#25f4ee",
    accent2: "#fe2c55",
    features: ["Hesap kurulumu", "Güvenlik", "İçerik planı", "Destek"],
    featured: true,
    sortOrder: 9,
  },
  {
    slug: "youtube-hesap-hizmetleri",
    name: "YouTube Hesap Hizmetleri",
    shortDesc: "Kanal kurulum, doğrulama ve sorun çözümü",
    description:
      "YouTube kanal kurulumu, doğrulama hataları, kısıtlama / itiraz ve kanal güvenlik desteği.",
    price: 0,
    category: "sosyal",
    badge: "YouTube",
    icon: "google",
    accent: "#ff0000",
    accent2: "#282828",
    features: ["Kanal kurulum", "Doğrulama", "İtiraz desteği", "Güvenlik"],
    featured: false,
    sortOrder: 10,
  },
  {
    slug: "x-twitter-hesap-hizmetleri",
    name: "X (Twitter) Hesap Hizmetleri",
    shortDesc: "X hesabı, doğrulama ve erişim sorunları",
    description:
      "X (Twitter) hesap güvenliği, erişim kaybı, kısıtlama ve doğrulama süreçlerinde destek.",
    price: 0,
    category: "sosyal",
    badge: "X",
    icon: "social",
    accent: "#e7e9ea",
    accent2: "#1d9bf0",
    features: ["Erişim sorunları", "Güvenlik", "Doğrulama", "Destek"],
    featured: false,
    sortOrder: 11,
  },
  {
    slug: "sosyal-medya-yonetimi",
    name: "Sosyal Medya Yönetimi",
    shortDesc: "Instagram · Facebook · TikTok içerik yönetimi",
    description:
      "Çok kanallı içerik planı, yayın takvimi ve hesap yönetimi. Markanız için sürdürülebilir sosyal medya hizmeti.",
    price: 0,
    category: "sosyal",
    badge: "Yönetim",
    icon: "social",
    accent: "#a78bfa",
    accent2: "#2ec4b6",
    features: ["İçerik planı", "Yayın takvimi", "Topluluk", "Rapor"],
    featured: true,
    sortOrder: 12,
  },
];

const KEEP_SLUGS = new Set(PRODUCTS.map((p) => p.slug));

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

  // Remove obsolete catalog items (keep leads via SetNull on productId)
  const obsolete = await prisma.product.findMany({
    where: { slug: { notIn: [...KEEP_SLUGS] } },
    select: { id: true, slug: true },
  });
  if (obsolete.length) {
    await prisma.product.deleteMany({
      where: { id: { in: obsolete.map((p) => p.id) } },
    });
  }

  // Never store/display prices on the storefront
  await prisma.product.updateMany({ data: { price: 0 } });

  console.log(
    `Seeded ${PRODUCTS.length} services; removed ${obsolete.length} obsolete products`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
