import { useRef } from 'react'
import type { ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

// Magnetic pull: the child eases toward the cursor while hovered, then springs
// home on leave. Used to make the primary CTA feel attracted to the pointer.
interface MagneticProps {
  children: ReactNode
  strength?: number
  className?: string
}

export default function Magnetic({ children, strength = 0.4, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.5 })

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => { x.set(0); y.set(0) }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
