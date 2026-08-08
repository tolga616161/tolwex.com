import { AnalysisPublicView } from "@/components/analysis/AnalysisPublicView";
import { PageAtmosphere } from "@/components/fx/PageAtmosphere";

export const metadata = { title: "Takip Etmeyenler — TOLWEX" };

export default function Page() {
  return (
    <>
      <PageAtmosphere />
      <AnalysisPublicView type="non_followers" accent="nonfollow" />
    </>
  );
}
