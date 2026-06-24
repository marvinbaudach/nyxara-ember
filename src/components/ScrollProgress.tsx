import { motion, useScroll, useSpring } from 'framer-motion'

// A hairline ember meter pinned to the top edge, scaling with page progress.
// Subtle, but it gives the long scroll a sense of momentum and place.
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[65] h-[2px] origin-left bg-gradient-to-r from-accent via-[oklch(0.78_0.2_55)] to-accent"
      style={{ scaleX, boxShadow: '0 0 12px oklch(0.685 0.19 45 / 0.6)' }}
    />
  )
}
