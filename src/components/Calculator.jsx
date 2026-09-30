import { useCallback, useEffect, useId, useRef, useState } from 'react'
import {
  businessTypes,
  calc,
  demoById,
  formatKr,
  inquiry,
  pageOptions,
  paths,
  priceFor,
  pricing,
  purposes,
  vatLine,
} from '../content.js'
import { resetCalc, setCalc, useCalc } from '../calcStore.js'
import { useInquiryForm } from '../useInquiryForm.js'
import { ErrorSummary, FieldError, Honeypot, SendResult } from './FormBits.jsx'
import { Arrow } from './Shots.jsx'

/**
 * PRISBEREGNER — kun selve hjemmesiden. ÉN komponent, brugt i forsidens hero
 * og på /prisberegner/. Tilstanden ligger i calcStore.js, så begge steder har
 * samme valg, og forsiden bliver på sin adresse.
 *
 *   1  Hvad skal din nye hjemmeside hjælpe med? (virksomhedstype er valgfri)
 *   2  Hvor mange sider? (forsiden tæller med; ingen beløb her)
 *   3  Resultat: pris, valg, det der er med, og én kontaktknap
 *
 * Prisen vises først på trin 3 og kræver ingen kontaktoplysninger. Den kommer
 * fra priceFor() i content.calc.js. "Mere end seks sider, webshop …" giver
 * "Særskilt tilbud", og "Jeg ved det ikke" giver en personlig afklaring: aldrig
 * en pris, der stopper på 5.000 kr., og aldrig en opfundet pris.
 *
 * Fokus: et trinskift flytter fokus til overskriften; et link til #beregner
 * (også fra samme side) scroller hertil og sætter fokus på overskriften.
 * Bookingløsning, integrationer og vedligeholdelse har ingen pris her.
 *
 * Layoutet bruger en container-forespørgsel (@container), så komponenten ser
 * rigtig ud både i heroens smalle kolonne og på den brede side.
 */

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
    <div className="grid grid-cols-[110px_1fr_auto] items-baseline gap-x-4 border-b border-rule py-3 text-[15px] @md:grid-cols-[170px_1fr_auto]">
      <dt className="t-eyebrow self-center">{label}</dt>
      <dd className="font-medium">{value}</dd>
      <dd>
        {onEdit && (
          <button type="button" onClick={onEdit} className="link-underline hit cursor-pointer text-[14px] text-muted">
            {calc.s3.edit}
            <span className="sr-only"> {label.toLowerCase()}</span>
          </button>
        )}
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

/** Formularen efter resultatet: navn, e-mail og eventuelt ønsker. Sender direkte. */
function InquiryForm({ state, onClose }) {
  const first = useRef(null)
  const f = calc.form
  const custom = state.pages === pricing.custom.id
  const unsure = state.pages === pricing.unsure.id

  const read = useCallback(
    (d) => ({
      source: 'beregner',
      topic: 'hjemmeside',
      name: d.get('name'),
      email: d.get('email'),
      phone: d.get('phone'),
      message: d.get('wishes'),
      calc: { type: state.type, purpose: state.purpose, pages: state.pages, demo: state.demo },
    }),
    [state],
  )
  const { form, status, errors, note, tooFast, submit, openMail, copy } = useInquiryForm({ read })
  const sending = status === 'sending'
  const fieldProps = (name) => ({
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `q-${name}-error` : undefined,
  })

  useEffect(() => {
    first.current?.focus()
  }, [])

  return (
    <form
      ref={form}
      onSubmit={submit}
      noValidate
      aria-labelledby="calc-form-title"
      className="swap-in on-dark relative mt-8 rounded-[var(--radius-panel)] bg-ink p-6 text-paper md:p-9"
    >
      <h3 id="calc-form-title" className="t-display t-h3">
        {custom ? f.titleQuote : unsure ? f.titleUnsure : f.title}
      </h3>
      <p className="mt-3 max-w-[54ch] text-[15px] text-paper/75">{f.intro}</p>

      <ErrorSummary errors={errors} />

      <div className="mt-7 grid grid-cols-1 gap-x-4 gap-y-5 @lg:grid-cols-2">
        <div>
          <label htmlFor="q-name" className="mb-2 block text-[15px] font-medium">
            {f.name}
          </label>
          <input ref={first} id="q-name" name="name" type="text" autoComplete="name" className="field" {...fieldProps('name')} />
          <FieldError id="q-name-error" message={errors.name} />
        </div>
        <div>
          <label htmlFor="q-email" className="mb-2 block text-[15px] font-medium">
            {f.email}
          </label>
          <input id="q-email" name="email" type="email" autoComplete="email" className="field" {...fieldProps('email')} />
          <FieldError id="q-email-error" message={errors.email} />
        </div>
        <div className="@lg:col-span-2 @lg:max-w-[calc(50%-8px)]">
          <label htmlFor="q-phone" className="mb-2 block text-[15px] font-medium">
            {f.phone}
          </label>
          <input id="q-phone" name="phone" type="tel" autoComplete="tel" className="field" {...fieldProps('phone')} />
          <FieldError id="q-phone-error" message={errors.phone} />
        </div>
        <div className="@lg:col-span-2">
          <label htmlFor="q-wishes" className="mb-2 block text-[15px] font-medium">
            {f.wishes}
          </label>
          <textarea id="q-wishes" name="wishes" placeholder={f.wishesPlaceholder} className="field" {...fieldProps('message')} />
          <FieldError id="q-message-error" message={errors.message} />
        </div>
      </div>
      <Honeypot />

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={sending || status === 'sent'}
          className="btn btn-primary shrink-0 cursor-pointer whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? inquiry.sending : f.submit}
          {!sending && <Arrow />}
        </button>
        <button type="button" onClick={onClose} className="btn btn-text cursor-pointer">
          Luk formularen
        </button>
      </div>

      <p className="mt-5 max-w-[60ch] text-[13px] leading-snug text-paper/70">
        Dine valg og din pris følger med beskeden. Jeg bruger dine oplysninger til at svare dig, og ikke til andet.
      </p>

      <SendResult status={status} note={note} tooFast={tooFast} onOpenMail={openMail} onCopy={copy} />
    </form>
  )
}

function Result({ state, onEdit, onBack, onRestart }) {
  const [formOpen, setFormOpen] = useState(false)
  const price = priceFor(state.pages)
  const tier = pricing.tiers.find((t) => t.id === state.pages)
  const type = businessTypes.find((b) => b.id === state.type)
  const purpose = purposes.find((p) => p.id === state.purpose)
  const demo = demoById(state.demo)
  const unsure = state.pages === pricing.unsure.id
  const custom = state.pages === pricing.custom.id
  const s = calc.s3

  return (
    <div>
      <div className="grid grid-cols-1 gap-x-12 gap-y-10 @2xl:grid-cols-12">
        <div className="@2xl:col-span-6">
          <p className="t-eyebrow">{s.yourChoice}</p>
          <dl className="mt-3 border-t border-ink">
            <Row label={s.purpose} value={purpose?.label} onEdit={() => onEdit(1)} />
            <Row label={s.pages} value={unsure ? pricing.unsure.label : custom ? pricing.custom.label : tier?.label} onEdit={() => onEdit(2)} />
            {type && <Row label={s.type} value={type.label} onEdit={() => onEdit(1)} />}
            {demo && <Row label={s.demo} value={demo.name} />}
          </dl>

          <div className="mt-8 rounded-[var(--radius-panel)] bg-paper-2 p-6 md:p-8">
            {price !== null ? (
              <>
                <p className="t-eyebrow">{s.oneTime}</p>
                <p
                  className="t-display mt-2 text-[clamp(2.75rem,6vw,4.5rem)] leading-none tabular-nums"
                  aria-label={`${price} kroner`}
                >
                  {formatKr(price)}
                </p>
                <p className="mt-3 text-[14px] leading-snug text-muted">{vatLine()}</p>
              </>
            ) : custom ? (
              <>
                <p className="t-eyebrow">{s.quoteTitle}</p>
                <p className="t-display mt-3 text-[clamp(1.75rem,3.4vw,2.5rem)] leading-tight">{s.quoteTitle}</p>
                <p className="t-body mt-3 max-w-[46ch] text-[16px]">{s.quoteText}</p>
              </>
            ) : (
              <>
                <p className="t-eyebrow">{s.unsureTitle}</p>
                <p className="t-display mt-3 text-[clamp(1.75rem,3.4vw,2.5rem)] leading-tight">{calc.s3.titleUnsure}</p>
                <p className="t-body mt-3 max-w-[46ch] text-[16px]">{s.unsureText}</p>
              </>
            )}
            {price !== null && <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed font-medium">{s.statement}</p>}
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

          <div className="mt-8 flex flex-col gap-3 @lg:flex-row @lg:flex-wrap @lg:items-center">
            {!formOpen && (
              <button type="button" onClick={() => setFormOpen(true)} className="btn btn-primary cursor-pointer">
                {custom ? s.ctaQuote : unsure ? s.ctaUnsure : s.cta}
                <Arrow />
              </button>
            )}
            <button type="button" onClick={onBack} className="btn btn-text cursor-pointer">
              {calc.back}
            </button>
            <button type="button" onClick={onRestart} className="btn btn-text cursor-pointer">
              {s.restart}
            </button>
          </div>
        </div>

        <div className="@2xl:col-span-6">
          {price !== null ? (
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
          ) : (
            <>
              <p className="t-eyebrow mb-3">{s.notIncludedTitle}</p>
              <List items={s.notIncluded.slice(1)} mark="plain" />
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

export default function Calculator({ compact = false }) {
  const state = useCalc()
  const { step } = state
  const root = useRef(null)
  const title = useRef(null)
  const moved = useRef(false)
  const uid = useId()

  // Et trinskift flytter fokus til overskriften, så tastatur og skærmlæser følger med.
  useEffect(() => {
    if (!moved.current) return
    title.current?.focus({ preventScroll: true })
    title.current?.scrollIntoView({ block: 'nearest' })
  }, [step])

  // Links til #beregner (fra samme side eller ved ankomst) scroller hertil og
  // sætter fokus på overskriften. Gælder også et klik på et link, der allerede
  // peger på #beregner (hashchange udløses da ikke).
  useEffect(() => {
    const focus = () => {
      root.current?.scrollIntoView({ block: 'start' })
      title.current?.focus({ preventScroll: true })
    }
    const onClick = (e) => {
      const a = e.target instanceof Element ? e.target.closest('a[href]') : null
      if (!a) return
      const u = new URL(a.href, window.location.href)
      if (u.hash === '#beregner' && u.pathname === window.location.pathname) window.setTimeout(focus, 0)
    }
    const onHash = () => window.location.hash === '#beregner' && focus()
    if (window.location.hash === '#beregner') window.requestAnimationFrame(focus)
    document.addEventListener('click', onClick)
    window.addEventListener('hashchange', onHash)
    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener('hashchange', onHash)
    }
  }, [])

  const go = (n) => {
    moved.current = true
    setCalc({ step: n })
  }
  const restart = () => {
    moved.current = true
    resetCalc()
  }

  const demo = demoById(state.demo)
  const purpose = purposes.find((p) => p.id === state.purpose)
  const heading = [calc.s1.title, calc.s2.title, calc.s3.title][step - 1]

  return (
    <div
      ref={root}
      id="beregner"
      role="group"
      aria-labelledby={`${uid}-title`}
      className={`@container rounded-[var(--radius-panel)] border border-rule bg-surface ${compact ? 'p-5 md:p-7' : 'p-5 md:p-10'}`}
    >
      <Progress step={step} />

      <div className="mt-7">
        <p className="t-eyebrow">{calc.progress(step)}</p>
        <h2
          id={`${uid}-title`}
          ref={title}
          tabIndex={-1}
          className={`t-display mt-2 outline-none ${compact ? 'text-[clamp(1.5rem,2.4vw,1.875rem)] leading-[1.15]' : 't-h3'}`}
        >
          {heading}
        </h2>
      </div>

      <div key={step} className="swap-in mt-6">
        {step === 1 && (
          <div>
            {demo && (
              <p className="mb-5 rounded-md bg-paper-2 px-4 py-3 text-[14px] leading-snug">{calc.s1.fromDemo(demo.name)}</p>
            )}
            <fieldset>
              <legend className="sr-only">{calc.s1.title}</legend>
              <div className="grid grid-cols-1 gap-2 @lg:grid-cols-2">
                {purposes.map((p) => (
                  <Opt
                    key={p.id}
                    name={`${uid}-purpose`}
                    value={p.id}
                    checked={state.purpose === p.id}
                    onChange={() => setCalc({ purpose: p.id })}
                    title={p.label}
                  />
                ))}
              </div>
            </fieldset>
            <p aria-live="polite" className="mt-3 text-[14px] leading-snug text-muted empty:hidden">
              {purpose?.note}
            </p>

            <div className="mt-6">
              <label htmlFor={`${uid}-type`} className="mb-2 block text-[14px] font-medium">
                {calc.s1.typeLabel}
              </label>
              <select
                id={`${uid}-type`}
                value={state.type}
                onChange={(e) => setCalc({ type: e.target.value })}
                className="min-h-12 w-full rounded-md border border-rule bg-paper px-3 text-[16px] text-ink"
              >
                <option value="">{calc.s1.typeNone}</option>
                {businessTypes.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 max-w-[60ch] text-[13px] text-muted">{calc.s1.note}</p>
            </div>
          </div>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="mb-1 max-w-[60ch] text-[15px] text-muted">{calc.s2.hint}</legend>
            <div className="mt-4 grid grid-cols-1 gap-2 @lg:grid-cols-2">
              {pageOptions.map((t) => (
                <Opt
                  key={t.id}
                  name={`${uid}-pages`}
                  value={t.id}
                  checked={state.pages === t.id}
                  onChange={() => setCalc({ pages: t.id })}
                  title={t.label}
                  sub={t.range}
                  className={t.id === pricing.custom.id ? '@lg:col-span-2' : ''}
                />
              ))}
            </div>
            <p aria-live="polite" className="mt-4 max-w-[62ch] text-[14px] leading-snug empty:hidden">
              {state.pages === pricing.custom.id && (
                <span className="swap-in block rounded-md bg-paper-2 px-4 py-3">{calc.s2.customNote}</span>
              )}
              {state.pages === pricing.unsure.id && (
                <span className="swap-in block rounded-md bg-paper-2 px-4 py-3">{calc.s2.unsureNote}</span>
              )}
            </p>
          </fieldset>
        )}

        {step === 3 && <Result state={state} onEdit={go} onBack={() => go(2)} onRestart={restart} />}
      </div>

      {step < 3 && (
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-rule pt-6 @lg:flex-row @lg:items-center @lg:justify-between">
          {step > 1 ? (
            <button type="button" onClick={() => go(step - 1)} className="btn btn-ghost cursor-pointer">
              {calc.back}
            </button>
          ) : (
            <span className="text-[13px] text-muted">{calc.scope}</span>
          )}
          <div className="flex flex-col gap-2 @lg:items-end">
            <button
              type="button"
              disabled={step === 1 ? !state.purpose : !state.pages}
              onClick={() => go(step + 1)}
              className="btn btn-primary cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            >
              {step === 2 ? calc.seeResult : calc.next}
              <Arrow />
            </button>
            {step === 1 && !state.purpose && <span className="text-[12px] text-muted">{calc.s1.needPurpose}</span>}
            {step === 2 && !state.pages && <span className="text-[12px] text-muted">{calc.s2.needPages}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
