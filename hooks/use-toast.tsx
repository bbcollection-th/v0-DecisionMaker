"use client"

import * as React from "react"

interface ToastData {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
}

const toastContext = React.createContext<{
  toasts: ToastData[]
  addToast: (toast: Omit<ToastData, "id">) => void
  removeToast: (id: string) => void
} | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastData[]>([])

  const addToast = React.useCallback((toast: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <toastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`w-full max-w-sm rounded-lg border p-4 shadow-lg transition-all ${
              toast.variant === "destructive"
                ? "bg-destructive text-destructive-foreground border-destructive"
                : toast.variant === "success"
                  ? "bg-green-50 text-green-900 border-green-200"
                  : "bg-background border-border"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                {toast.title && <div className="font-semibold">{toast.title}</div>}
                {toast.description && <div className="text-sm opacity-90">{toast.description}</div>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Fermer la notification"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </toastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(toastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
