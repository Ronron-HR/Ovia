import { fromPriceWithDrift, services } from '../data/pricing.js'
import { home } from '../data/texts.js'
import Amount from './Amount.jsx'
import { Arrow } from './Shots.jsx'

/**
 * Forsidens tre kort: Hjemmeside, Marketing, Booking & Google. Hele kortet er
 * ét link (ét tryk på mobil). "Fra"-prisen hentes fra pricing.js og står i
 * logoets skrift (Amount); resten er sidens skrift. Ingen tal foran kortene:
 * de er ikke en rækkefølge.
 */
export default function ServiceCards() {
  const c = home.cards
  return (
    <section aria-labelledby="ydelser-titel" className="section-y bg-paper-2">
      <div className="shell">
        <header data-reveal className="max-w-[48rem]">
          <h2 id="ydelser-titel" className="t-display t-h2">
            {c.title}
          </h2>
          <p className="t-body t-lead mt-3 max-w-[56ch]">{c.intro}</p>
        </header>

        <ul className="mt-8 grid grid-cols-1 gap-4 md:mt-10 md:grid-cols-3 md:gap-5">
          {c.items.map((item) => (
            <li key={item.href}>
              <a href={item.href} className="service-card group">
                <span className="t-display t-h4 block">{item.title}</span>
                <span className="t-body mt-3 block text-[16px]">{item.text}</span>
                <span className="flex items-end justify-between gap-4">
                  <span className="service-price amount-lg">
                    <Amount text={fromPriceWithDrift(services[item.service])} />
                  </span>
                  <span className="inline-flex items-center gap-2 text-[16px] font-semibold text-cta">
                    {c.more}
                    <Arrow className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
