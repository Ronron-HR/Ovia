import { useState } from 'react'
import { demoById } from '../content.demos.js'
import { SalonArt, SalonMark } from './art.jsx'
import DemoShell from './DemoShell.jsx'
import { DemoHero, ItemList, Notice } from './kit.jsx'

/**
 * SALONDEMO — fiktiv. Grå, knækket hvid og en diskret grøn accent.
 * Behandlinger med eksempelpriser og et lokalt bookingeksempel. Bookingen
 * reserverer intet og sender intet.
 */

const links = [
  { label: 'Behandlinger', href: '#behandlinger' },
  { label: 'Book tid', href: '#book' },
  { label: 'Åbningstider', href: '#tider' },
]

const treatments = [
  { id: 'klip-dame', name: 'Klip, dame', price: '495 kr.', meta: '45 min.' },
  { id: 'klip-herre', name: 'Klip, herre', price: '350 kr.', meta: '30 min.' },
  { id: 'klip-barn', name: 'Klip, barn', price: '250 kr.', meta: '30 min.' },
  { id: 'toner', name: 'Toning', price: '650 kr.', meta: '60 min.' },
  { id: 'farve', name: 'Helfarvning', price: '1.050 kr.', meta: '120 min.' },
  { id: 'highlights', name: 'Highlights', price: '1.350 kr.', meta: '150 min.' },
  { id: 'kur', name: 'Hårkur', price: '250 kr.', meta: '30 min.' },
  { id: 'massage', name: 'Hovedbundsmassage', price: '200 kr.', meta: '20 min.' },
  { id: 'foen', name: 'Føn og styling', price: '280 kr.', meta: '30 min.' },
]

const groups = [
  { title: 'Klip', ids: ['klip-dame', 'klip-herre', 'klip-barn'] },
  { title: 'Farve', ids: ['toner', 'farve', 'highlights'] },
  { title: 'Pleje og styling', ids: ['kur', 'massage', 'foen'] },
]

const days = ['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag']
const slots = [
  { t: '09.00', taken: false },
  { t: '10.30', taken: true },
  { t: '12.00', taken: false },
  { t: '13.30', taken: false },
  { t: '15.00', taken: true },
  { t: '16.30', taken: false },
]

function Booking() {
  const [treatment, setTreatment] = useState('')
  const [day, setDay] = useState('')
  const [slot, setSlot] = useState('')
  const [name, setName] = useState('')
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)

  const submit = (e) => {
    e.preventDefault()
    const found = {}
    if (!treatment) found.treatment = 'Vælg en behandling.'
    if (!day) found.day = 'Vælg en dag.'
    if (!slot) found.slot = 'Vælg et tidspunkt.'
    if (!name.trim()) found.name = 'Skriv et navn.'
    setErrors(found)
    if (Object.keys(found).length) {
      setNotice(null)
      return
    }
    const t = treatments.find((x) => x.id === treatment)
    setNotice({
      title: 'Demo: der er ikke booket noget.',
      text: `Eksemplet viser, hvordan det kunne se ud: ${t.name} (${t.meta}) ${day.toLowerCase()} kl. ${slot} til ${name.trim()}. Der er ingen salon bag formularen, og der er sendt ingenting.`,
    })
  }

  return (
    <div className="dm-card" data-reveal>
      <form onSubmit={submit} noValidate className="dm-form" aria-label="Book tid (demo)">
        <fieldset className="dm-choices">
          <legend>1. Vælg behandling</legend>
          {treatments.map((t) => (
            <label key={t.id} className="dm-choice">
              <input type="radio" name="treatment" value={t.id} checked={treatment === t.id} onChange={() => setTreatment(t.id)} />
              <span>
                <span>{t.name}</span>
                <span className="dm-meta">
                  {t.meta} · {t.price}
                </span>
              </span>
            </label>
          ))}
          {errors.treatment && <p className="dm-error">{errors.treatment}</p>}
        </fieldset>

        <fieldset className="dm-choices">
          <legend>2. Vælg dag</legend>
          <div className="dm-slots">
            {days.map((d) => (
              <label key={d} className="dm-choice">
                <input type="radio" name="day" value={d} checked={day === d} onChange={() => setDay(d)} />
                <span>{d}</span>
              </label>
            ))}
          </div>
          {errors.day && <p className="dm-error">{errors.day}</p>}
        </fieldset>

        <fieldset className="dm-choices">
          <legend>3. Vælg tidspunkt</legend>
          <div className="dm-slots">
            {slots.map((s) => (
              <label key={s.t} className="dm-choice">
                <input
                  type="radio"
                  name="slot"
                  value={s.t}
                  disabled={s.taken}
                  checked={slot === s.t}
                  onChange={() => setSlot(s.t)}
                />
                <span>
                  {s.t}
                  {s.taken && <span className="sr-only"> (optaget)</span>}
                </span>
              </label>
            ))}
          </div>
          {errors.slot && <p className="dm-error">{errors.slot}</p>}
        </fieldset>

        <div>
          <label htmlFor="salon-name" className="dm-label">
            4. Dit navn
          </label>
          <input
            id="salon-name"
            type="text"
            className="dm-input"
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? 'salon-name-error' : undefined}
          />
          {errors.name && (
            <p id="salon-name-error" className="dm-error">
              {errors.name}
            </p>
          )}
        </div>

        <button type="submit" className="dm-btn">
          Book tid (demo)
        </button>
        <p className="dm-inline-note">Eksempel: intet bliver booket, og der sendes ingenting.</p>
        <Notice notice={notice} />
      </form>
    </div>
  )
}

export default function Salon() {
  const project = demoById('salon')
  return (
    <DemoShell project={project} links={links} logo={<SalonMark />} footer="Salondemo · Demogade 12 · Fiktiv by">
      <main id="main">
        <DemoHero>
          <div className="dm-wrap dm-hero-grid">
            <div>
              <p className="dm-eyebrow">Fiktiv salon · eksempelindhold</p>
              <h1 className="dm-h1 mt-4">Klip, farve og ro i stolen.</h1>
              <p className="dm-lead">
                En enkel side, hvor kunden finder sin behandling, ser en eksempelpris og får et indtryk af, hvordan booking kan se ud.
              </p>
              <div className="dm-actions">
                <a href="#book" className="dm-btn">
                  Se bookingeksemplet
                </a>
                <a href="#behandlinger" className="dm-btn dm-btn-ghost">
                  Behandlinger
                </a>
              </div>
            </div>
            <div data-par="-34">
              <SalonArt />
            </div>
          </div>
        </DemoHero>

        <section id="behandlinger" className="dm-section">
          <div className="dm-wrap">
            <div className="dm-section-head" data-reveal>
              <p className="dm-eyebrow">Behandlinger</p>
              <h2 className="dm-h2">Det, vi tilbyder.</h2>
            </div>
            <div style={{ display: 'grid', gap: 40 }} className="md:grid-cols-3">
              {groups.map((g) => (
                <div key={g.title}>
                  <h3 className="dm-h3" style={{ paddingBottom: 6, borderBottom: '2px solid var(--dm-fg)' }}>
                    {g.title}
                  </h3>
                  <ItemList
                    meta
                    items={g.ids.map((id) => {
                      const t = treatments.find((x) => x.id === id)
                      return { name: t.name, price: t.price, meta: t.meta }
                    })}
                  />
                </div>
              ))}
            </div>
            <p className="dm-note">Eksempelpriser. Behandlinger og priser er opdigtet.</p>
          </div>
        </section>

        <section id="book" className="dm-section" style={{ background: 'var(--dm-soft)' }}>
          <div className="dm-wrap dm-hero-grid" style={{ alignItems: 'start' }}>
            <div>
              <p className="dm-eyebrow">Book tid</p>
              <h2 className="dm-h2 mt-3">Sådan kan en booking se ud.</h2>
              <p className="dm-lead">
                Vælg behandling, dag og tid, og se beskeden til kunden. Det er et lokalt eksempel: intet bliver booket, og der sendes ingenting.
              </p>
            </div>
            <Booking />
          </div>
        </section>

        <section id="tider" className="dm-section">
          <div className="dm-wrap">
            <div className="dm-section-head" data-reveal>
              <p className="dm-eyebrow">Åbningstider</p>
              <h2 className="dm-h2">Kom forbi.</h2>
            </div>
            <table className="dm-hours">
              <caption className="sr-only">Åbningstider (eksempel)</caption>
              <tbody>
                <tr>
                  <th scope="row">Mandag–fredag</th>
                  <td>09.00–17.30</td>
                </tr>
                <tr>
                  <th scope="row">Lørdag</th>
                  <td>09.00–14.00</td>
                </tr>
                <tr>
                  <th scope="row">Søndag</th>
                  <td>Lukket</td>
                </tr>
              </tbody>
            </table>
            <p className="dm-note">Eksempeltider. Demoen er ikke en rigtig salon.</p>
          </div>
        </section>
      </main>
    </DemoShell>
  )
}
