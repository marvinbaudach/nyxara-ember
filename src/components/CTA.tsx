import { useRef, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'
import Magnetic from './Magnetic'

// Premium button reflex: a radial specular sheen tracks the cursor across the
// button surface, computed from live mouse coordinates.
const SheenButton = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 })
  const [lit, setLit] = useState(false)

  const onMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 })
  }

  return (
    <button
      ref={ref}
      type="button"
      onMouseMove={onMove}
      onMouseEnter={() => { setLit(true); }}
      onMouseLeave={() => { setLit(false); }}
      data-cursor
      className="group relative overflow-hidden rounded-full border border-accent/70 bg-bg-lift px-12 py-5 font-sans text-[1.05rem] font-medium tracking-[0.02em] text-ink shadow-[0_0_40px_oklch(0.685_0.19_45/0.22),inset_0_0_0_1px_oklch(0.685_0.19_45/0.12)] transition-all hover:shadow-[0_0_70px_oklch(0.685_0.19_45/0.4)]"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: lit ? 1 : 0,
          background: `radial-gradient(120px circle at ${pos.x}% ${pos.y}%, oklch(0.72 0.19 45 / 0.55), transparent 60%)`,
        }}
      />
      <span className="relative">{children}</span>
    </button>
  )
}

const CTA = () => {
  return (
    <section id="reserve" className="relative scroll-mt-24 px-[8vw] py-[clamp(6rem,13vh,12rem)] text-center">
      <p className="font-mono text-[0.74rem] uppercase tracking-[0.42em] text-accent">Reservations open</p>
      <h2 className="mx-auto mt-6 max-w-[18ch] font-display text-[clamp(2.4rem,6vw,5rem)] font-normal leading-[1.03]">
        Claim a <span className="text-accent ember-glow">build night</span>.
      </h2>
      <p className="mx-auto mt-6 max-w-[44ch] font-sans text-[1.08rem] text-muted">
        A refundable deposit holds one of ninety nine slots. We build in the order the deposits land.
      </p>
      <div className="mt-12 flex justify-center">
        <Magnetic strength={0.5}>
          <SheenButton>Request your Ember</SheenButton>
        </Magnetic>
      </div>
    </section>
  )
}

export default CTA
