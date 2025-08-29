"use client"

export function TrustBar() {
  return (
    <section className="bg-background">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Trusted by a growing community
          </h2>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Join thousands of learners and educators who are transforming education
          </p>
        </div>
        
        <ul className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <Stat
            label="Active Learners"
            value="250k+"
            icon="👥"
            color="text-blue-500"
          />
          <Stat
            label="Quality Courses"
            value="1.2k+"
            icon="📚"
            color="text-violet-500"
          />
          <Stat
            label="Expert Instructors"
            value="900+"
            icon="🌟"
            color="text-amber-500"
          />
          <Stat
            label="Global Reach"
            value="85+"
            icon="🌎"
            color="text-emerald-500"
          />
        </ul>
        
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            Trusted by organizations worldwide
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value, icon, color }) {
  return (
    <li className="highlight-card hover-lift group rounded-xl p-6 text-center transition-all duration-300">
      <div className={`text-3xl mb-3 ${color} opacity-80 group-hover:opacity-100 transition-opacity`}>
        {icon}
      </div>
      <p className="mt-1 text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
        {value}
      </p>
      <p className="mt-2 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        {label}
      </p>
      <div className="mt-3 h-1 w-8 bg-primary/20 rounded-full mx-auto group-hover:w-12 transition-all duration-300"></div>
    </li>
  )
}
