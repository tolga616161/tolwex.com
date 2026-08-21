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
    excerpt: "Instagram, TikTok veya X hesabın kapandıysa sakin kalıp doğru ekranları topla.",
    tags: ["Kapanan hesap", "Instagram", "TikTok"],
    relatedHref: "/basvuru/kapanan",
    body: [
      "Hesap kapandığında panik yerine ekran görüntüsü al: kapanma mesajı, e-posta uyarısı ve son giriş tarihi işe yarar.",
      "Platformu net seç (Instagram, TikTok, X…). Yanlış platform süreci uzatır.",
      "TOLWEX formundan başvurunu WhatsApp’a ilet; fotoğraf varsa ekle, yoksa metinle de ilerleriz.",
    ],
  },
  {
    slug: "askiye-alinan-hesap",
    title: "Askıya alınan hesap nasıl çözülür?",
    excerpt: "Geçici engel ve askı uyarılarında hangi bilgilerin gerekli olduğunu özetledik.",
    tags: ["Askı", "Kısıt"],
    relatedHref: "/basvuru/aski",
    body: [
      "Askı mesajını aynen kaydet. “Community guidelines”, “suspicious activity” gibi ifadeler önemli.",
      "Hesaba bağlı e-posta ve telefon varsa not et — doğrulama adımlarında lazım olur.",
      "Başvuru formunda platform + kullanıcı adı + askı ekranı (opsiyonel) yeterli başlangıçtır.",
    ],
  },
  {
    slug: "kullanici-adi-alma",
    title: "Kullanıcı adı alma rehberi",
    excerpt: "Boşalan veya istediğin @username için hazırlık checklist’i.",
    tags: ["Username", "@alma"],
    relatedHref: "/basvuru/kullanici-adi",
    body: [
      "İstediğin kullanıcı adını ve nedenini yaz (marka, kişisel isim, eski hesap).",
      "Aynı ismin başka platformlarda sende olup olmadığını belirtmek süreci hızlandırır.",
      "Formdan başvur, WhatsApp’tan detayı netleştiririz.",
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
      "TOLWEX’e platform, @ ve kısa olay özeti gönder; ekran görüntüsü varsa ekle.",
    ],
  },
  {
    slug: "reklam-kisiti-onay",
    title: "Reklam kısıtı ve onay süreçleri",
    excerpt: "Reklam hesabı kısıtı veya onayda kalan reklamlar için pratik notlar.",
    tags: ["Reklam", "Meta"],
    relatedHref: "/basvuru/reklam-kisit",
    body: [
      "Kısıt / red metnini kaydet. Politika kodu varsa aynen yaz.",
      "Hangi reklam hesabı ve hangi creatives etkilendiğini belirt.",
      "Reklam kısıtı veya onay formuyla başvurunu ilet.",
    ],
  },
];

export function getGuide(slug: string) {
  return GUIDE_ARTICLES.find((a) => a.slug === slug);
}
