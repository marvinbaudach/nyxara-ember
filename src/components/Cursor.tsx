import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

// Custom cursor: a sharp dot at the true pointer plus a soft ember ring that
// trails behind on a spring. The ring swells and ignites over anything
// interactive. Mouse only — touch devices never see it and keep native input.
export default function Cursor() {
  const [enabled] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [active, setActive] = useState(false)
  const [down, setDown] = useState(false)

  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const ringX = useSpring(x, { stiffness: 350, damping: 28, mass: 0.6 })
  const ringY = useSpring(y, { stiffness: 350, damping: 28, mass: 0.6 })

  useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.add('has-emcursor')

    // Position is the only thing that updates on every move — keep it to two
    // motion-value writes (compositor-only, no React render, no DOM reads).
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    // Hover state is detected by delegation: pointerover/out fire only when the
    // pointer crosses an element boundary, not on every pixel — so the costly
    // closest() walk runs a handful of times instead of hundreds per second.
    const over = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null
      if (el?.closest('a, button, [data-cursor]')) setActive(true)
    }
    const out = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null
      if (el?.closest('a, button, [data-cursor]')) setActive(false)
    }
    const onDown = () => { setDown(true) }
    const onUp = () => { setDown(false) }

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    window.addEventListener('pointerout', out, { passive: true })
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      document.documentElement.classList.remove('has-emcursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', over)
      window.removeEventListener('pointerout', out)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
    }
  }, [x, y, enabled])

  if (!enabled) return null

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[70] h-1.5 w-1.5 rounded-full bg-accent"
        style={{ x, y, marginLeft: -3, marginTop: -3, willChange: 'transform' }}
        animate={{ scale: down ? 0.5 : 1 }}
        transition={{ duration: 0.12 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[70] rounded-full border border-accent/60"
        style={{
          x: ringX,
          y: ringY,
          width: 38,
          height: 38,
          marginLeft: -19,
          marginTop: -19,
          willChange: 'transform',
          boxShadow: '0 0 24px oklch(0.685 0.19 45 / 0.45)',
        }}
        animate={{
          scale: active ? 1.9 : 1,
          opacity: active ? 1 : 0.7,
          backgroundColor: active ? 'oklch(0.685 0.19 45 / 0.12)' : 'oklch(0.685 0.19 45 / 0)',
        }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      />
    </>
  )
}
