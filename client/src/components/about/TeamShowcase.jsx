// src/components/about/TeamShowcase.tsx

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const people = [
  { name: "Ava Chen", role: "Head of Learning Design", img: "/headshot-ava-chen.png" },
  { name: "Ravi Patel", role: "Platform Engineering", img: "/headshot-ravi-patel.png" },
  { name: "Sofia Reyes", role: "Instructor Experience", img: "/headshot-sofia-reyes.png" },
  { name: "Liam O’Connor", role: "Product & Research", img: "/headshot-liam-o-connor.png" },
]

export function TeamShowcase() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="text-pretty text-2xl text-foreground md:text-3xl">Meet the team</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Educators, builders, and lifelong learners shaping the future of learning.
        </p>

        <ul className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {people.map((p) => (
            <li
              key={p.name}
              className="group rounded-lg border border-border bg-card p-4 transition-transform hover:-translate-y-0.5"
            >
              <div className="flex flex-col items-center gap-3">
                <Avatar className="h-20 w-20 ring-2 ring-primary">
                  <AvatarImage src={p.img || "/placeholder.svg"} alt={`Headshot of ${p.name}`} />
                  <AvatarFallback className="bg-muted text-foreground">
                    {initials(p.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-medium text-foreground">{p.name}</p>
                  <p className="text-sm text-muted-foreground">{p.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function initials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
}
