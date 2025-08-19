"use client"

import type { User } from "@supabase/supabase-js"
import { useCallback, useEffect, useRef } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { useUpsertDecision } from "@/hooks/use-decision-queries"
import { useDecisionStore } from "@/lib/stores/decision-store"
import type { Argument, Decision } from "@/types/decision"

interface UseAutoSaveOptions {
  user: User | null
  draftDecision: Partial<Decision> | null
  arguments: Argument[]
  enabled?: boolean
  debounceMs?: number
}

export function useAutoSave({ user, draftDecision, arguments: args, enabled = true, debounceMs = 2000 }: UseAutoSaveOptions) {
  const upsertDecisionMutation = useUpsertDecision()
  const { updateDraftField } = useDecisionStore()

  // ✅ Utilise useRef pour éviter les problèmes de dépendances
  const savedDataRef = useRef<{
    title: string
    description: string
    argsLength: number
  }>({ argsLength: 0, description: "", title: "" }) // ✅ Utilise le hook useDebounce existant et UPSERT robuste
  const saveFunction = useCallback(async () => {
    // Ne sauvegarde que si l'utilisateur est connecté et que la sauvegarde est activée
    if (!user || !enabled || !draftDecision?.title?.trim()) {
      console.log("🔄 Auto-save skipped:", {
        enabled,
        hasTitle: !!draftDecision?.title?.trim(),
        hasUser: !!user,
        title: draftDecision?.title
      })
      return
    }

    console.log("🔄 Auto-save triggered:", {
      argsCount: args.length,
      hasId: !!draftDecision.id,
      title: draftDecision.title
    })

    try {
      const decisionData = {
        arguments: [], // Champ requis par le type Decision
        description: draftDecision.description || "",
        title: draftDecision.title || ""
      }

      // ✅ CORRECTION CRITIQUE : Utilise UPSERT au lieu de la logique if/else dangereuse
      const result = await upsertDecisionMutation.mutateAsync({
        args,
        decision: decisionData,
        existingId: draftDecision.id, // Passe l'ID existant s'il existe
        user
      })

      // Handle the result which now includes success/failure info
      if (!result.success) {
        console.error("❌ Auto-save failed:", result.error)
        // TODO: Could implement UI notification here
        return
      }

      // The UPSERT operation was successful
      console.log("✅ Auto-save successful:", {
        id: result.data.decision.id,
        isNew: result.data.isNew,
        title: result.data.decision.title
      })

      // ✅ CORRECTION CRITIQUE : Mise à jour de l'ID de la décision dans le store
      // Si c'était une nouvelle décision, s'assurer que l'ID est bien stocké
      if (result.data.isNew || !draftDecision.id) {
        console.log("🔧 Updating draft decision ID:", result.data.decision.id)
        updateDraftField("id", result.data.decision.id)
      }

      // Keep draft metadata in sync for optimistic locking
      updateDraftField("version", result.data.decision.version)
      updateDraftField("updatedAt", result.data.decision.updatedAt)
      updateDraftField("createdAt", result.data.decision.createdAt)

      // ✅ Mise à jour de la référence après sauvegarde réussie
      savedDataRef.current = {
        argsLength: args.length,
        description: draftDecision.description || "",
        title: draftDecision.title || ""
      }
    } catch (error) {
      console.error("❌ Auto-save failed:", error)
      // On ne fait pas d'alerte pour l'auto-save pour ne pas être intrusif
    }
  }, [user, draftDecision, args, enabled, upsertDecisionMutation, updateDraftField])

  const { debouncedCallback } = useDebounce(saveFunction, debounceMs)

  // Déclenche la sauvegarde debouncée quand les données changent vraiment
  useEffect(() => {
    const currentData = {
      argsLength: args.length,
      description: draftDecision?.description || "",
      title: draftDecision?.title || ""
    }

    // ✅ Évite les sauvegardes inutiles - vérifie si les données ont vraiment changé
    const hasChanged =
      currentData.title !== savedDataRef.current.title ||
      currentData.description !== savedDataRef.current.description ||
      currentData.argsLength !== savedDataRef.current.argsLength

    console.log("🔄 Auto-save effect triggered:", {
      current: currentData,
      enabled,
      hasChanged,
      hasTitle: !!draftDecision?.title?.trim(),
      hasUser: !!user,
      saved: savedDataRef.current
    })

    if (user && enabled && draftDecision?.title?.trim() && hasChanged) {
      console.log("🚀 Triggering debounced callback")
      debouncedCallback()
    }
  }, [
    user,
    draftDecision?.title,
    draftDecision?.description,
    args.length,
    enabled,
    debouncedCallback // ✅ Nécessaire pour que le hook fonctionne correctement
  ])

  return {
    isSaving: upsertDecisionMutation.isPending,
    saveError: upsertDecisionMutation.error
  }
}
