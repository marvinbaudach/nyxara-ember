import { useCallback, useEffect, useSyncExternalStore } from 'react'
import Lenis from 'lenis'

// Subscribe a component to a CSS media query, re-rendering only when it flips.
// useSyncExternalStore keeps it tear-free and SSR-safe (falls back to `false`
// on the server, then settles to the real value on mount) — the idiomatic React
// way to read external, event-driven browser state.
export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => { mql.removeEventListener('change', onChange) }
    },
    [query],
  )
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query])
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

export const usePrefersReducedMotion = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)')

// Touch-primary device with no mouse/trackpad — i.e. a real phone/tablet whose
// video decoder seeks slowly. Drives the coarse-grained, seek-gated scrub path.
export const useCoarsePointer = (): boolean => {
  const coarse = useMediaQuery('(pointer: coarse)')
  const anyFine = useMediaQuery('(any-pointer: fine)')
  return coarse && !anyFine
}

// Smooth inertia scroll. Instantiated only while enabled (and torn down on
// disable), and skipped entirely under reduced-motion.
export const useLenis = (enabled: boolean) => {
  const reducedMotion = usePrefersReducedMotion()
  useEffect(() => {
    if (!enabled || reducedMotion) return
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true })
    let raf = 0
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); lenis.destroy() }
  }, [enabled, reducedMotion])
}
