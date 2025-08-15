"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, Sparkles, Edit2, Check, X } from "lucide-react"
import { useRef, useEffect, useState } from "react"
import type { Argument, AISuggestion } from "@/types/decision"
import { validateArgument } from "@/lib/validation"
import { DECISION_CONSTANTS } from "@/lib/constants"
import { useToast } from "@/hooks/use-toast"

interface ArgumentsSectionProps {
  newArgument: { text: string; weight: number }
  setNewArgument: (arg: { text: string; weight: number }) => void
  onAddArgument: () => void
  sortedArguments: Argument[]
  onRemoveArgument: (id: string) => void
  onUpdateArgumentWeight: (id: string, weight: number) => void
  onUpdateArgumentText: (id: string, text: string) => void
  decisionTitle: string
  aiSuggestions: AISuggestion[]
  loadingSuggestions: boolean
  onGenerateSuggestions: () => void
  onAddSuggestion: (suggestion: AISuggestion) => void
}

export const ArgumentsSection = React.memo(function ArgumentsSection({
  newArgument,
  setNewArgument,
  onAddArgument,
  sortedArguments,
  onRemoveArgument,
  onUpdateArgumentWeight,
  onUpdateArgumentText,
  decisionTitle,
  aiSuggestions,
  loadingSuggestions,
  onGenerateSuggestions,
  onAddSuggestion,
}: ArgumentsSectionProps) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [editingArgument, setEditingArgument] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")
  const [editingSuggestions, setEditingSuggestions] = useState<{ [key: number]: { text: string; weight: number } }>({})
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const { addToast } = useToast()

  const ratings = Array.from({ length: 21 }, (_, i) => i - 10)

  const getGradient = (val: number) => {
    if (val <= -8) return "bg-red-600 text-white"
    if (val <= -5) return "bg-red-500 text-white"
    if (val <= -2) return "bg-orange-400 text-white"
    if (val < 0) return "bg-yellow-400 text-black"
    if (val === 0) return "bg-gray-300 text-black"
    if (val <= 2) return "bg-lime-400 text-black"
    if (val <= 5) return "bg-green-400 text-white"
    if (val <= 8) return "bg-green-500 text-white"
    return "bg-green-600 text-white"
  }

  const getArgumentColor = (weight: number) => {
    if (weight < 0) return "border-red-200 dark:border-red-800"
    if (weight > 0) return "border-green-200 dark:border-green-800"
    return "border-gray-200 dark:border-gray-800"
  }

  const getBadgeColor = (weight: number) => {
    if (weight < 0) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    if (weight > 0) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  const startEditingArgument = (argument: Argument) => {
    setEditingArgument(argument.id)
    setEditingText(argument.text)
  }

  const saveArgumentEdit = (argumentId: string) => {
    if (editingText.trim()) {
      // Update argument text (we'll need to add this to the parent component)
      onUpdateArgumentText(argumentId, editingText)
      const currentWeight = sortedArguments.find((a) => a.id === argumentId)?.weight || 0
      onUpdateArgumentWeight(argumentId, currentWeight)
    }
    setEditingArgument(null)
    setEditingText("")
  }

  const cancelArgumentEdit = () => {
    setEditingArgument(null)
    setEditingText("")
  }

  const startEditingSuggestion = (index: number, suggestion: AISuggestion) => {
    setEditingSuggestions((prev) => ({
      ...prev,
      [index]: { text: suggestion.text, weight: suggestion.weight },
    }))
  }

  const updateSuggestionEdit = (index: number, field: "text" | "weight", value: string | number) => {
    setEditingSuggestions((prev) => ({
      ...prev,
      [index]: { ...prev[index], [field]: value },
    }))
  }

  const saveSuggestionEdit = (index: number, originalSuggestion: AISuggestion) => {
    const edited = editingSuggestions[index]
    if (edited && edited.text.trim()) {
      onAddSuggestion({
        ...originalSuggestion,
        text: edited.text,
        weight: edited.weight,
      })
    }
    setEditingSuggestions((prev) => {
      const newState = { ...prev }
      delete newState[index]
      return newState
    })
  }

  const cancelSuggestionEdit = (index: number) => {
    setEditingSuggestions((prev) => {
      const newState = { ...prev }
      delete newState[index]
      return newState
    })
  }

  // Center slider on selected value
  useEffect(() => {
    if (sliderRef.current) {
      const selectedIndex = ratings.indexOf(newArgument.weight)
      const buttonWidth = 48 // w-12 = 48px
      const containerWidth = sliderRef.current.clientWidth
      const scrollPosition = selectedIndex * buttonWidth - containerWidth / 2 + buttonWidth / 2
      sliderRef.current.scrollTo({ left: Math.max(0, scrollPosition), behavior: "smooth" })
    }
  }, [newArgument.weight, ratings])

  const handleAddArgument = () => {
    const validation = validateArgument(newArgument.text, newArgument.weight)
    if (!validation.isValid) {
      setValidationErrors(validation.errors)
      addToast({
        title: "Erreur de validation",
        description: validation.errors[0],
        variant: "destructive",
      })
      return
    }
    setValidationErrors([])
    onAddArgument()
  }

  const remainingChars = DECISION_CONSTANTS.MAX_ARGUMENT_LENGTH - newArgument.text.length

  return (
    <div className="space-y-6">
      {/* Add New Argument */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Ajouter un Argument</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Argument</Label>
              <span className={`text-xs ${remainingChars < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                {remainingChars} caractères restants
              </span>
            </div>
            <Textarea
              placeholder="Décrivez votre argument..."
              value={newArgument.text}
              onChange={(e) => setNewArgument({ ...newArgument, text: e.target.value })}
              rows={2}
              maxLength={DECISION_CONSTANTS.MAX_ARGUMENT_LENGTH}
              aria-describedby="argument-help"
              aria-invalid={validationErrors.length > 0}
            />
            <div id="argument-help" className="text-xs text-muted-foreground">
              Décrivez un point positif ou négatif concernant votre décision
            </div>
            {validationErrors.length > 0 && (
              <div className="text-xs text-destructive" role="alert">
                {validationErrors[0]}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Note (-10 à +10)</Label>
            <div
              ref={sliderRef}
              className="flex gap-1 overflow-x-auto pb-2"
              role="radiogroup"
              aria-label="Sélectionner une note de -10 à +10"
            >
              {ratings.map((rating) => (
                <button
                  key={rating}
                  onClick={() => setNewArgument({ ...newArgument, weight: rating })}
                  className={`
                    w-12 h-12 rounded-full text-sm font-medium transition-all duration-200 flex-shrink-0
                    ${getGradient(rating)}
                    ${newArgument.weight === rating ? "ring-2 ring-primary scale-110" : "hover:scale-105"}
                  `}
                  role="radio"
                  aria-checked={newArgument.weight === rating}
                  aria-label={`Note ${rating}`}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAddArgument}
            disabled={!newArgument?.text?.trim() || remainingChars < 0}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </CardContent>
      </Card>

      {/* AI Suggestions */}
      {decisionTitle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Suggestions IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={onGenerateSuggestions}
              disabled={loadingSuggestions || !decisionTitle?.trim()}
              variant="outline"
              className="w-full bg-transparent"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {loadingSuggestions ? "Génération..." : "Générer des suggestions"}
            </Button>

            {aiSuggestions.length > 0 && (
              <div className="space-y-3">
                {aiSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 border rounded-lg bg-muted/50 space-y-2">
                    {editingSuggestions[index] ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editingSuggestions[index].text}
                          onChange={(e) => updateSuggestionEdit(index, "text", e.target.value)}
                          rows={2}
                          className="w-full"
                        />
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Note:</Label>
                          <div className="flex gap-1 overflow-x-auto">
                            {ratings.map((rating) => {
                              const baseClasses =
                                "w-8 h-8 rounded text-xs font-medium transition-all duration-200 flex-shrink-0"
                              const gradientClass = getGradient(rating)
                              const isSelected = editingSuggestions[index]?.weight === rating
                              const selectionClass = isSelected ? "ring-2 ring-primary scale-110" : "hover:scale-105"
                              const finalClassName = baseClasses + " " + gradientClass + " " + selectionClass

                              return (
                                <button
                                  key={rating}
                                  onClick={() => updateSuggestionEdit(index, "weight", rating)}
                                  className={finalClassName}
                                >
                                  {rating}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveSuggestionEdit(index, suggestion)}>
                            <Check className="w-3 h-3 mr-1" />
                            Ajouter
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => cancelSuggestionEdit(index)}>
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium">{suggestion.text}</p>
                          <p className="text-sm text-muted-foreground mt-1">{suggestion.reasoning}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getBadgeColor(suggestion.weight)}>
                            {suggestion.weight > 0 ? "+" : ""}
                            {suggestion.weight}
                          </Badge>
                          <Button size="sm" variant="ghost" onClick={() => startEditingSuggestion(index, suggestion)}>
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" onClick={() => onAddSuggestion(suggestion)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Arguments List */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Arguments Ajoutés ({sortedArguments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedArguments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucun argument ajouté pour le moment</div>
          ) : (
            <div className="space-y-3">
              {sortedArguments.map((argument) => (
                <div key={argument.id} className={`p-4 border rounded-lg ${getArgumentColor(argument.weight)}`}>
                  {editingArgument === argument.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        rows={2}
                        className="w-full"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveArgumentEdit(argument.id)}>
                          <Check className="w-3 h-3 mr-1" />
                          Sauvegarder
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelArgumentEdit}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium">{argument.text}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getBadgeColor(argument.weight)}>
                          {argument.weight > 0 ? "+" : ""}
                          {argument.weight}
                        </Badge>
                        <Button size="sm" variant="ghost" onClick={() => startEditingArgument(argument)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => onRemoveArgument(argument.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
})
