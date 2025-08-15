"use client"

import type { User } from "@supabase/supabase-js"
import { useState, useMemo, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { AISuggestion, Argument, Decision, SavedDecision } from "@/types/decision"
import { useToast } from "@/hooks/use-toast"

export function useDecision() {
  const [currentDecision, setCurrentDecision] = useState<Decision>({
    title: "Nouvelle décision",
    description: "",
    arguments: [],
  })
  const [saving, setSaving] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<Array<AISuggestion>>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const [savedDecisions, setSavedDecisions] = useState<Decision[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const supabase = useMemo(() => createClient(), [])
  const { addToast } = useToast()

  const loadDecisionHistory = useCallback(
    async (user: User | null) => {
      if (!user) return

      setLoadingHistory(true)
      try {
        const { data: decisions, error } = await supabase
          .from("decisions")
          .select(`
          id,
          title,
          description,
          created_at,
          arguments (
            text,
            weight
          )
        `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error

        setSavedDecisions(decisions || [])
      } catch (error) {
        console.error("Error loading decision history:", error)
        addToast({
          title: "Erreur",
          description: "Erreur lors du chargement de l'historique",
          variant: "destructive",
        })
      } finally {
        setLoadingHistory(false)
      }
    },
    [supabase, addToast],
  )

  const loadDecision = async (decisionIdOrObject: string | SavedDecision, setArgs?: (args: Argument[]) => void) => {
    try {
      let savedDecision: SavedDecision

      // Handle both ID string and SavedDecision object
      if (typeof decisionIdOrObject === "string") {
        const decisionId = decisionIdOrObject

        // First try to find in savedDecisions cache
        const cachedDecision = (savedDecisions || []).find((d) => d.id === decisionId)
        if (cachedDecision) {
          savedDecision = cachedDecision
        } else {
          // Fallback: fetch by ID from database
          const { data, error } = await supabase
            .from("decisions")
            .select(`
              id,
              title,
              description,
              created_at,
              arguments (
                text,
                weight
              )
            `)
            .eq("id", decisionId)
            .single()

          if (error) {
            console.error("Error loading decision by ID:", error)
            addToast({
              title: "Erreur",
              description: "Erreur lors du chargement de la décision",
              variant: "destructive",
            })
            return
          }

          if (!data) {
            console.error("Decision not found:", decisionId)
            addToast({
              title: "Erreur",
              description: "Décision introuvable",
              variant: "destructive",
            })
            return
          }

          savedDecision = data
        }
      } else {
        savedDecision = decisionIdOrObject
      }

      // Update current decision
      setCurrentDecision({
        id: savedDecision.id,
        title: savedDecision.title || "Décision sans titre",
        description: savedDecision.description || "",
        arguments: [],
      })

      // Convert saved arguments to current format with null safety
      const argumentsArray = savedDecision.arguments || []
      const loadedArgs: Argument[] = argumentsArray.map((arg, index) => ({
        id: `${savedDecision.id}-${index}`,
        text: arg?.text || "",
        weight: arg?.weight || 0,
      }))

      // Call setArgs if provided (for backward compatibility)
      if (setArgs) {
        setArgs(loadedArgs)
      }

      return loadedArgs
    } catch (error) {
      console.error("Error in loadDecision:", error)
      addToast({
        title: "Erreur",
        description: "Erreur lors du chargement de la décision",
        variant: "destructive",
      })
    }
  }

  const createNewDecision = (clearArgs: () => void) => {
    setCurrentDecision({
      title: "Nouvelle décision",
      description: "",
      arguments: [],
    })
    clearArgs()
    setAiSuggestions([])
  }

  const saveDecision = async (user: User | null, args: Argument[]) => {
    if (!user) {
      addToast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour sauvegarder une décision",
        variant: "destructive",
      })
      return
    }

    if (!currentDecision.title.trim()) {
      addToast({
        title: "Titre requis",
        description: "Veuillez donner un titre à votre décision",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      // Save decision
      const { data: decisionData, error: decisionError } = await supabase
        .from("decisions")
        .insert({
          user_id: user.id,
          title: currentDecision.title,
          description: currentDecision.description,
        })
        .select()
        .single()

      if (decisionError) throw decisionError

      // Save arguments
      if (args.length > 0) {
        const argumentsToInsert = args.map((arg) => ({
          decision_id: decisionData.id,
          text: arg.text,
          weight: arg.weight,
        }))

        const { error: argumentsError } = await supabase.from("arguments").insert(argumentsToInsert)

        if (argumentsError) throw argumentsError
      }

      setCurrentDecision((prev) => ({ ...prev, id: decisionData.id }))
      await loadDecisionHistory(user)
      addToast({
        title: "Succès",
        description: "Décision sauvegardée avec succès !",
        variant: "success",
      })
    } catch (error) {
      console.error("Error saving decision:", error)
      addToast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const generateSuggestions = async (args: Argument[]) => {
    if (!currentDecision.title.trim()) {
      addToast({
        title: "Titre requis",
        description: "Veuillez d'abord donner un titre à votre décision",
        variant: "destructive",
      })
      return
    }

    setLoadingSuggestions(true)
    try {
      const response = await fetch("/api/suggest-arguments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: currentDecision.title,
          description: currentDecision.description,
          existingArguments: args,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate suggestions")
      }

      const data = await response.json()
      setAiSuggestions(data.suggestions || [])
    } catch (error) {
      console.error("Error generating suggestions:", error)
      addToast({
        title: "Erreur",
        description: "Erreur lors de la génération des suggestions",
        variant: "destructive",
      })
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const addSuggestionAsArgument = (suggestion: AISuggestion, addArgumentToList: (arg: Argument) => void) => {
    const argument: Argument = {
      id: Date.now().toString(),
      text: suggestion.text,
      weight: suggestion.weight,
    }
    addArgumentToList(argument)
    // Remove the suggestion from the list
    setAiSuggestions((prev) => prev.filter((s) => s.text !== suggestion.text))
  }

  const getRecentDecisions = (count = 10) => {
    const decisions = savedDecisions || []
    const safeCount = Math.max(0, Math.min(count, decisions.length))
    return decisions.slice(0, safeCount)
  }

  const updateDecisionTitle = async (user: User | null, title: string, args: Argument[]) => {
    let updatedDecision: Decision | null = null
    setCurrentDecision((prev) => {
      updatedDecision = { ...prev, title }
      return updatedDecision
    })

    // Auto-save if title is not empty and user is logged in
    if (user && title.trim() && updatedDecision) {
      await autoSaveDecision(user, updatedDecision, args)
    }
  }

  const updateDecisionDescription = async (user: User | null, description: string, args: Argument[]) => {
    let updatedDecision: Decision | null = null
    setCurrentDecision((prev) => {
      updatedDecision = { ...prev, description }
      return updatedDecision
    })

    // Auto-save if we have a title and user is logged in
    if (user && (updatedDecision?.title || "").trim() && updatedDecision) {
      await autoSaveDecision(user, updatedDecision, args)
    }
  }

  const autoSaveDecision = async (user: User | null, decision: Decision, args: Argument[]) => {
    if (!user || !decision.title.trim()) return

    try {
      if (decision.id) {
        // Update existing decision
        const { error: decisionError } = await supabase
          .from("decisions")
          .update({
            title: decision.title,
            description: decision.description,
          })
          .eq("id", decision.id)

        if (decisionError) throw decisionError

        // Delete existing arguments and insert new ones
        await supabase.from("arguments").delete().eq("decision_id", decision.id)

        if (args.length > 0) {
          const argumentsToInsert = args.map((arg) => ({
            decision_id: decision.id,
            text: arg.text,
            weight: arg.weight,
          }))

          const { error: argumentsError } = await supabase.from("arguments").insert(argumentsToInsert)
          if (argumentsError) throw argumentsError
        }
      } else {
        // Create new decision
        const { data: decisionData, error: decisionError } = await supabase
          .from("decisions")
          .insert({
            user_id: user.id,
            title: decision.title,
            description: decision.description,
          })
          .select()
          .single()

        if (decisionError) throw decisionError

        // Save arguments
        if (args.length > 0) {
          const argumentsToInsert = args.map((arg) => ({
            decision_id: decisionData.id,
            text: arg.text,
            weight: arg.weight,
          }))

          const { error: argumentsError } = await supabase.from("arguments").insert(argumentsToInsert)
          if (argumentsError) throw argumentsError
        }

        setCurrentDecision((prev) => ({ ...prev, id: decisionData.id }))
      }

      // The sidebar will refresh its data when needed through other mechanisms
    } catch (error) {
      console.error("Error auto-saving decision:", error)
    }
  }

  const deleteDecision = async (user: User | null, decisionId: string) => {
    if (!user) return

    try {
      // Delete arguments first (foreign key constraint)
      await supabase.from("arguments").delete().eq("decision_id", decisionId)

      // Delete decision
      const { error } = await supabase.from("decisions").delete().eq("id", decisionId)
      if (error) throw error

      // Refresh history
      await loadDecisionHistory(user)

      // If we're currently viewing this decision, create a new one
      if (currentDecision.id === decisionId) {
        setCurrentDecision({
          id: "",
          title: "Nouvelle décision",
          description: "",
          arguments: [],
        })
      }

      addToast({
        title: "Succès",
        description: "Décision supprimée avec succès",
        variant: "success",
      })
    } catch (error) {
      console.error("Error deleting decision:", error)
      addToast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive",
      })
    }
  }

  const renameDecision = async (user: User | null, decisionId: string, newTitle: string) => {
    if (!user || !newTitle.trim()) return

    try {
      const { error } = await supabase.from("decisions").update({ title: newTitle.trim() }).eq("id", decisionId)

      if (error) throw error

      // Update current decision if it's the one being renamed
      if (currentDecision.id === decisionId) {
        setCurrentDecision((prev) => ({ ...prev, title: newTitle.trim() }))
      }

      // Refresh history
      await loadDecisionHistory(user)
    } catch (error) {
      console.error("Error renaming decision:", error)
      addToast({
        title: "Erreur",
        description: "Erreur lors du renommage",
        variant: "destructive",
      })
    }
  }

  const pinDecision = async (user: User | null, decisionId: string) => {
    if (!user) return

    try {
      // Update the decision with current timestamp to move it to top
      const { error } = await supabase
        .from("decisions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", decisionId)

      if (error) throw error

      // Refresh history
      await loadDecisionHistory(user)
    } catch (error) {
      console.error("Error pinning decision:", error)
      addToast({
        title: "Erreur",
        description: "Erreur lors de l'épinglage",
        variant: "destructive",
      })
    }
  }

  return {
    currentDecision,
    setCurrentDecision,
    saving,
    aiSuggestions,
    loadingSuggestions,
    savedDecisions,
    loadingHistory,
    saveDecision,
    generateSuggestions,
    addSuggestionAsArgument,
    loadDecisionHistory,
    loadDecision,
    createNewDecision,
    getRecentDecisions, // Export safe recent decisions getter
    updateDecisionTitle,
    updateDecisionDescription,
    autoSaveDecision,
    deleteDecision,
    renameDecision,
    pinDecision,
  }
}
