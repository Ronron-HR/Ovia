import { home } from '../data/texts.js'

/**
 * "Sådan foregår det": tre trin på en linje (desktop) eller en lodret
 * tidslinje (mobil). Genbruges på ydelsessiderne med egne trin.
 */
export default function Steps({ data = home.steps, id = 'forloeb', tone = 'grey' }) {
  return (
    <section id={id} aria-labelledby={`${id}-titel`} className={`section-y ${tone === 'grey' ? 'bg-paper-2' : 'bg-paper'}`}>
      <div className="shell">
        <header data-reveal className="max-w-[40ch]">
          <p className="t-eyebrow t-eyebrow-accent">{data.eyebrow}</p>
          <h2 id={`${id}-titel`} className="t-display t-h2 mt-4">
            {data.title}
          </h2>
        </header>

        <ol className="steps mt-10 grid grid-cols-1 md:mt-14 md:grid-cols-3 md:gap-8">
          {data.items.map((step, i) => (
            <li key={step.title} data-reveal style={{ '--d': `${i * 90}ms` }} className="step">
              <span className="step-dot" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h3 className="t-display t-h4">
                  <span className="sr-only">Trin {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="t-body mt-2 max-w-[38ch] text-[16px]">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
