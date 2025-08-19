import { create } from "zustand"
import { devtools } from "zustand/middleware"
import { generateUUID } from "@/lib/utils"
import type { Argument, Decision } from "@/types/decision"

interface DecisionState {
  // Current decision being worked on
  currentDecisionId: string | null

  // Draft state for unsaved changes
  draftDecision: Partial<Decision> | null

  // UI states
  isEditing: boolean
  hasUnsavedChanges: boolean

  // Arguments management (temporary state before save)
  draftArguments: Argument[]

  // Form states
  newArgumentForm: {
    isOpen: boolean
    text: string
    note: number
  }
}

interface DecisionActions {
  // Decision management
  setCurrentDecisionId: (id: string | null) => void
  setDraftDecision: (draft: Partial<Decision> | null) => void
  updateDraftField: <K extends keyof Decision>(field: K, value: Decision[K]) => void

  // Edit mode
  setIsEditing: (editing: boolean) => void
  setHasUnsavedChanges: (hasChanges: boolean) => void

  // Arguments management
  setDraftArguments: (args: Argument[]) => void
  addDraftArgument: (arg: Omit<Argument, "id">) => void
  removeDraftArgument: (id: string) => void
  updateDraftArgument: (id: string, updates: Partial<Argument>) => void
  clearDraftArguments: () => void

  // New argument form
  setNewArgumentFormOpen: (open: boolean) => void
  setNewArgumentText: (text: string) => void
  setNewArgumentNote: (note: number) => void
  resetNewArgumentForm: () => void

  // Utility actions
  clearDraft: () => void
  resetStore: () => void

  // Derived getters (computed values)
  getPositiveScore: () => number
  getNegativeScore: () => number
  getSortedArguments: () => Argument[]
}

export type DecisionStore = DecisionState & DecisionActions

const initialState: DecisionState = {
  currentDecisionId: null,
  draftArguments: [],
  draftDecision: null,
  hasUnsavedChanges: false,
  isEditing: false,
  newArgumentForm: {
    isOpen: false,
    note: 0,
    text: ""
  }
}

export const useDecisionStore = create<DecisionStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      addDraftArgument: arg =>
        set(
          state => ({
            draftArguments: [...state.draftArguments, { ...arg, id: generateUUID() }],
            hasUnsavedChanges: true
          }),
          false,
          "addDraftArgument"
        ),

      // Utility actions
      clearDraft: () =>
        set(
          {
            draftArguments: [],
            draftDecision: null,
            hasUnsavedChanges: false,
            isEditing: false
          },
          false,
          "clearDraft"
        ),

      clearDraftArguments: () => set({ draftArguments: [] }, false, "clearDraftArguments"),

      getNegativeScore: () => {
        const { draftArguments } = get()
        return Math.abs(draftArguments.filter(arg => arg.note < 0).reduce((sum, arg) => sum + arg.note, 0))
      },

      // Computed values
      getPositiveScore: () => {
        const { draftArguments } = get()
        return draftArguments.filter(arg => arg.note > 0).reduce((sum, arg) => sum + arg.note, 0)
      },

      getSortedArguments: () => {
        const { draftArguments } = get()
        return [...draftArguments].sort((a, b) => a.note - b.note)
      },

      removeDraftArgument: id =>
        set(
          state => ({
            draftArguments: state.draftArguments.filter(arg => arg.id !== id),
            hasUnsavedChanges: true
          }),
          false,
          "removeDraftArgument"
        ),

      resetNewArgumentForm: () =>
        set(
          _state => ({
            newArgumentForm: {
              isOpen: false,
              note: 0,
              text: ""
            }
          }),
          false,
          "resetNewArgumentForm"
        ),

      resetStore: () => set({ ...initialState }, false, "resetStore"),

      // Decision management
      setCurrentDecisionId: id => set({ currentDecisionId: id }, false, "setCurrentDecisionId"),

      // Arguments management
      setDraftArguments: args =>
        set(
          {
            draftArguments: args,
            hasUnsavedChanges: true
          },
          false,
          "setDraftArguments"
        ),

      setDraftDecision: draft =>
        set(
          {
            draftDecision: draft,
            hasUnsavedChanges: draft !== null
          },
          false,
          "setDraftDecision"
        ),

      setHasUnsavedChanges: hasChanges => set({ hasUnsavedChanges: hasChanges }, false, "setHasUnsavedChanges"),

      // Edit mode
      setIsEditing: editing => set({ isEditing: editing }, false, "setIsEditing"),

      // New argument form
      setNewArgumentFormOpen: open =>
        set(
          state => ({
            newArgumentForm: { ...state.newArgumentForm, isOpen: open }
          }),
          false,
          "setNewArgumentFormOpen"
        ),

      setNewArgumentNote: note =>
        set(
          state => ({
            newArgumentForm: { ...state.newArgumentForm, note }
          }),
          false,
          "setNewArgumentNote"
        ),

      setNewArgumentText: text =>
        set(
          state => ({
            newArgumentForm: { ...state.newArgumentForm, text }
          }),
          false,
          "setNewArgumentText"
        ),

      updateDraftArgument: (id, updates) =>
        set(
          state => ({
            draftArguments: state.draftArguments.map(arg => (arg.id === id ? { ...arg, ...updates } : arg)),
            hasUnsavedChanges: true
          }),
          false,
          "updateDraftArgument"
        ),

      updateDraftField: (field, value) =>
        set(
          state => ({
            draftDecision: {
              ...state.draftDecision,
              [field]: value
            },
            hasUnsavedChanges: true
          }),
          false,
          "updateDraftField"
        )
    }),
    {
      name: "DecisionStore"
    }
  )
)

// Selectors pour optimiser les re-renders
export const useCurrentDecisionId = () => useDecisionStore(state => state.currentDecisionId)
export const useDraftDecision = () => useDecisionStore(state => state.draftDecision)
export const useIsEditing = () => useDecisionStore(state => state.isEditing)
export const useHasUnsavedChanges = () => useDecisionStore(state => state.hasUnsavedChanges)
export const useDraftArguments = () => useDecisionStore(state => state.draftArguments)
export const useNewArgumentForm = () => useDecisionStore(state => state.newArgumentForm)

// Computed selectors
export const useDecisionScores = () =>
  useDecisionStore(state => ({
    negative: state.getNegativeScore(),
    positive: state.getPositiveScore(),
    total: state.getPositiveScore() - state.getNegativeScore()
  }))

export const useSortedDraftArguments = () => useDecisionStore(state => state.getSortedArguments())
