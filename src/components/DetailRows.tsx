interface Row { h: string; t: string }

// Not a spec sheet — those numbers live in SpecsCounter. These three rows are
// the covenant: what makes each Ember provably one of ninety-nine, not just fast.
const rows: Row[] = [
  {
    h: 'Timed and witnessed',
    t: 'Every figure on this page was timed on a sealed runway and signed off by two independent observers.',
  },
  {
    h: 'Etched into the sill',
    t: 'The owner’s name and the date of the car’s first night run would be laser cut into the sill. It is the only place the Ember says who it belongs to.',
  },
  {
    h: 'Closed at ninety-nine',
    t: 'At the ninety ninth car the tooling would be destroyed at the final build. There is no continuation series, no revival, no hundredth.',
  },
]

export default function DetailRows() {
  return (
    <section className="wrap py-[clamp(5rem,11vh,9rem)]">
      <h2 className="mb-[clamp(2.5rem,6vh,4.5rem)] font-display text-[clamp(2rem,4.5vw,3.75rem)] font-normal leading-[1.05]">
        The covenant
      </h2>
      {rows.map((r) => (
        <div
          key={r.h}
          className="grid items-baseline gap-x-[clamp(1.5rem,5vw,5rem)] gap-y-4 border-t border-hairline py-[clamp(2rem,5vh,4rem)] md:grid-cols-[0.9fr_1.1fr]"
        >
          <h3 className="font-display text-[clamp(1.6rem,3.4vw,2.8rem)] font-normal leading-[1.05]">{r.h}</h3>
          <p className="max-w-[46ch] font-sans text-[1.05rem] text-muted">{r.t}</p>
        </div>
      ))}
    </section>
  )
}
