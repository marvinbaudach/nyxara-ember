// Reveals are driven by the native CSS `.reveal-up` view-timeline (index.css) —
// no JS, compositor only, with a fully-visible fallback where unsupported.
export default function ThesisCallout() {
  return (
    <section className="wrap py-[clamp(6rem,16vh,14rem)]">
      <h2 className="reveal-up max-w-[18ch] font-display text-[clamp(2.4rem,6.4vw,5.5rem)] font-normal leading-[1.02] tracking-[-0.01em]">
        Two point one seconds. Then the air <span className="text-accent">catches fire</span>.
      </h2>
    </section>
  )
}
