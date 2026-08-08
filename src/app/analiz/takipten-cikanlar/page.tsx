import { AnalysisPublicView } from "@/components/analysis/AnalysisPublicView";

export const metadata = { title: "Takipten Çıkanlar — TOLWEX" };

export default function Page() {
  return (
    <>
      <AnalysisPublicView type="unfollowers" accent="unfollow" />
    </>
  );
}
