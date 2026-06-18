import { motion } from 'framer-motion'

const rows = [
  {
    n: '01',
    h: 'Two point one to sixty',
    t: 'Launch control puts 1340 horsepower down in 2.1 seconds, verified on a sealed runway with two witnesses.',
  },
  {
    n: '02',
    h: 'Three hundred ten, then it stops',
    t: 'Aero shrouds close over the wheels at speed. The Ember holds 310 mph before the limiter speaks.',
  },
  {
    n: '03',
    h: 'Ninety nine cars, ever',
    t: 'Production ends at ninety nine. Each sill is laser etched with the owner name and the night it first ran.',
  },
]

export default function DetailRows() {
  return (
    <section className="mx-auto max-w-[1100px] px-[8vw] py-[clamp(5rem,12vh,12rem)]">
      {rows.map((r, i) => (
        <motion.div
          key={r.n}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-12%' }}
          transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-[auto_1fr] items-baseline gap-[clamp(1.5rem,5vw,5rem)] border-t border-hairline py-[clamp(2rem,5vh,4rem)] md:grid-cols-[auto_0.9fr_1.1fr]"
        >
          <span className="font-display text-[clamp(1.4rem,2.4vw,2.2rem)] text-accent">{r.n}</span>
          <h3 className="font-display text-[clamp(1.6rem,3.4vw,2.8rem)] font-normal leading-[1.05]">{r.h}</h3>
          <p className="col-start-2 max-w-[46ch] font-sans text-[1.05rem] text-muted md:col-start-3">{r.t}</p>
        </motion.div>
      ))}
    </section>
  )
}
