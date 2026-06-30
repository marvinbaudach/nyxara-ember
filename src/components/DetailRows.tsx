interface Row { n: string; h: string; t: string }

// Not a spec sheet — those numbers live in SpecsCounter. These three rows are
// the covenant: what makes each Ember provably one of ninety nine, not just fast.
const rows: Row[] = [
  {
    n: '01',
    h: 'Witnessed, not claimed',
    t: 'Every figure on this page was timed on a sealed runway and signed off by two independent observers. No press launch, no estimates.',
  },
  {
    n: '02',
    h: 'Etched, not badged',
    t: 'Your name and the date of the car’s first night run are laser cut into the sill — the only place the Ember will ever say who it belongs to.',
  },
  {
    n: '03',
    h: 'Closed, not paused',
    t: 'At the ninety ninth car the tooling is destroyed in front of the owners. There is no continuation series, no revival, no hundredth.',
  },
]

export default function DetailRows() {
  return (
    <section className="mx-auto max-w-[1100px] px-[8vw] py-[clamp(5rem,11vh,9rem)]">
      <p className="reveal-up mb-[clamp(2.5rem,6vh,4.5rem)] font-mono text-[0.7rem] uppercase tracking-[0.5em] text-accent">
        The covenant
      </p>
      {rows.map((r) => (
        <div
          key={r.n}
          className="reveal-up grid grid-cols-[auto_1fr] items-baseline gap-[clamp(1.5rem,5vw,5rem)] border-t border-hairline py-[clamp(2rem,5vh,4rem)] md:grid-cols-[auto_0.9fr_1.1fr]"
        >
          <span className="font-display text-[clamp(1.4rem,2.4vw,2.2rem)] text-accent">{r.n}</span>
          <h3 className="font-display text-[clamp(1.6rem,3.4vw,2.8rem)] font-normal leading-[1.05]">{r.h}</h3>
          <p className="col-start-2 max-w-[46ch] font-sans text-[1.05rem] text-muted md:col-start-3">{r.t}</p>
        </div>
      ))}
    </section>
  )
}
