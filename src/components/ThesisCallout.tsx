// Reveals are driven by the native CSS `.reveal-up` view-timeline (index.css) —
// no JS, compositor only, with a fully-visible fallback where unsupported.
export default function ThesisCallout() {
  return (
    <section className="mx-auto max-w-[min(92vw,62rem)] px-[8vw] py-[clamp(8rem,18vh,16rem)] text-center">
      <h2 className="reveal-up font-display text-[clamp(2.4rem,7vw,6rem)] font-normal leading-[1.02] tracking-[-0.01em]">
        Two point one seconds. Then the air <span className="text-accent">catches fire</span>.
      </h2>
      <p className="reveal-up mx-auto mt-10 max-w-[46ch] font-sans text-[1.12rem] text-muted">
        The Ember pushes 1340 horsepower through twin afterburners.
        Built for the few who treat the horizon as a dare.
      </p>
    </section>
  )
}
