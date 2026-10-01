import { about, home } from '../data/texts.js'
import ContactButtons from './ContactButtons.jsx'
import { Arrow, Pic } from './Shots.jsx'

/**
 * FORSIDENS FØRSTE SKÆRMBILLEDE — skal kunne forstås på 10 sekunder:
 * hvad jeg gør (én sætning), hvem man taler med, og to knapper.
 *
 * De fleste kommer hertil fra et link efter et fysisk besøg, så ansigtet er
 * med: på mobil som et lille portræt ved "Du taler med mig", på desktop som
 * et større billede til højre. Indgangen er ren CSS (motion.css).
 */
export default function HomeHero() {
  const h = home.hero
  return (
    <section className="relative pt-[calc(var(--nav-h)+36px)] pb-14 md:pt-[calc(var(--nav-h)+64px)] md:pb-20">
      <div className="shell">
        <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p data-hero="fade" className="t-eyebrow t-eyebrow-accent">
              {h.eyebrow}
            </p>
            <h1 data-hero="fade" style={{ '--d': '60ms' }} className="t-display t-hero mt-5 max-w-[20ch]">
              {h.title}
            </h1>
            <p data-hero="fade" style={{ '--d': '140ms' }} className="t-body t-lead mt-6 max-w-[48ch]">
              {h.lead}
            </p>

            <div data-hero="fade" style={{ '--d': '220ms' }} data-callbar-hide>
              <ContactButtons className="mt-8" stretch />
            </div>

            <div data-hero="fade" style={{ '--d': '300ms' }} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <p className="flex items-center gap-3 text-[15px] text-ink">
                <span className="block size-11 shrink-0 overflow-hidden rounded-full bg-paper-2 lg:hidden">
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

          <figure data-hero="media" style={{ '--d': '200ms' }} className="hidden lg:col-span-4 lg:block">
            <div className="overflow-hidden rounded-[var(--radius-panel)] bg-paper-2">
              <Pic image={about.portrait} eager sizes="360px" className="block h-auto w-full" />
            </div>
            <figcaption className="mt-3 font-mono text-[12px] tracking-[0.06em] text-muted uppercase">
              Ronny Hong · OviaSpecs
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  )
}
