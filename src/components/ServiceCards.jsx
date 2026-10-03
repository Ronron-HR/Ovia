import { fromPrice, services } from '../data/pricing.js'
import { home } from '../data/texts.js'
import { Arrow } from './Shots.jsx'

/**
 * Forsidens tre kort: Hjemmeside, Marketing, Booking & Google. Hele kortet er
 * ét link (ét tryk på mobil). "Fra"-prisen hentes fra pricing.js.
 */
export default function ServiceCards() {
  const c = home.cards
  return (
    <section aria-labelledby="ydelser-titel" className="section-y bg-paper">
      <div className="shell">
        <header data-reveal className="max-w-[40ch]">
          <p className="t-eyebrow t-eyebrow-accent">{c.eyebrow}</p>
          <h2 id="ydelser-titel" className="t-display t-h2 mt-4">
            {c.title}
          </h2>
        </header>

        <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {c.items.map((item, i) => (
            <li key={item.href} data-reveal style={{ '--d': `${i * 70}ms` }}>
              <a href={item.href} className="service-card group">
                <span className="flex items-baseline justify-between gap-4">
                  <span aria-hidden="true" className="font-mono text-[12px] tracking-[0.08em] text-muted">0{i + 1}</span>
                  <span className="text-[14px] font-medium text-accent">{fromPrice(services[item.service])}</span>
                </span>
                <span className="t-display t-h4 mt-8 block md:mt-12">{item.title}</span>
                <span className="t-body mt-3 block text-[15px]">{item.text}</span>
                <span className="inline-flex items-center gap-2 text-[15px] font-medium text-ink">
                  {c.more}
                  <Arrow className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
