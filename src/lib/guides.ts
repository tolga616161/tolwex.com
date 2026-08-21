export type GuideArticle = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  relatedHref?: string;
  body: string[];
};

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: "kapanan-hesap-ne-yapmali",
    title: "Kapanan hesap: ilk adımlar",
    excerpt: "Instagram, TikTok veya X hesabın kapandıysa sakin kalıp doğru bilgileri topla.",
    tags: ["Kapanan hesap", "Instagram", "TikTok"],
    relatedHref: "/basvuru/kapanan",
    body: [
      "Hesap kapandığında panik yerine ekran mesajını ve son giriş bilgisini not et.",
      "Platformu net seç (Instagram, TikTok, X…). Yanlış platform süreci uzatır.",
      "TOLWEX formundan başvurunu WhatsApp’a ilet; fotoğraf istersen galeriden ekle — zorunlu değil.",
    ],
  },
  {
    slug: "calinan-hesap-guvenlik",
    title: "Çalınan hesapta güvenlik",
    excerpt: "Şüpheli giriş ve çalıntı hesaplarda önce yapılacaklar.",
    tags: ["Güvenlik", "Çalıntı"],
    relatedHref: "/basvuru/calinan",
    body: [
      "Mümkünse bağlı e-posta / telefonu kontrol et. Şüpheli oturumları not al.",
      "Şifreyi başka yerlerde de kullandıysan hemen değiştir.",
      "TOLWEX’e platform, @ ve kısa olay özeti gönder; fotoğraf opsiyonel.",
    ],
  },
  {
    slug: "kisitlanan-reklam-hesabi",
    title: "Kısıtlanan reklam hesabı",
    excerpt: "Reklam hesabı kısıtı veya yayınlanmayan reklamlar için kısa checklist.",
    tags: ["Reklam", "Kısıt"],
    relatedHref: "/basvuru/reklam-kisit",
    body: [
      "Kısıt mesajını ve hesap adını not et.",
      "Hangi reklamlar etkilendiğini yaz.",
      "Kısıtlanan reklam hesabı kategorisinden başvurunu ilet.",
    ],
  },
];

export function getGuide(slug: string) {
  return GUIDE_ARTICLES.find((a) => a.slug === slug);
}
