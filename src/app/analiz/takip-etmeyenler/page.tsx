import { AnalysisPublicView } from "@/components/analysis/AnalysisPublicView";

export const metadata = { title: "Takip Etmeyenler — TOLWEX" };

export default function Page() {
  return (
    <>
      <AnalysisPublicView type="non_followers" accent="nonfollow" />
    </>
  );
}
