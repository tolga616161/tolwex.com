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
      <DashboardPreview />
      <ProfileVisitSection />
      <BlockingSection />
      <UnfollowSection />
      <FakeRiskSection />
      <NewsRemovalSection />
      <SecuritySection />
      <HowItWorksSection />
    </div>
  );
}
