import { useEffect, useRef, useState } from 'react'
import { ORDER, mailBody, priceParts, priceText, quote, sentence, smsBody, useCalc } from '../calculator.js'
import { calculator, flags, fromPrice, priceNote, services, tierName } from '../data/pricing.js'
import { paths } from '../data/texts.js'
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
 * står det under knappen, og fokus flyttes til spørgsmålet.
 */
export default function PriceCalculator() {
  const [state, set] = useCalc()
  const { selected, answers, step } = state
  const resultStep = selected.length + 1
  const total = selected.length + 2
  const isResult = selected.length > 0 && step === resultStep
  const service = step > 0 && step < resultStep ? selected[step - 1] : null

  const [missing, setMissing] = useState(null)
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
    set({ ...state, answers: { ...answers, [id]: value } })
  }

  const next = (event) => {
    event.preventDefault()
    if (step === 0 && !selected.length) {
      setMissing('Vælg mindst én ydelse.')
      form.current?.querySelector('input')?.focus()
      return
    }
    if (service) {
      const open = calculator.questions[service].find((q) => !answers[q.id])
      if (open) {
        setMissing(`Svar på: ${open.label}`)
        form.current?.querySelector(`input[name="${open.id}"]`)?.focus()
        return
      }
    }
    go(step + 1)
  }

  const q = isResult ? quote(state) : null
  const totalParts = q ? priceParts(q.total) : null
  const showPilot = isResult && selected.includes('marketing') && !flags.hasMarketingCases

  return (
    <div data-calc data-callbar-hide className="calc">
      {/* Annonceres for skærmlæsere, når prisen vises. */}
      <p className="sr-only" aria-live="polite">
        {isResult ? `Din pris: ${sentence(priceText(q.total))} ${calculator.finalNote}.` : ''}
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
              <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
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
              {calculator.questions[service].map((question) => (
                <fieldset key={question.id} className="mt-7">
                  <legend className="text-[17px] leading-snug font-medium">{question.label}</legend>
                  <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {question.options.map((o) => (
                      <label key={o.id} className="choice">
                        <input
                          type="radio"
                          name={question.id}
                          value={o.id}
                          checked={answers[question.id] === o.id}
                          onChange={() => answer(question.id, o.id)}
                          className="choice-input"
                        />
                        <span className="choice-box">
                          <span className="choice-mark choice-mark-radio" aria-hidden="true" />
                          <span className="text-[16px]">{o.label}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
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
        </form>
      ) : (
        <div className="mt-7">
          <h2 ref={heading} tabIndex={-1} className="t-display t-h3 outline-none">
            Din pris
          </h2>
          <p className="mt-4 text-[clamp(1.75rem,5vw,2.5rem)] leading-tight font-medium tracking-tight tabular-nums">
            {totalParts.once || totalParts.month}
            {totalParts.once && totalParts.month && (
              <span className="mt-1 block text-[clamp(1.25rem,3vw,1.5rem)] text-muted">+ {totalParts.month}</span>
            )}
          </p>
          <p className="mt-2 text-[16px] font-medium">{calculator.finalNote}</p>
          {priceNote && <p className="t-body mt-1 text-[14px]">{priceNote}</p>}

          <ul className="mt-6 border-t border-rule">
            {q.lines.map((l) => (
              <li key={l.key} className="border-b border-rule py-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <p className="text-[16px] font-medium">
                    {l.service.name}: {tierName(l.tier)}
                  </p>
                  <p className="text-[16px] tabular-nums">{priceText(l)}</p>
                </div>
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

          {showPilot && (
            <p className="mt-5 rounded-[10px] bg-paper-2 px-4 py-3 text-[15px]">
              Marketing kan også starte som et gratis pilotforløb i {services.marketing.pilot.weeks} uger.{' '}
              <a href={`${paths.marketing}#pilot`} className="link-underline font-medium">
                Læs om piloten
              </a>
            </p>
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
                set({ selected: [], answers: {}, step: 0 })
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
