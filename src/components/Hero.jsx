import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const SRC = 'assets/hero.mp4'
const FADE = 0.8 // seconds of crossfade at the loop boundary

// Ambient cinematic hero. The driving take is a single continuous shot, so its
// first and last frames differ; a hard loop would visibly jump. Two stacked
// video layers crossfade into each other at the boundary to hide the restart.
export default function Hero({ onReady }) {
  const aRef = useRef(null)
  const bRef = useRef(null)

  useEffect(() => {
    const a = aRef.current
    const b = bRef.current
    if (!a || !b) return

    let active = a
    let idle = b
    let swapping = false
    let raf = 0

    const kick = (v) => v.play().catch(() => {})
    kick(a)

    // Tell the app the hero is showing real frames so the loader can lift.
    const signalReady = () => onReady?.()
    a.addEventListener('playing', signalReady, { once: true })
    a.addEventListener('canplaythrough', signalReady, { once: true })

    const tick = () => {
      const v = active
      if (v.duration && !swapping && v.duration - v.currentTime <= FADE) {
        swapping = true
        idle.currentTime = 0
        kick(idle)
        idle.style.opacity = '1'
        v.style.opacity = '0'
        const tmp = active
        active = idle
        idle = tmp
        setTimeout(() => { swapping = false }, FADE * 1000)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const onTouch = () => { kick(active); window.removeEventListener('pointerdown', onTouch) }
    window.addEventListener('pointerdown', onTouch)

    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointerdown', onTouch) }
  }, [])

  const layer = 'absolute inset-0 z-0 h-full w-full object-cover transition-opacity duration-[800ms] ease-linear'

  return (
    <section className="relative h-screen w-full overflow-hidden bg-bg">
      <video ref={aRef} className={layer} style={{ opacity: 1 }} src={SRC} muted playsInline preload="auto" poster="assets/g3.jpg" />
      <video ref={bRef} className={layer} style={{ opacity: 0 }} src={SRC} muted playsInline preload="auto" />

      {/* soft dark contrast halo so the wordmark never washes out */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            'radial-gradient(58% 68% at 50% 56%, oklch(0.11 0.01 50 / 0.74) 0%, oklch(0.11 0.01 50 / 0.32) 45%, oklch(0.11 0.01 50 / 0) 74%), linear-gradient(to bottom, oklch(0.13 0.01 50 / 0.5), oklch(0.13 0.01 50 / 0.08) 28%, oklch(0.13 0.01 50 / 0.1) 70%, oklch(0.13 0.01 50 / 0.75))',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 z-20 grid place-items-center px-[6vw] text-center"
      >
        <div>
          <p className="mb-6 pl-[0.6em] font-sans text-[clamp(0.8rem,1.4vw,1.05rem)] font-semibold tracking-[0.6em] text-ink">
            NYXARA
          </p>
          <h1 className="font-display text-[clamp(4rem,21vw,17rem)] font-medium leading-[0.82] tracking-[-0.02em]">
            EMBER
          </h1>
          <p className="mt-7 font-sans text-[0.78rem] uppercase tracking-[0.42em] text-muted">
            Ninety nine will burn. No more.
          </p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-[4vh] left-1/2 z-20 -translate-x-1/2 font-sans text-[0.7rem] uppercase tracking-[0.3em] text-muted"
      >
        Scroll
      </motion.p>
    </section>
  )
}
