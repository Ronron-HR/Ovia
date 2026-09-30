import { Fragment } from 'react'
import { hero } from '../content.js'
import Calculator from './Calculator.jsx'

/**
 * FØRSTE SKÆRMBILLEDE
 *
 * En kort overskrift og forklaring, og selve prisberegneren lige ved siden af:
 * første spørgsmål står med det samme, og kunden kan gå fra første valg til
 * prisresultat uden at forlade forsiden. Ingen beløb og ingen fra-priser her:
 * prisen vises først som resultat i beregneren.
 *
 * Desktop: tekst til venstre og beregner til højre. Mobil: overskrift, kort
 * forklaring og så straks første spørgsmål; "Se demoer" kommer efter
 * beregneren. De store demoer følger under heroen (DemoTeasers).
 *
 * Beregneren er den samme komponent som på /prisberegner/ (Calculator.jsx) og
 * deler tilstand med den (calcStore.js). Den ændrer ikke forsidens adresse.
 *
 * Koreografien er ren CSS (se motion.css) og starter på første frame,
 * uafhængigt af React.
 */
export default function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-x-clip pt-[calc(var(--nav-h)+28px)] pb-10 md:pb-14 lg:pt-[calc(var(--nav-h)+36px)] lg:pb-16"
    >
      <div className="shell relative z-10">
        <div className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-5 lg:row-start-1">
            <p data-hero="fade" className="t-eyebrow t-eyebrow-accent">
              {hero.eyebrow}
            </p>

            <h1 className="t-display mt-5 text-[clamp(2.25rem,3.9vw,3.5rem)] leading-[1.05]">
              {hero.lines.map((line, i) => (
                <Fragment key={line}>
                  {/* Mellemrummet gør, at rækkerne læses som ét udsagn. */}
                  {i > 0 && ' '}
                  <span className="mask">
                    <span className="hero-rise" style={{ '--d': `${i * 80}ms` }}>
                      {line}
                    </span>
                  </span>
                </Fragment>
              ))}
            </h1>

            <p data-hero="fade" style={{ '--d': '200ms' }} className="t-body t-lead mt-6 max-w-[46ch]">
              {hero.deck}
            </p>
          </div>

          <div
            data-hero="fade"
            style={{ '--d': '260ms' }}
            className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1"
          >
            <Calculator compact />
          </div>

          <div
            data-hero="fade"
            style={{ '--d': '360ms' }}
            className="flex flex-col gap-4 lg:col-span-5 lg:row-start-2"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <a href={hero.secondary.href} className="btn btn-ghost">
                {hero.secondary.label}
              </a>
            </div>
            <p className="text-[14px] text-muted">
              {hero.other.text}{' '}
              <a href={hero.other.href} className="link-underline hit font-medium text-ink">
                {hero.other.label}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
