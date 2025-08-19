"use client"

import { Quote, Star } from "lucide-react"
import Image from "next/image"
import type { ReactNode } from "react"
import { handleImageError } from "@/lib/utils"
import { testimonials } from "../data"

// Composant SimpleCard réutilisé depuis la page originale
function SimpleCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>
}

export function TestimonialsGrid() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Témoignages Clients</h2>
          <p className="text-xl text-muted-foreground">Des résultats concrets, des retours authentiques</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map(testimonial => (
            <SimpleCard
              key={testimonial.name}
              className="relative group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-accent/50"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center space-x-4">
                  <Image
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                    width={48}
                    height={48}
                    onError={e => handleImageError(e, testimonial.name)}
                  />
                  <div>
                    <h3 className="font-semibold text-card-foreground">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-xs text-accent font-medium">{testimonial.company}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={`${testimonial.name}-star-${i}`}
                      className="w-4 h-4 fill-accent text-accent"
                    />
                  ))}
                </div>
              </div>
              <div className="px-6 pb-6 space-y-4">
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 w-6 h-6 text-accent/20" />
                  <p className="text-muted-foreground italic pl-4">"{testimonial.text}"</p>
                </div>
                <div className="p-3 bg-accent/5 rounded-lg border border-accent/20">
                  <p className="text-sm font-semibold text-accent">{testimonial.highlight}</p>
                </div>
              </div>
            </SimpleCard>
          ))}
        </div>
      </div>
    </section>
  )
}
