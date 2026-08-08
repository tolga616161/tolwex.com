import { AnalysisPublicView } from "@/components/analysis/AnalysisPublicView";
import { PageAtmosphere } from "@/components/fx/PageAtmosphere";

export const metadata = { title: "Profilime Kim Baktı? — TOLWEX" };

export default function Page() {
  return (
    <>
      <PageAtmosphere />
      <AnalysisPublicView type="profile_visit" accent="eye" />
    </>
  );
}
