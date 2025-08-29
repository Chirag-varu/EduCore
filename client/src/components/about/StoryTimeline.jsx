"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Flag, Rocket, Sparkles } from "lucide-react";

export function StoryTimeline() {
  const timelineItems = [
    {
      icon: <Flag className="h-6 w-6" aria-hidden="true" />,
      year: "2019",
      title: "The Beginning",
      desc: "A small team sets out to design a learning platform that reduces friction and increases outcomes.",
      color: "text-blue-500",
      bgColor: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      icon: <Rocket className="h-6 w-6" aria-hidden="true" />,
      year: "2021",
      title: "First Launch",
      desc: "We onboard early partners, run pilots, and refine the product through real classroom feedback.",
      color: "text-violet-500",
      bgColor: "bg-violet-100 dark:bg-violet-900/30"
    },
    {
      icon: <Sparkles className="h-6 w-6" aria-hidden="true" />,
      year: "2024",
      title: "Scaling Learning",
      desc: "Today we power cohorts across companies and universities—focused on impact, not vanity.",
      color: "text-amber-500",
      bgColor: "bg-amber-100 dark:bg-amber-900/30"
    }
  ];

  return (
    <section id="our-story" className="bg-gradient-to-br from-background to-secondary/30">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center mb-16">
          <Badge className="bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-medium px-4 py-1.5 mb-4">
            Our Journey
          </Badge>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            The Story Behind <span className="text-gradient">Learn Forward</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            From a simple idea to empowering thousands of learners worldwide—here's our evolution
          </p>
        </div>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 h-full w-0.5 bg-gradient-to-b from-primary/30 via-accent/30 to-primary/30 md:left-1/2 md:-translate-x-1/2"></div>
          
          <div className="grid gap-12 md:grid-cols-2">
            <div className="flex flex-col gap-8 md:pr-12">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-foreground">
                  Built for real-world learning
                </h3>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  We started as educators and engineers frustrated by noisy, complex tools.
                  So we built an LMS that respects your time—clean, focused, and ready to
                  scale across teams and classrooms.
                </p>
              </div>
              
              <div className="flex justify-center md:justify-start">
                <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                  Making learning accessible for everyone
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="space-y-12">
                {timelineItems.map((item, index) => (
                  <TimelineItem
                    key={index}
                    icon={item.icon}
                    year={item.year}
                    title={item.title}
                    desc={item.desc}
                    color={item.color}
                    bgColor={item.bgColor}
                    index={index}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ icon, year, title, desc, color, bgColor, index }) {
  return (
    <div className="relative group">
      {/* Connection line */}
      <div className={`absolute left-8 top-6 h-0.5 w-8 bg-gradient-to-r from-primary/30 to-transparent md:left-1/2 md:-translate-x-1/2 md:w-12 ${
        index % 2 === 0 ? 'md:left-auto md:right-1/2 md:translate-x-1/2 md:bg-gradient-to-l' : ''
      }`}></div>
      
      <div className="flex items-start gap-6">
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${bgColor} ${color} shadow-lg group-hover:scale-110 transition-transform z-10`}>
          {icon}
        </div>
        
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {year}
            </span>
            <div className="h-1 w-6 rounded-full bg-current opacity-40 group-hover:w-8 transition-all"></div>
          </div>
          
          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          
          <p className="mt-2 text-muted-foreground group-hover:text-foreground transition-colors">
            {desc}
          </p>
          
          <div className="mt-3 h-0.5 w-8 bg-primary/30 rounded-full group-hover:w-12 transition-all"></div>
        </div>
      </div>
    </div>
  );
}
