const steps = [
  {
    number: 1,
    title: "Définissez votre décision",
    description: "Décrivez clairement la situation et le contexte de votre décision.",
  },
  {
    number: 2,
    title: "Listez vos arguments",
    description: "Ajoutez vos arguments et notez-les de -10 à +10 selon leur importance.",
  },
  {
    number: 3,
    title: "Obtenez des suggestions IA",
    description: "L'IA analyse votre contexte et propose des arguments supplémentaires.",
  },
  {
    number: 4,
    title: "Visualisez et décidez",
    description: "La visualisation semi-circulaire vous donne une recommandation claire basée sur la règle 2:1.",
  },
]

const exampleArguments = [
  { text: "Opportunité de croissance", score: 8, positive: true },
  { text: "Équipe motivée", score: 6, positive: true },
  { text: "Investissement initial élevé", score: -5, positive: false },
  { text: "Risque de marché", score: -2, positive: false },
]

export function MethodSection() {
  return (
    <section id="methode" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground">La méthode Schulich enrichie par l'IA</h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto">
            Notre plateforme s'appuie sur la méthode éprouvée de Seymour Schulich, enrichie par l'intelligence
            artificielle pour vous aider à prendre des décisions plus éclairées.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step) => (
            <div key={step.number} className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-xl border border-border max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold text-card-foreground mb-6 text-center">Exemple d'analyse</h3>
          <div className="space-y-4">
            {exampleArguments.map((arg, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  arg.positive ? "bg-primary/5 border-primary/20" : "bg-destructive/5 border-destructive/20"
                }`}
              >
                <span className="text-card-foreground">{arg.text}</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    arg.positive ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"
                  }`}
                >
                  {arg.score > 0 ? "+" : ""}
                  {arg.score}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-lg font-semibold text-primary mb-2">Recommandation: Favorable</p>
            <p className="text-sm text-muted-foreground">Ratio 2:1 respecté (14 vs 7)</p>
          </div>
        </div>
      </div>
    </section>
  )
}
