import { useModals, useSidebarOpen, useUILoading, useUIStore } from "@/lib/stores"

/**
 * Hook d'interface pour l'état UI global
 * Facilite la migration depuis useState vers Zustand
 */
export function useUI() {
  const store = useUIStore()

  return {
    breadcrumbs: store.breadcrumbs,
    closeAllModals: store.closeAllModals,
    closeModal: store.closeModal,
    currentPage: store.currentPage,

    // Modals
    modals: store.modals,
    openModal: store.openModal,
    setBreadcrumbs: store.setBreadcrumbs,
    setCurrentPage: store.setCurrentPage,
    setSidebarOpen: store.setSidebarOpen,
    setUILoading: store.setUILoading,
    // Navigation & Layout
    sidebarOpen: store.sidebarOpen,
    toggleSidebar: store.toggleSidebar,

    // Loading states
    ui: store.ui
  }
}

import { useTheme as useNextTheme } from "next-themes"

/**
 * Hook optimisé pour le theme avec next-themes
 */
export function useTheme() {
  const { theme, setTheme } = useNextTheme()
  const isDarkMode = theme === "dark"

  return {
    isDarkMode,
    setTheme,
    toggleTheme: () => setTheme(isDarkMode ? "light" : "dark")
  }
}

/**
 * Hook optimisé pour la sidebar seule
 */
export function useSidebar() {
  const sidebarOpen = useSidebarOpen()
  const { setSidebarOpen, toggleSidebar } = useUIStore()

  return {
    setSidebarOpen,
    sidebarOpen,
    toggleSidebar
  }
}

/**
 * Hook pour la gestion des modals
 */
export function useModalState() {
  const modals = useModals()
  const { openModal, closeModal, closeAllModals } = useUIStore()

  return {
    closeAllModals,
    closeModal,
    // Convenience helpers
    isDeleteConfirmOpen: modals.deleteConfirm,
    isRenameDialogOpen: modals.renameDialog,
    isSettingsModalOpen: modals.settingsModal,
    modals,
    openModal
  }
}

/**
 * Hook pour les états de chargement UI
 */
export function useLoadingStates() {
  const ui = useUILoading()
  const { setUILoading } = useUIStore()

  return {
    deletingDecision: ui.deletingDecision,
    generatingSuggestions: ui.generatingSuggestions,
    // Convenience helpers
    savingDecision: ui.savingDecision,
    setDeletingDecision: (loading: boolean) => setUILoading("deletingDecision", loading),
    setGeneratingSuggestions: (loading: boolean) => setUILoading("generatingSuggestions", loading),
    setSavingDecision: (loading: boolean) => setUILoading("savingDecision", loading),
    setUILoading,
    ui
  }
}
