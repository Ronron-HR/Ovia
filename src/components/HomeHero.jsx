import { contact } from '../data/pricing.js'
import { cta, home, links } from '../data/texts.js'
import PriceCalculator from './PriceCalculator.jsx'
import TourLauncher from './TourLauncher.jsx'

/**
 * FORSIDENS FØRSTE SKÆRMBILLEDE OG BEREGNEREN
 *
 * Heroen er kort: hvem det er til (virksomheder), hvad
 * man får, og to handlinger: "Se din pris" (hopper til beregneren, sidens
 * eneste blå knap her) og "Vis mig rundt" (rundvisningen). Ring og Mail er små
 * tekstlinks, så de ikke konkurrerer; de står også i nav og i den faste
 * bundbjælke på mobil.
 *
 * Beregneren (id="beregner" ligger inde i PriceCalculator) står i sin egen
 * sektion lige under, i fuld indholdsbredde på et lyst bånd, så kortet får den
 * plads, valgene og resultatet har brug for.
 */
export default function HomeHero() {
  const h = home.hero
  return (
    <>
      <section className="hero">
        <div className="shell">
          <div className="grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <h1 data-hero="lift" className="t-display t-hero max-w-[19ch]">
                {h.title}
              </h1>
              <p data-hero="lift" style={{ '--d': '80ms' }} className="t-body t-lead mt-5 max-w-[46ch] md:mt-6">
                {h.short}
              </p>

              <div data-hero="fade" style={{ '--d': '140ms' }} data-callbar-hide>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-9">
                  <a href="#beregner" className="btn btn-cta btn-lg">
                    {h.cta}
                  </a>
                  <TourLauncher className="btn btn-ghost btn-lg" />
                </div>
                <p className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-1 text-[16px]">
                  <a href={links.tel} className="link-underline hit font-medium text-ink">
                    {cta.call} <span className="tabular-nums">{contact.phone}</span>
                  </a>
                  <a href={links.mail} className="link-underline hit font-medium text-ink">
                    {cta.write}
                  </a>
                </p>
              </div>
            </div>

            <div data-hero="fade" style={{ '--d': '200ms' }} className="lg:col-span-5">
              <div className="facts">
                <h2 className="text-[19px] font-semibold tracking-tight">{h.factsTitle}</h2>
                <ul className="facts-list mt-3">
                  {h.facts.map((fact) => (
                    <li key={fact}>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="beregner-titel" className="calc-section">
        <div className="shell">
          <header className="max-w-[48rem]">
            <h2 id="beregner-titel" className="t-display t-h2">
              {home.calc.title}
            </h2>
            <p className="t-body t-lead mt-3 max-w-[56ch]">{home.calc.intro}</p>
          </header>
          <div className="mt-7 md:mt-9">
            <PriceCalculator />
          </div>
        </div>
      </section>
    </>
  )
}
