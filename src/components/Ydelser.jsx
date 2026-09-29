import { ydelser } from '../content.js'
import { setTopic } from '../topic.js'
import AreaNav from './AreaNav.jsx'
import BookingDemo from './BookingDemo.jsx'
import SearchSketch from './SearchSketch.jsx'
import { Arrow } from './Shots.jsx'

/**
 * YDELSER — tre områder, tre kompositioner.
 *
 * Tilbuddet er organiseret efter kundens behov og ikke som en liste over alt,
 * jeg kan:
 *   01 Hjemmesider og booking       tekst til venstre, interaktivt eksempel til højre
 *   02 Systemer og automatisering   varm grå flade, fire eksempler i to søjler
 *   03 Synlighed og annoncering     tre veje som rækker, søgeskitse til højre
 *
 * Alt her er tilbud, ikke færdige kundecases (examplesNote). Hvert område har
 * en kontaktknap, der forvælger emnet i formularen (se topic.js), og en linje
 * om pris og forventninger: hvad der aftales, og hvad der betales separat.
 *
 * Sektionen ligger under det mørke arbejdsafsnit, som skubber ind over den
 * (.under-sheet / .sheet).
 */
function Area({ n, eyebrow, title, body }) {
  return (
    <>
      <p className="t-eyebrow t-eyebrow-accent">
        {n} <span aria-hidden="true">·</span> {eyebrow}
      </p>
      <h3 className="t-display t-h3 mt-4 max-w-[22ch]">{title}</h3>
      <p className="t-body t-lead mt-5 max-w-[50ch]">{body}</p>
    </>
  )
}

function Price({ text }) {
  return (
    <div className="mt-8 max-w-[56ch] text-[15px]">
      <p className="t-eyebrow">{ydelser.labels.price}</p>
      <p className="t-body mt-2">{text}</p>
    </div>
  )
}

function Cta({ cta, className = '' }) {
  return (
    <a
      href="#kontakt"
      onClick={() => setTopic(cta.topic)}
      className={`btn btn-primary ${className}`}
    >
      {cta.label}
      <Arrow />
    </a>
  )
}

function Next({ to }) {
  const item = ydelser.areaNav.items.find((i) => i.id === to)
  return (
    <a href={`#${to}`} className="next-area link-underline mt-4">
      {ydelser.areaNav.next}: {item.long}
      <svg aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v10M4 9l4 4 4-4" /></svg>
    </a>
  )
}

export default function Ydelser() {
  const { hjemmesider: h, systemer: s, synlighed: v } = ydelser

  return (
    <section
      id={ydelser.id}
      className="under-sheet bg-paper pt-[var(--space-section)]"
      style={{ '--pad-b': '5rem' }}
    >
      <div className="shell">
        <header data-reveal className="max-w-[54ch]">
          <p className="t-eyebrow t-eyebrow-accent">{ydelser.eyebrow}</p>
          <h2 className="t-display t-h2 mt-4">{ydelser.title}</h2>
          <p className="t-body t-lead mt-5">{ydelser.intro}</p>
        </header>

        <AreaNav />

        {/* 01 Hjemmesider og booking */}
        <div
          id={h.id}
          className="scroll-mt-[calc(var(--nav-h)+72px)] mt-[var(--space-block)] grid grid-cols-1 gap-x-14 gap-y-12 lg:grid-cols-12 lg:items-start"
        >
          <div className="lg:col-span-5">
            <Area n={h.n} eyebrow={h.eyebrow} title={h.title} body={h.body} />

            <div className="mt-8 max-w-[56ch]">
              <p className="t-eyebrow mb-3">{ydelser.labels.examples}</p>
              <ul className="spec-list">
                {h.examples.map((item) => (
                  <li key={item}>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="t-body mt-3 text-[13px]">{ydelser.examplesNote}</p>
            </div>

            <Price text={h.price} />
            <div className="mt-7">
              <Cta cta={h.cta} />
            </div>
            <Next to="systemer" />
          </div>

          <div className="lg:col-span-7">
            <div className="backdrop">
              <BookingDemo />
            </div>
          </div>
        </div>

        {/* 02 Systemer og automatisering: grå flade, ingen kort. */}
        <div
          id={s.id}
          className="scroll-mt-[calc(var(--nav-h)+72px)] on-grey mt-[var(--space-block)] rounded-[var(--radius-panel)] px-6 py-12 md:px-12 md:py-16 lg:px-16"
        >
          <div className="grid grid-cols-1 gap-x-14 gap-y-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Area n={s.n} eyebrow={s.eyebrow} title={s.title} body={s.body} />
              <Price text={s.price} />
              <div className="mt-7">
                <Cta cta={s.cta} />
              </div>
              <Next to="synlighed" />
            </div>

            <div className="lg:col-span-7">
              <p className="t-eyebrow">{ydelser.labels.examples}</p>
              <dl className="mt-3 grid grid-cols-1 gap-x-10 border-t border-ink sm:grid-cols-2">
                {s.items.map((item) => (
                  <div key={item.title} className="border-b border-rule py-6">
                    <dt className="t-display t-h4">{item.title}</dt>
                    <dd className="t-body mt-2 text-[15px]">{item.text}</dd>
                  </div>
                ))}
              </dl>
              <p className="t-body mt-3 text-[13px]">{ydelser.examplesNote}</p>
            </div>
          </div>
        </div>

        {/* 03 Synlighed og annoncering */}
        <div
          id={v.id}
          className="scroll-mt-[calc(var(--nav-h)+72px)] mt-[var(--space-block)] grid grid-cols-1 gap-x-14 gap-y-12 lg:grid-cols-12 lg:items-start"
        >
          <div className="lg:col-span-7">
            <Area n={v.n} eyebrow={v.eyebrow} title={v.title} body={v.body} />

            <dl className="mt-9 border-t border-ink">
              {v.rows.map((row) => (
                <div
                  key={row.label}
                  className="grid gap-x-6 gap-y-2 border-b border-rule py-6 md:max-lg:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr]"
                >
                  <dt className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[12px] leading-none font-medium text-white"
                    >
                      {row.n}
                    </span>
                    <span>
                      <span className="t-eyebrow block">{row.kind}</span>
                      <span className="t-display t-h4 mt-1 block">{row.label}</span>
                    </span>
                  </dt>
                  <dd className="t-body max-w-[52ch] text-[15px]">{row.text}</dd>
                </div>
              ))}
            </dl>

            <Price text={v.price} />
            <div className="mt-7">
              <Cta cta={v.cta} />
            </div>
            <Next to="andet" />
          </div>

          <div className="lg:col-span-5 lg:pt-16">
            <SearchSketch />
          </div>
        </div>

        {/* Åben indgang til andre opgaver. */}
        <div
          id="andet"
          data-reveal
          className="scroll-mt-[calc(var(--nav-h)+72px)] mt-[var(--space-block)] grid grid-cols-1 items-center gap-x-14 gap-y-7 border-t border-ink pt-10 lg:grid-cols-12"
        >
          <p className="t-display t-h4 max-w-[38ch] lg:col-span-8 lg:text-[26px]">
            {ydelser.open.text}
          </p>
          <div className="lg:col-span-4 lg:justify-self-end">
            <Cta cta={ydelser.open.cta} />
          </div>
        </div>
      </div>
    </section>
  )
}
