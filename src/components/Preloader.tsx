import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ease } from '../anim'

// Full-screen branded loading veil. Stays until the hero video is actually
// playing, so the visitor never sees the poster pop to video. A climbing readout
// (and an ember that ignites the wordmark) turns the wait into a countdown to
// the reveal rather than a dead spinner.
export default function Preloader() {
  const [pct, setPct] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 99
      : 0,
  )

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const start = performance.now()
    const tick = (t: number) => {
      // Ease toward 99 over ~5s; the real "ready" event unmounts us first.
      const p = Math.min(99, Math.round((1 - Math.exp(-(t - start) / 1600)) * 100))
      setPct(p)
      if (p < 99) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf) }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease }}
      className="fixed inset-0 z-50 grid place-items-center bg-bg"
    >
      <div className="text-center">
        <p className="pl-[0.5em] font-display text-[clamp(2rem,6vw,3.5rem)] tracking-[0.5em] text-ink">
          NYX<span className="text-accent ember-glow">A</span>RA
        </p>
        <div className="mx-auto mt-8 h-px w-56 overflow-hidden bg-hairline">
          <motion.div
            className="h-full bg-gradient-to-r from-accent to-[oklch(0.78_0.2_55)]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-5 flex items-center justify-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.3em] text-muted">
          <span>Igniting</span>
          <span className="tabular-nums text-ink">{pct.toString().padStart(2, '0')}</span>
        </p>
      </div>
    </motion.div>
  )
}
