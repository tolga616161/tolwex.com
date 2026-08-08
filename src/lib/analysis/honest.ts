/**
 * Honest analysis helpers — never invent usernames or blocker/viewer lists.
 * Instagram Graph API does not provide personal profile-viewer or blocker lists.
 */

export type AnalysisAvailability = {
  type: string;
  title: string;
  mode: "estimated" | "signal" | "comparative" | "unavailable";
  apiProvidesUserList: boolean;
  headline: string;
  explanation: string;
  whatWeShow: string[];
  whatWeNeverShow: string[];
};

export const ANALYSIS_CATALOG: AnalysisAvailability[] = [
  {
    type: "profile_visit",
    title: "Profilime Kim Baktı?",
    mode: "estimated",
    apiProvidesUserList: false,
    headline: "Profil Ziyaret Tahmini",
    explanation:
      "Instagram resmi Graph API, kullanıcı bazında “profilime kim baktı” listesini üçüncü taraf uygulamalara vermez. TOLWEX yalnızca erişilebilen etkileşim sinyallerinden tahmini yoğunluk analizi üretebilir.",
    whatWeShow: [
      "Tahmini ziyaret yoğunluğu (sinyal tabanlı)",
      "Zaman aralığına göre aktivite bandı",
      "Erişilebilir etkileşim özeti",
    ],
    whatWeNeverShow: [
      "Rastgele @kullanıcı listesi",
      "Kesin ziyaretçi kimlikleri",
      "Uydurma profil fotoğrafları",
    ],
  },
  {
    type: "blocking",
    title: "Beni Engelleyenler",
    mode: "signal",
    apiProvidesUserList: false,
    headline: "Engelleme Analizi · Muhtemel Sinyaller",
    explanation:
      "Bu ekran resmi bir Instagram engelleme listesi değildir. Meta API kişisel “engelleyenler” listesini sunmaz. TOLWEX yalnızca erişilebilen görünürlük / liste tutarsızlığı sinyallerini yorumlar.",
    whatWeShow: [
      "Muhtemel engelleme sinyalleri",
      "Güven bandı (düşük / orta)",
      "Karşılaştırmalı görünürlük notları",
    ],
    whatWeNeverShow: [
      "Kesin engelleyen kullanıcı listesi",
      "Sahte @hesap üretimi",
    ],
  },
  {
    type: "unfollowers",
    title: "Takipten Çıkanlar",
    mode: "comparative",
    apiProvidesUserList: false,
    headline: "Takipten Çıkanlar",
    explanation:
      "Gerçek sonuç yalnızca önceki kayıt ile güncel listenin API’den alınabildiği durumda üretilir. Geçmiş snapshot yoksa veya Graph API liste vermiyorsa sonuç boş kalır — sahte veri üretilmez.",
    whatWeShow: [
      "Önceki vs yeni karşılaştırma (veri varsa)",
      "Tespit tarihi",
      "Filtre: 24s / 7g / 30g",
    ],
    whatWeNeverShow: ["Uydurma takipten çıkan listesi"],
  },
  {
    type: "non_followers",
    title: "Takip Etmeyenler",
    mode: "comparative",
    apiProvidesUserList: false,
    headline: "Takip Etmeyenler",
    explanation:
      "Takip edilenler ile takipçiler karşılaştırılır — yalnızca her iki liste Graph API’den gerçekten geldiğinde. Aksi halde boş durum ve açıklama gösterilir.",
    whatWeShow: ["Karşılıklı takip farkı (veri varsa)", "Arama / filtre"],
    whatWeNeverShow: ["Sahte non-follower listesi"],
  },
  {
    type: "fake_risk",
    title: "Fake Hesap Analizi",
    mode: "estimated",
    apiProvidesUserList: false,
    headline: "Profile Risk Score",
    explanation:
      "Risk skoru erişilebilen profil sinyallerinden hesaplanır. “Kesinlikle fake” hükmü verilmez — LOW / MEDIUM / HIGH bandı kullanılır.",
    whatWeShow: [
      "0–100 risk skoru",
      "Sinyal kırılımları",
      "LOW / MEDIUM / HIGH",
    ],
    whatWeNeverShow: ["Kesin fake etiketi", "Uydurma kanıt listesi"],
  },
];

export function getAnalysisMeta(type: string) {
  return ANALYSIS_CATALOG.find((a) => a.type === type) || null;
}

/** Build risk score only from real connection fields — never invent metrics. */
export function computeFakeRiskFromConnection(input: {
  accountType?: string | null;
  mediaCount?: number | null;
  hasUsername?: boolean;
  tokenActive?: boolean;
}) {
  let score = 35;
  const signals: Array<{ id: string; label: string; status: string; weight: number }> = [];

  if (input.hasUsername) {
    score -= 8;
    signals.push({ id: "username", label: "Kullanıcı adı mevcut", status: "ok", weight: -8 });
  } else {
    score += 12;
    signals.push({ id: "username", label: "Kullanıcı adı eksik", status: "warn", weight: 12 });
  }

  if (input.tokenActive) {
    score -= 5;
    signals.push({ id: "token", label: "Aktif OAuth token", status: "ok", weight: -5 });
  } else {
    score += 10;
    signals.push({ id: "token", label: "Token aktif değil", status: "warn", weight: 10 });
  }

  if (input.accountType) {
    score -= 6;
    signals.push({
      id: "type",
      label: `Hesap tipi: ${input.accountType}`,
      status: "ok",
      weight: -6,
    });
  } else {
    score += 8;
    signals.push({ id: "type", label: "Hesap tipi bilinmiyor", status: "neutral", weight: 8 });
  }

  if (typeof input.mediaCount === "number") {
    if (input.mediaCount === 0) {
      score += 15;
      signals.push({ id: "media", label: "Gönderi sayısı: 0", status: "warn", weight: 15 });
    } else if (input.mediaCount < 3) {
      score += 8;
      signals.push({
        id: "media",
        label: `Gönderi sayısı: ${input.mediaCount}`,
        status: "neutral",
        weight: 8,
      });
    } else {
      score -= 10;
      signals.push({
        id: "media",
        label: `Gönderi sayısı: ${input.mediaCount}`,
        status: "ok",
        weight: -10,
      });
    }
  } else {
    signals.push({
      id: "media",
      label: "Gönderi sayısı API’den gelmedi",
      status: "neutral",
      weight: 0,
    });
  }

  signals.push({
    id: "followers",
    label: "Takipçi / takip oranı — liste API’de yok",
    status: "unavailable",
    weight: 0,
  });
  signals.push({
    id: "engagement",
    label: "Etkileşim oranı — yetersiz Insights erişimi",
    status: "unavailable",
    weight: 0,
  });

  score = Math.max(0, Math.min(100, Math.round(score)));
  const band = score < 40 ? "LOW RISK" : score < 70 ? "MEDIUM RISK" : "HIGH RISK";

  return {
    score,
    band,
    disclaimer:
      "Bu skor sinyal tabanlıdır. Hesabın sahte olduğu kesin değildir — kesin “fake” hükmü verilmez.",
    signals,
  };
}
