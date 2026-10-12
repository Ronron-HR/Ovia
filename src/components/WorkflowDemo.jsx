import { useId, useRef, useState } from 'react'
import ErrorText from './ErrorText.jsx'

/**
 * DEMO AF EN ARBEJDSGANG: catering-/selskabsforespørgsler. Ren frontend: en formular (dato, antal
 * personer, type og ønsker) lægger en forespørgsel i et overblik med status (Ny, Besvaret,
 * Tilbud sendt, Afvist) og én intern påmindelse pr. forespørgsel, når et tilbud er sendt.
 *
 * DETTE ER IKKE ET FÆRDIGT SYSTEM. Intet sendes, intet gemmes (kun React-state), og alt nulstilles,
 * når siden genindlæses. De tre forespørgsler fra start er opdigtede eksempler. En forespørgsel er
 * ikke en bekræftet reservation. Mærket "Demo" står synligt øverst.
 *
 * Forudrenderes som en statisk, læsbar tilstand (ingen window/document/dato under render).
 * Tastatur: almindelige felter, en select pr. status og knapper. Placeres af D:
 *   import WorkflowDemo from '../components/WorkflowDemo.jsx'
 *   <WorkflowDemo />
 * Styles: klasser fra index.css (.btn, .field, .badge, .t-*) og designtokens; ingen egne farver.
 */

const STATUSES = ['Ny', 'Besvaret', 'Tilbud sendt', 'Afvist']
const TYPES = ['Fødselsdag', 'Firmaarrangement', 'Konfirmation', 'Andet selskab']
const MONTHS = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december']
const MAX_WISHES = 300
const MAX_PEOPLE = 500

const text = {
  label: 'Demo, ikke et færdigt system',
  title: 'Sådan kan en arbejdsgang se ud',
  intro:
    'Et eksempel på, hvordan forespørgsler på selskaber kan samles ét sted, så du kan se status og ved, hvad du skal følge op på. Prøv selv: udfyld formularen, og skift status.',
  disclaimer:
    'Det her er en demo. Intet sendes, og intet gemmes: alt forsvinder, når du genindlæser siden. De tre forespørgsler er opdigtede eksempler. En forespørgsel er ikke en bekræftet reservation.',
  formTitle: 'Ny forespørgsel',
  date: 'Dato',
  people: 'Antal personer',
  type: 'Type af arrangement',
  wishes: 'Ønsker',
  optional: '(valgfrit)',
  add: 'Tilføj til overblikket',
  errDate: 'Vælg en dato.',
  errPeople: `Skriv et antal personer mellem 1 og ${MAX_PEOPLE}.`,
  overviewTitle: 'Overblik',
  example: 'Eksempel',
  yours: 'Din demo',
  status: 'Status',
  reminderTitle: 'Intern påmindelse',
  reminder: 'Følg op på tilbuddet.',
  reminderDone: 'Påmindelsen er markeret som gjort.',
  markDone: 'Marker som gjort',
  none: 'Ingen forespørgsler endnu.',
  noWishes: 'Ingen særlige ønsker',
}

const EXAMPLES = [
  { id: 1, example: true, type: 'Fødselsdag', date: '2027-03-13', people: 24, wishes: 'Vegetarisk menu til fire personer.', status: 'Ny', reminder: null },
  { id: 2, example: true, type: 'Firmaarrangement', date: '2027-03-19', people: 40, wishes: 'Frokost, der kan leveres lidt før kl. 12.', status: 'Besvaret', reminder: null },
  { id: 3, example: true, type: 'Konfirmation', date: '2027-04-24', people: 60, wishes: 'Buffet. Ingen nødder.', status: 'Tilbud sendt', reminder: 'open' },
]

/** "2027-03-13" → "13. marts 2027" (manuelt, så server og browser giver samme tekst). */
function formatDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  return `${Number(m[3])}. ${MONTHS[Number(m[2]) - 1]} ${m[1]}`
}

export default function WorkflowDemo() {
  const id = useId()
  const [items, setItems] = useState(EXAMPLES)
  const [errors, setErrors] = useState({})
  const [announce, setAnnounce] = useState('')
  const nextId = useRef(EXAMPLES.length + 1)
  const formRef = useRef(null)

  const counts = STATUSES.map((s) => [s, items.filter((i) => i.status === s).length])

  const submit = (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const date = String(data.get('date') ?? '')
    const people = Number(data.get('people'))
    const next = {}
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) next.date = text.errDate
    if (!Number.isInteger(people) || people < 1 || people > MAX_PEOPLE) next.people = text.errPeople
    setErrors(next)
    if (next.date || next.people) {
      formRef.current?.querySelector(next.date ? '[name=date]' : '[name=people]')?.focus()
      return
    }
    const item = {
      id: nextId.current++,
      example: false,
      type: String(data.get('type')),
      date,
      people,
      wishes: String(data.get('wishes') ?? '').trim().slice(0, MAX_WISHES),
      status: 'Ny',
      reminder: null,
    }
    setItems((list) => [item, ...list])
    setAnnounce(`${item.type} den ${formatDate(date)} er lagt i overblikket med status Ny.`)
    formRef.current?.reset()
  }

  const setStatus = (itemId, status) => {
    setItems((list) =>
      list.map((i) => {
        if (i.id !== itemId) return i
        // Én intern påmindelse pr. forespørgsel: den oprettes, når et tilbud er sendt.
        const reminder = status === 'Tilbud sendt' ? (i.reminder ?? 'open') : status === 'Afvist' ? null : i.reminder
        return { ...i, status, reminder }
      }),
    )
    const item = items.find((i) => i.id === itemId)
    setAnnounce(`Status for ${item.type} den ${formatDate(item.date)} er nu ${status}.`)
  }

  const doneReminder = (itemId) => {
    setItems((list) => list.map((i) => (i.id === itemId ? { ...i, reminder: 'done' } : i)))
    setAnnounce(text.reminderDone)
  }

  return (
    <section className="wfd rounded-[var(--radius-panel)] border border-rule-strong bg-surface p-5 md:p-8" aria-labelledby={`${id}-titel`} data-workflow-demo>
      <div className="flex flex-wrap items-center gap-3">
        <span className="badge badge-ink">{text.label}</span>
      </div>
      <h3 id={`${id}-titel`} className="t-display t-h3 mt-3">
        {text.title}
      </h3>
      <p className="t-body mt-2 max-w-[62ch] text-[16px]">{text.intro}</p>
      <p className="mt-3 max-w-[62ch] rounded-[var(--radius-btn)] border border-rule-strong bg-paper-2 px-4 py-3 text-[15px] text-ink">{text.disclaimer}</p>

      <div className="mt-7 grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <form ref={formRef} onSubmit={submit} noValidate className="flex flex-col gap-4" aria-label={text.formTitle}>
          <h4 className="text-[17px] font-medium">{text.formTitle}</h4>
          <div>
            <label htmlFor={`${id}-dato`} className="block text-[15px] font-medium">
              {text.date}
            </label>
            <input
              id={`${id}-dato`}
              name="date"
              type="date"
              required
              aria-invalid={errors.date ? 'true' : undefined}
              aria-describedby={errors.date ? `${id}-dato-fejl` : undefined}
              className="field mt-2"
            />
            {errors.date && (
              <ErrorText id={`${id}-dato-fejl`} className="mt-2 text-[14px]">
                {errors.date}
              </ErrorText>
            )}
          </div>
          <div>
            <label htmlFor={`${id}-antal`} className="block text-[15px] font-medium">
              {text.people}
            </label>
            <input
              id={`${id}-antal`}
              name="people"
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_PEOPLE}
              required
              aria-invalid={errors.people ? 'true' : undefined}
              aria-describedby={errors.people ? `${id}-antal-fejl` : undefined}
              className="field mt-2"
            />
            {errors.people && (
              <ErrorText id={`${id}-antal-fejl`} className="mt-2 text-[14px]">
                {errors.people}
              </ErrorText>
            )}
          </div>
          <div>
            <label htmlFor={`${id}-type`} className="block text-[15px] font-medium">
              {text.type}
            </label>
            <select id={`${id}-type`} name="type" defaultValue={TYPES[0]} className="field mt-2">
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor={`${id}-oensker`} className="block text-[15px] font-medium">
              {text.wishes} <span className="font-normal text-muted">{text.optional}</span>
            </label>
            <textarea id={`${id}-oensker`} name="wishes" rows={3} maxLength={MAX_WISHES} className="field mt-2" />
          </div>
          <div>
            <button type="submit" className="btn btn-primary w-full sm:w-auto">
              {text.add}
            </button>
          </div>
        </form>

        <div>
          <h4 className="text-[17px] font-medium">{text.overviewTitle}</h4>
          <ul className="t-body mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[14px]" aria-label="Antal pr. status">
            {counts.map(([s, n]) => (
              <li key={s}>
                {s}: <span className="font-medium text-ink tabular-nums">{n}</span>
              </li>
            ))}
          </ul>
          {items.length === 0 ? (
            <p className="t-body mt-4 text-[15px]">{text.none}</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {items.map((i) => (
                <li key={i.id} className="rounded-[var(--radius-card)] border border-rule bg-paper p-4" data-demo-item>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <p className="text-[16px] font-medium">
                      {i.type} <span className="font-normal text-muted">({i.example ? text.example.toLowerCase() : text.yours.toLowerCase()})</span>
                    </p>
                    <span className="badge">{i.status}</span>
                  </div>
                  <p className="t-body mt-1 text-[15px]">
                    {formatDate(i.date)} · {i.people} personer
                  </p>
                  <p className="t-body mt-1 text-[14px]">{i.wishes || text.noWishes}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <label htmlFor={`${id}-status-${i.id}`} className="text-[14px] font-medium">
                      {text.status}
                    </label>
                    <select
                      id={`${id}-status-${i.id}`}
                      value={i.status}
                      onChange={(e) => setStatus(i.id, e.target.value)}
                      className="field max-w-[220px]"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  {i.reminder && (
                    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[var(--radius-btn)] bg-paper-2 px-3 py-2 text-[14px]">
                      <span>
                        <span className="font-medium">{text.reminderTitle}:</span> {i.reminder === 'done' ? text.reminderDone : text.reminder}
                      </span>
                      {i.reminder === 'open' && (
                        <button type="button" onClick={() => doneReminder(i.id)} className="btn btn-ghost">
                          {text.markDone}
                        </button>
                      )}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {announce}
      </p>
    </section>
  )
}
