"use client"

import { Menu } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { ArgumentsSection } from "@/components/decision/arguments-section"
import { DecisionHeader } from "@/components/decision/decision-header"
import { ResultsSection } from "@/components/decision/results-section"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { useArguments } from "@/hooks/use-arguments"
import { useAuth } from "@/hooks/use-auth"
import { useDecision } from "@/hooks/use-decision"
import type { AISuggestion } from "@/types/decision"
import debounce from "lodash.debounce"

export default function DecisionMakerPlatform() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  const { user } = useAuth()
  const {
    args,
    newArgument,
    setNewArgument,
    addArgument,
    addArgumentDirectly,
    removeArgument,
    updateArgumentWeight,
    positiveScore,
    negativeScore,
    sortedArguments,
    setArgs,
    clearArgs,
  } = useArguments()

  const {
    currentDecision,
    setCurrentDecision,
    saving,
    aiSuggestions,
    loadingSuggestions,
    generateSuggestions,
    addSuggestionAsArgument,
    createNewDecision,
    loadDecision,
    loadDecisionHistory,
    updateDecisionTitle,
    updateDecisionDescription,
    autoSaveDecision,
  } = useDecision()

  useEffect(() => {
    if (user) {
      loadDecisionHistory(user)
    }
  }, [user, loadDecisionHistory])

  const handleLoadDecision = async (decisionId: string) => {
    const loadedArgs = await loadDecision(decisionId, setArgs)
    if (loadedArgs) {
      setArgs(loadedArgs)
    }
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      if (isDarkMode) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [isDarkMode, isMounted])

  const debouncedAutoSaveDecision = useMemo(
    () =>
      debounce((u: typeof user, d: typeof currentDecision, a: typeof args) => {
        autoSaveDecision(u, d, a)
      }, 1000),
    [autoSaveDecision],
  )

  useEffect(() => {
    if (user && currentDecision.title.trim()) {
      debouncedAutoSaveDecision(user, currentDecision, args)
    }
    return () => {
      debouncedAutoSaveDecision.cancel()
    }
  }, [args, user, currentDecision, debouncedAutoSaveDecision])

  const handleGenerateSuggestions = () => {
    generateSuggestions(args)
  }

  const handleAddSuggestion = (suggestion: AISuggestion) => {
    addSuggestionAsArgument(suggestion, addArgumentDirectly)
  }

  const handleCreateNew = () => {
    createNewDecision(clearArgs)
  }

  const handleTitleChange = (title: string) => {
    updateDecisionTitle(user, title, args)
    debouncedAutoSaveDecision(user, { ...currentDecision, title }, args)
  }

  const handleDescriptionChange = (description: string) => {
    updateDecisionDescription(user, description, args)
    debouncedAutoSaveDecision(user, { ...currentDecision, description }, args)
  }

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onLoadDecision={handleLoadDecision}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-80" : "ml-0"}`}>
        <div className="fixed top-4 left-4 z-30">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="bg-card shadow-lg"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-4 pt-16">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Header avec contexte de décision */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-foreground">Aide à la Décision</h1>
              <p className="text-sm text-muted-foreground">Méthode Schulich : pondérez vos arguments</p>
            </div>

            <DecisionHeader
              currentDecision={currentDecision}
              onTitleChange={handleTitleChange}
              onDescriptionChange={handleDescriptionChange}
              user={user}
              saving={saving}
              onCreateNew={handleCreateNew}
            />

            {/* Section Résultats */}
            <ResultsSection positiveScore={positiveScore} negativeScore={negativeScore} argumentsCount={args.length} />

            {/* Section Arguments */}
            <ArgumentsSection
              newArgument={newArgument}
              setNewArgument={setNewArgument}
              onAddArgument={addArgument}
              sortedArguments={sortedArguments}
              onRemoveArgument={removeArgument}
              onUpdateArgumentWeight={updateArgumentWeight}
              decisionTitle={currentDecision.title}
              aiSuggestions={aiSuggestions}
              loadingSuggestions={loadingSuggestions}
              onGenerateSuggestions={handleGenerateSuggestions}
              onAddSuggestion={handleAddSuggestion}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
