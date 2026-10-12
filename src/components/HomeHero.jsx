import { contact } from '../data/pricing.js'
import { cta, home, links } from '../data/texts.js'
import Amount from './Amount.jsx'
import Icon from './Icon.jsx'
import { Arrow } from './Shots.jsx'

/**
 * FORSIDENS FØRSTE SKÆRMBILLEDE
 *
 * Værdi og målgruppe (overskrift og forklaring), hovedtilbuddet (tilbudslinjen med
 * opstart, månedspris og minimumsperiode, og under den minimumsbetalingen; altid
 * ved siden af abonnementet og aldrig under en "gratis"-overskrift) og kontakt:
 * "Se priser" (sidens ene blå knap her) og "Ring". Mail og eksempler er små
 * tekstlinks. Alle tal bygges i texts.js af pricing.js. Ingen beregner her:
 * den står i sin egen sektion længere nede (Home.jsx).
 *
 * Knapperne og kontaktlinjen er data-callbar-hide, så den faste bundbjælke på
 * mobil ikke står oven i dem.
 */
export default function HomeHero() {
  const h = home.hero
  const offer = h.offer
  return (
    <section className="hero" aria-labelledby="hero-titel">
      <div className="shell">
        <div className="grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">
            <h1 id="hero-titel" data-hero="lift" className="t-display t-hero max-w-[18ch]">
              {h.title}
            </h1>
            <p data-hero="lift" style={{ '--d': '80ms' }} className="t-body t-lead mt-5 max-w-[52ch] md:mt-6">
              {h.short}
            </p>

            <div data-hero="fade" style={{ '--d': '140ms' }}>
              <div className="offer" role="group" aria-labelledby="tilbud-titel">
                <p id="tilbud-titel" className="t-eyebrow">
                  {offer.heading}
                </p>
                <p className="offer-main mt-1.5">
                  <Amount text={offer.line} />
                </p>
                <p className="offer-sub">
                  <Amount text={offer.minimum} serif={false} />
                </p>
                <p className="mt-3 text-[14px] text-muted">{offer.note}</p>
              </div>

              <div data-callbar-hide>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-8">
                  <a href={h.ctaHref} className="btn btn-cta btn-lg">
                    {h.cta}
                    <Arrow />
                  </a>
                  <a href={links.tel} className="btn btn-ghost btn-lg">
                    <Icon name="phone" size={20} />
                    <span>
                      {cta.call} <span className="tabular-nums">{contact.phone}</span>
                    </span>
                  </a>
                </div>
                <p className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-[16px]">
                  <a href={h.secondary.href} className="link-underline hit font-medium text-ink">
                    {h.secondary.label}
                  </a>
                  <a href={links.mail} className="link-underline hit font-medium text-ink">
                    {cta.write}
                  </a>
                  <a href={offer.link.href} className="link-underline hit font-medium text-ink">
                    {offer.link.label}
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div data-hero="fade" style={{ '--d': '200ms' }} className="lg:col-span-5">
            <div className="card card-panel p-6 md:p-8">
              <h2 className="t-display t-h4">{h.factsTitle}</h2>
              <ul className="spec-list mt-4 gap-3.5 text-[17px]">
                {h.facts.map((fact) => (
                  <li key={fact} className="!text-[16px]">
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
