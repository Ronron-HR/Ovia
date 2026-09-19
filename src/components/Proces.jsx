import { proces } from '../content.js'

/**
 * Trinene er en faktisk rækkefølge, så hvert trin har en lille label over
 * overskriften: "TRIN 01" i Instrument Serif (kun vægt 400 — ingen syntetisk
 * fed), versaler, dæmpet grå, samme afdæmpede stemme som sektionens eyebrow.
 *
 * data-step: hvert trin tænder for sig, når DET SELV er nået op i skærmen
 * (se useReveal) — ingen indeksbaseret forsinkelse. Kommer trin 2 først
 * ind i billedet, når man scroller ned til det, afsløres det først da.
 */
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
              data-step
              className="rule grid grid-cols-12 gap-x-6 gap-y-2 py-8 last:border-b last:border-rule md:py-10"
            >
              <span className="t-eyebrow font-display col-span-12 text-[14px]">
                Trin {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="t-display col-span-12 text-[26px] md:col-span-5 md:text-[32px]">
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
