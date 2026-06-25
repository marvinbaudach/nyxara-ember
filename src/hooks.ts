import { useCallback, useSyncExternalStore } from 'react'

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
