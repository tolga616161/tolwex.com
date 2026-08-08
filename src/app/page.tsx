import { HeroSection } from "@/components/hero/HeroSection";
import { PageAtmosphere } from "@/components/fx/PageAtmosphere";
import {
  FeaturedProductsSection,
  HowItWorksSection,
  RecoveryHighlightSection,
  ServicesSection,
} from "@/components/marketing/HomeSections";

export default function HomePage() {
  return (
    <div className="home-root">
      <PageAtmosphere />
      <HeroSection />
      <FeaturedProductsSection />
      <ServicesSection />
      <RecoveryHighlightSection />
      <HowItWorksSection />
    </div>
  );
}
