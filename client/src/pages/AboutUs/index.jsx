// src/pages/AboutPage.tsx

import { useEffect } from "react"
import { HeroAbout } from "@/components/about/HeroAbout"
import { TrustBar } from "@/components/about/TrustBar"
import { StoryTimeline } from "@/components/about/StoryTimeline"
import { ValuesGrid } from "@/components/about/ValuesGrid"
import { ImpactStats } from "@/components/about/ImpactStats"
import { TeamShowcase } from "@/components/about/TeamShowcase"
import { Testimonials } from "@/components/about/Testimonials"
import { PartnersMarquee } from "@/components/about/PartnersMarquee"
import { ClosingCta } from "@/components/about/ClosingCta"
import { BentoPhilosophy } from "@/components/about/BentoPhilosophy"
import { AboutNavigation } from "@/components/about/AboutNavigation"

export default function AboutPage() {
  useEffect(() => {
    document.title = "About Us — Learn Forward"
  }, [])

  return (
    <main className="font-sans">
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
  )
}
