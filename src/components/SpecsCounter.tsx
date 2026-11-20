import { useEffect, useRef } from 'react'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'
import { ease } from '../anim'
import { usePrefersReducedMotion } from '../hooks'

interface Spec {
  value: number
  decimals: number
  suffix: string
  label: string
}

const specs: Spec[] = [
  { value: 1340, decimals: 0, suffix: 'hp', label: 'Twin afterburners' },
  { value: 2.1, decimals: 1, suffix: 's', label: 'Zero to sixty' },
  { value: 310, decimals: 0, suffix: 'mph', label: 'Before the limiter' },
  { value: 99, decimals: 0, suffix: '', label: 'Built, then never again' },
]

// One animated numeral. Counts up from zero the first time it scrolls in.
// The tween drives a MotionValue rendered straight into the DOM, so the ~60fps
// updates never trip a React re-render — only this one text node changes.
const Counter = ({ spec, delay }: { spec: Spec; delay: number }) => {
  const ref = useRef<HTMLSpanElement>(null)
  const reduced = usePrefersReducedMotion()
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const count = useMotionValue(reduced ? spec.value : 0)
  const text = useTransform(count, (v) => v.toFixed(spec.decimals))

  useEffect(() => {
    if (!inView || reduced) return
    const controls = animate(count, spec.value, { duration: 1.8, delay, ease })
    return () => { controls.stop() }
  }, [inView, reduced, count, spec.value, delay])

  return <motion.span ref={ref} className="tabular-nums">{text}</motion.span>
}

export default function SpecsCounter() {
  return (
    <section className="wrap pb-[clamp(6rem,14vh,12rem)]">
      <h2 className="sr-only">Specifications</h2>
      <div className="grid grid-cols-2 gap-x-[clamp(1.5rem,4vw,4rem)] gap-y-[clamp(2.5rem,5vw,4rem)] md:grid-cols-4">
        {specs.map((s, i) => (
          <div key={s.label} className="border-t border-hairline pt-6">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-[clamp(3rem,6.4vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.02em] text-ink">
                <Counter spec={s} delay={i * 0.08} />
              </span>
              <span className="font-mono text-[clamp(0.85rem,1.4vw,1.1rem)] text-accent">{s.suffix}</span>
            </div>
            <p className="mt-4 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
