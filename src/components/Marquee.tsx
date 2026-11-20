import { useEffect, useRef, type RefObject } from 'react'
import {
  motion,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  useAnimationFrame,
  useMotionValue,
  type MotionValue,
} from 'framer-motion'
import { usePrefersReducedMotion } from '../hooks'

// Kinetic marquee. The strip auto-scrolls forever; scroll velocity bends it:
// it speeds up and reverses with the scroll direction. It carries the model's
// mantra. The hard numbers live in SpecsCounter, so this stays brand voice and
// the page never repeats its own figures.
const PHRASE = ['Ninety-nine will burn', 'No more', 'Built in the dark', 'Driven once, at night']

interface DriveProps {
  baseX: MotionValue<number>
  sectionRef: RefObject<HTMLElement | null>
  trackRef: RefObject<HTMLDivElement | null>
}

// All of the marquee's motion work lives here and renders nothing, so it is only
// mounted while it is needed: under reduced motion the strip stays still and none
// of the scroll-velocity springs or frame callbacks exist, and while the strip is
// offscreen the frame callback does no work.
const MarqueeDrive = ({ baseX, sectionRef, trackRef }: DriveProps) => {
  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smooth = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  // -1..1 boost from how hard the page is being scrolled.
  const factor = useTransform(smooth, [-2000, 0, 2000], [-4, 0, 4], { clamp: false })

  const directionRef = useRef(1)
  const widthRef = useRef(0)
  const visibleRef = useRef(false)

  useEffect(() => {
    const measure = () => {
      // The track holds two identical sequences; half its width is one loop.
      if (trackRef.current) widthRef.current = trackRef.current.scrollWidth / 2
    }
    measure()
    window.addEventListener('resize', measure)

    const section = sectionRef.current
    const observer = new IntersectionObserver((entries) => {
      // Entries arrive oldest first; the last one is the current state.
      visibleRef.current = entries[entries.length - 1].isIntersecting
    })
    if (section) observer.observe(section)

    return () => {
      window.removeEventListener('resize', measure)
      observer.disconnect()
      baseX.set(0) // back to the static strip when reduced motion switches on
    }
  }, [baseX, sectionRef, trackRef])

  useAnimationFrame((_, delta) => {
    const w = widthRef.current
    if (!w || !visibleRef.current) return
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

  return null
}

export default function Marquee() {
  const reduced = usePrefersReducedMotion()
  const baseX = useMotionValue(0)
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const items = [...PHRASE, ...PHRASE]

  return (
    <section
      ref={sectionRef}
      aria-hidden
      className="relative overflow-hidden border-y border-hairline bg-bg py-[clamp(1.4rem,3vw,2.4rem)]"
    >
      {!reduced && <MarqueeDrive baseX={baseX} sectionRef={sectionRef} trackRef={trackRef} />}
      <motion.div
        ref={trackRef}
        className="flex whitespace-nowrap will-change-transform"
        style={{ x: baseX }}
      >
        {items.map((p, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center font-display text-[clamp(2rem,6vw,5rem)] font-normal italic tracking-[-0.01em] text-ink/85"
          >
            {p}
            <span className="mx-[clamp(1.5rem,4vw,3.5rem)] inline-block h-[0.55em] w-[0.55em] rotate-45 bg-accent" />
          </span>
        ))}
      </motion.div>
    </section>
  )
}
