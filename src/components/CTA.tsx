import { useRef, useState } from 'react'
import type { MouseEvent, ReactNode } from 'react'

// Premium button reflex: a radial specular sheen tracks the cursor across the
// button surface, computed from live mouse coordinates.
function SheenButton({ children }: { children: ReactNode }) {
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
      onMouseMove={onMove}
      onMouseEnter={() => setLit(true)}
      onMouseLeave={() => setLit(false)}
      className="group relative overflow-hidden rounded-full border border-accent/40 bg-bg-lift px-12 py-5 font-sans text-[1.05rem] font-medium tracking-[0.02em] text-ink transition-colors"
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

export default function CTA() {
  return (
    <section className="relative px-[8vw] py-[clamp(7rem,16vh,16rem)] text-center">
      <p className="font-sans text-[0.78rem] uppercase tracking-[0.42em] text-muted">Reservations open</p>
      <h2 className="mx-auto mt-6 max-w-[18ch] font-display text-[clamp(2.4rem,6vw,5rem)] font-normal leading-[1.03]">
        Claim a <span className="text-accent">build night</span>.
      </h2>
      <p className="mx-auto mt-6 max-w-[44ch] font-sans text-[1.08rem] text-muted">
        A refundable deposit holds one of ninety nine slots. We build in the order the deposits land.
      </p>
      <div className="mt-12">
        <SheenButton>Request your Ember</SheenButton>
      </div>
    </section>
  )
}
