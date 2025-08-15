"use client"

import { ArrowRight, Star, Quote, Building, User, TrendingUp } from "lucide-react"
import Link from "next/link"
import { UnifiedHeader } from "@/components/shared/unified-header"

function SimpleButton({ children, variant = "default", size = "default", className = "", href, ...props }: any) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"

  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  }

  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 px-8 rounded-md",
  }

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

function SimpleCard({ children, className = "" }: any) {
  return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>
}

const testimonials = [
  {
    name: "Marie Dubois",
    role: "Directrice Générale",
    company: "TechStart SAS",
    avatar: "/professional-woman-diverse.png",
    rating: 5,
    text: "DecisionAI a révolutionné notre processus de prise de décision. La méthode Schulich enrichie par l'IA nous fait gagner un temps précieux et améliore la qualité de nos choix stratégiques.",
    highlight: "Gain de temps de 60%",
  },
  {
    name: "Pierre Martin",
    role: "Consultant Senior",
    company: "Strategy & Co",
    avatar: "/professional-man.png",
    rating: 5,
    text: "L'interface intuitive et les suggestions IA sont remarquables. Mes clients apprécient la visualisation claire qui les aide à comprendre instantanément les enjeux de leurs décisions.",
    highlight: "Satisfaction client +40%",
  },
  {
    name: "Sophie Chen",
    role: "Chef de Projet",
    company: "Innovation Labs",
    avatar: "/asian-professional-woman.png",
    rating: 5,
    text: "La collaboration d'équipe et l'historique des décisions nous permettent d'apprendre de nos choix passés. Un outil indispensable pour tout manager.",
    highlight: "Amélioration des résultats de 35%",
  },
  {
    name: "Thomas Leroy",
    role: "Entrepreneur",
    company: "StartupBoost",
    avatar: "/young-entrepreneur.png",
    rating: 5,
    text: "En tant qu'entrepreneur, chaque décision compte. DecisionAI m'aide à structurer ma réflexion et à éviter les biais cognitifs. Les résultats parlent d'eux-mêmes.",
    highlight: "ROI amélioré de 50%",
  },
  {
    name: "Isabelle Moreau",
    role: "Directrice RH",
    company: "Global Corp",
    avatar: "/hr-director-woman.png",
    rating: 5,
    text: "Pour les décisions RH complexes, la méthode Schulich apporte une objectivité précieuse. L'IA suggère des aspects que nous n'aurions pas forcément considérés.",
    highlight: "Décisions plus objectives",
  },
  {
    name: "Alexandre Petit",
    role: "Directeur Financier",
    company: "FinanceFirst",
    avatar: "/finance-director-man.png",
    rating: 5,
    text: "La sécurité des données et la conformité RGPD étaient essentielles pour nous. DecisionAI répond parfaitement à nos exigences tout en offrant une expérience utilisateur exceptionnelle.",
    highlight: "Conformité 100% RGPD",
  },
]

const stats = [
  { number: "98%", label: "Taux de satisfaction", icon: <Star className="w-6 h-6" /> },
  { number: "10,000+", label: "Utilisateurs actifs", icon: <User className="w-6 h-6" /> },
  { number: "500+", label: "Entreprises clientes", icon: <Building className="w-6 h-6" /> },
  { number: "45%", label: "Amélioration moyenne", icon: <TrendingUp className="w-6 h-6" /> },
]

const companies = [
  "TechStart SAS",
  "Strategy & Co",
  "Innovation Labs",
  "StartupBoost",
  "Global Corp",
  "FinanceFirst",
  "ConsultPro",
  "Digital Solutions",
]

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-background to-primary/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground">
              Ce que disent nos <span className="text-accent">clients</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez comment DecisionAI transforme la prise de décision dans des centaines d'entreprises à travers le
              monde.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SimpleButton size="lg" className="bg-accent hover:bg-accent/90" href="/demo">
                Voir la démo
                <ArrowRight className="w-5 h-5 ml-2" />
              </SimpleButton>
              <SimpleButton variant="outline" size="lg" href="/auth/sign-up">
                Rejoindre nos clients
              </SimpleButton>
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

      {/* Testimonials Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Témoignages Clients</h2>
            <p className="text-xl text-muted-foreground">Des résultats concrets, des retours authentiques</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <SimpleCard
                key={index}
                className="relative group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-accent/50"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={testimonial.avatar || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(testimonial.name)
                      }}
                    />
                    <div>
                      <h3 className="font-semibold text-card-foreground">{testimonial.name}</h3>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-accent font-medium">{testimonial.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
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

      {/* Companies Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Ils nous font confiance</h2>
            <p className="text-muted-foreground">Plus de 500 entreprises utilisent DecisionAI quotidiennement</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {companies.map((company, index) => (
              <div key={index} className="text-center p-4 bg-card rounded-lg border border-border/50">
                <p className="text-sm font-medium text-muted-foreground">{company}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Share Experience Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SimpleCard className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
            <div className="p-6 text-center">
              <h3 className="text-2xl font-semibold text-card-foreground mb-2">Partagez votre expérience</h3>
              <p className="text-muted-foreground mb-6">
                Votre retour nous aide à améliorer continuellement notre plateforme
              </p>
            </div>
            <div className="px-6 pb-6 text-center space-y-6">
              <p className="text-muted-foreground">
                Vous utilisez déjà DecisionAI ? Partagez votre expérience avec notre communauté et aidez d'autres
                professionnels à découvrir les bénéfices de notre solution.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SimpleButton size="lg" className="bg-accent hover:bg-accent/90">
                  Laisser un témoignage
                  <ArrowRight className="w-5 h-5 ml-2" />
                </SimpleButton>
                <SimpleButton variant="outline" size="lg">
                  Contacter le support
                </SimpleButton>
              </div>
            </div>
          </SimpleCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground">Rejoignez nos clients satisfaits</h2>
            <p className="text-xl text-primary-foreground/80">
              Commencez dès aujourd'hui à transformer vos décisions avec DecisionAI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SimpleButton size="lg" variant="secondary" className="bg-accent hover:bg-accent/90" href="/demo">
                Essayer gratuitement
                <ArrowRight className="w-5 h-5 ml-2" />
              </SimpleButton>
              <SimpleButton
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                href="/auth/sign-up"
              >
                Créer un compte
              </SimpleButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
