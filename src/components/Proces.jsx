import { proces } from '../content.js'

/**
 * Standard-reveal. Numrene er ikke pynt — det her er en faktisk rækkefølge,
 * og rækkefølgen er pointen i sektionen.
 */
export default function Proces() {
  return (
    <section id={proces.id} className="bg-paper">
      <div className="shell py-24 md:py-36">
        <header className="max-w-[40ch]">
          <p data-reveal className="t-eyebrow">
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
              <span className="t-display col-span-12 text-[18px] text-accent md:col-span-2 md:text-[22px]">
                {String(i + 1).padStart(2, '0')}
              </span>
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
