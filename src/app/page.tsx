import { MarketingNav } from "@/components/marketing/nav";
import { Footer } from "@/components/marketing/footer";
import { Hero } from "@/components/marketing/hero";
import { Principles } from "@/components/marketing/principles";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { CitySpotlight } from "@/components/marketing/city-spotlight";
import { ClosingCta } from "@/components/marketing/closing-cta";

export default function LandingPage() {
  return (
    <>
      <MarketingNav />
      <main>
        <Hero />
        <Principles />
        <HowItWorks />
        <CitySpotlight />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
