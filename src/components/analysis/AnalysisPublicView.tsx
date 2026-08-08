import Link from "next/link";
import { getAnalysisMeta, type AnalysisAvailability } from "@/lib/analysis/honest";
import { CONTACT_PHONE_DISPLAY, whatsappUrl } from "@/lib/contact";

export function AnalysisPublicView({
  type,
  accent = "eye",
}: {
  type: string;
  accent?: "eye" | "block" | "unfollow" | "nonfollow" | "risk";
}) {
  const meta = getAnalysisMeta(type) as AnalysisAvailability;
  if (!meta) return null;

  const isProfile = type === "profile_visit";
  const waMsg = isProfile
    ? "Profilime kim baktı analizi hakkında yazıyorum."
    : `${meta.title} hakkında yazıyorum.`;

  return (
    <div className="site-shell py-10 pb-24 analysis-public">
      <section className={`analysis-hero glass-panel rounded-3xl p-6 md:p-10 ${isProfile ? "profile-visit-hero" : ""}`}>
        <div className={`analysis-visual accent-${accent}`} aria-hidden>
          <span className="analysis-visual-orb" />
          <span className="analysis-visual-core">{glyph(accent)}</span>
        </div>
        <p className="section-kicker">{meta.headline}</p>
        <h1 className="display text-3xl md:text-5xl font-bold mb-3">{meta.title}</h1>
        <p className="admin-badge mb-4">
          {meta.mode === "estimated"
            ? "TAHMİNİ ANALİZ"
            : meta.mode === "signal"
              ? "SİNYAL ANALİZİ"
              : meta.mode === "comparative"
                ? "KARŞILAŞTIRMALI ANALİZ"
                : "API LİSTESİ YOK"}
        </p>
        <p className="muted leading-relaxed max-w-2xl mb-4">{meta.explanation}</p>
        {isProfile ? (
          <p className="legal-note max-w-2xl mb-6">
            IP adresi, konum veya cihaz parmak izi ile “kim baktı” tespiti yapılmaz.
            Bu tür takip Instagram kurallarına ve gizlilik ilkelerine aykırıdır.
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <a
            href={whatsappUrl(waMsg)}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp Destek
          </a>
          <Link href="/instagram/security" className="btn btn-ghost">
            Hesap Güvenliği
          </Link>
          <Link href="/#hizmetler" className="btn btn-ghost">
            Tüm hizmetler
          </Link>
        </div>
      </section>

      {isProfile ? (
        <section className="profile-method-grid mt-8">
          <div className="mono-panel profile-method-card">
            <p className="mono-panel-title">Nasıl çalışır?</p>
            <ol className="method-steps">
              <li>Erişilebilir etkileşim ve zaman sinyalleri incelenir</li>
              <li>Yoğunluk bandı tahmini olarak özetlenir</li>
              <li>Kesin isim listesi üretilmez — şeffaf sınırlar</li>
            </ol>
          </div>
          <div className="mono-panel profile-method-card">
            <p className="mono-panel-title">Neden IP değil?</p>
            <p className="muted text-sm leading-relaxed">
              Instagram profil ziyaretlerini IP üzerinden üçüncü taraflara açmaz.
              IP takibi hem teknik olarak güvenilir değildir hem de gizlilik ihlali
              riski taşır. TOLWEX bu yolu kullanmaz.
            </p>
          </div>
        </section>
      ) : null}

      <div className="analysis-grid mt-8">
        <div className="mono-panel">
          <p className="mono-panel-title">Ne gösterilir?</p>
          <ul className="mono-list">
            {meta.whatWeShow.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
        <div className="mono-panel">
          <p className="mono-panel-title">Ne üretilmez?</p>
          <ul className="mono-list">
            {meta.whatWeNeverShow.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass-panel rounded-3xl p-6 mt-8">
        <h2 className="display text-xl mb-2">Sonuç alanı</h2>
        <p className="legal-note mb-4">
          Liste boş olabilir. Bu, özelliğin olmadığı anlamına gelmez — Instagram’ın
          resmi API’sinin kullanıcı listesini vermediği veya henüz karşılaştırma
          kaydı bulunmadığı anlamına gelir. Sahte @kullanıcı üretilmez.
        </p>
        <div className="analysis-empty-result">
          <p className="muted mb-3">
            Kayıtlı sonuç yok · tahmini sinyal özeti WhatsApp danışmanlığında
            netleştirilir
          </p>
          <a
            href={whatsappUrl(waMsg)}
            className="btn btn-ghost text-sm"
            target="_blank"
            rel="noopener noreferrer"
          >
            {CONTACT_PHONE_DISPLAY}
          </a>
        </div>
        {type === "unfollowers" || type === "non_followers" ? (
          <div className="admin-toolbar mt-4" style={{ maxWidth: 420 }}>
            <select defaultValue="7" aria-label="Filtre">
              <option value="1">Son 24 saat</option>
              <option value="7">Son 7 gün</option>
              <option value="30">Son 30 gün</option>
            </select>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function glyph(accent: string) {
  if (accent === "eye") return "◉";
  if (accent === "block") return "⊘";
  if (accent === "unfollow") return "↺";
  if (accent === "nonfollow") return "⇄";
  return "⚠";
}
