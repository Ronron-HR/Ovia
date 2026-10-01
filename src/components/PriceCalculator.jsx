import { useEffect, useRef, useState } from 'react'
import {
  ORDER,
  allowed,
  bookingOnWebsite,
  cleanAnswers,
  mailBody,
  priceParts,
  priceText,
  quote,
  smsBody,
  tierFor,
  totalText,
  useCalc,
  visibleQuestions,
} from '../calculator.js'
import { calculator, flags, fromPrice, introText, priceNote, services, tierName } from '../data/pricing.js'
import ContactButtons from './ContactButtons.jsx'

/**
 * PRISBEREGNER
 *
 * Trin 1: hvilke ydelser (flervalg). Derefter ét trin pr. valgt ydelse og så
 * resultatet: højst 5 trin. Prisen vises med det samme, uden formular.
 * Efter resultatet: Ring, SMS og "Send mig tilbuddet" (mailto med
 * opsummering). Ingen tracking, intet sendes; valgene står kun i adresselinjen.
 *
 * TILGÆNGELIGHED: almindelige checkbokse og radioknapper i fieldsets (piletaster
 * og mellemrum virker), overskriften får fokus ved hvert nyt trin, og prisen
 * annonceres i en aria-live-region, når resultatet vises. Mangler et svar,
 * står det under knappen, og fokus flyttes til spørgsmålet. Svar, der ikke kan
 * vælges med pakken (fx egen konto til Fuld fart), er deaktiveret med en
 * forklaring. "Hvor mange sider i alt?" er en almindelig <select>.
 */
export default function PriceCalculator({ defaults }) {
  const [state, set] = useCalc(defaults)
  const { selected, answers, step } = state
  const resultStep = selected.length + 1
  const total = selected.length + 2
  const isResult = selected.length > 0 && step === resultStep
  const service = step > 0 && step < resultStep ? selected[step - 1] : null

  const [missing, setMissing] = useState(null)
  const [notice, setNotice] = useState(null)
  const heading = useRef(null)
  const form = useRef(null)
  const moved = useRef(false)

  // Nyt trin, som brugeren selv har valgt: fokus til trinnets overskrift, og
  // beregneren rulles til toppen. Ikke ved indlæsning (fx et delt link med ?trin=3).
  useEffect(() => {
    if (!moved.current) return
    moved.current = false
    heading.current?.focus({ preventScroll: true })
    heading.current?.closest('[data-calc]')?.scrollIntoView({ block: 'start' })
  }, [step])

  const go = (next) => {
    setMissing(null)
    setNotice(null)
    moved.current = true
    set({ ...state, step: next })
  }

  const toggleService = (key) => {
    setMissing(null)
    const on = selected.includes(key)
    set({ ...state, selected: ORDER.filter((k) => (k === key ? !on : selected.includes(k))) })
  }

  const answer = (id, value) => {
    setMissing(null)
    const nextAnswers = { ...answers, [id]: value }
    // Tilføjes booking, efter egen konto er valgt, skifter hjemmesiden til drift: sig det.
    const clean = cleanAnswers(nextAnswers, selected)
    setNotice(answers.drift === 'egen' && clean.drift !== 'egen' ? `${calculator.switchedToDrift} ${calculator.driftWithBooking}` : null)
    set({ ...state, answers: nextAnswers })
  }

  const next = (event) => {
    event.preventDefault()
    if (step === 0 && !selected.length) {
      setMissing('Vælg mindst én ydelse.')
      form.current?.querySelector('input')?.focus()
      return
    }
    if (service) {
      const open = visibleQuestions(service, answers).find((q) => !answers[q.id])
      if (open) {
        setMissing(`Svar på: ${open.label}`)
        form.current?.querySelector(`[name="${open.id}"]:not(:disabled)`)?.focus()
        return
      }
    }
    go(step + 1)
  }

  const q = isResult ? quote(state) : null
  const totalParts = q ? priceParts(q.total) : null

  return (
    <div id="beregner" data-calc data-callbar-hide className="calc @container">
      {/* Annonceres for skærmlæsere, når prisen vises. */}
      <p className="sr-only" aria-live="polite">
        {isResult ? `Din pris: ${totalText(q.total)}.${calculator.finalNote ? ` ${calculator.finalNote}.` : ''}` : ''}
      </p>

      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[12px] tracking-[0.08em] text-muted uppercase">
          Trin {Math.min(step + 1, Math.max(total, 1))} af {selected.length ? total : '…'}
        </p>
        {step > 0 && (
          <button type="button" onClick={() => go(step - 1)} className="calc-link">
            ← Tilbage
          </button>
        )}
      </div>
      <div className="calc-progress mt-3" aria-hidden="true">
        <span style={{ width: `${selected.length ? ((step + 1) / total) * 100 : 8}%` }} />
      </div>

      {!isResult ? (
        <form ref={form} onSubmit={next} noValidate className="mt-7">
          {step === 0 && (
            <fieldset>
              <legend>
                <h2 ref={heading} tabIndex={-1} className="t-display t-h3 outline-none">
                  {calculator.servicesQuestion}
                </h2>
                <span className="t-body mt-2 block text-[15px]">{calculator.servicesHint}</span>
              </legend>
              <div className="mt-6 grid grid-cols-1 gap-3 @2xl:grid-cols-3">
                {ORDER.map((key) => (
                  <label key={key} className="choice">
                    <input
                      type="checkbox"
                      name="ydelser"
                      value={key}
                      checked={selected.includes(key)}
                      onChange={() => toggleService(key)}
                      className="choice-input"
                    />
                    <span className="choice-box">
                      <span className="choice-mark" aria-hidden="true" />
                      <span>
                        <span className="block text-[17px] font-medium">{services[key].name}</span>
                        <span className="t-body block text-[14px]">{fromPrice(services[key])}</span>
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {service && (
            <div>
              <h2 ref={heading} tabIndex={-1} className="t-display t-h3 outline-none">
                {services[service].name}
              </h2>
              {visibleQuestions(service, answers).map((question) =>
                question.kind === 'select' ? (
                  <div key={question.id} className="mt-7">
                    <label htmlFor={`calc-${question.id}`} className="block text-[17px] leading-snug font-medium">
                      {question.label}
                    </label>
                    <select
                      id={`calc-${question.id}`}
                      name={question.id}
                      value={answers[question.id] ?? ''}
                      onChange={(e) => answer(question.id, e.target.value)}
                      className="calc-select mt-3"
                    >
                      <option value="" disabled>
                        {question.placeholder}
                      </option>
                      {question.options.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <fieldset key={question.id} className="mt-7">
                    <legend className="text-[17px] leading-snug font-medium">{question.label}</legend>
                    <div className="mt-3 grid grid-cols-1 gap-2.5 @md:grid-cols-2">
                      {question.options.map((o) => {
                        const off = !allowed(o, tierFor(service, answers), service === 'hjemmeside' && bookingOnWebsite(selected, answers))
                        return (
                          <label key={o.id} className="choice" data-disabled={off || undefined}>
                            <input
                              type="radio"
                              name={question.id}
                              value={o.id}
                              checked={answers[question.id] === o.id}
                              disabled={off}
                              onChange={() => answer(question.id, o.id)}
                              className="choice-input"
                            />
                            <span className="choice-box">
                              <span className="choice-mark choice-mark-radio" aria-hidden="true" />
                              <span>
                                <span className="block text-[16px]">{o.label}</span>
                                {off && o.disabledNote && <span className="t-body block text-[14px]">{o.disabledNote}</span>}
                              </span>
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </fieldset>
                ),
              )}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="submit" className="btn btn-primary">
              {step === resultStep - 1 && selected.length ? 'Se prisen' : 'Næste'}
            </button>
            {missing && (
              <p role="alert" className="text-[15px] font-medium text-accent">
                {missing}
              </p>
            )}
          </div>
          <div role="status" className="mt-3 text-[15px] font-medium text-ink empty:hidden">
            {notice}
          </div>
        </form>
      ) : (
        <div className="mt-7">
          <h2 ref={heading} tabIndex={-1} className="t-display t-h3 outline-none">
            Din pris
          </h2>
          {introText && <p className="badge mt-3">{introText}</p>}
          {/* Totalen: "X kr. nu" og "Y kr./md" hver for sig; et beløb på 0 vises ikke. */}
          <p className="mt-4 leading-tight font-medium tracking-tight tabular-nums">
            {totalParts.once && (
              <span className="block text-[clamp(1.75rem,5vw,2.5rem)]">
                {totalParts.once} {calculator.nowLabel}
              </span>
            )}
            {totalParts.month && (
              <span className={`block ${totalParts.once ? 'mt-1 text-[clamp(1.375rem,3.5vw,1.75rem)]' : 'text-[clamp(1.75rem,5vw,2.5rem)]'}`}>
                {totalParts.month}
              </span>
            )}
            {q.total.noDrift && (
              <span className="mt-1 block text-[16px] font-normal tracking-normal text-muted">
                {totalParts.month ? calculator.noDriftWithMonthly : calculator.noDriftTotal}
              </span>
            )}
          </p>
          {q.total.noDrift && calculator.ownAccountNote && (
            <p className="mt-3 max-w-[52ch] text-[15px] text-ink">{calculator.ownAccountNote}</p>
          )}
          {calculator.finalNote && <p className="mt-2 text-[16px] font-medium">{calculator.finalNote}</p>}
          {priceNote && <p className="t-body mt-1 text-[14px]">{priceNote}</p>}

          <ul className="mt-6 border-t border-rule">
            {q.lines.map((l) => (
              <li key={l.key} className="border-b border-rule py-4">
                <div className="flex flex-col gap-1 @md:flex-row @md:items-baseline @md:justify-between @md:gap-6">
                  <p className="text-[16px] font-medium">
                    {l.service.name}: {tierName(l.tier)}
                  </p>
                  <p className="text-[16px] tabular-nums">{priceText(l)}</p>
                </div>
                {l.key === 'marketing' && !flags.hasMarketingCases && (
                  <p className="mt-1 text-[15px]">
                    <a href={services.marketing.pilot.calcLink.href} className="link-underline hit font-medium">
                      {services.marketing.pilot.calcLink.label}
                    </a>
                  </p>
                )}
                <ul className="t-body mt-1 text-[14px]">
                  {l.tier.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                  {l.notes.map((n) => (
                    <li key={n} className="text-ink">
                      {n}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          {q.notes.length > 0 && (
            <ul className="mt-5 flex flex-col gap-1.5 text-[15px]">
              {q.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}

          <ContactButtons
            sms
            smsText={smsBody(q)}
            mailSubject={calculator.mailSubject}
            mailBody={mailBody(q)}
            writeLabel="Send mig tilbuddet"
            className="mt-7"
            stretch
            stack
          />

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            <button type="button" onClick={() => go(1)} className="calc-link">
              Ret svarene
            </button>
            <button
              type="button"
              onClick={() => {
                moved.current = true
                set({ selected: [...(defaults ?? [])], answers: {}, step: 0 })
              }}
              className="calc-link"
            >
              Start forfra
            </button>
          </div>
        </div>
      )}

      <noscript>
        <p className="mt-6 text-[15px]">Prisberegneren kræver JavaScript. Alle pakker og priser står herunder.</p>
      </noscript>
    </div>
  )
}
