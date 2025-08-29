// src/components/about/ClosingCta.tsx

import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function ClosingCta() {
  return (
    <section className="bg-muted">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="rounded-xl border border-border bg-card p-8">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-pretty text-xl text-foreground">Ready to learn forward?</h3>
              <p className="mt-1 text-muted-foreground">
                Spin up your first course in minutes. No heavy setup. No clutter.
              </p>
              <ul className="mt-3 list-disc pl-5 text-sm text-muted-foreground">
                <li>Author courses fast with practical defaults</li>
                <li>Track progress and outcomes with ease</li>
                <li>Accessible, privacy-first by design</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Link to="/signup">
                <Button>Get started</Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" className="bg-transparent hover:bg-secondary">
                  Book a demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
