import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react"; // nice icon for back
import CountUp from "./CountUp/CountUp";

export function HeroAbout() {
  return (
    <header className="relative overflow-hidden about-section">
      {/* Subtle radial glow for depth */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background/5 to-transparent opacity-70"></div>

      <div className="mx-auto max-w-6xl px-6 py-24 md:py-32 relative z-10">
        {/* Back button */}
        <div className="absolute top-6 left-6">
          <Link to="/home">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 px-4 py-2 hover-lift border-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>

        <div className="flex flex-col items-center text-center gap-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/70 px-5 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-md dark:bg-black/30">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            Welcome to{" "}
            <span className="font-semibold text-foreground">Learn Forward</span>
          </div>

          {/* Headline */}
          <h1 className="text-pretty text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-foreground">
            <span className="text-gradient">Transforming</span> the way
            <br className="hidden sm:block" />
            the world learns
          </h1>

          {/* Subtext */}
          <p className="max-w-3xl text-lg md:text-xl text-muted-foreground leading-relaxed">
            We're building the next generation of learning platforms—designed
            for real people, with simplicity, accessibility, and impact at our
            core. Join us on this journey to make education better for everyone.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link to="/courses">
              <Button className="px-8 py-3 text-base font-semibold hover-lift bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg hover:shadow-xl transition-all">
                Discover Courses
              </Button>
            </Link>
            <Link to="#our-story">
              <Button
                variant="outline"
                className="px-8 py-3 text-base border-2 hover-lift"
              >
                Our Journey
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <StatPill
              color="bg-success"
              number={250}
              suffix="k+"
              label="Active Learners"
            />
            <StatPill
              color="bg-accent"
              number={99.9}
              suffix="%"
              label="Uptime"
            />
            <StatPill
              color="bg-primary"
              number={120}
              suffix="+"
              label="Countries Reached"
            />
          </div>
        </div>
      </div>

      {/* Decorative smooth wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 150"
          className="w-full h-24 text-background fill-current"
        >
          <path d="M0,64L48,74.7C96,85,192,107,288,122.7C384,139,480,149,576,144C672,139,768,117,864,96C960,75,1056,53,1152,53.3C1248,53,1344,75,1392,85.3L1440,96V0H0Z"></path>
        </svg>
      </div>
    </header>
  );
}

/* Improved stat pill */
function StatPill({ color, number, suffix = "", label }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-border/40 bg-background/70 px-5 py-2 backdrop-blur-sm shadow-sm hover:shadow-md transition hover:bg-background/80">
      <div className={`h-3 w-3 rounded-full ${color}`}></div>
      <div className="flex items-baseline gap-1">
        <span className="font-bold text-foreground text-lg">
          <CountUp from={0} to={number} separator="," duration={1.5} />
          {suffix}
        </span>
        <span className="text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
