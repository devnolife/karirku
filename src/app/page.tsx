import { HeroSection } from "@/components/landing/HeroSection";
import { LogosStatsSection } from "@/components/landing/LogosStatsSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { ProcessSection } from "@/components/landing/ProcessSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { MetricsSection } from "@/components/landing/MetricsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { IntegrationsSection } from "@/components/landing/IntegrationsSection";
import { BlogSection } from "@/components/landing/BlogSection";
import { FooterSection } from "@/components/landing/FooterSection";

/* =========================================================
   CraftWorks — Landing V5 (ui-pages)
   Finsyc-style visual system: Onest headings, Inter body,
   Playfair italic accents, deep green #042718 / #198F38.
   Structure: hero (video bg) → logos+stats → features →
   process tabs → scroll-driven benefits → metrics →
   testimonial carousel → pricing → integrations hub →
   blog → footer CTA + giant wordmark.
   ========================================================= */

export default function LandingPage() {
  return (
    <main className="w-full overflow-x-hidden bg-white font-inter">
      <HeroSection />
      <LogosStatsSection />
      <FeaturesSection />
      <ProcessSection />
      <BenefitsSection />
      <MetricsSection />
      <TestimonialsSection />
      <PricingSection />
      <IntegrationsSection />
      <BlogSection />
      <FooterSection />
    </main>
  );
}
