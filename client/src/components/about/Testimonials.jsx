"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Quote } from "lucide-react"

const quotes = [
  {
    text: "Our onboarding time dropped dramatically. The clarity of the course experience boosted completion rates immediately.",
    author: "Dana, L&D Lead",
  },
  {
    text: "As an instructor, I can finally focus on teaching. The authoring workflow is fast and frustration-free.",
    author: "Marco, Instructor",
  },
  {
    text: "We scaled training across 10 countries with zero chaos. The platform just… makes sense.",
    author: "Iris, People Ops",
  },
]

export function Testimonials() {
  return (
    <section className="bg-gradient-to-br from-background to-primary/5">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white">
              <Quote className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Voices from Our <span className="text-gradient">Community</span>
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Hear from educators, learners, and organizations who are transforming education with us
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {quotes.map((q, i) => (
            <div key={i} className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl transform group-hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
              
              <Card className="highlight-card hover-lift relative z-10 h-full border-0 transition-all duration-300 group-hover:shadow-xl">
                <CardContent className="p-8">
                  <div className="mb-6 flex justify-between items-start">
                    <div className="h-2 w-12 rounded-full bg-gradient-to-r from-primary to-accent"></div>
                    <Quote className="h-8 w-8 text-primary/20" />
                  </div>
                  
                  <p className="text-foreground leading-relaxed group-hover:text-primary/90 transition-colors italic">
                    "{q.text}"
                  </p>
                  
                  <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-foreground font-medium text-sm">
                      {q.author.split(' ')[0][0]}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{q.author}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, star) => (
                          <svg key={star} className="h-3 w-3 fill-amber-400" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-secondary px-6 py-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-sm">
              💫
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Join thousands of satisfied users worldwide
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
