// Primary action: a flat bordered button that fills on hover and presses on click.
const ReserveButton = ({ children }: { children: string }) => (
  <button
    type="button"
    data-cursor
    className="border border-accent bg-transparent px-10 py-4 font-sans text-[1.05rem] font-medium text-ink transition-[background-color,color,transform] duration-200 hover:bg-accent hover:text-bg active:translate-y-px"
  >
    {children}
  </button>
)

const CTA = () => {
  return (
    <section id="reserve" className="wrap scroll-mt-24 py-[clamp(6rem,13vh,12rem)]">
      <p className="font-mono text-[0.8rem] uppercase tracking-[0.3em] text-accent">Reservations open</p>
      <h2 className="mt-6 max-w-[24ch] font-display text-[clamp(2rem,4.5vw,3.75rem)] font-normal leading-[1.03]">
        Claim a <span className="text-accent">build night</span>.
      </h2>
      <p className="mt-6 max-w-[44ch] font-sans text-[1.08rem] text-muted">
        A refundable deposit holds one of ninety nine slots. We build in the order the deposits land.
      </p>
      <div className="mt-10">
        <ReserveButton>Request your Ember</ReserveButton>
      </div>
    </section>
  )
}

export default CTA
