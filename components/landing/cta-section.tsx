"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface CTASectionProps {
  user: any
  loading: boolean
}

export function CTASection({ user, loading }: CTASectionProps) {
  return (
    <section className="py-20 bg-primary">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground">
            Prêt à prendre de meilleures décisions ?
          </h2>
          <p className="text-xl text-primary-foreground/80">
            Rejoignez des milliers de professionnels qui utilisent déjà notre plateforme pour optimiser leurs décisions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {loading ? (
              <div className="flex space-x-4 justify-center">
                <div className="w-40 h-12 bg-primary-foreground/20 animate-pulse rounded"></div>
                <div className="w-32 h-12 bg-primary-foreground/20 animate-pulse rounded"></div>
              </div>
            ) : user ? (
              <>
                <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Link href="/app">
                    Accéder à l'application
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link href="/app">Nouvelle analyse</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Link href="/auth/sign-up">
                    Commencer maintenant
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Link href="/demo">Essayer la démo</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
