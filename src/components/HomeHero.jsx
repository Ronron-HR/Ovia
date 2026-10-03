import { contact } from '../data/pricing.js'
import { cta, home, links } from '../data/texts.js'
import PriceCalculator from './PriceCalculator.jsx'

/**
 * FORSIDENS FØRSTE SKÆRMBILLEDE: overskrift, én kort linje og prisberegneren.
 * Beregneren er det dominerende element: til højre og bredest på desktop
 * (hele første trin synligt ved 1440 px) og lige under linjen på mobil
 * (overskrift og alle tre valg synlige ved 360 og 390 px). Ring og Mail er
 * små tekstlinks, så de ikke konkurrerer med beregneren; de står også i nav og
 * i den faste bundbjælke. Intet portræt her (det står i Om).
 */
export default function HomeHero() {
  const h = home.hero
  return (
    <section className="relative pt-[calc(var(--nav-h)+16px)] pb-12 md:pt-[calc(var(--nav-h)+40px)] md:pb-20">
      <div className="shell">
        <div className="grid grid-cols-1 gap-x-12 gap-y-5 lg:grid-cols-12 lg:items-start lg:gap-y-8">
          <div className="lg:col-span-5 lg:pt-6">
            <h1
              data-hero="lift"
              className="t-display max-w-[20ch] text-[clamp(1.5rem,6.2vw,1.75rem)] leading-[1.08] lg:text-[clamp(2.25rem,3.2vw,3rem)] lg:leading-[1.04]"
            >
              {h.title}
            </h1>
            <p data-hero="lift" style={{ '--d': '80ms' }} className="t-body mt-2.5 max-w-[42ch] text-[16px] lg:mt-5 lg:text-[18px]">
              {h.short}
            </p>
            <p
              data-hero="fade"
              style={{ '--d': '140ms' }}
              data-callbar-hide
              className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[15px] lg:mt-6"
            >
              <a href={links.tel} className="link-underline hit font-medium text-ink">
                {cta.call} <span className="tabular-nums">{contact.phone}</span>
              </a>
              <a href={links.mail} className="link-underline hit font-medium text-ink">
                {cta.write}
              </a>
            </p>
          </div>

          <div data-hero="fade" style={{ '--d': '120ms' }} className="lg:col-span-7">
            <PriceCalculator />
          </div>
        </div>
      </div>
    </section>
  )
}
