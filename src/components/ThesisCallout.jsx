import { motion } from 'framer-motion'

export default function ThesisCallout() {
  return (
    <section className="mx-auto max-w-[min(92vw,62rem)] px-[8vw] py-[clamp(8rem,18vh,16rem)] text-center">
      <motion.h2
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-[clamp(2.4rem,7vw,6rem)] font-normal leading-[1.02] tracking-[-0.01em]"
      >
        Two point one seconds. Then the air <span className="text-accent">catches fire</span>.
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-15%' }}
        transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto mt-10 max-w-[46ch] font-sans text-[1.12rem] text-muted"
      >
        The Ember pushes 1340 horsepower through twin afterburners.
        Built for the few who treat the horizon as a dare.
      </motion.p>
    </section>
  )
}
