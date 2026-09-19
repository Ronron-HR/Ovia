import { proces } from '../content.js'

/**
 * SIGNATURE MOMENT 06 — TÆLLEVÆRKET
 *
 * Numrene er ikke pynt — det her er en faktisk rækkefølge, og rækkefølgen
 * er pointen i sektionen. Derfor får tallet vægt: blæk i stedet for ler,
 * og et mekanisk rul på plads, når trinnet kommer til syne.
 *
 * Tallet er sat i Inter og ikke i display-serif'en. Det er ikke en smag,
 * det er en begrænsning: Instrument Serif har kun vægt 400, så en fed
 * serif ville være browserens syntetiske efterligning. Inters wght-akse
 * går til 900, så 700 her er ægte. Se @font-face i index.css.
 *
 * Bevægelsen bor i motion.css. Selve rullen hænger på <li>-ets [data-reveal],
 * så der kun er ét tidsforløb i sektionen.
 */

/* Opløbet: cifrene lige før målet, så hjulet ruller som et tælleværk frem
   for bare at stige. Længden er den samme for alle fire tal — et opløb,
   der voksede med tallet, ville få 04 til at rulle fire gange så langt
   som 01 og ødelægge fornemmelsen af én maskine. */
const RUN = 2
const runUp = (digit) =>
  Array.from({ length: RUN + 1 }, (_, k) => (Number(digit) - RUN + k + 10) % 10)
export default function Proces() {
  return (
    <section id={proces.id} className="bg-paper">
      <div className="shell py-24 md:py-36">
        <header className="max-w-[40ch]">
          <p data-reveal className="t-eyebrow eyebrow-rule">
            {proces.eyebrow}
          </p>
          <h2
            data-reveal="lg"
            style={{ '--d': '60ms' }}
            className="t-display mt-5 text-[clamp(30px,5.2vw,54px)]"
          >
            {proces.title}
          </h2>
        </header>

        <ol className="mt-14 md:mt-20">
          {proces.steps.map((step, i) => (
            <li
              key={step.title}
              data-reveal
              style={{ '--d': `${Math.min(i, 4) * 60}ms` }}
              className="rule grid grid-cols-12 gap-x-6 gap-y-2 py-8 last:border-b last:border-rule md:py-10"
            >
              {/* Hjulene er aria-hidden: en oplæser ville ellers læse
                  opløbscifrene med og sige "otte ni nul" i stedet for
                  "nul". Tallet selv står som skjult tekst ved siden af,
                  så det annonceres præcis som før. */}
              <span
                aria-hidden="true"
                className="odo col-span-12 mb-1 text-[28px] leading-none font-bold tracking-[-0.02em] text-ink md:col-span-2 md:mb-0 md:text-[34px]"
              >
                {String(i + 1)
                  .padStart(2, '0')
                  .split('')
                  .map((digit, j) => (
                    <span key={j} className="odo-wheel" style={{ '--odo-d': `${j * 60}ms` }}>
                      <span className="odo-strip">
                        {runUp(digit).map((d) => (
                          <span key={d} className="odo-cell">
                            {d}
                          </span>
                        ))}
                      </span>
                    </span>
                  ))}
              </span>
              <span className="sr-only">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="t-display col-span-12 text-[26px] md:col-span-4 md:text-[32px]">
                {step.title}
              </h3>
              <p className="t-body col-span-12 max-w-[52ch] text-[15px] md:col-span-6">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
