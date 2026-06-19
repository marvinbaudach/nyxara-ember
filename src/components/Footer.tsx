import { motion } from 'framer-motion'
import { ease } from '../anim'

export default function Footer() {
  return (
    <footer className="border-t border-hairline px-[8vw] py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease }}
        className="mx-auto flex max-w-[1100px] flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left"
      >
        <p className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-none tracking-[0.04em]">
          NYXARA
        </p>
        <p className="font-sans text-[0.78rem] uppercase tracking-[0.3em] text-muted">
          Ember &middot; Ninety nine built in the dark
        </p>
      </motion.div>
    </footer>
  )
}
