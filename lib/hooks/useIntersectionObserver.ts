// lib/hooks/useIntersectionObserver.ts
import { useEffect, useRef } from 'react'

interface UseIntersectionObserverOptions {
  onIntersect: () => void
  enabled?: boolean
  threshold?: number
  rootMargin?: string
}

export function useIntersectionObserver(
  targetRef: React.RefObject<Element>,
  {
    onIntersect,
    enabled = true,
    threshold = 0.1,
    rootMargin = '0px'
  }: UseIntersectionObserverOptions
) {
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!enabled) return

    const target = targetRef.current
    if (!target) return

    // Disconnect existing observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onIntersect()
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    // Start observing
    observerRef.current.observe(target)

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [targetRef, onIntersect, enabled, threshold, rootMargin])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])
}