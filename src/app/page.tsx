import { HeroSection } from "@/components/hero/HeroSection";
import { PageAtmosphere } from "@/components/fx/PageAtmosphere";
import {
  BlockingSection,
  DashboardPreview,
  FakeRiskSection,
  HowItWorksSection,
  NewsRemovalSection,
  ProfileVisitSection,
  SecuritySection,
  ServicesSection,
  UnfollowSection,
} from "@/components/marketing/HomeSections";

export default function HomePage() {
  return (
    <div className="home-root">
      <PageAtmosphere />
      <HeroSection />
      <ServicesSection />
      <ProfileVisitSection />
      <SecuritySection />
      <DashboardPreview />
      <BlockingSection />
      <UnfollowSection />
      <FakeRiskSection />
      <NewsRemovalSection />
      <HowItWorksSection />
    </div>
  );
}
