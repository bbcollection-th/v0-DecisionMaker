"use client"

import { useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, FileText, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CounterDisplay } from "@/components/ui/counter-display"
import { DateDisplay } from "@/components/ui/date-display"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { RecommendationBadge } from "@/components/ui/recommendation-badge"
import { DecisionActionsMenu } from "@/features/decision/components/decision-actions-menu"
import { type FilterOption, HistorySubmenu, type SortOption } from "@/features/decision/components/history-submenu"
import { useAuth } from "@/hooks/use-auth"
import { useCurrentDecision } from "@/hooks/use-current-decision"
import { useDecisionHistory } from "@/hooks/use-decision-queries"
import { useDecisionStats } from "@/hooks/use-decision-stats"
import { getErrorMessage } from "@/lib/utils"
import type { Decision } from "@/types/decision"

const ITEMS_PER_PAGE = 12

export default function HistoryPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user, loading: authLoading } = useAuth()
  // ✅ API ZUSTAND PURE - loadDecision existe déjà
  const { loadDecision } = useCurrentDecision()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [currentSort, setCurrentSort] = useState<SortOption>("recent")
  const [currentFilter, setCurrentFilter] = useState<FilterOption>("all")

  const { data: decisions = [], isLoading, error } = useDecisionHistory(user)
  const { getDecisionStats } = useDecisionStats()

  // Fonction pour calculer la recommandation d'une décision
  const getDecisionRecommendation = useMemo(() => {
    return (decision: Decision) => {
      const stats = getDecisionStats(decision)
      return stats.recommendation as "Favorable" | "Défavorable" | "Mitigé" | "Aucune donnée"
    }
  }, [getDecisionStats])

  // Filtrer les décisions
  const filteredDecisions = useMemo(() => {
    let filtered = (decisions || []).filter(
      (decision: Decision) =>
        (decision.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (decision.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Appliquer le filtre
    if (currentFilter !== "all") {
      filtered = filtered.filter(decision => {
        switch (currentFilter) {
          case "favorable":
            return getDecisionRecommendation(decision) === "Favorable"
          case "defavorable":
            return getDecisionRecommendation(decision) === "Défavorable"
          case "mitige":
            return getDecisionRecommendation(decision) === "Mitigé"
          case "pinned":
            return decision.isPinned === true
          default:
            return true
        }
      })
    }

    // Appliquer le tri
    filtered.sort((a, b) => {
      switch (currentSort) {
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
        case "title":
          return (a.title || "").localeCompare(b.title || "")
        case "score": {
          const statsA = getDecisionStats(a)
          const statsB = getDecisionStats(b)
          const scoreA = statsA.positiveScore - statsA.negativeScore
          const scoreB = statsB.positiveScore - statsB.negativeScore
          return scoreB - scoreA
        }
        default:
          return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
      }
    })

    return filtered
  }, [decisions, searchTerm, currentSort, currentFilter, getDecisionStats, getDecisionRecommendation])

  // Réinitialiser la page courante lorsque le terme de recherche change
  // biome-ignore lint/correctness/useExhaustiveDependencies: we need to include searchTerm here
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Gérer les erreurs de chargement
  useEffect(() => {
    if (!error) return
    const msg = getErrorMessage(error)
    console.error("Erreur lors du chargement des décisions:", msg)
    if (msg.includes("auth") || msg.includes("JWT")) {
      router.push("/login")
    }
  }, [error, router])

  // Ne pas rendre si l'utilisateur n'est pas connecté
  if (!user && !authLoading) {
    return null
  }

  const handleDecisionSelect = async (decisionId: string) => {
    await loadDecision(decisionId)
    router.push("/platform")
  }

  const totalPages = Math.ceil(Math.max(0, filteredDecisions.length) / ITEMS_PER_PAGE)
  const startIndex = Math.max(0, (currentPage - 1) * ITEMS_PER_PAGE)
  const endIndex = Math.min(filteredDecisions.length, startIndex + ITEMS_PER_PAGE)
  const paginatedDecisions = (filteredDecisions || []).slice(startIndex, endIndex)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner
          isLoading={isLoading}
          message="Chargement de l'historique..."
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/platform")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Historique des décisions</h1>
            <p className="text-muted-foreground">
              {decisions.length} décision{decisions.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher dans vos décisions..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Submenu de filtres et tri */}
        <HistorySubmenu
          decisions={decisions}
          currentSort={currentSort}
          currentFilter={currentFilter}
          onSortChange={setCurrentSort}
          onFilterChange={setCurrentFilter}
          totalCount={decisions.length}
          filteredCount={filteredDecisions.length}
        />

        {/* Decisions Grid */}
        {paginatedDecisions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedDecisions.map(decision => {
                const stats = getDecisionStats(decision)
                return (
                  <Card
                    key={decision.id}
                    className="group cursor-pointer hover:shadow-lg transition-shadow border-border hover:border-primary/20"
                    onClick={() => decision.id && handleDecisionSelect(decision.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <CardTitle className="text-lg truncate min-w-0">{decision.title || "Décision sans titre"}</CardTitle>
                        </div>
                        <div className="flex-shrink-0">
                          <DecisionActionsMenu
                            decision={decision}
                            onDecisionUpdated={() => {
                              // Invalider les requêtes pour recharger les données
                              queryClient.invalidateQueries({ queryKey: ["decisionHistory", user?.id] })
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">{decision.description || "Aucune description"}</p>

                      <div className="flex items-center justify-between">
                        <RecommendationBadge recommendation={stats.recommendation as "Favorable" | "Défavorable" | "Mitigé" | "Aucune donnée"} />
                        <div className="text-sm text-muted-foreground">
                          <CounterDisplay
                            count={stats.positiveScore}
                            label=""
                            className="inline"
                          />
                          :
                          <CounterDisplay
                            count={stats.negativeScore}
                            label=""
                            className="inline"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DateDisplay date={decision.updatedAt ?? new Date()} />
                        </div>
                        <CounterDisplay
                          count={(decision.arguments || []).length}
                          label="argument"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">{searchTerm ? "Aucune décision trouvée" : "Aucune décision sauvegardée"}</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Essayez avec d'autres mots-clés" : "Commencez par créer votre première décision"}
              </p>
              {!searchTerm && <Button onClick={() => router.push("/platform")}>Créer une décision</Button>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
