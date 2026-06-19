import { motion } from 'framer-motion'

// Full-screen branded loading veil. Stays until the hero video is actually
// playing, so the visitor never sees the poster image pop to video.
export default function Preloader() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-50 grid place-items-center bg-bg"
    >
      <div className="text-center">
        <p className="pl-[0.5em] font-display text-[clamp(2rem,6vw,3.5rem)] tracking-[0.5em] text-ink">
          NYXARA
        </p>
        <div className="mx-auto mt-8 h-px w-48 overflow-hidden bg-hairline">
          <motion.div
            className="h-full w-1/3 bg-accent"
            animate={{ x: ['-120%', '320%'] }}
            transition={{ repeat: Infinity, duration: 1.15, ease: 'easeInOut' }}
          />
        </div>
        <p className="mt-5 font-sans text-[0.7rem] uppercase tracking-[0.3em] text-muted">Loading</p>
      </div>
    </motion.div>
  )
}
