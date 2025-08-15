"use client"

import { ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface HeroSectionProps {
  user: any
  loading: boolean
}

export function HeroSection({ user, loading }: HeroSectionProps) {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-card via-background to-muted opacity-50" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                Prenez des décisions
                <span className="text-primary"> éclairées</span> avec l'IA
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Utilisez la méthode Schulich enrichie par l'intelligence artificielle pour analyser vos arguments et
                prendre les meilleures décisions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {loading ? (
                <div className="flex space-x-4">
                  <div className="w-48 h-12 bg-muted animate-pulse rounded"></div>
                  <div className="w-32 h-12 bg-muted animate-pulse rounded"></div>
                </div>
              ) : user ? (
                <>
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/app">
                      Accéder à l'application
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                    <Link href="/demo">Voir la démo</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="w-full sm:w-auto">
                    <Link href="/auth/sign-up">
                      Commencer gratuitement
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                    <Link href="/demo">Voir la démo</Link>
                  </Button>
                </>
              )}
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span>Gratuit pour commencer</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-accent" />
                <span>Aucune carte requise</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-card rounded-2xl p-8 shadow-2xl border border-border">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">Analyse de Décision</h3>
                  <div className="relative w-64 h-32 mx-auto">
                    <svg viewBox="0 0 200 100" className="w-full h-full">
                      <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#dc2626" />
                          <stop offset="25%" stopColor="#f97316" />
                          <stop offset="50%" stopColor="#eab308" />
                          <stop offset="75%" stopColor="#84cc16" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 20 80 A 60 60 0 0 1 180 80"
                        fill="none"
                        stroke="url(#gaugeGradient)"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      <line x1="100" y1="80" x2="130" y2="55" stroke="#164e63" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="100" cy="80" r="4" fill="#164e63" />
                    </svg>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center text-destructive-foreground font-bold">
                        7
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Négatifs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-accent">Favorable</p>
                      <p className="text-xs text-muted-foreground">Recommandation</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                        14
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Positifs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
