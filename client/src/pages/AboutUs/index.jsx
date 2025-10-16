// src/pages/AboutPage.tsx

import { useEffect } from "react";
import { HeroAbout } from "@/components/about/HeroAbout";
import { TrustBar } from "@/components/about/TrustBar";
import { StoryTimeline } from "@/components/about/StoryTimeline";
import { ValuesGrid } from "@/components/about/ValuesGrid";
import { ImpactStats } from "@/components/about/ImpactStats";
import { TeamShowcase } from "@/components/about/TeamShowcase";
import { Testimonials } from "@/components/about/Testimonials";
import { PartnersMarquee } from "@/components/about/PartnersMarquee";
import { ClosingCta } from "@/components/about/ClosingCta";
import { BentoPhilosophy } from "@/components/about/BentoPhilosophy";
import { AboutNavigation } from "@/components/about/AboutNavigation";
import DotGrid from "@/components/about/DotGrid/DotGrid";

export default function AboutPage() {
  useEffect(() => {
    document.title = "About Us — Learn Forward";
  }, []);

  return (
    <main className="relative font-sans min-h-screen overflow-hidden">
  {/* Header is provided by StudentViewCommonLayout - do not render here to avoid duplication */}
      
      {/* Dot background */}
      <div className="absolute inset-0 -z-10">
        <DotGrid
          dotSize={10}
          gap={15}
          baseColor="#5227FF"
          activeColor="#5227FF"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>

      {/* Page Content */}
      <AboutNavigation />

      <section id="hero">
        <HeroAbout />
      </section>

      <TrustBar />
      <section id="story">
        <StoryTimeline />
      </section>
      <section id="values">
        <ValuesGrid />
      </section>
      <section id="philosophy">
        <BentoPhilosophy />
      </section>
      <ImpactStats />
      <section id="team">
        <TeamShowcase />
      </section>
      <section id="testimonials">
        <Testimonials />
      </section>
      <section id="partners">
        <PartnersMarquee />
      </section>
      <ClosingCta />
    </main>
  );
}
