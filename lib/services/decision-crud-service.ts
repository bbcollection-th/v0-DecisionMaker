import type { User } from "@supabase/supabase-js"
import * as z from "zod"
import { ArgumentSchema, NewArgumentSchema, NewDecisionSchema } from "@/features/decision/schemas"
import { createClient } from "@/lib/supabase/client"
import { createFailureResult, createRetryFunction, createSuccessResult, handleSupabaseError } from "@/lib/utils/decision-conflict-manager"
import type { AISuggestion, Argument, Decision, DecisionOperationResult, UpsertResult } from "@/types/decision"

// Type pour la réponse de Supabase
interface SupabaseDecision {
  id: string
  title: string | null
  description: string | null
  created_at: string | null
  updated_at: string | null
  arguments: Array<{
    text: string
    note: number
  }> | null
}

interface SupabaseArgumentRow {
  id: string
  text: string
  note: number
  created_at: string
}

export class DecisionCrudService {
  private supabase = createClient()

  async loadDecisionHistory(user: User | null): Promise<Decision[]> {
    if (!user) {
      console.warn("loadDecisionHistory called with null user")
      return []
    }

    try {
      console.log("Loading decision history for user:", user.id)

      const { data: decisions, error } = await this.supabase
        .from("decisions")
        .select(`
          id,
          title,
          description,
          created_at,
          updated_at,
          arguments (
            text,
            note
          )
        `)
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      console.log("Raw decisions from database:", decisions)

      // Transform the data to match our Decision type
      const transformedDecisions = (decisions || []).map((decision: SupabaseDecision) => ({
        arguments: decision.arguments || [],
        createdAt: decision.created_at ? new Date(decision.created_at) : new Date(),
        description: decision.description || "",
        id: decision.id,
        title: decision.title || "Décision sans titre",
        updatedAt: decision.updated_at ? new Date(decision.updated_at) : new Date()
      }))

      console.log("Transformed decisions:", transformedDecisions)
      return transformedDecisions
    } catch (error) {
      console.error("Error loading decision history:", error)
      // Améliorer le diagnostic d'erreur
      if (error instanceof Error) {
        throw new Error(`Failed to load decision history: ${error.message}`)
      } else {
        throw new Error(`Failed to load decision history: ${JSON.stringify(error)}`)
      }
    }
  }

  async loadDecisionById(decisionId: string): Promise<Decision | null> {
    try {
      const { data, error } = await this.supabase
        .from("decisions")
        .select(`
          id,
          title,
          description,
          created_at,
          updated_at,
          arguments (
            id,
            text,
            note,
            created_at
          )
        `)
        .eq("id", decisionId)
        .single()

      if (error) {
        console.error("Error loading decision by ID:", error)
        return null
      }

      if (!data) {
        console.error("Decision not found:", decisionId)
        return null
      }

      interface LoadedArgument {
        createdAt: Date
        id: string
        note: number
        text: string
        updatedAt: Date
      }

      interface LoadedDecision {
        arguments: LoadedArgument[]
        createdAt: Date
        description: string
        id: string
        title: string
        updatedAt: Date
      }

      return {
        arguments: (data.arguments || []).map(
          (arg: SupabaseArgumentRow): LoadedArgument => ({
            createdAt: new Date(arg.created_at || new Date()),
            id: arg.id,
            note: arg.note,
            text: arg.text,
            updatedAt: new Date(arg.created_at || new Date()) // arguments table doesn't have updated_at
          })
        ),
        createdAt: data.created_at ? new Date(data.created_at) : new Date(),
        description: data.description || "",
        id: data.id,
        title: data.title || "Décision sans titre",
        updatedAt: data.updated_at ? new Date(data.updated_at) : new Date()
      } as LoadedDecision
    } catch (error) {
      console.error("Error in loadDecisionById:", error)
      return null
    }
  }

  /**
   * UPSERT decision using robust SQL function
   * Prevents duplicates and handles conflicts automatically
   */
  async upsertDecision(
    user: User | null,
    decision: Omit<Decision, "id" | "createdAt" | "updatedAt">,
    args: Argument[],
    existingId?: string
  ): Promise<DecisionOperationResult<UpsertResult>> {
    if (!user) {
      return createFailureResult(new Error("User is required to save a decision"))
    }

    try {
      // Validate input data
      const validatedDecision = NewDecisionSchema.parse({
        description: decision.description || "",
        title: decision.title
      })

      const validatedArgs = z.array(NewArgumentSchema).parse(args)

      // Prepare arguments for SQL function
      const argumentsData = validatedArgs.length > 0 ? validatedArgs.map(arg => ({ note: arg.note, text: arg.text })) : []

      // Call the robust UPSERT function
      const { data, error } = await this.supabase
        .rpc("upsert_decision", {
          p_arguments: argumentsData,
          p_description: validatedDecision.description,
          p_existing_id: existingId || null,
          p_title: validatedDecision.title,
          p_user_id: user.id
        })
        .single()

      if (error) {
        const handledError = handleSupabaseError(error)
        return createFailureResult(handledError)
      }

      if (!data) {
        return createFailureResult(new Error("No data returned from upsert operation"))
      }

      // Load the complete decision with actual arguments from database
      const completeDecision = await this.loadDecisionById(data.id)
      if (!completeDecision) {
        return createFailureResult(new Error("Failed to load decision after upsert"))
      }

      const result: UpsertResult = {
        decision: completeDecision,
        isNew: data.is_new
      }

      return createSuccessResult(result)
    } catch (error) {
      console.error("Error in upsertDecision:", error)
      const handledError = handleSupabaseError(error as Error)

      // Create retry function for certain errors
      const retryFn = createRetryFunction(() =>
        this.upsertDecision(user, decision, args, existingId).then(result => {
          if (!result.success) throw result.error
          return result.data
        })
      )

      return createFailureResult(handledError, retryFn)
    }
  }

  /**
   * Update decision with optimistic locking
   */
  async updateDecisionWithLocking(user: User | null, decision: Decision, args: Argument[]): Promise<DecisionOperationResult<Decision>> {
    if (!user || !decision.id) {
      return createFailureResult(new Error("User and decision ID are required to update a decision"))
    }

    if (!decision.title.trim()) {
      return createFailureResult(new Error("Title is required"))
    }

    try {
      // Prepare arguments for SQL function
      const argumentsJson = args.length > 0 ? JSON.stringify(args.map(arg => ({ note: arg.note, text: arg.text }))) : null

      // Use atomic update function with optimistic locking
      const { data, error } = await this.supabase
        .rpc("update_decision_with_arguments", {
          p_arguments: argumentsJson,
          p_decision_id: decision.id,
          p_description: decision.description || "",
          p_expected_version: decision.version || 1,
          p_title: decision.title
        })
        .single()

      if (error) {
        const handledError = handleSupabaseError(error)
        return createFailureResult(handledError)
      }

      if (!data) {
        return createFailureResult(new Error("No data returned from update operation"))
      }

      // Transform response to Decision object
      const updatedDecision: Decision = {
        arguments: args,
        createdAt: new Date(data.created_at),
        description: data.description || "",
        id: data.id,
        title: data.title,
        updatedAt: new Date(data.updated_at),
        version: data.version
      }

      return createSuccessResult(updatedDecision)
    } catch (error) {
      console.error("Error updating decision:", error)
      const handledError = handleSupabaseError(error as Error)

      // Create retry function for optimistic lock failures
      const retryFn = createRetryFunction(() =>
        this.updateDecisionWithLocking(user, decision, args).then(result => {
          if (!result.success) throw result.error
          return result.data
        })
      )

      return createFailureResult(handledError, retryFn)
    }
  }

  async saveDecision(user: User | null, decision: Omit<Decision, "id" | "createdAt" | "updatedAt">, args: Argument[]): Promise<Decision | null> {
    if (!user) {
      throw new Error("User is required to save a decision")
    }

    // ✅ VALIDATION ZOD - Remplace la validation manuelle
    try {
      const validatedDecision = NewDecisionSchema.parse({
        description: decision.description,
        title: decision.title
      })

      const validatedArgs = z.array(ArgumentSchema.omit({ createdAt: true, id: true, updatedAt: true })).parse(args)

      // Save decision avec les données validées
      const { data: decisionData, error: decisionError } = await this.supabase
        .from("decisions")
        .insert({
          description: validatedDecision.description,
          title: validatedDecision.title,
          user_id: user.id
        })
        .select()
        .single()

      if (decisionError) throw decisionError

      // Save arguments avec validation Zod
      if (validatedArgs.length > 0) {
        const argumentsToInsert = validatedArgs.map(arg => ({
          decision_id: decisionData.id,
          note: arg.note,
          text: arg.text
        }))

        const { data: insertedArgs, error: argumentsError } = await this.supabase.from("arguments").insert(argumentsToInsert).select()

        if (argumentsError) throw argumentsError

        // Use the real arguments with actual IDs and timestamps from database
        const realArguments = (insertedArgs || []).map((arg: SupabaseArgumentRow) => ({
          createdAt: new Date(arg.created_at),
          id: arg.id,
          note: arg.note,
          text: arg.text,
          updatedAt: new Date(arg.created_at) // arguments table doesn't have updated_at
        }))

        return {
          arguments: realArguments,
          createdAt: new Date(decisionData.created_at),
          description: validatedDecision.description,
          id: decisionData.id,
          title: validatedDecision.title,
          updatedAt: new Date(decisionData.updated_at)
        }
      }

      return {
        arguments: [],
        createdAt: new Date(decisionData.created_at),
        description: validatedDecision.description,
        id: decisionData.id,
        title: validatedDecision.title,
        updatedAt: new Date(decisionData.updated_at)
      }
    } catch (error) {
      console.error("Error saving decision:", error)
      throw error
    }
  }

  async updateDecision(user: User | null, decision: Decision, args: Argument[]): Promise<Decision | null> {
    if (!user || !decision.id) {
      throw new Error("User and decision ID are required to update a decision")
    }

    if (!decision.title.trim()) {
      throw new Error("Title is required")
    }

    try {
      // Update decision
      const { data: decisionData, error: decisionError } = await this.supabase
        .from("decisions")
        .update({
          description: decision.description,
          title: decision.title,
          updated_at: new Date().toISOString()
        })
        .eq("id", decision.id)
        .select()
        .single()

      if (decisionError) throw decisionError

      // Delete existing arguments and insert new ones
      await this.supabase.from("arguments").delete().eq("decision_id", decision.id)

      if (args.length > 0) {
        const argumentsToInsert = args.map(arg => ({
          decision_id: decision.id,
          note: arg.note,
          text: arg.text
        }))

        const { error: argumentsError } = await this.supabase.from("arguments").insert(argumentsToInsert)
        if (argumentsError) throw argumentsError
      }

      return {
        arguments: args,
        createdAt: decision.createdAt,
        description: decision.description,
        id: decisionData.id,
        title: decision.title,
        updatedAt: new Date()
      }
    } catch (error) {
      console.error("Error updating decision:", error)
      throw error
    }
  }

  async deleteDecision(user: User | null, decisionId: string): Promise<void> {
    if (!user) {
      throw new Error("User is required to delete a decision")
    }

    try {
      // Delete arguments first (foreign key constraint)
      const { error: argsError } = await this.supabase.from("arguments").delete().eq("decision_id", decisionId)
      if (argsError) {
        console.error("Error deleting arguments:", argsError)
      }

      // Delete decision
      const { error } = await this.supabase.from("decisions").delete().eq("id", decisionId)
      if (error) {
        console.error("Error deleting decision:", error)
        throw error
      }
    } catch (error) {
      console.error("Error deleting decision:", error)
      throw error
    }
  }

  async renameDecision(user: User | null, decisionId: string, newTitle: string): Promise<void> {
    if (!user) {
      throw new Error("User is required to rename a decision")
    }

    // ✅ VALIDATION ZOD - Remplace la validation manuelle trim()
    const titleSchema = z.string().min(1, "Le titre est requis").max(100, "Le titre ne peut pas dépasser 100 caractères")
    const validatedTitle = titleSchema.parse(newTitle.trim())

    try {
      const { error } = await this.supabase
        .from("decisions")
        .update({
          title: validatedTitle,
          updated_at: new Date().toISOString()
        })
        .eq("id", decisionId)

      if (error) {
        console.error("Error updating decision:", error)
        throw error
      }
    } catch (error) {
      console.error("Error renaming decision:", error)
      throw error
    }
  }

  async pinDecision(user: User | null, decisionId: string): Promise<void> {
    if (!user) {
      throw new Error("User is required to pin a decision")
    }

    try {
      // Update the decision with current timestamp to move it to top
      const { error } = await this.supabase.from("decisions").update({ updated_at: new Date().toISOString() }).eq("id", decisionId)

      if (error) {
        console.error("Error updating decision:", error)
        throw error
      }
    } catch (error) {
      console.error("Error pinning decision:", error)
      throw error
    }
  }

  async generateSuggestions(decision: Pick<Decision, "title" | "description">, args: Argument[]): Promise<AISuggestion[]> {
    if (!decision.title.trim()) {
      throw new Error("Title is required to generate suggestions")
    }

    try {
      const response = await fetch("/api/suggest-arguments", {
        body: JSON.stringify({
          description: decision.description,
          existingArguments: args,
          title: decision.title
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      })

      if (!response.ok) {
        throw new Error("Failed to generate suggestions")
      }

      const data = await response.json()
      return data.suggestions || []
    } catch (error) {
      console.error("Error generating suggestions:", error)
      throw error
    }
  }
}
