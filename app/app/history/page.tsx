"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ArrowLeft, FileText, Search, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useDecision } from "@/hooks/use-decision"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import type { Decision } from "@/types/decision"

const ITEMS_PER_PAGE = 12

export default function HistoryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { loadDecision } = useDecision()
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [filteredDecisions, setFilteredDecisions] = useState<Decision[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!user) {
      router.push("/auth/login")
      return
    }

    const fetchAllDecisions = async () => {
      try {
        const { data, error } = await supabase
          .from("decisions")
          .select(`
						*,
						arguments (*)
					`)
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })

        if (error) throw error
        setDecisions(data || [])
        setFilteredDecisions(data || [])
      } catch (error) {
        console.error("Erreur lors du chargement des décisions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllDecisions()
  }, [user, router, supabase])

  useEffect(() => {
    const filtered = (decisions || []).filter(
      (decision) =>
        (decision.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (decision.description || "").toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredDecisions(filtered)
    setCurrentPage(1)
  }, [searchTerm, decisions])

  const handleDecisionSelect = async (decisionId: string) => {
    await loadDecision(decisionId)
    router.push("/app")
  }

  const getDecisionStats = (decision: Decision) => {
    const argumentsArray = decision.arguments || []
    const positiveScore = argumentsArray
      .filter((arg) => arg?.weight > 0)
      .reduce((sum, arg) => sum + (arg?.weight || 0), 0)
    const negativeScore = Math.abs(
      argumentsArray.filter((arg) => arg?.weight < 0).reduce((sum, arg) => sum + (arg?.weight || 0), 0),
    )
    const ratio = negativeScore > 0 ? positiveScore / negativeScore : positiveScore > 0 ? Number.POSITIVE_INFINITY : 1
    const recommendation = ratio >= 2 ? "Favorable" : ratio <= 0.5 ? "Défavorable" : "Mitigé"

    return { positiveScore, negativeScore, recommendation, ratio }
  }

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case "Favorable":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "Défavorable":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-orange-600" />
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "Favorable":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
      case "Défavorable":
        return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
      default:
        return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20"
    }
  }

  const totalPages = Math.ceil(Math.max(0, filteredDecisions.length) / ITEMS_PER_PAGE)
  const startIndex = Math.max(0, (currentPage - 1) * ITEMS_PER_PAGE)
  const endIndex = Math.min(filteredDecisions.length, startIndex + ITEMS_PER_PAGE)
  const paginatedDecisions = (filteredDecisions || []).slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Chargement de l'historique...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" onClick={() => router.push("/app")} className="flex items-center gap-2">
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
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Decisions Grid */}
        {paginatedDecisions.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedDecisions.map((decision) => {
                const stats = getDecisionStats(decision)
                return (
                  <Card
                    key={decision.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-border hover:border-primary/20"
                    onClick={() => handleDecisionSelect(decision.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <CardTitle className="text-lg truncate">{decision.title || "Décision sans titre"}</CardTitle>
                        </div>
                        {getRecommendationIcon(stats.recommendation)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {decision.description || "Aucune description"}
                      </p>

                      <div className="flex items-center justify-between">
                        <Badge className={`${getRecommendationColor(stats.recommendation)} border-0`}>
                          {stats.recommendation}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {stats.positiveScore}:{stats.negativeScore}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(decision.updated_at).toLocaleDateString("fr-FR")}
                        </div>
                        <div>
                          {(decision.arguments || []).length} argument{(decision.arguments || []).length > 1 ? "s" : ""}
                        </div>
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
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
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
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? "Aucune décision trouvée" : "Aucune décision sauvegardée"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Essayez avec d'autres mots-clés" : "Commencez par créer votre première décision"}
              </p>
              {!searchTerm && <Button onClick={() => router.push("/app")}>Créer une décision</Button>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
