"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Users, Lightbulb, Target } from "lucide-react";

export function ValuesGrid() {
  const values = [
    {
      icon: <Users className="h-6 w-6" aria-hidden="true" />,
      title: "Learner-first",
      desc: "We optimize for clarity and outcomes—not features for their own sake.",
      color: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30"
    },
    {
      icon: <Lightbulb className="h-6 w-6" aria-hidden="true" />,
      title: "Practical by design",
      desc: "Simple flows, thoughtful defaults, and fewer clicks to do more.",
      color: "text-violet-500",
      bgColor: "bg-violet-50 dark:bg-violet-950/30"
    },
    {
      icon: <ShieldCheck className="h-6 w-6" aria-hidden="true" />,
      title: "Trust & privacy",
      desc: "We treat your data like our own—secure and transparent.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30"
    },
    {
      icon: <Target className="h-6 w-6" aria-hidden="true" />,
      title: "Continuous improvement",
      desc: "We listen, iterate, and ship what matters.",
      color: "text-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/30"
    }
  ];

  return (
    <section className="bg-gradient-to-br from-background to-secondary/30">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            Our Core <span className="text-gradient">Values</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            The principles that guide everything we do, from product design to community support
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => (
            <Value
              key={index}
              icon={value.icon}
              title={value.title}
              desc={value.desc}
              color={value.color}
              bgColor={value.bgColor}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-secondary px-6 py-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-sm">
              ⚡
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Built with purpose, designed for impact
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Value({ icon, title, desc, color, bgColor }) {
  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-2xl transform group-hover:scale-105 transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
      
      <Card className={`highlight-card hover-lift relative z-10 h-full border-0 ${bgColor} transition-all duration-300 group-hover:shadow-xl`}>
        <CardHeader className="flex flex-row items-start gap-4 pb-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor} ${color} shadow-sm group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          <CardTitle className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`h-1 w-12 rounded-full ${color} opacity-60 mb-4 group-hover:w-16 transition-all duration-300`}></div>
          <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
            {desc}
          </p>
          <div className="mt-4 flex items-center text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="mr-2">→</span>
            Learn more
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
