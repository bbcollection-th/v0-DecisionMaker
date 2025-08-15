"use client"

import { ArrowRight, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export function UnifiedHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">DecisionAI</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/fonctionnalites"
              className={`transition-colors ${
                pathname === "/fonctionnalites"
                  ? "text-accent font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Fonctionnalités
            </Link>
            <Link
              href="/methode"
              className={`transition-colors ${
                pathname === "/methode" ? "text-accent font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Méthode
            </Link>
            <Link
              href="/temoignages"
              className={`transition-colors ${
                pathname === "/temoignages" ? "text-accent font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Témoignages
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link href="/auth/login">Se connecter</Link>
            </Button>
            <Button asChild size="sm" className="bg-accent hover:bg-accent/90">
              <Link href="/demo">
                Voir la démo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
