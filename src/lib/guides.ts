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
    slug: "reklam-kisiti",
    title: "Reklam kısıtları ne demek?",
    excerpt: "Reklam hesabı kısıtı veya yayınlanmayan reklamlar için pratik notlar.",
    tags: ["Reklam", "Kısıt"],
    relatedHref: "/basvuru/reklam-kisit",
    body: [
      "Kısıt / red metnini kaydet. Politika kodu varsa aynen yaz.",
      "Hangi reklam hesabı ve hangi creatives etkilendiğini belirt.",
      "Reklam kısıtları menüsünden başvurunu ilet.",
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
    slug: "fake-hesap-sikayet",
    title: "Fake hesap şikayeti",
    excerpt: "Sahte hesaplara karşı başvuru için kısa checklist.",
    tags: ["Fake", "Şikayet"],
    relatedHref: "/basvuru/fake",
    body: [
      "Sahte @kullanıcı adını ve hangi içeriği taklit ettiğini yaz.",
      "Fotoğraf zorunlu değil — metinle de başvurabilirsin; istersen galeriden ekle.",
      "Fake hesaplar menüsünden formu doldurup WhatsApp’a ilet.",
    ],
  },
];

export function getGuide(slug: string) {
  return GUIDE_ARTICLES.find((a) => a.slug === slug);
}
