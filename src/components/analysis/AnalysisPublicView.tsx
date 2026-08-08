import Link from "next/link";
import { getAnalysisMeta, type AnalysisAvailability } from "@/lib/analysis/honest";

export function AnalysisPublicView({
  type,
  accent = "eye",
}: {
  type: string;
  accent?: "eye" | "block" | "unfollow" | "nonfollow" | "risk";
}) {
  const meta = getAnalysisMeta(type) as AnalysisAvailability;
  if (!meta) return null;

  return (
    <div className="site-shell py-10 pb-24 analysis-public">
      <section className="analysis-hero glass-panel rounded-3xl p-6 md:p-10">
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
        <p className="muted leading-relaxed max-w-2xl mb-6">{meta.explanation}</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/instagram/connect" className="btn btn-primary">
            Instagram ile Bağlan
          </Link>
          <Link href="/instagram/dashboard" className="btn btn-ghost">
            Analiz paneli
          </Link>
        </div>
      </section>

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
          Liste boş olabilir. Bu, özelliğin olmadığı anlamına gelmez — Instagram’ın resmi
          API’sinin kullanıcı listesini vermediği veya henüz karşılaştırma kaydı
          bulunmadığı anlamına gelir. Sahte @kullanıcı üretilmez.
        </p>
        <div className="analysis-empty-result">
          <p className="muted">Kayıtlı sonuç yok · bağlandıktan sonra gerçek sinyaller işlenir</p>
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
