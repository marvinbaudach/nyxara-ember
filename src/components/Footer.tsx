const links = [
  { label: 'Reserve', href: '#reserve' },
  { label: 'The build', href: '#' },
  { label: 'Contact', href: '#' },
  { label: 'Press', href: '#' },
]

export default function Footer() {
  return (
    <footer className="border-t border-hairline px-[8vw] pb-12 pt-[clamp(4rem,9vh,7rem)]">
      <div className="reveal-up mx-auto max-w-[1100px]">
        <div className="flex flex-col gap-12 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-none tracking-[0.04em]">
              NYX<span className="text-accent">A</span>RA
            </p>
            <p className="mt-4 max-w-[34ch] font-sans text-[0.95rem] text-muted">
              Ninety nine built in the dark. Then the tooling burns.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-10 gap-y-3">
            {links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                data-cursor
                className="group relative font-mono text-[0.72rem] uppercase tracking-[0.3em] text-ink transition-colors hover:text-accent"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-hairline pt-7 font-mono text-[0.68rem] uppercase tracking-[0.28em] text-muted md:flex-row md:justify-between">
          <span>&copy; 2026 Nyxara Motorwerke — a fictional concept</span>
          <span>Ember &middot; 01 / 99</span>
        </div>
      </div>
    </footer>
  )
}
