"use client"

import { ArrowRight, CheckCircle, Brain, BarChart3, Lightbulb, Target } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UnifiedHeader } from "@/components/shared/unified-header"

const steps = [
  {
    number: 1,
    title: "Définissez votre décision",
    description: "Décrivez clairement la situation et le contexte de votre décision.",
    icon: <Target className="w-6 h-6" />,
    details: ["Contexte détaillé", "Enjeux identifiés", "Objectifs clairs"],
  },
  {
    number: 2,
    title: "Listez vos arguments",
    description: "Ajoutez vos arguments et notez-les de -10 à +10 selon leur importance.",
    icon: <Lightbulb className="w-6 h-6" />,
    details: ["Arguments pour/contre", "Notation pondérée", "Tri automatique"],
  },
  {
    number: 3,
    title: "Obtenez des suggestions IA",
    description: "L'IA analyse votre contexte et propose des arguments supplémentaires.",
    icon: <Brain className="w-6 h-6" />,
    details: ["Analyse contextuelle", "Suggestions pertinentes", "Arguments manqués"],
  },
  {
    number: 4,
    title: "Visualisez et décidez",
    description: "La visualisation semi-circulaire vous donne une recommandation claire basée sur la règle 2:1.",
    icon: <BarChart3 className="w-6 h-6" />,
    details: ["Gauge interactive", "Règle 2:1 de Schulich", "Recommandation claire"],
  },
]

const principles = [
  {
    title: "Règle 2:1 de Schulich",
    description: "Une décision est favorable si les arguments positifs sont au moins 2 fois supérieurs aux négatifs.",
    example: "14 points positifs vs 7 points négatifs = Décision favorable",
  },
  {
    title: "Pondération intelligente",
    description: "Chaque argument est noté de -10 à +10 selon son importance réelle dans votre contexte.",
    example: "Un risque majeur (-8) pèse plus qu'un avantage mineur (+2)",
  },
  {
    title: "Analyse contextuelle",
    description: "L'IA comprend votre situation et propose des arguments que vous n'auriez pas considérés.",
    example: "Suggestions basées sur des cas similaires et l'expertise sectorielle",
  },
]

export default function MethodPage() {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
              La Méthode <span className="text-primary">Schulich</span> Enrichie par l'IA
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
              Découvrez comment notre plateforme s'appuie sur la méthode éprouvée de Seymour Schulich, enrichie par
              l'intelligence artificielle pour vous aider à prendre des décisions plus éclairées.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Voir la méthode en action
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/fonctionnalites">
                <Button variant="outline" size="lg">
                  Découvrir les fonctionnalités
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Method Steps */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">4 Étapes Simples</h2>
            <p className="text-xl text-muted-foreground">Un processus structuré pour des décisions éclairées</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-accent to-transparent z-0" />
                )}
                <Card className="relative z-10 h-full hover:shadow-lg transition-shadow border-border/50 hover:border-accent/50">
                  <CardHeader className="text-center space-y-4">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-2xl font-bold mx-auto">
                      {step.number}
                    </div>
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto text-accent">
                      {step.icon}
                    </div>
                    <CardTitle className="text-xl text-card-foreground">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-muted-foreground text-center">{step.description}</CardDescription>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-accent mr-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Principes Fondamentaux</h2>
            <p className="text-xl text-muted-foreground">Les règles qui garantissent la qualité de vos décisions</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {principles.map((principle, index) => (
              <Card key={index} className="border-border/50 hover:border-accent/50 transition-colors">
                <CardHeader>
                  <CardTitle className="text-xl text-card-foreground">{principle.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-muted-foreground">{principle.description}</CardDescription>
                  <div className="p-4 bg-accent/5 rounded-lg border border-accent/20">
                    <p className="text-sm text-accent font-medium">Exemple :</p>
                    <p className="text-sm text-muted-foreground mt-1">{principle.example}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-accent/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-card-foreground">Exemple Concret d'Analyse</CardTitle>
              <CardDescription>Découvrez comment la méthode s'applique à une décision réelle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-card rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-card-foreground">Décision : Lancer un nouveau produit</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-accent">Arguments Positifs (14 pts)</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-accent/5 rounded">
                        <span className="text-sm">Opportunité de marché</span>
                        <span className="text-accent font-semibold">+8</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-accent/5 rounded">
                        <span className="text-sm">Équipe motivée</span>
                        <span className="text-accent font-semibold">+6</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-destructive">Arguments Négatifs (7 pts)</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-destructive/5 rounded">
                        <span className="text-sm">Investissement élevé</span>
                        <span className="text-destructive font-semibold">-5</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-destructive/5 rounded">
                        <span className="text-sm">Risque concurrentiel</span>
                        <span className="text-destructive font-semibold">-2</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <p className="text-lg font-semibold text-accent mb-2">Recommandation : Favorable</p>
                  <p className="text-sm text-muted-foreground">
                    Ratio 2:1 respecté (14 vs 7) - La décision est recommandée
                  </p>
                </div>
              </div>
              <div className="text-center">
                <Link href="/demo">
                  <Button size="lg" className="bg-accent hover:bg-accent/90">
                    Essayer avec vos propres données
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground">Maîtrisez la méthode Schulich</h2>
            <p className="text-xl text-primary-foreground/80">
              Transformez votre processus de décision avec une méthode éprouvée et l'intelligence artificielle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button size="lg" variant="secondary" className="bg-accent hover:bg-accent/90">
                  Commencer la démo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                >
                  Créer un compte gratuit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
