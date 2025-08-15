"use client"

import { ArrowRight, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  user: any
  loading: boolean
}

export function Header({ user, loading }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">DecisionAI</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/fonctionnalites" className="text-muted-foreground hover:text-foreground transition-colors">
              Fonctionnalités
            </Link>
            <Link href="/methode" className="text-muted-foreground hover:text-foreground transition-colors">
              Méthode
            </Link>
            <Link href="/temoignages" className="text-muted-foreground hover:text-foreground transition-colors">
              Témoignages
            </Link>
            {loading ? (
              <div className="flex space-x-2">
                <div className="w-20 h-8 bg-muted animate-pulse rounded"></div>
                <div className="w-24 h-8 bg-muted animate-pulse rounded"></div>
              </div>
            ) : user ? (
              <Button asChild size="sm">
                <Link href="/app">
                  Accéder à l'application
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="outline" size="sm">
                  <Link href="/auth/login">Se connecter</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/sign-up">
                    Commencer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
