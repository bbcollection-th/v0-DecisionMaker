"use client"

import { ArrowRight, Brain, BarChart3, Shield, Smartphone, Users, Clock, Zap, Target, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UnifiedHeader } from "@/components/shared/unified-header"

const features = [
  {
    icon: <Brain className="w-8 h-8 text-accent" />,
    title: "Intelligence Artificielle Avancée",
    description:
      "Notre IA analyse votre contexte et génère des arguments pertinents que vous n'auriez peut-être pas considérés.",
    benefits: ["Suggestions contextuelles", "Analyse sémantique", "Apprentissage continu"],
    highlight: "Nouveau",
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-accent" />,
    title: "Visualisation Interactive",
    description: "Gauge semi-circulaire dynamique basée sur la méthode Schulich pour une compréhension instantanée.",
    benefits: ["Interface intuitive", "Temps réel", "Responsive design"],
    highlight: "Populaire",
  },
  {
    icon: <Shield className="w-8 h-8 text-accent" />,
    title: "Sécurité Maximale",
    description: "Chiffrement de bout en bout et conformité RGPD pour protéger vos données sensibles.",
    benefits: ["Chiffrement AES-256", "Conformité RGPD", "Audit de sécurité"],
    highlight: "",
  },
  {
    icon: <Smartphone className="w-8 h-8 text-accent" />,
    title: "Multi-Plateforme",
    description: "Accédez à vos analyses depuis n'importe quel appareil avec synchronisation automatique.",
    benefits: ["Application mobile", "Synchronisation cloud", "Mode hors-ligne"],
    highlight: "",
  },
  {
    icon: <Users className="w-8 h-8 text-accent" />,
    title: "Collaboration d'Équipe",
    description: "Partagez vos analyses et prenez des décisions collectives avec votre équipe.",
    benefits: ["Partage sécurisé", "Commentaires", "Historique des versions"],
    highlight: "Pro",
  },
  {
    icon: <Clock className="w-8 h-8 text-accent" />,
    title: "Historique Complet",
    description: "Retrouvez et analysez toutes vos décisions passées pour améliorer votre processus.",
    benefits: ["Recherche avancée", "Filtres personnalisés", "Export de données"],
    highlight: "",
  },
]

const stats = [
  { number: "10,000+", label: "Décisions analysées", icon: <Target className="w-6 h-6" /> },
  { number: "95%", label: "Satisfaction client", icon: <TrendingUp className="w-6 h-6" /> },
  { number: "2.5x", label: "Amélioration des résultats", icon: <Zap className="w-6 h-6" /> },
  { number: "24/7", label: "Support disponible", icon: <Clock className="w-6 h-6" /> },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Unified Header */}
      <UnifiedHeader />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-primary/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
              Fonctionnalités <span className="text-accent">Puissantes</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez comment notre plateforme révolutionne votre processus de prise de décision avec des outils
              avancés et une interface intuitive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button size="lg" className="bg-accent hover:bg-accent/90">
                  Essayer la démo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button variant="outline" size="lg">
                  Commencer gratuitement
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="flex justify-center text-accent mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-foreground">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="relative group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-accent/50"
              >
                {feature.highlight && (
                  <div className="absolute -top-3 left-6 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    {feature.highlight}
                  </div>
                )}
                <CardHeader className="space-y-4">
                  <div className="w-16 h-16 bg-accent/10 rounded-xl flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-card-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mr-3" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Button variant="ghost" className="w-full group-hover:bg-accent/10 transition-colors">
                    En savoir plus
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground">
              Prêt à transformer vos décisions ?
            </h2>
            <p className="text-xl text-primary-foreground/80">
              Rejoignez des milliers de professionnels qui optimisent leurs décisions avec notre plateforme.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/demo">
                <Button size="lg" variant="secondary" className="bg-accent hover:bg-accent/90">
                  Voir la démo interactive
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                >
                  Commencer maintenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
