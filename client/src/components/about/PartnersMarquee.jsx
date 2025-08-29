"use client"

export function PartnersMarquee() {
  const logos = [
    { alt: "Acme University", src: "/acme-university-logo.png" },
    { alt: "Northwind", src: "/northwind-logo.png" },
    { alt: "Globex", src: "/abstract-geometric-logo.png" },
    { alt: "Innotech", src: "/innotech-logo.png" },
    { alt: "Umbrella", src: "/abstract-umbrella-logo.png" },
  ]

  return (
    <section className="bg-background" aria-labelledby="partners-title">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h2 id="partners-title" className="sr-only">
          Partners
        </h2>
        <p className="text-center text-sm text-muted-foreground">Trusted by universities and teams worldwide</p>
        <div className="mt-6 grid grid-cols-2 items-center gap-6 sm:grid-cols-3 md:grid-cols-5">
          {logos.map((logo) => (
            <img
              key={logo.alt}
              src={logo.src || "/placeholder.svg"}
              alt={logo.alt}
              className="mx-auto h-10 w-auto grayscale transition hover:grayscale-0"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
