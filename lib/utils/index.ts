/**
 * Utility functions for the DecisionMaker application
 */

/**
 * Generate a UUID in a browser-compatible way
 * Falls back to a pseudo-random implementation if crypto.randomUUID() is not available
 */
export function generateUUID(): string {
  // Check if crypto.randomUUID is available (modern browsers and Node.js >= 15)
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  // Fallback implementation for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === "x" ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Type guard to check if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0
}

/**
 * Safe error message extraction
 */
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return typeof error.message === "string" ? error.message : String(error)
  }
  return String(error)
}

/**
 * Handle image loading errors by falling back to a generated avatar
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement, Event>, name: string): void {
  const target = event.target as HTMLImageElement
  target.onerror = null // Prevent infinite loop
  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`
}
