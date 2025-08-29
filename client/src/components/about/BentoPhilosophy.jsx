// src/components/about/BentoPhilosophy.tsx

// Colors strictly use tokens: primary, accent, card, border, background, foreground.

export function BentoPhilosophy() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">Learning Philosophy</p>
          <h2 className="text-pretty text-2xl text-foreground md:text-3xl">
            How we design for better learning
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Your time matters. We build for clarity, real progress, and motivation that lasts.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Clarity */}
          <article className="group rounded-xl border border-border bg-card p-5 transition-transform hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <span className="h-2 w-8 rounded-full bg-accent" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-foreground">Clarity</h3>
            </div>
            <img
              src="/clean-course-interface-ui.png"
              alt="Clean course interface illustration"
              className="mt-4 w-full rounded-md border border-border"
            />
            <p className="mt-3 text-sm text-muted-foreground">
              Fewer clicks, clear steps, and focused content so learners can act—not hunt.
            </p>
          </article>

          {/* Community */}
          <article className="group rounded-xl border border-border bg-card p-5 transition-transform hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <span className="h-2 w-8 rounded-full bg-primary" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-foreground">Community</h3>
            </div>
            <img
              src="/peers-learning-discussion-forum.png"
              alt="Peers learning and discussion forum"
              className="mt-4 w-full rounded-md border border-border"
            />
            <p className="mt-3 text-sm text-muted-foreground">
              Human-centered features that help learners connect, ask, and grow together.
            </p>
          </article>

          {/* Capability */}
          <article className="group rounded-xl border border-border bg-card p-5 transition-transform hover:-translate-y-0.5">
            <div className="flex items-center gap-3">
              <span className="h-2 w-8 rounded-full bg-accent" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-foreground">Capability</h3>
            </div>
            <img
              src="/skills-growth-progress-tracker.png"
              alt="Skills growth progress tracker"
              className="mt-4 w-full rounded-md border border-border"
            />
            <p className="mt-3 text-sm text-muted-foreground">
              Practical paths and outcome tracking to convert curiosity into skill.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
