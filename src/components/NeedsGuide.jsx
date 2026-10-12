import { useEffect, useRef, useState } from 'react'
import { lineTitle, lokalOf, priceText, serialize, smsBody } from '../calculator.js'
import { QUESTIONS, plannedTotal, proposal, questionList, recommend, withAnswer } from '../guide.js'
import { calculator, contact, priceNote } from '../data/pricing.js'
import { cta, links } from '../data/texts.js'
import Amount from './Amount.jsx'
import { MailIcon, PhoneIcon, SmsIcon } from './ContactButtons.jsx'
import ErrorText from './ErrorText.jsx'
import PriceDetails, { LokalTerms, PriceParts, TotalBlock } from './PriceDetails.jsx'
import SendQuote from './SendQuote.jsx'

const G = calculator.guide

/**
 * BEHOVSGUIDEN ("Hjælp mig med at vælge") inde i beregnerens område. Frivillig:
 * åbnes kun af kunden, har altid "Tilbage" og "Vælg selv i beregneren", og tager
 * ikke siden over. Højst tre spørgsmål, og "Spring over" står synligt på hvert spørgsmål og på resultatet. Reglerne står i src/guide.js; svarene i adresselinjen
 * (useGuide), så genindlæsning og tilbage-knappen i guiden mister intet.
 *
 * Tilgængelighed som beregneren: fieldset med legend og almindelige radioknapper
 * (piletaster), overskriften får fokus ved hvert nyt trin, fejlen står under
 * knappen og flytter fokus til svarene.
 */
export default function NeedsGuide({ guide, setGuide, onExit, onOpen, focusOnOpen = false }) {
  const [missing, setMissing] = useState(false)
  const heading = useRef(null)
  const form = useRef(null)
  // Åbnet af kunden selv: fokus til spørgsmålet. Ikke ved indlæsning af et delt link.
  const moved = useRef(focusOnOpen)
  const { step, a } = guide
  const list = questionList(a)
  const isResult = step === list.length + 1
  const key = isResult ? null : list[step - 1]
  const total = plannedTotal(a)

  useEffect(() => {
    if (!moved.current) return
    moved.current = false
    heading.current?.focus({ preventScroll: true })
    heading.current?.closest('[data-calc]')?.scrollIntoView({ block: 'start' })
  }, [step])

  const go = (next) => {
    setMissing(false)
    moved.current = true
    setGuide({ ...guide, step: next })
  }
  const back = () => (step === 1 ? onExit() : go(step - 1))
  const choose = (value) => {
    setMissing(false)
    setGuide(withAnswer(guide, key, value))
  }
  const submit = (event) => {
    event.preventDefault()
    if (!a[key]) {
      setMissing(true)
      form.current?.querySelector('input')?.focus()
      return
    }
    go(step + 1)
  }

  const label = isResult ? 'Forslag' : total ? `Spørgsmål ${step} af ${total}` : `Spørgsmål ${step}`
  const progress = total ? Math.min(step, total + 1) / (total + 1) : 0.12

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="font-mono text-[14px] tracking-[0.08em] text-muted uppercase">{label}</p>
        <button type="button" onClick={back} className="calc-link">
          <span aria-hidden="true">←</span> Tilbage
        </button>
      </div>
      <div className="calc-progress mt-3" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>

      <div key={step} className="calc-stage" data-animate>
      {isResult ? (
        <Result guide={guide} heading={heading} onOpen={onOpen} onChange={() => go(1)} onExit={onExit} />
      ) : (
        <form ref={form} onSubmit={submit} noValidate className="mt-7">
          <fieldset>
            <legend>
              <h2 ref={heading} tabIndex={-1} className="t-display t-h3 outline-none">
                {QUESTIONS[key].label}
              </h2>
              {QUESTIONS[key].help && <span className="t-body mt-2 block text-[15px]">{QUESTIONS[key].help}</span>}
            </legend>
            <div className="mt-5 grid grid-cols-1 gap-2.5 @md:grid-cols-2">
              {QUESTIONS[key].options.map((o) => (
                <label key={o.id} className="choice">
                  <input
                    type="radio"
                    name={`guide-${QUESTIONS[key].id}`}
                    value={o.id}
                    checked={a[key] === o.id}
                    onChange={() => choose(o.id)}
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
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="submit" className="btn btn-primary">
              {step === list.length && total === list.length ? (recommend(a).kind === 'plan' ? 'Vis mit forslag' : 'Se resultatet') : 'Næste'}
            </button>
            {missing && (
              <ErrorText role="alert" className="text-[15px]">
                {G.pickAnswer}
              </ErrorText>
            )}
          </div>
          <p className="mt-5">
            <button type="button" onClick={onExit} className="btn btn-ghost" data-guide-skip>
              {G.skip}
            </button>{' '}
            <span className="t-body text-[14px]">{G.skipHint}</span>
          </p>
        </form>
      )}
      </div>
    </div>
  )
}

function Result({ guide, heading, onOpen, onChange, onExit }) {
  const rec = proposal(guide.a)

  if (rec.kind === 'unclear' || rec.kind === 'talk') {
    const talk = rec.kind === 'talk'
    return (
      <div className="mt-7">
        <h2 ref={heading} tabIndex={-1} className="t-display t-h3 outline-none">
          {talk ? rec.title : G.unclearTitle}
        </h2>
        <p className="t-body mt-3 max-w-[52ch] text-[16px]">{talk ? rec.text : G.unclearText}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href={links.tel} className="btn btn-primary whitespace-nowrap">
            <PhoneIcon />
            <span>
              {cta.call} <span className="tabular-nums">{contact.phone}</span>
            </span>
          </a>
          <a href={links.sms(talk ? rec.sms : G.unclearSms)} className="btn btn-ghost">
            <SmsIcon />
            {cta.sms}
          </a>
          <a href={links.mail} className="btn btn-ghost">
            <MailIcon />
            {cta.write}
          </a>
        </div>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <button type="button" onClick={onChange} className="calc-link">
            {G.change}
          </button>
          <button type="button" onClick={onExit} className="calc-link" data-guide-skip>
            {G.skip} {G.skipHint}
          </button>
        </div>
      </div>
    )
  }

  const { quote: q, state, reasons } = rec
  const link = `${window.location.pathname}${serialize(state)}`
  return (
    <div className="mt-7">
      <h2 ref={heading} tabIndex={-1} className="t-display t-h3 outline-none">
        {G.resultTitle}
      </h2>
      {q.lines.map((line) => (
        <div key={line.key} className="mt-3">
          <p className="text-[18px] font-medium">{lineTitle(line)}</p>
          <p className="t-body mt-1 text-[15px]">{line.tier.summary}</p>
          <p className="mt-1 text-[15px] font-medium">
            <Amount text={priceText(line)} serif={false} className="tabular-nums" />
          </p>
          <PriceParts parts={line.parts} className="mt-2" />
        </div>
      ))}

      <div data-tour="price">
        <TotalBlock q={q} labels={{ once: G.oncePrice, month: G.monthPrice }} always sub className="mt-4" />
      </div>
      {priceNote && <p className="t-body mt-2 text-[14px]">{priceNote}</p>}
      {q.total.noDrift && calculator.ownAccountNote && <p className="mt-3 max-w-[52ch] text-[15px] text-ink">{calculator.ownAccountNote}</p>}

      <h3 className="mt-6 text-[15px] font-medium">{G.whyTitle}</h3>
      <ul className="t-body mt-1 list-disc pl-5 text-[15px]">
        {reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>

      <h3 className="mt-5 text-[15px] font-medium">{G.includesTitle}</h3>
      <ul className="t-body mt-1 list-disc pl-5 text-[15px]">
        {q.lines.flatMap((line) => [
          ...line.tier.features.map((f) => <li key={`${line.key}-${f}`}>{f}</li>),
          ...line.notes.map((n) => (
            <li key={`${line.key}-${n}`} className="text-ink">
              {n}
            </li>
          )),
        ])}
      </ul>
      {q.notes.map((n) => (
        <p key={n} className="calc-aside mt-3">
          {n}
        </p>
      ))}

      {lokalOf(q) && <LokalTerms line={lokalOf(q)} />}

      <PriceDetails lines={q.lines} />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="button" onClick={() => onOpen(state)} className="btn btn-primary">
          {G.open}
        </button>
        <button type="button" onClick={onChange} className="calc-link">
          {G.change}
        </button>
        <button type="button" onClick={onExit} className="calc-link" data-guide-skip>
          {G.skip} {G.skipHint}
        </button>
      </div>

      <SendQuote smsText={smsBody(q)} link={link} />
    </div>
  )
}
