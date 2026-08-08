import { AnalysisPublicView } from "@/components/analysis/AnalysisPublicView";
import { computeFakeRiskFromConnection } from "@/lib/analysis/honest";

export const metadata = { title: "Fake Hesap Analizi — TOLWEX" };

export default function Page() {
  // Demo of scoring UI with empty signals only — no invented account
  const sample = computeFakeRiskFromConnection({});

  return (
    <>
      <AnalysisPublicView type="fake_risk" accent="risk" />
      <div className="site-shell pb-24 -mt-12 relative z-10">
        <div className="glass-panel rounded-3xl p-6 md:p-8">
          <h2 className="display text-2xl mb-2">PROFILE RISK SCORE</h2>
          <p className="legal-note mb-6">{sample.disclaimer}</p>
          <div className="risk-score-row">
            <div className="risk-score-ring">
              <strong>—</strong>
              <span>/ 100</span>
            </div>
            <div className="risk-levels">
              {["LOW RISK", "MEDIUM RISK", "HIGH RISK"].map((level) => (
                <div key={level} className="risk-level">
                  <span className="risk-level-label">BAND</span>
                  <strong>{level}</strong>
                </div>
              ))}
            </div>
          </div>
          <ul className="mono-list mt-6">
            {sample.signals.map((s) => (
              <li key={s.id}>
                {s.label} · {s.status}
              </li>
            ))}
          </ul>
          <p className="muted text-sm mt-4">
            Skor yalnızca erişilebilir profil sinyallerinden hesaplanır. Veri yokken
            örnek kullanıcı uydurulmaz.
          </p>
        </div>
      </div>
    </>
  );
}
