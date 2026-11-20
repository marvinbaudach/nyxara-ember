export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-hairline pb-12 pt-[clamp(4rem,9vh,7rem)]">
      <div className="wrap">
        <p className="mx-auto mb-[clamp(3rem,7vh,6rem)] max-w-[40ch] text-pretty text-center font-sans text-[clamp(1rem,2.2vw,1.35rem)] leading-snug text-ink/80">
          Built in the dark. Then the tooling burns.
        </p>

        {/* Oversized wordmark — the closing frame of the film. */}
        <p
          className="select-none whitespace-nowrap text-center font-display font-light leading-[0.8] tracking-[0.02em] text-[clamp(3.5rem,15.5vw,15rem)] text-ink/90"
        >
          NYX<span className="text-accent">A</span>RA
        </p>

        <div className="mt-12 flex flex-col gap-3 border-t border-hairline pt-7 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-muted md:flex-row md:items-center md:justify-between">
          <span>&copy; 2026 Nyxara Motorwerke. A fictional concept.</span>
          <a
            href="#main"
            data-cursor
            className="text-ink transition-colors hover:text-accent"
          >
            Back to top
          </a>
        </div>
      </div>
    </footer>
  )
}
