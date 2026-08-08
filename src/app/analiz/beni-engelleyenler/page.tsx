import { AnalysisPublicView } from "@/components/analysis/AnalysisPublicView";
import { PageAtmosphere } from "@/components/fx/PageAtmosphere";

export const metadata = { title: "Beni Engelleyenler — TOLWEX" };

export default function Page() {
  return (
    <>
      <PageAtmosphere />
      <AnalysisPublicView type="blocking" accent="block" />
    </>
  );
}
