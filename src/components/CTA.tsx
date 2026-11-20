// Primary action, shown as a concept: aria-disabled keeps it focusable so the
// note it points to is reachable, and it carries no hover fill or press state.
const ReserveButton = ({ children, describedBy }: { children: string; describedBy: string }) => (
  <button
    type="button"
    aria-disabled="true"
    aria-describedby={describedBy}
    className="cursor-default border border-accent bg-transparent px-10 py-4 font-sans text-[1.05rem] font-medium text-ink"
  >
    {children}
  </button>
)

const CTA = () => {
  return (
    <section id="reserve" className="wrap scroll-mt-24 py-[clamp(6rem,13vh,12rem)]">
      <p className="font-mono text-[0.8rem] uppercase tracking-[0.3em] text-accent">Concept only</p>
      <h2 className="mt-6 max-w-[24ch] font-display text-[clamp(2rem,4.5vw,3.75rem)] font-normal leading-[1.03]">
        Ninety nine cars, <span className="text-accent">one build night</span> each.
      </h2>
      <p className="mt-6 max-w-[44ch] font-sans text-[1.08rem] text-muted">
        On paper, ninety nine cars would be built, each finished with one night drive. No cars exist and nothing is for sale.
      </p>
      <div className="mt-10">
        <ReserveButton describedBy="reserve-note">View the concept</ReserveButton>
        <p id="reserve-note" className="mt-4 max-w-[44ch] font-sans text-[0.9rem] text-muted">
          This is a design concept. Nothing can be ordered.
        </p>
      </div>
    </section>
  )
}

export default CTA
