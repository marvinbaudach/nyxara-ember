import { useEffect, useRef } from 'react'
import {
  motion,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  useAnimationFrame,
  useMotionValue,
} from 'framer-motion'
import { usePrefersReducedMotion } from '../hooks'

// Kinetic marquee. The strip auto-scrolls forever; scroll velocity bends it —
// it speeds up, reverses with the scroll direction, and skews as you fling the
// page. Classic award-site energy, here carrying the model's mantra. The hard
// numbers live in SpecsCounter — this stays pure brand voice so the page never
// repeats its own figures.
const PHRASE = ['Ninety nine will burn', 'No more', 'Built in the dark', 'Driven once, at night']

export default function Marquee() {
  const reduced = usePrefersReducedMotion()
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  // -1..1 boost from how hard the page is being scrolled.
  const factor = useTransform(smooth, [-2000, 0, 2000], [-4, 0, 4], { clamp: false })
  const skew = useTransform(smooth, [-2000, 0, 2000], [-8, 0, 8], { clamp: false })

  const directionRef = useRef(1)
  const widthRef = useRef(0)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const measure = () => {
      // The track holds two identical sequences; half its width is one loop.
      if (innerRef.current) widthRef.current = innerRef.current.scrollWidth / 2
    }
    measure()
    window.addEventListener('resize', measure)
    return () => { window.removeEventListener('resize', measure) }
  }, [])

  useAnimationFrame((_, delta) => {
    if (reduced) return
    const w = widthRef.current
    if (!w) return
    let move = directionRef.current * 0.04 * delta // steady drift
    const f = factor.get()
    if (f < 0) directionRef.current = -1
    else if (f > 0) directionRef.current = 1
    move += directionRef.current * Math.abs(f) * 0.6 * delta

    let next = baseX.get() + move
    // Wrap within one loop width so it never runs out of tape.
    if (next <= -w) next += w
    else if (next > 0) next -= w
    baseX.set(next)
  })

  const items = [...PHRASE, ...PHRASE]

  return (
    <section
      aria-hidden
      className="relative overflow-hidden border-y border-hairline bg-bg py-[clamp(1.4rem,3vw,2.4rem)]"
    >
      <motion.div
        ref={innerRef}
        className="flex whitespace-nowrap will-change-transform"
        style={{ x: baseX, skewX: reduced ? 0 : skew }}
      >
        {items.map((p, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center font-display text-[clamp(2rem,6vw,5rem)] font-normal italic tracking-[-0.01em] text-ink/85"
          >
            {p}
            <span className="mx-[clamp(1.5rem,4vw,3.5rem)] inline-block h-[0.55em] w-[0.55em] rotate-45 bg-accent shadow-[0_0_18px_oklch(0.685_0.19_45/0.7)]" />
          </span>
        ))}
      </motion.div>
    </section>
  )
}
