import { nav } from '../content.js'

/**
 * Minimal nav: mærke til venstre, ét CTA til højre.
 *
 * Den er ikke synlig i heroen. Når lagovergangen er færdig, fader den ind
 * og bliver liggende — z-50 holder den over alle lag. Synligheden styres
 * af data-nav på :root, sat af useLayer, så der ikke re-renderes pr. frame.
 */
export default function Nav() {
  return (
    <header className="nav fixed inset-x-0 top-0 z-50 border-b border-rule bg-paper">
      <div className="shell flex h-[var(--nav-h)] items-center justify-between gap-6">
        <a
          href="#hero"
          className="t-display text-[22px] leading-none tracking-tight text-ink"
        >
          {nav.brand}
        </a>

        <a
          href={nav.cta.href}
          className="btn border border-ink px-4 py-2 text-[13px] font-medium text-ink hover:bg-ink hover:text-paper"
        >
          {nav.cta.label}
        </a>
      </div>
    </header>
  )
}
