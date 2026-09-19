import { hero } from '../content.js'
import Slot from './Slot.jsx'

/**
 * SIGNATURE MOMENT 01 — HERO LOAD
 *
 * Koreografien er ren CSS (se motion.css) og starter på første frame,
 * uafhængigt af React. Delays sættes her, fordi det er her, rækkefølgen
 * giver mening at læse:
 *
 *   0ms    overskrift linje 1   ── typografien leder
 *   70ms   overskrift linje 2
 *   140ms  underrubrik
 *   220ms  portræt              ── billedet er anden stemme
 *   380ms  CTA
 *   460ms  nav (mærket bor der; se motion.css)
 *
 * Linje 1 står reelt læsbar efter ~300ms. Kravet er 400ms.
 *
 * LINJELÅSEN: antallet af maskerede rækker er låst til to af strukturen —
 * hero.lines skal være præcis to strenge. Overskriften får hele bredden,
 * så de to strenge også bliver til to VISUELLE linjer på desktop.
 * På mobil brækker række 1 til to linjer (3 i alt, som aftalt) og rejser
 * sig som én blok. Koreografien kan altså ikke brække, uanset hvor lang
 * din endelige tekst bliver — kun antallet af visuelle linjer flytter sig.
 */
export default function Hero() {
  return (
    <section id="hero" className="layer-sticky bg-paper">
      <div className="layer-sink flex flex-1 flex-col justify-center">
        <div className="shell w-full py-10 md:py-14">
          {/* Loftet på 80px er ikke tilfældigt: det er den største grad,
              hvor en linje på ~29 tegn stadig holder på én linje i den
              fulde bredde. Skriver du længere linjer, skal loftet ned. */}
          <h1 className="t-display text-[clamp(32px,7vw,80px)]">
            {hero.lines.map((line, i) => (
              <span key={line} className="mask">
                <span className="hero-rise" style={{ '--d': `${i * 70}ms` }}>
                  {line}
                </span>
              </span>
            ))}
          </h1>

          {/* Underrubrik og CTA ligger i SAMME kolonne. Lå de i hver sin
              gridcelle, ville portrættets højde gøre rækken høj og
              efterlade et tomt hul mellem dem. */}
          <div className="mt-6 grid grid-cols-12 gap-x-6 gap-y-8 md:mt-10">
            <div className="col-span-12 md:col-span-6 md:row-start-1">
              <p
                data-hero="fade"
                style={{ '--d': '140ms' }}
                className="t-body max-w-[48ch] text-[15px] md:text-[17px]"
              >
                {hero.deck}
              </p>

              <div
                data-hero="fade"
                style={{ '--d': '380ms' }}
                className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 md:mt-9"
              >
                <a
                  href={hero.primary.href}
                  className="btn bg-ink px-6 py-3.5 text-[14px] font-medium text-paper hover:bg-accent"
                >
                  {hero.primary.label}
                </a>
                {hero.secondary && (
                  <a
                    href={hero.secondary.href}
                    className="link-underline text-[14px] font-medium text-ink"
                  >
                    {hero.secondary.label}
                  </a>
                )}
              </div>
            </div>

            {/* Heroen bæres af typografien. Portrættet er en lille,
                forskudt detalje ved siden af — derfor tre kolonner yderst
                til højre, et loft på 26svh og en nedrykning, så det
                bevidst ikke flugter med tekstblokken. */}
            <div className="col-span-4 md:col-span-3 md:col-start-10 md:row-start-1 md:mt-12">
              <div data-hero="media" style={{ '--d': '220ms' }} className="mask ml-auto w-full">
                <div data-hero="media-inner" style={{ '--d': '220ms' }}>
                  <Slot
                    image={hero.portrait}
                    maxVh={26}
                    priority
                    framed
                    className="ml-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
