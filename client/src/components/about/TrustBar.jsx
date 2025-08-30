export function TrustBar() {
  return (
    <section className="relative bg-gradient-to-b from-muted/40 to-muted py-20">
      <div className="mx-auto max-w-6xl px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
            Trusted by a growing community
          </h2>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of learners and educators transforming education
          </p>
        </div>
        
        {/* Stats */}
        <ul className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <Stat
            label="Active Learners"
            value="250k+"
            icon="👥"
            color="bg-blue-500/10 text-blue-600"
          />
          <Stat
            label="Quality Courses"
            value="1.2k+"
            icon="📚"
            color="bg-violet-500/10 text-violet-600"
          />
          <Stat
            label="Expert Instructors"
            value="900+"
            icon="🌟"
            color="bg-amber-500/10 text-amber-600"
          />
          <Stat
            label="Global Reach"
            value="85+"
            icon="🌎"
            color="bg-emerald-500/10 text-emerald-600"
          />
        </ul>
        
        {/* Trusted Badge */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-secondary/60 px-5 py-2.5 text-sm text-muted-foreground shadow-sm backdrop-blur-md">
            <div className="h-2 w-2 rounded-full bg-primary animate-ping"></div>
            Trusted by organizations worldwide
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ label, value, icon, color }) {
  return (
    <li className="group rounded-2xl bg-background/70 backdrop-blur-md shadow-md p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
      {/* Icon */}
      <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${color}`}>
        <span className="text-2xl">{icon}</span>
      </div>
      
      {/* Value */}
      <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
        {value}
      </p>
      
      {/* Label */}
      <p className="mt-2 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        {label}
      </p>
      
      {/* Animated underline */}
      <div className="mt-4 h-1 w-10 bg-primary/20 rounded-full mx-auto group-hover:w-16 group-hover:bg-primary transition-all duration-300"></div>
    </li>
  )
}
