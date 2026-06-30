export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-hairline px-[8vw] pb-12 pt-[clamp(4rem,9vh,7rem)]">
      {/* Warm coal-light pooling up from the base — the page's last breath of fire. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-[radial-gradient(120%_100%_at_50%_120%,oklch(0.30_0.12_48/0.5),transparent_62%)]"
      />

      <div className="reveal-up relative mx-auto max-w-[1100px]">
        {/* A single line — the closing whisper before the name. */}
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="inline-flex items-center gap-2.5 font-mono text-[0.66rem] uppercase tracking-[0.28em] text-muted">
            <span aria-hidden className="dot-coal relative h-2 w-2 rounded-full bg-accent" />
            Build status — live in the dark
          </p>
          <p className="max-w-[40ch] font-sans text-[clamp(1rem,2.2vw,1.35rem)] leading-snug text-ink/80">
            Ninety nine built in the dark. Then the tooling burns.
          </p>
        </div>

        {/* Oversized full-bleed wordmark — the closing frame of the film, and the only place the name is spoken aloud. */}
        <a
          href="#main"
          data-cursor
          aria-label="Back to top"
          className="group mt-[clamp(3rem,7vh,6rem)] block select-none"
        >
          <span className="block whitespace-nowrap text-center font-display font-light leading-[0.8] tracking-[0.02em] text-[clamp(3.5rem,15.5vw,15rem)] text-ink/90 transition-colors duration-500 group-hover:text-ink">
            NYX<span className="ember-glow text-accent">A</span>RA
          </span>
        </a>

        <div className="mt-12 flex flex-col gap-3 border-t border-hairline pt-7 font-mono text-[0.68rem] uppercase tracking-[0.28em] text-muted md:flex-row md:items-center md:justify-between">
          <span>&copy; 2026 Nyxara Motorwerke — a fictional concept</span>
          <span className="hidden md:inline">Ember &middot; 01 / 99</span>
          <a
            href="#main"
            data-cursor
            className="group inline-flex items-center gap-2 text-ink transition-colors hover:text-accent"
          >
            Back to top
            <span aria-hidden className="transition-transform duration-300 group-hover:-translate-y-0.5">
              &uarr;
            </span>
          </a>
        </div>
      </div>
    </footer>
  )
}
