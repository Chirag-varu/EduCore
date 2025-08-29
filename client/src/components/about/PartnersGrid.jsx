export function PartnersGrid() {
  const partners = ["AWS Educate", "Google for Education", "Microsoft Learn", "Coursera", "edX", "Khan Academy"]
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-16 sm:py-20">
          <h2 className="text-pretty text-3xl font-semibold sm:text-4xl">Partners</h2>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">
            {partners.map((p) => (
              <div
                key={p}
                className="flex items-center justify-center rounded-md border border-gray-200 bg-gray-50 p-4"
              >
                <img
                  src={`/abstract-geometric-shapes.png?height=26&width=120&query=${encodeURIComponent(p + " logo")}`}
                  alt={`${p} logo`}
                  className="h-6 w-auto opacity-80"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
