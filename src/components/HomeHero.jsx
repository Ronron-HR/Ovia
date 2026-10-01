import { about, home } from '../data/texts.js'
import ContactButtons from './ContactButtons.jsx'
import PriceCalculator from './PriceCalculator.jsx'
import { Arrow, Pic } from './Shots.jsx'

/**
 * FORSIDENS FØRSTE SKÆRMBILLEDE — skal kunne forstås på 10 sekunder:
 * hvad jeg gør (én sætning), hvem man taler med, Ring/Skriv og prisen.
 *
 * Prisberegneren står i heroen: til højre for overskriften på desktop (synlig
 * uden at scrolle ved 1440 px) og lige under Ring/Skriv på mobil. Det er den
 * samme komponent som på /priser/ og ydelsessiderne. Portrættet står i Om;
 * her er kun det lille ved "Du taler med mig". Indgangen er ren CSS (motion.css).
 */
export default function HomeHero() {
  const h = home.hero
  return (
    <section className="relative pt-[calc(var(--nav-h)+28px)] pb-14 md:pt-[calc(var(--nav-h)+48px)] md:pb-20">
      <div className="shell">
        {/* Mobil: tekst → beregner → "Du taler med mig". Desktop: tekst og "Du taler
            med mig" til venstre, beregneren til højre over begge rækker. */}
        <div className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-y-6">
          <div className="lg:col-span-6 lg:pt-4">
            <p data-hero="fade" className="t-eyebrow t-eyebrow-accent">
              {h.eyebrow}
            </p>
            <h1
              data-hero="fade"
              style={{ '--d': '60ms' }}
              className="t-display mt-4 max-w-[20ch] text-[clamp(2rem,3.6vw,3.25rem)] leading-[1.04]"
            >
              {h.title}
            </h1>
            <p data-hero="fade" style={{ '--d': '140ms' }} className="t-body t-lead mt-5 max-w-[46ch]">
              {h.lead}
            </p>

            <div data-hero="fade" style={{ '--d': '220ms' }} data-callbar-hide>
              <ContactButtons className="mt-7" stretch />
            </div>
          </div>

          <div data-hero="fade" style={{ '--d': '180ms' }} className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1">
            <PriceCalculator />
          </div>

          <div data-hero="fade" style={{ '--d': '300ms' }} className="lg:col-span-6 lg:row-start-2">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <p className="flex items-center gap-3 text-[15px] text-ink">
                <span className="block size-11 shrink-0 overflow-hidden rounded-full bg-paper-2">
                  <Pic image={about.portrait} eager alt="" sizes="44px" className="h-full w-full object-cover object-top" />
                </span>
                {h.who}
              </p>
              <a href={h.prices.href} className="btn-text inline-flex items-center gap-2 text-[15px] font-medium">
                {h.prices.label}
                <Arrow />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
