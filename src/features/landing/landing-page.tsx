import { FeaturesSection } from "@/features/landing/features-section";
import { Hero } from "@/features/landing/hero";
import { HowItWorks } from "@/features/landing/how-it-works";
import { IconSprite } from "@/features/landing/icons";
import { Marquee } from "@/features/landing/marquee";
import { FinalCta } from "@/features/landing/final-cta";
import { PricingSection } from "@/features/landing/pricing-section";
import { PrivacySection } from "@/features/landing/privacy-section";
import { ScrollReveal } from "@/features/landing/scroll-reveal";
import { SiteFooter } from "@/features/landing/site-footer";
import { SiteHeader } from "@/features/landing/site-header";
import "@/features/landing/landing.css";

/**
 * The public marketing page at `/`. Its copy is English only, so it declares `lang="en"` even
 * when the app language (on `<html>`) is Polish. Class names and tokens come from landing.css.
 */
export function LandingPage() {
  return (
    <>
      <IconSprite />
      <div className="page" lang="en">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" tabIndex={-1}>
          <Hero />
          <Marquee />
          <HowItWorks />
          <FeaturesSection />
          <PrivacySection />
          <PricingSection />
          <FinalCta />
        </main>
        <SiteFooter />
      </div>
      <ScrollReveal />
    </>
  );
}
