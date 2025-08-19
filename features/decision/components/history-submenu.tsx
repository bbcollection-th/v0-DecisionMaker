"use client"

import { Calendar, Filter, Pin, Star, TrendingDown, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Decision } from "@/types/decision"

export type SortOption = "recent" | "oldest" | "title" | "score"
export type FilterOption = "all" | "favorable" | "defavorable" | "mitige" | "pinned"

interface HistorySubmenuProps {
  decisions: Decision[]
  currentSort: SortOption
  currentFilter: FilterOption
  onSortChange: (sort: SortOption) => void
  onFilterChange: (filter: FilterOption) => void
  totalCount: number
  filteredCount: number
}

export const HistorySubmenu = ({
  decisions,
  currentSort,
  currentFilter,
  onSortChange,
  onFilterChange,
  totalCount,
  filteredCount
}: HistorySubmenuProps) => {
  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case "recent":
        return "Plus récent"
      case "oldest":
        return "Plus ancien"
      case "title":
        return "Titre (A-Z)"
      case "score":
        return "Score"
      default:
        return "Trier"
    }
  }

  const getFilterLabel = (filter: FilterOption) => {
    switch (filter) {
      case "all":
        return "Toutes"
      case "favorable":
        return "Favorables"
      case "defavorable":
        return "Défavorables"
      case "mitige":
        return "Mitigées"
      case "pinned":
        return "Épinglées"
      default:
        return "Filtrer"
    }
  }

  const getSortIcon = (sort: SortOption) => {
    switch (sort) {
      case "recent":
        return <Calendar className="w-4 h-4" />
      case "oldest":
        return <Calendar className="w-4 h-4" />
      case "title":
        return <Filter className="w-4 h-4" />
      case "score":
        return <TrendingUp className="w-4 h-4" />
      default:
        return <Filter className="w-4 h-4" />
    }
  }

  const getFilterIcon = (filter: FilterOption) => {
    switch (filter) {
      case "favorable":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "defavorable":
        return <TrendingDown className="w-4 h-4 text-red-600" />
      case "mitige":
        return <Filter className="w-4 h-4 text-orange-600" />
      case "pinned":
        return <Pin className="w-4 h-4 text-blue-600" />
      default:
        return <Filter className="w-4 h-4" />
    }
  }

  // Compter les décisions par type pour afficher dans les filtres
  const getDecisionCounts = () => {
    const counts = decisions.reduce(
      (acc, decision) => {
        if (decision.isPinned) acc.pinned += 1
        const args = decision.arguments || []
        const positiveScore = args.filter(arg => (arg.note ?? 0) > 0).reduce((sum, arg) => sum + (arg.note ?? 0), 0)
        const negativeScore = Math.abs(args.filter(arg => (arg.note ?? 0) < 0).reduce((sum, arg) => sum + (arg.note ?? 0), 0))
        if (positiveScore > negativeScore) acc.favorable += 1
        else if (negativeScore > positiveScore) acc.defavorable += 1
        else if (positiveScore > 0 || negativeScore > 0) acc.mitige += 1
        return acc
      },
      { defavorable: 0, favorable: 0, mitige: 0, pinned: 0 }
    )

    return counts
  }

  const counts = getDecisionCounts()

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Tri */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {getSortIcon(currentSort)}
                  {getSortLabel(currentSort)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => onSortChange("recent")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Plus récent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortChange("oldest")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Plus ancien
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortChange("title")}>
                  <Filter className="mr-2 h-4 w-4" />
                  Titre (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSortChange("score")}>
                  <Star className="mr-2 h-4 w-4" />
                  Score
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Filtres */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {getFilterIcon(currentFilter)}
                  {getFilterLabel(currentFilter)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => onFilterChange("all")}>
                  <Filter className="mr-2 h-4 w-4" />
                  Toutes ({totalCount})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilterChange("favorable")}>
                  <TrendingUp className="mr-2 h-4 w-4 text-green-600" />
                  Favorables ({counts.favorable})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilterChange("defavorable")}>
                  <TrendingDown className="mr-2 h-4 w-4 text-red-600" />
                  Défavorables ({counts.defavorable})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilterChange("mitige")}>
                  <Filter className="mr-2 h-4 w-4 text-orange-600" />
                  Mitigées ({counts.mitige})
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onFilterChange("pinned")}>
                  <Pin className="mr-2 h-4 w-4 text-blue-600" />
                  Épinglées ({counts.pinned})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Compteur de résultats */}
          <div className="text-sm text-muted-foreground">
            {filteredCount !== totalCount ? (
              <>
                {filteredCount} sur {totalCount} décision{totalCount > 1 ? "s" : ""}
              </>
            ) : (
              <>
                {totalCount} décision{totalCount > 1 ? "s" : ""}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
