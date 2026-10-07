import { useEffect, useRef, useState } from 'react'
import {
  ORDER,
  priceParts,
  priceText,
  quote,
  resultStep,
  smsBody,
  stepQuestions,
  stepsFor,
  switchTier,
  totalText,
} from '../calculator.js'
import { useCalc, useGuide } from '../useCalc.js'
import {
  calculator,
  driftPlans,
  flags,
  formatKr,
  fromPriceWithDrift,
  introNote,
  introText,
  priceNote,
  services,
  tierName,
} from '../data/pricing.js'
import Amount from './Amount.jsx'
import ErrorText from './ErrorText.jsx'
import NeedsGuide from './NeedsGuide.jsx'
import PriceDetails, { PriceParts } from './PriceDetails.jsx'
import SendQuote from './SendQuote.jsx'
import '../calc.css'

/** Etiketterne over totalen i resultatet. "Nu" er calculator.nowLabel med stort. */
const NOW_LABEL = calculator.nowLabel.charAt(0).toUpperCase() + calculator.nowLabel.slice(1)
const MONTH_LABEL = 'Pr. måned'
const D = calculator.driftStep

/**
 * PRISBEREGNER
 *
 * Trin 1: hvilke ydelser (flervalg). Derefter ét trin pr. valgt ydelse og så
 * resultatet. Hjemmesiden har to trin: siderne (valg 1, pakken) og driften
 * (valg 2, Basis, Plus, Ekstra eller egen konto/hosting). Fremdriftslinjen og
 * "Trin n af m" tæller de faktiske trin. Prisen vises med det samme, uden formular.
 * Under prisen: "Send din forespørgsel" (SendQuote) med Ring og SMS som sekundære
 * links. Ingen tracking; valgene står i adresselinjen og sendes kun, hvis
 * kunden selv sender formularen.
 *
 * TILGÆNGELIGHED: almindelige checkbokse og radioknapper i fieldsets (piletaster
 * og mellemrum virker), overskriften får fokus ved hvert nyt trin, og prisen
 * annonceres i en aria-live-region, når resultatet vises. Mangler et svar,
 * står det under knappen, og fokus flyttes til spørgsmålet. "Hvor mange sider
 * i alt?" er en almindelig <select>. Trinskiftet er en rolig opacity/transform
 * (calc.css, slået fra ved prefers-reduced-motion); indholdet er altid synligt.
 *
 * data-tour: calc (kortet), guide (guideindgangen), drift (driftvalget), price (prisen).
 */
export default function PriceCalculator({ defaults }) {
  const [state, set] = useCalc(defaults)
  const [guide, setGuide] = useGuide()
  // Guiden åbnet af kunden selv (ikke fra et delt link): fokus går til første spørgsmål.
  const [guideFocus, setGuideFocus] = useState(false)
  // Trinskiftet animeres kun efter kundens eget valg, ikke ved indlæsning af siden.
  const [animate, setAnimate] = useState(false)
  const { selected, answers, step } = state
  const steps = stepsFor(selected)
  const resultIdx = resultStep(selected)
  const total = steps.length + 2
  const isResult = selected.length > 0 && step === resultIdx
  const current = step > 0 && step < resultIdx ? steps[step - 1] : null
  const questions = current ? stepQuestions(current, answers) : []
  const isDrift = questions.some((q) => q.id === 'drift')

  const [missing, setMissing] = useState(null)
  const [switched, setSwitched] = useState(null)
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

  // Direkte link til et senere trin: index.html holder indholdet under
  // beregneren skjult (data-calc-pending), til trinnet fra adresselinjen er
  // vist. Her er det vist, så markeringen fjernes efter næste maling.
  useEffect(() => {
    const root = document.documentElement
    if (!root.hasAttribute('data-calc-pending')) return
    const frame = requestAnimationFrame(() => root.removeAttribute('data-calc-pending'))
    return () => cancelAnimationFrame(frame)
  }, [step, guide?.step])

  // Fejlen ("Vælg en driftsplan …") knyttes til valgene, så den læses sammen med dem.
  useEffect(() => {
    form.current?.querySelectorAll('input[type=radio],input[type=checkbox],select').forEach((el) => {
      if (missing) el.setAttribute('aria-describedby', 'calc-missing')
      else el.removeAttribute('aria-describedby')
    })
  }, [missing])

  const go = (next) => {
    setMissing(null)
    setSwitched(null)
    setAnimate(true)
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

  // Pakkeskift i resultatet: svarene skiftes med (switchTier), driftsvalget bevares,
  // og linjen under vælgeren siger, hvad der ændrede sig.
  const changeTier = (key, tierId) => {
    setSwitched({ key, text: `${calculator.tierSwitch[key][tierId].now}.` })
    set({ ...state, answers: switchTier(key, tierId, answers) })
  }

  // Driftsskift i resultatet: kun driftsvalget ændres, pakken er uændret.
  const changeDrift = (id) => {
    const option = calculator.questions.hjemmeside.find((q) => q.id === 'drift').options.find((o) => o.id === id)
    setSwitched({ key: 'drift', text: `${D.now(option.summary ?? option.label)}.` })
    set({ ...state, answers: { ...answers, drift: id } })
  }

  const next = (event) => {
    event.preventDefault()
    if (step === 0 && !selected.length) {
      setMissing('Vælg mindst én ydelse.')
      form.current?.querySelector('input')?.focus()
      return
    }
    if (current) {
      const open = questions.find((q) => !answers[q.id])
      if (open) {
        setMissing(open.missing ?? `Svar på: ${open.label}`)
        form.current?.querySelector(`[name="${open.id}"]:not(:disabled)`)?.focus({ preventScroll: true })
        // Fejlen står øverst i formularen: den rulles til midten, så den og valgene er i syne.
        requestAnimationFrame(() => document.getElementById('calc-missing')?.scrollIntoView({ block: 'center' }))
        return
      }
    }
    go(step + 1)
  }

  // Beregnerens valg, når guiden åbnes: "Vælg selv i beregneren" fører tilbage til dem.
  const saved = useRef(null)
  const openGuide = () => {
    saved.current = state
    setMissing(null)
    setGuideFocus(true)
    setGuide({ step: 1, a: {} })
  }
  const closeGuide = () => {
    moved.current = true
    setGuideFocus(false)
    if (saved.current) set(saved.current)
    else setGuide(null)
    saved.current = null
  }
  const openProposal = (next) => {
    moved.current = true
    setAnimate(true)
    set(next)
  }

  const q = isResult ? quote(state) : null
  const totalParts = q ? priceParts(q.total) : null

  if (guide) {
    return (
      <div id="beregner" data-calc data-tour="calc" data-callbar-hide className="calc @container">
        <NeedsGuide guide={guide} setGuide={setGuide} onExit={closeGuide} onOpen={openProposal} focusOnOpen={guideFocus} />
      </div>
    )
  }

  return (
    <div id="beregner" data-calc data-tour="calc" data-callbar-hide className="calc @container">
      {/* Annonceres for skærmlæsere, når prisen vises. */}
      <p className="sr-only" aria-live="polite">
        {isResult ? `Din pris: ${totalText(q.total)}.${calculator.finalNote ? ` ${calculator.finalNote}.` : ''}` : ''}
      </p>

      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[14px] tracking-[0.08em] text-muted uppercase">
          {/* Antallet af trin kendes først, når der er valgt mindst én ydelse. */}
          {selected.length ? `Trin ${Math.min(step + 1, total)} af ${total}` : `Trin ${step + 1}`}
        </p>
        {step > 0 && (
          <button type="button" onClick={() => go(step - 1)} className="calc-link">
            <span aria-hidden="true">←</span> Tilbage
          </button>
        )}
      </div>
      <div className="calc-progress mt-3" aria-hidden="true">
        <span style={{ transform: `scaleX(${selected.length ? (step + 1) / total : 0.08})` }} />
      </div>

      <div key={step} className="calc-stage" data-animate={animate || undefined}>
        {!isResult ? (
          <form ref={form} onSubmit={next} noValidate aria-describedby={missing ? 'calc-missing' : undefined} className="mt-7">
            {missing && (
              <ErrorText id="calc-missing" role="alert" className="mb-5 text-[15px]">
                {missing}
              </ErrorText>
            )}
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
                          <span className="choice-title block text-[17px]">{services[key].name}</span>
                          <span className="t-body block text-[14px]">{fromPriceWithDrift(services[key])}</span>
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                {priceNote && <p className="t-body mt-3 text-[14px]">{priceNote}</p>}
              </fieldset>
            )}

            {step === 0 && (
              <div className="calc-help mt-6" data-tour="guide">
                <p className="text-[15px] font-medium">{calculator.guide.entryText}</p>
                <button type="button" onClick={openGuide} className="btn btn-ghost mt-3">
                  {calculator.guide.entryTitle}
                </button>
              </div>
            )}

            {current && isDrift && (
              <DriftStep question={questions[0]} state={state} heading={heading} onAnswer={answer} />
            )}

            {current && !isDrift && (
              <div>
                <h2 ref={heading} tabIndex={-1} className="t-display t-h3 outline-none">
                  {questions[0]?.heading ?? services[current.key].name}
                </h2>
                {questions.map((question) =>
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
                      <Help id={question.id} />
                      <div className="mt-3 grid grid-cols-1 gap-2.5 @md:grid-cols-2">
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
                              <span className="choice-title choice-title-regular block text-[16px]">{o.label}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  ),
                )}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button type="submit" className="btn btn-primary">
                {step === resultIdx - 1 && selected.length ? 'Vis min pris' : 'Næste'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-7">
            <h2 ref={heading} tabIndex={-1} className="t-display t-h3 outline-none">
              Din pris
            </h2>
            {introText && (
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="badge">{introText}</span>
                {introNote && <span className="text-[14px] text-muted">{introNote}</span>}
              </p>
            )}

            <div data-tour="price">
              {/* Totalen: små etiketter over beløbene ("Nu", "Pr. måned"). Etiketterne
                  er kun visuelle; skærmlæsere hører "X kr. nu, Y kr. pr. måned". Engangs-
                  og månedsbeløb står hver for sig, og et beløb på 0 vises ikke. */}
              <div className="calc-total amount-lg mt-4 flex flex-wrap items-end gap-x-10 gap-y-3 tabular-nums">
                {totalParts.once && (
                  <p className="calc-total-part">
                    <span aria-hidden="true" className="t-eyebrow block">
                      {NOW_LABEL}
                    </span>
                    <span className="calc-total-main block">
                      <Amount text={totalParts.once} />
                      <span className="sr-only"> {calculator.nowLabel},</span>
                    </span>
                  </p>
                )}
                {totalParts.month && (
                  <p className="calc-total-part">
                    <span aria-hidden="true" className="t-eyebrow block">
                      {MONTH_LABEL}
                    </span>
                    <span className="calc-total-main block">
                      <Amount text={totalParts.month.replace('/md', '')} />
                      <span className="sr-only"> {MONTH_LABEL.toLowerCase()}</span>
                    </span>
                  </p>
                )}
              </div>
              {q.total.noDrift && (
                <p className="mt-2 text-[16px] text-muted">
                  {totalParts.month ? calculator.noDriftWithMonthly : calculator.noDriftTotal}
                </p>
              )}
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
                      <Amount text={priceText(l)} serif={false} className="block text-[16px] tabular-nums" />
                    </div>
                    {l.key === 'marketing' && !flags.hasMarketingCases && (
                      <p className="mt-1 text-[15px]">
                        <a href={services.marketing.pilot.calcLink.href} className="link-underline hit font-medium">
                          {services.marketing.pilot.calcLink.label}
                        </a>
                      </p>
                    )}
                    <PriceParts parts={l.parts} className="mt-2" />
                    <ul className="t-body mt-2 text-[14px]">
                      {l.tier.features.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                      {l.notes.map((n) => (
                        <li key={n} className="text-ink">
                          {n}
                        </li>
                      ))}
                    </ul>
                    <TierPicker
                      line={l}
                      state={state}
                      onChange={changeTier}
                      status={switched?.key === l.key ? switched.text : ''}
                    />
                    {l.key === 'hjemmeside' && (
                      <DriftPicker
                        line={l}
                        state={state}
                        onChange={changeDrift}
                        status={switched?.key === 'drift' ? switched.text : ''}
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {q.notes.length > 0 && (
              <ul className="mt-5 flex flex-col gap-1.5">
                {q.notes.map((n) => (
                  <li key={n} className="calc-aside">
                    {n}
                  </li>
                ))}
              </ul>
            )}

            <PriceDetails lines={q.lines} />

            <SendQuote smsText={smsBody(q)} />

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              <button type="button" onClick={() => go(1)} className="calc-link">
                Ret svarene
              </button>
              <button
                type="button"
                onClick={() => {
                  moved.current = true
                  setAnimate(true)
                  set({ selected: [...(defaults ?? [])], answers: {}, step: 0 })
                }}
                className="calc-link"
              >
                Start forfra
              </button>
            </div>
          </div>
        )}
      </div>

      <noscript>
        <style>{'#beregner form,[data-tour-launcher]{display:none!important}'}</style>
        <p className="mt-6 text-[15px]">Prisberegneren kræver JavaScript. Alle pakker og priser står på siden Priser.</p>
      </noscript>
    </div>
  )
}

/**
 * Driftstrinnet (valg 2 efter pakken): Basis, Plus, Ekstra og egen konto/hosting.
 * Ingen er forvalgt. Hver plan viser pris, indholdsarbejde (minutter) og en kort
 * beskrivelse; grænserne står kort under, detaljerne i "Hvad er drift?".
 */
function DriftStep({ question, state, heading, onAnswer }) {
  const answers = state.answers
  const web = quote(state).lines.find((l) => l.key === 'hjemmeside')
  const own = question.options.find((o) => o.noDrift)
  const ownAccount = services.hjemmeside.addons.ownAccount
  const radio = (o, children) => (
    <label key={o.id} className="choice calc-plan">
      <input
        type="radio"
        name={question.id}
        value={o.id}
        checked={answers[question.id] === o.id}
        onChange={() => onAnswer(question.id, o.id)}
        className="choice-input"
      />
      <span className="choice-box">
        <span className="choice-mark choice-mark-radio" aria-hidden="true" />
        <span className="min-w-0 flex-1">{children}</span>
      </span>
    </label>
  )
  return (
    <fieldset data-tour="drift">
      <legend>
        <h2 ref={heading} tabIndex={-1} className="t-display t-h3 outline-none">
          {question.heading}
        </h2>
        <span className="t-body mt-2 block text-[15px]">{D.intro}</span>
        {web && (
          <span className="mt-2 block text-[15px] font-medium text-ink">
            {D.packageLine(tierName(web.tier), formatKr(web.parts[0].once))}
          </span>
        )}
      </legend>
      <p className="t-body mt-4 text-[14px]">
        <span className="font-medium text-ink">{D.sharedLead}</span> {services.hjemmeside.drift.included[0]}.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2.5 @2xl:grid-cols-3">
        {question.options
          .filter((o) => o.plan)
          .map((o) => {
            const plan = driftPlans[o.plan]
            return radio(
              o,
              <>
                <span className="flex items-baseline justify-between gap-2">
                  <span className="choice-title text-[17px]">{plan.name}</span>
                  <span className="calc-picked" aria-hidden="true">
                    {D.picked}
                  </span>
                </span>
                <Amount text={`${formatKr(plan.monthly)}/md`} serif={false} className="calc-plan-price block tabular-nums" />
                <span className="mt-1 block text-[14px] font-medium text-ink">{plan.content}</span>
                <span className="t-body mt-0.5 block text-[14px]">{plan.summary}</span>
              </>,
            )
          })}
      </div>
      <div className="mt-2.5">
        {radio(
          own,
          <>
            <span className="flex items-baseline justify-between gap-2">
              <span className="choice-title text-[17px]">{own.label}</span>
              <span className="calc-picked" aria-hidden="true">
                {D.picked}
              </span>
            </span>
            <Amount text={D.ownPrice(formatKr(ownAccount.price))} serif={false} className="calc-plan-price block tabular-nums" />
            <span className="mt-1 block text-[14px] font-medium text-ink">{D.ownText}</span>
            <span className="t-body mt-0.5 block text-[14px]">{D.ownExtra}</span>
          </>,
        )}
      </div>
      <p className="t-body mt-4 max-w-[64ch] text-[14px]">{D.limits()}</p>
      <details className="calc-details mt-3">
        <summary>{D.helpTitle}</summary>
        <div className="t-body mt-2 flex flex-col gap-2 text-[14px]">
          {calculator.help.driftWhat().map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
      </details>
      {priceNote && <p className="t-body mt-3 text-[14px]">{priceNote}</p>}
    </fieldset>
  )
}

/**
 * Pakkevælger under en ydelse i resultatet: Start / Vækst / Fuld fart som en
 * radiogruppe med legend. Prisen ved hver pakke er linjens pris efter et skift
 * (med tilvalg og overlap), så tallet passer med det, resultatet viser bagefter.
 * Driftsvalget bevares ved et skift.
 */
function TierPicker({ line, state, onChange, status }) {
  const key = line.key
  return (
    <fieldset className="mt-4">
      <legend className="text-[14px] font-medium">{calculator.tierSwitch.legend(line.service.name)}</legend>
      <div className="mt-2 grid grid-cols-1 gap-2 @xl:grid-cols-3">
        {line.service.tiers.map((t) => {
          const after = quote({ ...state, answers: switchTier(key, t.id, state.answers) })
          const price = priceText(after.lines.find((x) => x.key === key))
          return (
            <label key={t.id} className="choice choice-sm">
              <input
                type="radio"
                name={`pakke-${key}`}
                value={t.id}
                checked={line.tier.id === t.id}
                onChange={() => onChange(key, t.id)}
                className="choice-input"
              />
              <span className="choice-box">
                <span className="choice-mark choice-mark-radio" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="choice-title text-[15px]">{tierName(t)}</span>
                    <span className="calc-picked" aria-hidden="true">
                      {D.picked}
                    </span>
                  </span>
                  <Amount text={price} serif={false} className="t-body block text-[14px] tabular-nums" />
                </span>
              </span>
            </label>
          )
        })}
      </div>
      <p role="status" className="calc-status mt-2 text-[14px] font-medium text-ink empty:hidden">
        {status}
      </p>
    </fieldset>
  )
}

/**
 * Driftvælger under hjemmesiden i resultatet: Basis / Plus / Ekstra / egen konto.
 * Prisen ved hvert valg er linjens pris efter skiftet; pakken er uændret.
 */
function DriftPicker({ line, state, onChange, status }) {
  const question = calculator.questions.hjemmeside.find((q) => q.id === 'drift')
  const chosen = state.answers.drift
  return (
    <fieldset className="mt-4" data-tour="drift">
      <legend className="text-[14px] font-medium">{D.legend}</legend>
      <div className="mt-2 grid grid-cols-1 gap-2 @md:grid-cols-2 @3xl:grid-cols-4">
        {question.options.map((o) => {
          const after = quote({ ...state, answers: { ...state.answers, drift: o.id } })
          const price = priceText(after.lines.find((x) => x.key === line.key))
          return (
            <label key={o.id} className="choice choice-sm">
              <input
                type="radio"
                name="drift"
                value={o.id}
                checked={chosen === o.id}
                onChange={() => onChange(o.id)}
                className="choice-input"
              />
              <span className="choice-box">
                <span className="choice-mark choice-mark-radio" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="choice-title text-[15px]">{o.label}</span>
                    <span className="calc-picked" aria-hidden="true">
                      {D.picked}
                    </span>
                  </span>
                  <Amount text={price} serif={false} className="t-body block text-[14px] tabular-nums" />
                </span>
              </span>
            </label>
          )
        })}
      </div>
      <p role="status" className="calc-status mt-2 text-[14px] font-medium text-ink empty:hidden">
        {status}
      </p>
    </fieldset>
  )
}

/** Hjælpetekst under et spørgsmål (calculator.help i pricing.js): en tekst eller flere afsnit. */
function Help({ id }) {
  const help = calculator.help[id]
  if (typeof help !== 'string' && (!help || typeof help !== 'object' || typeof Object.values(help)[0] !== 'string')) return null
  const items = typeof help === 'string' ? [help] : Object.values(help)
  return (
    <div className="t-body mt-1.5 flex flex-col gap-1.5 text-[14px]">
      {items.map((text) => (
        <p key={text}>{text}</p>
      ))}
    </div>
  )
}
