"use client"

import { useState, useEffect } from "react"
import { Link as ScrollLink } from "react-scroll"
import { Button } from "@/components/ui/button"
import { ChevronUp } from "lucide-react"

const sections = [
  { id: "hero", label: "Overview" },
  { id: "story", label: "Our Story" },
  { id: "values", label: "Values" },
  { id: "philosophy", label: "Philosophy" },
  { id: "team", label: "Team" },
  { id: "testimonials", label: "Testimonials" },
  { id: "partners", label: "Partners" }
]

export function AboutNavigation() {
  const [activeSection, setActiveSection] = useState("hero")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      setIsVisible(scrollY > 200)

      // Find active section based on scroll position
      const sectionElements = sections.map(section => ({
        id: section.id,
        element: document.getElementById(section.id)
      }))

      const currentSection = sectionElements.find(({ element }) => {
        if (!element) return false
        const rect = element.getBoundingClientRect()
        return rect.top <= 100 && rect.bottom >= 100
      })

      if (currentSection) {
        setActiveSection(currentSection.id)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-background/95 backdrop-blur-lg border border-border rounded-full shadow-lg p-2">
        {sections.slice(0, 4).map((section) => (
          <ScrollLink
            key={section.id}
            to={section.id}
            spy={true}
            smooth={true}
            offset={-80}
            duration={500}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 cursor-pointer ${
              activeSection === section.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
            onSetActive={() => setActiveSection(section.id)}
          >
            {section.label}
          </ScrollLink>
        ))}
        
        <div className="relative group">
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 rounded-full text-muted-foreground hover:text-foreground"
          >
            •••
          </Button>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
            <div className="bg-background border border-border rounded-lg shadow-lg p-2 min-w-[120px]">
              {sections.slice(4).map((section) => (
                <ScrollLink
                  key={section.id}
                  to={section.id}
                  spy={true}
                  smooth={true}
                  offset={-80}
                  duration={500}
                  className={`block px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  onSetActive={() => setActiveSection(section.id)}
                >
                  {section.label}
                </ScrollLink>
              ))}
            </div>
          </div>
        </div>

        {isVisible && (
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 rounded-full text-muted-foreground hover:text-foreground"
            onClick={scrollToTop}
            title="Scroll to top"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}