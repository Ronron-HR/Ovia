import { process } from '../data/offer.js'

/**
 * FORLØB: fem trin som en lodret tidslinje (afklaring, aftalt omfang,
 * udkast og godkendelse, lancering, løbende hjælp). Fra lg står overskriften til
 * venstre og tidslinjen til højre; under lg ligger de under hinanden. Tal er på
 * sin plads, fordi indholdet er en rækkefølge: tallet står i prikken (skjult for
 * skærmlæsere, som får nummeret fra <ol>). Genbruges på ydelsessiderne.
 */
export default function Steps({ data = process, id = 'forloeb', tone = 'grey' }) {
  return (
    <section id={id} aria-labelledby={`${id}-titel`} className={`section-y ${tone === 'grey' ? 'bg-paper-2' : 'bg-paper'}`}>
      <div className="shell">
        <div className="grid grid-cols-1 gap-x-14 gap-y-9 lg:grid-cols-12">
          <header data-reveal className="lg:col-span-4">
            {data.eyebrow && <p className="t-eyebrow t-eyebrow-strong">{data.eyebrow}</p>}
            <h2 id={`${id}-titel`} className="t-display t-h2 mt-3 max-w-[16ch]">
              {data.title}
            </h2>
          </header>

          <ol className="steps lg:col-span-7 lg:col-start-6">
            {data.items.map((step, i) => (
              <li key={step.title} data-reveal style={{ '--d': `${i * 60}ms` }} className="step">
                <span className="step-dot" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="pt-1.5">
                  <h3 className="t-display t-h4">{step.title}</h3>
                  <p className="t-body mt-2 max-w-[56ch] text-[16px]">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
