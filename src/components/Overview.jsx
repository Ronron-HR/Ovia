import { overview } from '../content.js'
import { Arrow } from './Shots.jsx'

/**
 * OVERBLIK OVER YDELSERNE (forsiden)
 *
 * Tre indgange, ikke en liste over alt: Hjemmesider er den store flade med
 * knappen til beregneren; Marketing og Integrationer står ved siden af som to
 * mindre flader med links til deres undersider. Detaljerne ligger på
 * undersiderne og gentages ikke her.
 */
export default function Overview() {
  const { main, groups } = overview

  return (
    <section id="ydelser" className="on-grey">
      <div className="shell section-y">
        <header data-reveal className="max-w-[54ch]">
          <p className="t-eyebrow t-eyebrow-accent">{overview.eyebrow}</p>
          <h2 className="t-display t-h2 mt-4">{overview.title}</h2>
          <p className="t-body t-lead mt-5">{overview.intro}</p>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-5 md:mt-14 lg:grid-cols-12">
          <div
            data-reveal
            className="flex flex-col justify-between rounded-[var(--radius-panel)] bg-ink p-7 text-paper md:p-10 lg:col-span-6"
          >
            <div className="on-dark">
              <p className="t-eyebrow t-eyebrow-accent">
                {main.n} <span aria-hidden="true">·</span> {main.title}
              </p>
              <h3 className="t-display t-h3 mt-4 max-w-[16ch]">{main.title}</h3>
              <p className="t-body mt-5 max-w-[42ch] text-[16px]">{main.text}</p>
            </div>
            <div className="on-dark mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a href={main.calc.href} className="btn btn-primary">
                {main.calc.label}
                <Arrow />
              </a>
              <a href={main.cta.href} className="btn btn-text">
                {main.cta.label}
                <Arrow />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:col-span-6">
            {groups.map((g, i) => (
              <div
                key={g.title}
                data-reveal
                style={{ '--d': `${(i + 1) * 90}ms` }}
                className="flex-1 rounded-[var(--radius-panel)] border border-rule bg-paper p-7 md:p-9"
              >
                <p className="t-eyebrow">
                  {g.n} <span aria-hidden="true">·</span> {g.title}
                </p>
                <p className="t-display t-h4 mt-3 max-w-[30ch]">{g.text}</p>
                <ul className="mt-5 border-t border-rule">
                  {g.links.map((l) => (
                    <li key={l.href} className="border-b border-rule">
                      <a
                        href={l.href}
                        className="group flex min-h-12 items-center justify-between gap-4 py-2 text-[16px] font-medium text-ink"
                      >
                        <span>
                          {l.label}
                          {l.note && <span className="ml-2 text-[13px] font-normal text-muted">{l.note}</span>}
                        </span>
                        <Arrow className="text-accent" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
