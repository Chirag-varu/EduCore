"use client"

export function ImpactStats() {
  return (
    <section className="bg-muted">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          <ImpactItem title="Completion uplift" value="+28%" note="vs. legacy LMS benchmarks" progress={28} />
          <ImpactItem
            title="Time-to-competency"
            value="35% faster"
            note="measured across 10k+ learners"
            progress={35}
          />
          <ImpactItem title="Support satisfaction" value="97%" note="CSAT across enterprise teams" progress={97} />
        </div>
      </div>
    </section>
  )
}

function ImpactItem({ title, value, note, progress }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{note}</p>

      <div className="mt-4">
        <div className="h-2 w-full rounded-full bg-secondary" aria-hidden="true">
          <div
            className="h-2 rounded-full bg-primary"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
            aria-hidden="true"
          />
        </div>
        <span className="sr-only">{`Progress ${progress}%`}</span>
      </div>
    </div>
  )
}
