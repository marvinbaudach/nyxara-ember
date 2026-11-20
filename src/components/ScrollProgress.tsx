import { motion, useScroll, useSpring } from 'framer-motion'

// A hairline ember meter pinned to the top edge, scaling with page progress.
// Subtle, but it gives the long scroll a sense of momentum and place.
//
// Where the browser supports CSS scroll timelines we drive it entirely in CSS
// (`.scroll-progress`, see index.css) — zero JS, runs on the compositor. Older
// browsers fall back to the Framer scroll spring below.
const supportsScrollTimeline =
  typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()')

const BAR_CLASS =
  'fixed inset-x-0 top-0 z-[65] h-[2px] origin-left bg-accent'

export default function ScrollProgress() {
  if (supportsScrollTimeline) {
    return <div aria-hidden className={`scroll-progress ${BAR_CLASS}`} />
  }
  return <FramerProgress />
}

const FramerProgress = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })

  return <motion.div aria-hidden className={BAR_CLASS} style={{ scaleX }} />
}
