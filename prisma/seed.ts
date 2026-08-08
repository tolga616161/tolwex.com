import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** price kept as 0 — UI never shows prices */
const PRODUCTS = [
  {
    slug: "eski-tarihli-hesaplar",
    name: "Meta Eski Tarihli Hesaplar",
    shortDesc: "Instagram / Meta eski tarihli hesap seçenekleri",
    description:
      "İhtiyacınıza uygun eski tarihli Instagram ve Meta hesap seçenekleri. Yaş / tarih filtresi, güvenli teslim ve WhatsApp destek. Şifre paylaşımı istenmez — teslim süreci bilgilendirilerek yönetilir.",
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
    slug: "projeli-hesaplar",
    name: "Projeli Hesaplar",
    shortDesc: "Marka ve proje için hazır / yaşlı hesap paketleri",
    description:
      "Kampanya, ajans veya marka projeleri için uygun hesap paketleri. İstenen platform, yaş ve kullanım senaryosuna göre seçenek sunulur; teslim ve kullanım notları WhatsApp üzerinden netleştirilir.",
    price: 0,
    category: "hesap",
    badge: "Proje",
    icon: "social",
    accent: "#2ec4b6",
    accent2: "#1877f2",
    features: ["Proje ihtiyacına göre seçim", "Yaşlı / hazır paket", "Teslim notları", "WhatsApp takip"],
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "kapanan-hesap-aktif-etme",
    name: "Kapanan Hesap Açma",
    shortDesc: "Askı / kapanma ekranını yükle, nedeni yaz, süreci başlat",
    description:
      "Instagram veya Facebook hesabın askıya alındıysa ya da kapandıysa: kapanma ekranı görselini yükle, hesabı ve nedeni yaz. Ekip resmi itiraz / aktifleştirme sürecinde WhatsApp üzerinden takip eder. Bu sitede şifre istenmez.",
    price: 0,
    category: "kurtarma",
    badge: "Acil",
    icon: "instagram",
    accent: "#e4574d",
    accent2: "#e9a319",
    features: ["Görsel yükleme", "Kapanma nedeni", "İtiraz dosyası", "WhatsApp süreç takibi"],
    featured: true,
    sortOrder: 3,
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
    sortOrder: 4,
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
    featured: false,
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
    featured: false,
    sortOrder: 7,
  },
  {
    slug: "meta-verified-hatalari",
    name: "Meta Verified Hataları",
    shortDesc: "Meta Verified başvuru ve hata çözüm desteği",
    description:
      "Meta Verified onay, red ve hata mesajları için inceleme + düzeltme önerileri.",
    price: 0,
    category: "meta",
    badge: "Meta",
    icon: "facebook",
    accent: "#1877f2",
    accent2: "#f58529",
    features: ["Hata analizi", "Profil uyumu", "Belge kontrolü", "Yeniden başvuru planı"],
    featured: false,
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
    featured: false,
    sortOrder: 9,
  },
  {
    slug: "sosyal-medya-yonetimi",
    name: "Sosyal Medya Yönetimi",
    shortDesc: "Instagram · Facebook · TikTok içerik yönetimi",
    description:
      "Çok kanallı içerik planı, yayın takvimi ve hesap yönetimi.",
    price: 0,
    category: "sosyal",
    badge: "Yönetim",
    icon: "social",
    accent: "#a78bfa",
    accent2: "#2ec4b6",
    features: ["İçerik planı", "Yayın takvimi", "Topluluk", "Rapor"],
    featured: false,
    sortOrder: 10,
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
  for (const row of obsolete) {
    await prisma.product.delete({ where: { id: row.id } });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
