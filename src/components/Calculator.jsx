import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  businessTypes,
  calc,
  calcHref,
  composeCalcParts,
  demoById,
  formatKr,
  mailtoFrom,
  paths,
  priceFor,
  pricing,
  purposes,
  site,
} from '../content.js'
import { useSearch } from '../useSearch.js'
import { Arrow } from './Shots.jsx'

/**
 * PRISBEREGNER — kun selve hjemmesiden.
 *
 * Ét trin ad gangen:
 *   1  virksomhedstype og formål (ændrer ikke prisen)
 *   2  antal sider, forsiden med
 *   3  resultat: pris, valgt løsning og leveranceoversigt
 *
 * Prisen vises først på trin 3 og kræver ingen kontaktoplysninger. Prisen kommer
 * fra priceFor() i content.js: samme logik overalt, og ét sted at ændre den.
 * Mere end seks sider, webshop og specialudvikling giver "Særskilt tilbud" og
 * aldrig en pris, der stopper på 5.000 kr.
 *
 * Valgene lever i adresselinjen (?virksomhed=…&formaal=…&sider=…&demo=…&trin=…),
 * så heroens spørgsmål og "Beregn en lignende hjemmeside" på en demo kan starte
 * beregneren med det rigtige valgt, og så en genindlæsning ikke nulstiller. Der
 * gemmes intet i cookies eller browserens lager. Kunden kan altid gå tilbage og
 * rette.
 *
 * Bookingintegration, vedligeholdelse og hosting er ikke prissatte tilvalg.
 *
 * Efter resultatet kan kunden åbne en kort formular (navn, e-mail, valgfri
 * telefon, ønsker). Der er ingen formularbackend: knappen åbner kundens
 * mailprogram med valgene, prisestimatet og en eventuel demo. Siden viser
 * derfor aldrig en "sendt"-besked.
 */

const emptyState = { type: '', purpose: '', pages: '', demo: '' }

function readUrl(search) {
  const q = new URLSearchParams(search)
  const demo = demoById(q.get('demo') ?? '')
  const pick = (list, v) => (list.some((x) => x.id === v) ? v : '')
  const state = {
    type: pick(businessTypes, q.get('virksomhed')) || demo?.calcType || '',
    purpose: pick(purposes, q.get('formaal')) || demo?.calcPurpose || '',
    pages: [...pricing.tiers, pricing.custom].some((t) => t.id === q.get('sider')) ? q.get('sider') : '',
    demo: demo?.id ?? '',
  }
  const wanted = Number(q.get('trin')) || 1
  const hasAll = state.type && state.purpose
  const step = wanted === 3 && hasAll && state.pages ? 3 : wanted === 2 && hasAll ? 2 : 1
  return { state, step }
}

function Opt({ name, value, checked, onChange, title, sub, className = '' }) {
  return (
    <label className="block">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={`choice flex min-h-14 cursor-pointer flex-col justify-center rounded-md border border-rule bg-surface px-4 py-3 text-ink select-none peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${className}`}
      >
        <span className="text-[16px] leading-snug font-medium">{title}</span>
        {sub && <span className="mt-0.5 text-[13px] leading-snug opacity-70">{sub}</span>}
      </span>
    </label>
  )
}

function Progress({ step }) {
  return (
    <div>
      <ol className="grid grid-cols-3 gap-2" aria-hidden="true">
        {calc.steps.map((label, i) => (
          <li key={label}>
            <span className={`block h-1 rounded-full ${i < step ? 'bg-ink' : 'bg-paper-2'}`} />
            <span className={`mt-2 block text-[12px] leading-tight ${i + 1 === step ? 'font-medium text-ink' : 'text-muted'}`}>
              {label}
            </span>
          </li>
        ))}
      </ol>
      <p className="sr-only">
        {calc.progress(step)}: {calc.steps[step - 1]}
      </p>
    </div>
  )
}

function Row({ label, value, onEdit }) {
  return (
    <div className="grid grid-cols-[130px_1fr_auto] items-baseline gap-x-4 border-b border-rule py-3 text-[15px] sm:grid-cols-[170px_1fr_auto]">
      <dt className="t-eyebrow self-center">{label}</dt>
      <dd className="font-medium">{value}</dd>
      <dd>
        <button type="button" onClick={onEdit} className="link-underline hit cursor-pointer text-[14px] text-muted">
          {calc.s3.edit}
          <span className="sr-only"> {label.toLowerCase()}</span>
        </button>
      </dd>
    </div>
  )
}

function List({ items, mark = 'spec' }) {
  return (
    <ul className={mark === 'spec' ? 'spec-list' : 'flex flex-col gap-2.5 text-[15px] leading-relaxed text-muted'}>
      {items.map((t) => (
        <li key={t}>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}

function InquiryForm({ state, onClose }) {
  const [note, setNote] = useState(null)
  const form = useRef(null)
  const first = useRef(null)
  const f = calc.form
  const custom = state.pages === pricing.custom.id

  useEffect(() => {
    first.current?.focus({ preventScroll: false })
  }, [])

  const read = () => {
    const d = new FormData(form.current)
    return {
      ...state,
      name: String(d.get('name') ?? '').trim(),
      email: String(d.get('email') ?? '').trim(),
      phone: String(d.get('phone') ?? '').trim(),
      wishes: String(d.get('wishes') ?? '').trim(),
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    window.location.href = mailtoFrom(composeCalcParts(read()))
    setNote('opened')
  }

  const onCopy = async () => {
    if (!form.current.reportValidity()) return
    const { subject, body } = composeCalcParts(read())
    try {
      await navigator.clipboard.writeText(`Emne: ${subject}\n\n${body}`)
      setNote('copied')
    } catch {
      setNote('failed')
    }
  }

  return (
    <form
      ref={form}
      onSubmit={onSubmit}
      aria-labelledby="calc-form-title"
      className="swap-in mt-8 rounded-[var(--radius-panel)] bg-ink p-6 text-paper md:p-9 on-dark"
    >
      <h3 id="calc-form-title" className="t-display t-h3">
        {custom ? calc.s3.ctaQuote : f.title}
      </h3>
      <p className="mt-3 max-w-[54ch] text-[15px] text-paper/75">{f.intro}</p>

      <div className="mt-7 grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
        <div>
          <label htmlFor="q-name" className="mb-2 block text-[15px] font-medium">
            {f.name}
          </label>
          <input ref={first} id="q-name" name="name" type="text" required autoComplete="name" className="field" />
        </div>
        <div>
          <label htmlFor="q-email" className="mb-2 block text-[15px] font-medium">
            {f.email}
          </label>
          <input id="q-email" name="email" type="email" required autoComplete="email" className="field" />
        </div>
        <div className="sm:col-span-2 sm:max-w-[calc(50%-8px)]">
          <label htmlFor="q-phone" className="mb-2 block text-[15px] font-medium">
            {f.phone}
          </label>
          <input id="q-phone" name="phone" type="tel" autoComplete="tel" className="field" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="q-wishes" className="mb-2 block text-[15px] font-medium">
            {f.wishes}
          </label>
          <textarea id="q-wishes" name="wishes" placeholder={f.wishesPlaceholder} className="field" />
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button type="submit" className="btn btn-primary shrink-0 cursor-pointer whitespace-nowrap">
          Åbn e-mail med mine valg
          <Arrow />
        </button>
        <button type="button" onClick={onClose} className="btn btn-text cursor-pointer">
          Luk formularen
        </button>
      </div>

      <p className="mt-5 max-w-[60ch] text-[13px] leading-snug text-paper/70">
        Beskeden sendes i dit eget mailprogram, ikke fra denne side. Knappen åbner en færdig mail til mig med dine valg og prisestimatet, og først når du trykker send dér, når den mig.
      </p>
      <p className="mt-3 text-[14px] leading-snug text-paper/80">
        Har du ikke et mailprogram sat op?{' '}
        <button type="button" onClick={onCopy} className="link-underline hit cursor-pointer font-medium text-paper">
          Kopiér beskeden
        </button>
        . Eller ring på{' '}
        <a href={`tel:${site.phoneHref}`} className="link-underline font-medium text-paper">
          +45 {site.phone}
        </a>
        .
      </p>

      <p role="status" aria-live="polite" className="mt-4 text-[14px] leading-snug text-paper/85 empty:hidden">
        {note && (
          <span key={note} className="swap-in block">
            {note === 'opened'
              ? 'Jeg har forsøgt at åbne dit mailprogram med beskeden. Husk at trykke send dér. Åbnede det sig ikke, kan du skrive direkte til'
              : note === 'copied'
                ? 'Beskeden er kopieret. Indsæt den i en mail til'
                : 'Kunne ikke kopiere automatisk. Skriv i stedet direkte til'}{' '}
            <a href={`mailto:${site.email}`} className="link-underline break-all text-paper">
              {site.email}
            </a>
            .
          </span>
        )}
      </p>
    </form>
  )
}

function Result({ state, onEdit, onRestart }) {
  const [formOpen, setFormOpen] = useState(false)
  const price = priceFor(state.pages)
  const tier = pricing.tiers.find((t) => t.id === state.pages)
  const type = businessTypes.find((b) => b.id === state.type)
  const purpose = purposes.find((p) => p.id === state.purpose)
  const demo = demoById(state.demo)
  const custom = price === null
  const s = calc.s3

  return (
    <div>
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="t-eyebrow">{s.yourChoice}</p>
          <dl className="mt-3 border-t border-ink">
            <Row label={s.type} value={type?.label} onEdit={() => onEdit(1)} />
            <Row label={s.purpose} value={purpose?.label} onEdit={() => onEdit(1)} />
            <Row label={s.pages} value={custom ? pricing.custom.label : tier?.label} onEdit={() => onEdit(2)} />
            {demo && (
              <div className="grid grid-cols-[130px_1fr] items-baseline gap-x-4 border-b border-rule py-3 text-[15px] sm:grid-cols-[170px_1fr]">
                <dt className="t-eyebrow self-center">{s.demo}</dt>
                <dd className="font-medium">{demo.name}</dd>
              </div>
            )}
          </dl>

          <div className="mt-8 rounded-[var(--radius-panel)] bg-paper-2 p-6 md:p-8">
            {custom ? (
              <>
                <p className="t-eyebrow">{s.quoteTitle}</p>
                <p className="t-display mt-3 text-[clamp(1.75rem,3.4vw,2.5rem)] leading-tight">{s.quoteTitle}</p>
                <p className="t-body mt-3 max-w-[46ch] text-[16px]">{s.quoteText}</p>
              </>
            ) : (
              <>
                <p className="t-eyebrow">{s.oneTime}</p>
                <p
                  className="t-display mt-2 text-[clamp(2.75rem,6vw,4.5rem)] leading-none tabular-nums"
                  aria-label={`${price} kroner`}
                >
                  {formatKr(price)}
                </p>
              </>
            )}
            <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed font-medium">{s.statement}</p>
          </div>

          {(demo || state.purpose === 'booking') && (
            <div className="mt-5 flex flex-col gap-2 text-[14px] leading-relaxed text-muted">
              {demo && <p>{s.demoNote}</p>}
              {state.purpose === 'booking' && (
                <p>
                  {s.bookingNote}{' '}
                  <a href={paths.booking} className="link-underline text-ink">
                    Læs om booking og integrationer
                  </a>
                  .
                </p>
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {!formOpen && (
              <button type="button" onClick={() => setFormOpen(true)} className="btn btn-primary cursor-pointer">
                {custom ? s.ctaQuote : s.cta}
                <Arrow />
              </button>
            )}
            <button type="button" onClick={onRestart} className="btn btn-text cursor-pointer">
              {s.restart}
            </button>
          </div>
        </div>

        <div className="lg:col-span-6">
          {custom ? (
            <>
              <p className="t-eyebrow">{s.separateTitle}</p>
              <p className="t-body mt-3 max-w-[54ch] text-[15px]">{s.separate}</p>
            </>
          ) : (
            <>
              <p className="t-eyebrow mb-3">{s.includedTitle}</p>
              <List items={s.included} />

              <p className="t-eyebrow mt-8 mb-3">{s.yourPartTitle}</p>
              <List items={s.yourPart} mark="plain" />

              <p className="t-eyebrow mt-8 mb-3">{s.notIncludedTitle}</p>
              <List items={s.notIncluded} mark="plain" />

              <p className="t-eyebrow mt-8 mb-3">{s.separateTitle}</p>
              <p className="t-body max-w-[54ch] text-[15px]">{s.separate}</p>
            </>
          )}
        </div>
      </div>

      {formOpen && <InquiryForm state={state} onClose={() => setFormOpen(false)} />}
    </div>
  )
}

export default function Calculator() {
  // Startværdier fra adresselinjen (se useSearch). Så snart kunden ændrer noget,
  // overtager `edit`, og adresselinjen opdateres, så en genindlæsning ikke nulstiller.
  const search = useSearch()
  const fromUrl = useMemo(() => readUrl(search), [search])
  const [edit, setEdit] = useState(null)
  const state = edit?.state ?? fromUrl.state
  const step = edit?.step ?? fromUrl.step
  const title = useRef(null)
  const moved = useRef(false)
  const uid = useId()

  useEffect(() => {
    if (!edit) return
    window.history.replaceState(null, '', calcHref({ ...edit.state, step: edit.step > 1 ? edit.step : 0 }))
  }, [edit])

  // Ved et trinskift flyttes fokus til overskriften, så tastatur og skærmlæser følger med.
  useEffect(() => {
    if (!moved.current) return
    title.current?.focus({ preventScroll: true })
    title.current?.scrollIntoView({ block: 'nearest' })
  }, [step])

  const go = (n) => {
    moved.current = true
    setEdit({ state, step: n })
  }
  const set = (patch) => setEdit({ state: { ...state, ...patch }, step })
  const restart = () => {
    moved.current = true
    setEdit({ state: emptyState, step: 1 })
  }

  const s1ok = Boolean(state.type && state.purpose)
  const demo = demoById(state.demo)
  const heading = [calc.s1.title, calc.s2.title, calc.s3.title][step - 1]

  return (
    <div className="rounded-[var(--radius-panel)] border border-rule bg-surface p-5 md:p-10">
      <Progress step={step} />

      <div className="mt-8">
        <p className="t-eyebrow">{calc.progress(step)}</p>
        <h2 ref={title} tabIndex={-1} className="t-display t-h3 mt-2 outline-none">
          {heading}
        </h2>
      </div>

      <div key={step} className="swap-in mt-7">
        {step === 1 && (
          <div>
            {demo && (
              <p className="mb-6 rounded-md bg-paper-2 px-4 py-3 text-[14px] leading-snug">{calc.s1.fromDemo(demo.name)}</p>
            )}
            <div className="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-2">
              <fieldset>
                <legend className="mb-3 text-[15px] font-medium">{calc.s1.type}</legend>
                <div className="grid grid-cols-1 gap-2">
                  {businessTypes.map((b) => (
                    <Opt
                      key={b.id}
                      name={`${uid}-type`}
                      value={b.id}
                      checked={state.type === b.id}
                      onChange={() => set({ type: b.id })}
                      title={b.label}
                    />
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="mb-3 text-[15px] font-medium">{calc.s1.purpose}</legend>
                <div className="grid grid-cols-1 gap-2">
                  {purposes.map((p) => (
                    <Opt
                      key={p.id}
                      name={`${uid}-purpose`}
                      value={p.id}
                      checked={state.purpose === p.id}
                      onChange={() => set({ purpose: p.id })}
                      title={p.label}
                    />
                  ))}
                </div>
              </fieldset>
            </div>
            <p className="mt-6 max-w-[60ch] text-[13px] text-muted">{calc.s1.note}</p>
          </div>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="mb-1 max-w-[60ch] text-[15px] text-muted">{calc.s2.hint}</legend>
            <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
              {[...pricing.tiers, pricing.custom].map((t) => (
                <Opt
                  key={t.id}
                  name={`${uid}-pages`}
                  value={t.id}
                  checked={state.pages === t.id}
                  onChange={() => set({ pages: t.id })}
                  title={t.label}
                  sub={t.range}
                  className={t.id === pricing.custom.id ? 'md:col-span-2' : ''}
                />
              ))}
            </div>
            {state.pages === pricing.custom.id && (
              <p className="swap-in mt-4 max-w-[62ch] rounded-md bg-paper-2 px-4 py-3 text-[14px] leading-snug">
                {calc.s2.customNote}
              </p>
            )}
          </fieldset>
        )}

        {step === 3 && <Result state={state} onEdit={go} onRestart={restart} />}
      </div>

      {step < 3 && (
        <div className="mt-9 flex flex-col-reverse gap-3 border-t border-rule pt-6 sm:flex-row sm:items-center sm:justify-between">
          {step > 1 ? (
            <button type="button" onClick={() => go(step - 1)} className="btn btn-ghost cursor-pointer">
              {calc.back}
            </button>
          ) : (
            <span className="text-[13px] text-muted">{calc.scope}</span>
          )}
          <div className="flex flex-col gap-2 sm:items-end">
            <button
              type="button"
              disabled={step === 1 ? !s1ok : !state.pages}
              onClick={() => go(step + 1)}
              className="btn btn-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
              {step === 2 ? 'Se din pris' : calc.next}
              <Arrow />
            </button>
            {step === 1 && !s1ok && <span className="text-[12px] text-muted">Vælg både virksomhedstype og formål.</span>}
            {step === 2 && !state.pages && <span className="text-[12px] text-muted">Vælg, hvor mange sider du skal bruge.</span>}
          </div>
        </div>
      )}
    </div>
  )
}
