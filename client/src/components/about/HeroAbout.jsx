// src/components/about/HeroAbout.tsx

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function HeroAbout() {
  return (
    <header className="gradient-bg about-section">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <div className="flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-white/80 px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur-sm dark:bg-black/20">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            Welcome to Learn Forward
          </div>
          
          <h1 className="text-pretty text-4xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
            <span className="text-gradient">Transforming</span> the way
            <br className="hidden sm:block" />
            the world learns
          </h1>
          
          <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            We're building the next generation of learning platforms—designed for real people, with simplicity,
            accessibility, and impact at our core. Join us on this journey to make education better for everyone.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link to="/courses">
              <Button className="px-8 py-3 text-base font-semibold hover-lift">
                Discover Courses
              </Button>
            </Link>
            <Link to="#our-story">
              <Button variant="outline" className="px-8 py-3 text-base border-2 hover-lift">
                Our Journey
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap7 6 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-success"></div>
                <span>250K+ Active Learners</span>
              </div>
              <div className="h-4 w-px bg-border"></div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-accent"></div>
                <span>99.9% Uptime</span>
              </div>
              <div className="h-4 w-px bg-border"></div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-primary"></div>
                <span>Global Reach</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative wave divider */}
      <div className="h-16 w-full bg-background" style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 70%, 50% 40%, 100% 70%, 100% 100%)'
      }} aria-hidden="true" />
    </header>
  )
}
