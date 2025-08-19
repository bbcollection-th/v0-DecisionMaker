import {
  useFilteredSuggestions,
  useIsGeneratingSuggestions,
  useNegativeSuggestions,
  usePositiveSuggestions,
  useSuggestions,
  useSuggestionsError,
  useSuggestionsFilters,
  useSuggestionsStore
} from "@/lib/stores"
import type { AISuggestion, Argument } from "@/types/decision"

/**
 * Hook d'interface pour les suggestions AI avec Zustand
 * Compatible avec l'API existante de use-ai-suggestions.ts
 */
export function useAISuggestions() {
  const store = useSuggestionsStore()

  return {
    // Actions de gestion
    addSuggestion: store.addSuggestion,
    // État principal
    aiSuggestions: store.suggestions,
    clearSuggestions: store.clearSuggestions,
    error: store.error,

    // États UI
    expandedSuggestions: store.expandedSuggestions,

    // Suggestions filtrées
    filteredSuggestions: store.getFilteredSuggestions(),

    // Filtres
    filters: store.filters,

    // Paramètres de génération
    lastGenerationParams: store.lastGenerationParams,
    loadingSuggestions: store.isGenerating,
    negativeSuggestions: store.getNegativeSuggestions(),
    pinnedSuggestions: store.pinnedSuggestions,
    pinnedSuggestionsData: store.getPinnedSuggestions(),
    positiveSuggestions: store.getPositiveSuggestions(),
    removeSuggestion: store.removeSuggestion,
    resetFilters: store.resetFilters,
    restoreFromHistory: store.restoreFromHistory,

    // Historique
    saveToHistory: store.saveToHistory,
    setError: store.setError,
    setFilter: store.setFilter,
    setIsGenerating: store.setIsGenerating,
    setLastGenerationParams: store.setLastGenerationParams,

    // Actions principales
    setSuggestions: store.setSuggestions,
    suggestionsHistory: store.suggestionsHistory,
    toggleSuggestionExpanded: store.toggleSuggestionExpanded,
    toggleSuggestionPinned: store.toggleSuggestionPinned
  }
}

/**
 * Hook pour la génération de suggestions
 * Interface avec l'API et met à jour le store Zustand
 */
export function useGenerateSuggestions() {
  const { setSuggestions, setIsGenerating, setError, saveToHistory, setLastGenerationParams } = useSuggestionsStore()

  const generateSuggestions = async (decision: { title: string; description?: string }, args: Argument[]) => {
    try {
      setIsGenerating(true)
      setError(null)

      // Sauvegarder les paramètres pour régénération
      setLastGenerationParams({
        description: decision.description || "",
        existingArgumentsCount: args.length,
        title: decision.title
      })

      const response = await fetch("/api/suggest-arguments", {
        body: JSON.stringify({
          description: decision.description || "",
          existingArguments: args,
          title: decision.title
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la génération des suggestions")
      }

      const data = await response.json()
      const rawSuggestions = data.suggestions || []

      // Ajouter des IDs uniques aux suggestions reçues de l'API
      const suggestions = rawSuggestions.map((suggestion: Omit<AISuggestion, "id">, index: number) => ({
        ...suggestion,
        id: `${Date.now()}-${index}` // Générer un ID unique basé sur timestamp + index
      }))

      // Sauvegarder l'historique avant de définir les nouvelles suggestions
      saveToHistory()
      setSuggestions(suggestions)
    } catch (error) {
      console.error("Erreur génération suggestions:", error)
      setError(error instanceof Error ? error.message : "Erreur inconnue")
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    error: useSuggestionsStore(state => state.error),
    generateSuggestions,
    isGenerating: useSuggestionsStore(state => state.isGenerating)
  }
}

/**
 * Hook pour ajouter une suggestion comme argument
 * Compatible avec l'API existante
 */
export function useAddSuggestion() {
  return {
    handleAddSuggestion: (suggestion: AISuggestion, addArgument: (arg: Omit<Argument, "id">) => void) => {
      const argument: Omit<Argument, "id"> = {
        note: suggestion.note,
        text: suggestion.text
      }
      addArgument(argument)
    }
  }
}

/**
 * Hook combiné pour toutes les fonctionnalités AI
 * Centralise la logique actuelle de use-ai-suggestions.ts
 */
export function useAIFeatures() {
  const suggestions = useAISuggestions()
  const generator = useGenerateSuggestions()
  const adder = useAddSuggestion()

  return {
    // État des suggestions
    ...suggestions,

    clearAll: () => {
      suggestions.clearSuggestions()
      suggestions.setError(null)
    },

    // Génération
    generateSuggestions: generator.generateSuggestions,

    // Ajout d'une suggestion
    handleAddSuggestion: adder.handleAddSuggestion,

    // Méthodes de convenance
    regenerateSuggestions: () => {
      const params = suggestions.lastGenerationParams
      if (params) {
        generator.generateSuggestions(
          { description: params.description, title: params.title },
          [] // Les arguments actuels devraient venir du store de décision
        )
      }
    }
  }
}

/**
 * Selectors optimisés pour éviter les re-renders
 */
export const useSuggestionsData = () => useSuggestions()
export const useIsLoading = () => useIsGeneratingSuggestions()
export const useSuggestionsErrorState = () => useSuggestionsError()
export const useFilters = () => useSuggestionsFilters()
export const useFilteredSuggestionsData = () => useFilteredSuggestions()
export const usePositiveSuggestionsData = () => usePositiveSuggestions()
export const useNegativeSuggestionsData = () => useNegativeSuggestions()
