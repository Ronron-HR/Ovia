import { ydelser } from '../content.js'
import Annotated from './Annotated.jsx'
import BookingDemo from './BookingDemo.jsx'
import SearchSketch from './SearchSketch.jsx'

/**
 * YDELSER — tre områder, tre kompositioner.
 *
 * Hjemmesider er indgangen og fylder mest: en stor, annoteret optagelse af
 * en rigtig side. Booking står spejlvendt med det interaktive eksempel.
 * Synlighed forklarer tre veje, der ligner hinanden, men virker forskelligt,
 * med en skitse af en søgning ved siden af. Ingen otte lige store kort.
 *
 * Arket lægger sig over det mørke arbejdsafsnit (.sheet). Afgrænsningen står
 * ved hvert område, fordi den siger, hvad der IKKE er med.
 */
function Header({ eyebrow, title, body }) {
  return (
    <>
      <p className="t-eyebrow">{eyebrow}</p>
      <h3 className="t-display mt-4 text-[clamp(27px,3.2vw,40px)]">{title}</h3>
      <p className="t-body mt-5 max-w-[48ch] text-[17px]">{body}</p>
    </>
  )
}

function SpecList({ items }) {
  return (
    <div className="mt-7 max-w-[56ch]">
      <p className="t-eyebrow mb-3">{ydelser.labels.get}</p>
      <ul className="spec-list">
        {items.map((item) => (
          <li key={item}>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Limit({ text }) {
  return (
    <div className="mt-7 max-w-[56ch] text-[15px]">
      <p className="t-eyebrow">{ydelser.labels.limit}</p>
      <p className="t-body mt-1.5">{text}</p>
    </div>
  )
}

export default function Ydelser() {
  const { hjemmesider: h, booking: b, synlighed: s } = ydelser

  return (
    <section id={ydelser.id} className="sheet bg-paper">
      <div className="shell py-24 md:py-32">
        <header data-reveal className="max-w-[52ch]">
          <p className="t-eyebrow">{ydelser.eyebrow}</p>
          <h2 className="t-display mt-4 text-[clamp(30px,4vw,52px)]">{ydelser.title}</h2>
          <p className="t-body mt-5 text-[17px]">{ydelser.intro}</p>
        </header>

        <div className="mt-16 flex flex-col gap-24 md:mt-24 md:gap-32">
          {/* Hjemmesider: størst. */}
          <div id={h.id} className="grid grid-cols-1 gap-x-14 gap-y-12 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-5">
              <Header eyebrow={h.eyebrow} title={h.title} body={h.body} />
              <SpecList items={h.get} />
              <Limit text={h.limit} />
            </div>
            <div className="lg:col-span-7 lg:-mr-6 lg:pt-3">
              <Annotated />
            </div>
          </div>

          {/* Booking: eksemplet står først på bred skærm. */}
          <div id={b.id} className="grid grid-cols-1 gap-x-14 gap-y-12 lg:grid-cols-12 lg:items-start">
            <div className="lg:order-2 lg:col-span-5">
              <Header eyebrow={b.eyebrow} title={b.title} body={b.body} />
              <SpecList items={b.get} />
              <Limit text={b.limit} />
            </div>
            <div className="lg:order-1 lg:col-span-7">
              <div className="backdrop">
                <BookingDemo />
              </div>
            </div>
          </div>

          {/* Synlighed: tre veje. */}
          <div id={s.id} className="grid grid-cols-1 gap-x-14 gap-y-12 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <p className="t-eyebrow">{s.eyebrow}</p>
              <h3 className="t-display mt-4 max-w-[20ch] text-[clamp(27px,3.2vw,40px)]">{s.title}</h3>
              <p className="t-body mt-5 max-w-[52ch] text-[17px]">{s.body}</p>

              <dl className="mt-9 border-t border-ink">
                {s.rows.map((row) => (
                  <div
                    key={row.label}
                    className="grid gap-x-6 gap-y-2 border-b border-rule py-6 md:grid-cols-[170px_1fr]"
                  >
                    <dt className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-[11px] leading-none text-white"
                      >
                        {row.n}
                      </span>
                      <span>
                        <span className="t-eyebrow block">{row.kind}</span>
                        <span className="t-display mt-1 block text-[24px]">{row.label}</span>
                      </span>
                    </dt>
                    <dd className="t-body max-w-[52ch] text-[15px]">{row.text}</dd>
                  </div>
                ))}
              </dl>

              <Limit text={s.limit} />
            </div>

            <div className="lg:col-span-5 lg:pt-16">
              <SearchSketch />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
