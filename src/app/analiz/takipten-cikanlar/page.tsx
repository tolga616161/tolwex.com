import { AnalysisPublicView } from "@/components/analysis/AnalysisPublicView";
import { PageAtmosphere } from "@/components/fx/PageAtmosphere";

export const metadata = { title: "Takipten Çıkanlar — TOLWEX" };

export default function Page() {
  return (
    <>
      <PageAtmosphere />
      <AnalysisPublicView type="unfollowers" accent="unfollow" />
    </>
  );
}
