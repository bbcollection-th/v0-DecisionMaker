import { useCallback, useEffect, useRef } from "react"

/**
 * Hook pour debouncer une fonction
 * @param callback - La fonction à debouncer
 * @param delay - Le délai en millisecondes
 * @returns La fonction debouncée avec une méthode cancel
 */
export function useDebounce<T extends (...args: unknown[]) => void>(callback: T, delay: number) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const callbackRef = useRef(callback)
  const delayRef = useRef(delay)

  // Keep latest callback and delay
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
  useEffect(() => {
    delayRef.current = delay
  }, [delay])

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    // Cancel previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    // Schedule next call with latest delay
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args)
      timeoutRef.current = null
    }, delayRef.current)
  }, [])

  // Cleanup on unmount
  useEffect(() => cancel, [cancel])

  return {
    cancel,
    cleanup: cancel,
    debouncedCallback: debouncedCallback as T
  }
}
