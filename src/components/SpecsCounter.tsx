import { useEffect, useRef, useState } from 'react'
import { motion, useInView, animate } from 'framer-motion'
import { ease } from '../anim'

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

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// One animated numeral. Counts up from zero the first time it scrolls in.
const Counter = ({ spec, delay }: { spec: Spec; delay: number }) => {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const [text, setText] = useState(() =>
    reducedMotion() ? spec.value.toFixed(spec.decimals) : (0).toFixed(spec.decimals),
  )

  useEffect(() => {
    if (!inView || reducedMotion()) return
    const controls = animate(0, spec.value, {
      duration: 1.8,
      delay,
      ease,
      onUpdate: (v) => { setText(v.toFixed(spec.decimals)) },
    })
    return () => { controls.stop() }
  }, [inView, spec.value, spec.decimals, delay])

  return <span ref={ref} className="tabular-nums">{text}</span>
}

export default function SpecsCounter() {
  return (
    <section className="relative px-[6vw] py-[clamp(6rem,14vh,14rem)]">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease }}
        className="mb-[clamp(2.5rem,6vh,5rem)] text-center font-mono text-[0.7rem] uppercase tracking-[0.5em] text-accent"
      >
        The numbers
      </motion.p>
      <div className="mx-auto grid max-w-[1300px] gap-[clamp(2.5rem,5vw,4rem)] md:grid-cols-4">
        {specs.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: i * 0.08, ease }}
            className="group relative border-t border-hairline pt-7 text-center md:text-left"
          >
            <div className="flex items-baseline justify-center gap-1.5 md:justify-start">
              <span className="font-display text-[clamp(3.4rem,7vw,6rem)] font-medium leading-[0.9] tracking-[-0.02em] text-ink transition-colors duration-500 group-hover:text-accent">
                <Counter spec={s} delay={i * 0.08} />
              </span>
              <span className="font-mono text-[clamp(0.85rem,1.4vw,1.1rem)] text-accent">{s.suffix}</span>
            </div>
            <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-[0.32em] text-muted">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
