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
      "Her dosya ve senaryo farklıdır — kesin çözüm için TOLWEX’ten bilgi al; formu doldurup WhatsApp’tan ulaş.",
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
      "Kişisel durumunu değerlendirmeden kesin adım atma — detaylı yönlendirme için TOLWEX Sosyal Medya Uzmanı’na yaz.",
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
      "Reklam politikaları sık değişir; senin hesabına özel bilgi için kısıtlanan reklam başvurusundan bize ulaş.",
    ],
  },
  {
    slug: "fake-hesap-nasil-anlasilir",
    title: "Fake hesap nasıl anlaşılır?",
    excerpt: "Taklit profil, çalıntı fotoğraf ve sahte mesajları ayırt etmek için pratik işaretler.",
    tags: ["Fake hesap", "Tespit", "Güvenlik"],
    relatedHref: "/basvuru/fake-tespit",
    body: [
      "Sahte hesaplar çoğu zaman benzer kullanıcı adı, çalıntı fotoğraf, az etkileşim veya ani takip isteği ile kendini belli eder.",
      "Profil bio’sunda “resmi değil” yazmasa bile aynı isim / logo / story stili taklit olabilir. Linkleri ve mesaj tonunu dikkatle oku.",
      "Şüpheli bir @ gördüğünde kendi başına rapor zincirine girmeden önce ekran görüntüsü ve linki kaydet.",
      "Tespit her platformda farklı işler. Senin durumuna özel bilgiyi TOLWEX’ten al — Fake Hesap Tespit başvurusundan WhatsApp’a yaz.",
    ],
  },
  {
    slug: "fake-hesap-kapatma-sureci",
    title: "Fake hesap kapatma süreci",
    excerpt: "Adını veya markanı kullanan sahte hesaplar için doğru başvuru yaklaşımı.",
    tags: ["Fake hesap", "Kapatma"],
    relatedHref: "/basvuru/fake-kapatma",
    body: [
      "Önce sahte hesabın net linkini, kullanıcı adını ve hangi içeriğin taklit olduğunu topla.",
      "Kendi orijinal hesabının kanıtları (eski post, doğrulama, marka kayıtları) süreci hızlandırır — ama her dosya ayrı incelenir.",
      "Toplu şikâyet veya rastgele bot yöntemleri çoğu zaman işe yaramaz; yanlış adım hesabını da riske atabilir.",
      "Kapatma yolunu senin dosyana göre netleştirmek için TOLWEX Fake Hesap Kapatma formundan bilgi iste — WhatsApp’tan yönlendirelim.",
    ],
  },
  {
    slug: "fake-hesaplara-karsi-onlemler",
    title: "Fake hesaplara karşı önlemler",
    excerpt: "Taklit hesap riskini azaltmak için günlük güvenlik alışkanlıkları.",
    tags: ["Önlem", "Fake hesap", "Güvenlik"],
    relatedHref: "/basvuru/fake-tespit",
    body: [
      "İki adımlı doğrulamayı aç, eski oturumları temizle, kritik şifreleri başka yerde kullanma.",
      "Takipçilerine “resmi hesap sadece bu” notunu bio veya sabit story ile duyur; şüpheli DM’leri paylaşmalarını söyle.",
      "Marka / isim taklitlerini erken yakalamak için düzenli arama yap (@varyasyonları, benzer isimler).",
      "Önlem listesi geneldir — hangi adımların sana uygun olduğunu TOLWEX’ten öğren. Şüphe varsa önce Fake Hesap Tespit veya Kapatma başvurusundan yaz.",
    ],
  },
  {
    slug: "sahte-hesap-mesajlarina-dikkat",
    title: "Sahte hesap mesajlarına dikkat",
    excerpt: "DM, WhatsApp ve yorumlarda gelen sahtekârlık tuzakları.",
    tags: ["Fake hesap", "Mesaj", "Dolandırıcılık"],
    relatedHref: "/basvuru/fake-tespit",
    body: [
      "Acil para, “hesabın kapanacak”, “doğrulama kodu gönder” diyen mesajlara güvenme.",
      "Resmi destek asla şifre veya SMS kodu istemez. Şüpheli linklere tıklama.",
      "Karşı tarafın profili yeni, fotoğrafları bulanık veya aynı görseller başka hesaplarda da varsa alarm çal.",
      "Mesaj ekranını kaydet ve TOLWEX’e gönder — senin örnek üzerinden bilgi verelim. Formdan WhatsApp’a ulaşman yeterli.",
    ],
  },
];

export function getGuide(slug: string) {
  return GUIDE_ARTICLES.find((a) => a.slug === slug);
}
