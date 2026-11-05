import { useEffect, useRef, useState } from 'react'
import prices from '../../data/prices.json'
import { driftChoices, helpQuestions, serviceMeta, SERVICE_KEYS, shortPoints } from '../../data/calculator.js'
import { formatKr } from '../../lib/calculate.js'
import { Check, ReceiptLine, TERMS_SHORT, Total } from './parts.jsx'

const NB = ' '
const heading = 'font-[family-name:var(--font-display)] font-bold [font-stretch:125%]'
const drift = (key) => prices.drift.plans.find((p) => p.key === key)
const driftName = (c) => c.name ?? drift(c.key).name
const driftPrice = (c) => (c.key === 'egen' ? `+${formatKr(prices.addons.ownHosting.price)} engang` : formatKr(drift(c.key).price, true))

/** Valgflade: mørk når valgt, lys ellers. Hele fladen er en knap (≥ 48 px). */
const choice = (on) => `press w-full text-left min-h-12 ${on ? 'bg-ink text-paper' : 'bg-surface text-ink'}`

function StepHead({ children, aside }) {
  return (
    <div className="mb-2 flex min-h-12 items-center justify-between gap-3">
      <h3 className="text-[clamp(19px,5.6vw,24px)] leading-[1.05] tracking-[-0.025em]">{children}</h3>
      {aside}
    </div>
  )
}

function Services({ calc }) {
  const { state, dispatch } = calc
  const svc = state.selection.services
  return (
    <div>
      <h2 className="text-[clamp(26px,8vw,36px)] leading-none tracking-[-0.035em]">Prisberegner</h2>
      <button
        type="button"
        onClick={() => dispatch({ type: 'helpStart' })}
        className="press mt-[14px] flex min-h-[52px] w-full items-center justify-between bg-surface px-4 active:bg-ink active:text-paper"
      >
        <span className="text-[15px] font-medium whitespace-nowrap">Hjælp mig med at vælge</span>
        <span aria-hidden="true">→</span>
      </button>
      <div className="mt-4 flex flex-col gap-2">
        {SERVICE_KEYS.map((key) => {
          const s = prices.services[key]
          const meta = serviceMeta[key]
          const sel = svc[key] !== null
          return (
            <button
              key={key}
              type="button"
              aria-pressed={sel}
              onClick={() => dispatch({ type: 'toggleService', key })}
              className={`${choice(sel)} flex items-start gap-[14px] px-4 py-[14px] [--press:.98]`}
            >
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className={`${heading} text-[clamp(18px,5.2vw,22px)] leading-[1.1] tracking-[-0.025em]`}>{s.name}</span>
                <span className="text-sm leading-[1.35]">{meta.desc}</span>
                <span className="price mt-[2px] text-[13px]">fra {formatKr(s.packages[0].price, meta.month)}</span>
              </span>
              <Check on={sel} size={24} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Packages({ calc }) {
  const { state, dispatch, chosenKeys } = calc
  const key = chosenKeys[Math.min(state.sub, chosenKeys.length - 1)]
  if (!key) return null
  const s = prices.services[key]
  const meta = serviceMeta[key]
  const cur = state.selection.services[key]
  return (
    <div>
      <StepHead
        aside={
          <a href={meta.href} className="flex min-h-12 flex-none items-center text-sm whitespace-nowrap">
            Læs mere →
          </a>
        }
      >
        {s.name}
      </StepHead>
      <div className="flex flex-col gap-2" role="group" aria-label={`${s.name}, vælg pakke`}>
        {s.packages.map((p, i) => (
          <button
            key={p.key}
            type="button"
            aria-pressed={cur === i}
            onClick={() => dispatch({ type: 'setService', key, value: i })}
            className={`${choice(cur === i)} flex flex-col gap-2 px-4 py-[14px] [--press:.98]`}
          >
            <span className="flex w-full items-center gap-[10px]">
              <span className={`${heading} text-lg tracking-[-0.02em] whitespace-nowrap`}>{p.name}</span>
              {p.recommended && <span className="bg-paper px-[7px] py-[3px] text-xs font-medium whitespace-nowrap text-ink">Anbefalet</span>}
              <span className="price ml-auto text-sm">{formatKr(p.price, meta.month)}</span>
              <Check on={cur === i} size={24} />
            </span>
            <span className="flex flex-col gap-[3px]">
              {shortPoints[key][i].map((pt) => (
                <span key={pt} className="text-sm leading-[1.35]">
                  – {pt}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Drift({ calc }) {
  const { state, dispatch } = calc
  const cur = state.selection.drift
  return (
    <div>
      <StepHead aside={<span className="text-[13px] whitespace-nowrap text-muted-2">Ingen binding</span>}>Driftsplan</StepHead>
      <div className="flex flex-col gap-2" role="group" aria-label="Driftsplan">
        {driftChoices.map((c) => (
          <button
            key={c.key}
            type="button"
            aria-pressed={cur === c.key}
            onClick={() => dispatch({ type: 'setDrift', drift: c.key })}
            className={`${choice(cur === c.key)} flex flex-col gap-1 px-4 py-[13px] [--press:.98]`}
          >
            <span className="flex w-full items-center gap-[10px]">
              <span className={`${heading} text-[17px] tracking-[-0.015em] whitespace-nowrap`}>{driftName(c)}</span>
              <span className="price ml-auto text-[13px]">{driftPrice(c)}</span>
              <Check on={cur === c.key} size={24} />
            </span>
            <span className="text-[13px] leading-[1.35]">{c.desc}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-[13px] leading-normal text-muted-2">Alle planer: online, sikker, domæne og backup. 1{NB}md. opsigelse.</p>
    </div>
  )
}

function Addons({ calc }) {
  const { state, dispatch, receipt } = calc
  const sel = state.selection
  const included = receipt.bookingIncluded
  const on = sel.bookingAddon && !included
  const full = sel.services.web === 2
  return (
    <div>
      <StepHead>Tilvalg</StepHead>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          aria-pressed={on}
          disabled={included}
          onClick={() => dispatch({ type: 'toggleBooking' })}
          className={`${choice(on)} flex items-center gap-[14px] p-4 [--press:.98]`}
        >
          <span className="flex flex-1 flex-col gap-1">
            <span className="text-base font-semibold">
              {prices.addons.booking.name} <span className="price text-[13px] font-normal">+{formatKr(prices.addons.booking.price)}</span>
            </span>
            <span className="text-[13px]">
              {included ? `Indgår i Booking & Google · ${prices.services.book.packages[sel.services.book].name}` : 'Abonnementet betales til udbyderen.'}
            </span>
          </span>
          {included ? <span className="flex-none bg-paper px-[10px] py-[6px] text-[13px] font-medium text-ink">Indgår</span> : <Check on={on} size={24} />}
        </button>
        <div className="flex flex-col gap-3 bg-surface p-4">
          <div className="flex flex-col gap-1">
            <span className="text-base font-semibold">
              {prices.addons.extraPage.name} <span className="price text-[13px] font-normal">+{formatKr(prices.addons.extraPage.price).replace('kr.', 'kr./side')}</span>
            </span>
            <span className="text-[13px]">{full ? 'Ud over de 8 sider i Fuld fart.' : 'Kun med Fuld fart.'}</span>
          </div>
          {full ? (
            <div className="grid h-[52px] self-start bg-paper" style={{ gridTemplateColumns: '52px 56px 52px' }}>
              <button
                type="button"
                aria-label="Færre undersider"
                disabled={sel.extraPages <= 0}
                onClick={() => dispatch({ type: 'setExtra', value: sel.extraPages - 1 })}
                className="press text-xl [--press:.88] disabled:opacity-40"
              >
                −
              </button>
              <span className="price flex items-center justify-center text-base" aria-live="polite">
                {sel.extraPages}
              </span>
              <button
                type="button"
                aria-label="Flere undersider"
                onClick={() => dispatch({ type: 'setExtra', value: sel.extraPages + 1 })}
                className="press text-xl [--press:.88]"
              >
                +
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => dispatch({ type: 'upgradeFull' })} className="btn btn-white min-h-12 self-start px-4 text-sm [--press:.96]">
              Skift til Fuld fart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function Summary({ calc }) {
  const { receipt, hrefs } = calc
  const [copied, setCopied] = useState(false)
  const copy = () => {
    try {
      navigator.clipboard?.writeText(hrefs.url)
    } catch {
      /* linket står i adresselinjen */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div>
      <h3 className="text-[clamp(26px,8vw,36px)] leading-none tracking-[-0.035em]">Din pris er klar.</h3>
      <p className="mt-2 text-[15px] text-muted-2">Jeg svarer inden for 24 timer.</p>
      <div className="mt-5 bg-surface px-4 pt-1 pb-4">
        {receipt.all.map((l) => (
          <ReceiptLine key={l.key + l.pkg} line={l} dark={false} priceSize={13} labelSmall={13} />
        ))}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-[6px]">
            <span className="text-[13px]">Engang</span>
            <Total value={receipt.o} unit="kr." size={28} unitSize={12} gap={5} unitPad={2} />
          </div>
          <div className="flex flex-col gap-[6px]">
            <span className="text-[13px]">Pr. måned</span>
            <Total value={receipt.m} unit="kr./md." size={28} unitSize={12} gap={5} unitPad={2} />
          </div>
        </div>
        <p className="mt-3 text-[13px]">Alle priser er ekskl. moms</p>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <a href={hrefs.mail} className="btn btn-ink px-[18px] [--press:.98]">
          <span className="whitespace-nowrap">Send mine valg</span>
          <span aria-hidden="true">→</span>
        </a>
        <div className="grid grid-cols-2 gap-2">
          <a href="tel:+4553613699" className="btn btn-surface min-h-[52px] justify-center text-[15px]">
            Ring til Ronny
          </a>
          <a href={hrefs.sms} className="btn btn-surface min-h-[52px] justify-center text-[15px]">
            Skriv en SMS
          </a>
        </div>
        <button type="button" onClick={copy} className="min-h-12 text-[15px] underline underline-offset-4">
          {copied ? 'Link kopieret' : 'Kopiér link til min pris'}
        </button>
      </div>
    </div>
  )
}

function HelpQuestion({ calc }) {
  const { state, dispatch } = calc
  const { help } = state
  const q = help.q
  const multi = q === 1
  const answers = help.a[1] || []
  return (
    <div>
      <h3 className="mt-2 mb-5 text-[clamp(24px,7.2vw,32px)] leading-[1.05] tracking-[-0.03em]">{helpQuestions[q].title}</h3>
      <div className="flex flex-col gap-2" role="group" aria-label={helpQuestions[q].title}>
        {helpQuestions[q].options.map((label, i) => {
          const on = multi ? answers.includes(i) : help.a[q] === i
          return (
            <button
              key={label}
              type="button"
              aria-pressed={on}
              onClick={() => dispatch({ type: 'helpAnswer', i })}
              className={`${choice(on)} flex min-h-16 items-center gap-[14px] px-4 [--press:.98]`}
            >
              <span className="flex-1 py-3 text-[17px] leading-[1.3] font-medium">{label}</span>
              <Check on={on} size={24} />
            </button>
          )
        })}
      </div>
      {multi && <p className="mt-[14px] text-[13px] text-muted-2">Vælg en eller flere.</p>}
    </div>
  )
}

function HelpResult({ calc }) {
  const { state } = calc
  const svc = state.selection.services
  const rows = SERVICE_KEYS.filter((k) => svc[k] !== null).map((k) => ({
    name: prices.services[k].name,
    pkg: prices.services[k].packages[svc[k]].name,
    price: formatKr(prices.services[k].packages[svc[k]].price, serviceMeta[k].month),
  }))
  if (svc.web !== null) {
    const c = driftChoices.find((x) => x.key === state.selection.drift)
    rows.push({ name: 'Drift', pkg: driftName(c), price: driftPrice(c).replace(' engang', '') })
  }
  return (
    <div>
      <h3 className="mt-2 mb-5 text-[clamp(24px,7.2vw,32px)] leading-[1.05] tracking-[-0.03em]">Det her ville jeg starte med.</h3>
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div key={r.name} className="anim-line grid items-baseline gap-3 bg-surface p-4" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
            <span className="flex flex-col gap-[2px]">
              <span className={`${heading} text-[17px] tracking-[-0.015em]`}>{r.name}</span>
              <span className="text-sm">{r.pkg}</span>
            </span>
            <span className="price text-[13px]">{r.price}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Bundbar og kvitteringsark. Baren viser valg og totaler; tryk, træk op eller
 * Enter/Space åbner arket, som lukkes med træk ned, bagtæppe, Luk eller Escape.
 */
function BarAndSheet({ calc, barRef, barVisible }) {
  const { state, dispatch, receipt, any, hrefs, odoDelay } = calc
  const { sheet } = state
  const [drag, setDrag] = useState({ dy: 0, active: false, from: false })
  const ds = useRef(null)
  const closeRef = useRef(null)
  const wasOpen = useRef(false)
  const showTerms = state.selection.services.web !== null && state.selection.drift !== 'egen'

  useEffect(() => {
    if (sheet) closeRef.current?.focus({ preventScroll: true })
    else if (wasOpen.current) barRef.current?.focus({ preventScroll: true })
    wasOpen.current = sheet
    if (!sheet) return
    const onKey = (e) => e.key === 'Escape' && dispatch({ type: 'sheet', open: false })
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sheet, dispatch, barRef])

  const down = (e) => {
    ds.current = { y: e.clientY, open: sheet }
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* pointer capture kan mangle */
    }
  }
  const move = (e) => {
    if (!ds.current) return
    const dy = e.clientY - ds.current.y
    if (Math.abs(dy) > 4) setDrag({ dy, active: true, from: ds.current.open })
  }
  const up = (e) => {
    if (!ds.current) return
    const dy = e.clientY - ds.current.y
    const open = ds.current.open
    ds.current = null
    let next = open
    if (Math.abs(dy) < 6) next = !open
    else if (!open && dy < -40) next = true
    else if (open && dy > 60) next = false
    setDrag({ dy: 0, active: false, from: false })
    dispatch({ type: 'sheet', open: next })
  }

  const dragging = drag.active
  const transform = sheet
    ? `translateY(${dragging ? Math.max(0, drag.dy) : 0}px)`
    : dragging && !drag.from
      ? `translateY(calc(100% + ${Math.min(0, drag.dy)}px))`
      : 'translateY(100%)'
  const all = receipt.all
  const barKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      dispatch({ type: 'sheet', open: !sheet })
    }
  }

  return (
    <>
      <div style={{ maxHeight: barVisible ? 130 : 0, overflow: 'hidden', transition: 'max-height 420ms var(--ease-bar)' }}>
        <div
          ref={barRef}
          role="button"
          tabIndex={barVisible ? 0 : -1}
          aria-expanded={sheet}
          aria-label={sheet ? 'Luk kvittering' : 'Se kvittering'}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onKeyDown={barKey}
          className="cursor-grab bg-ink px-4 pt-2 pb-3 text-paper select-none"
          style={{ touchAction: 'none' }}
        >
          <span aria-hidden="true" className="mx-auto mb-2 block h-1 w-9 bg-muted" />
          <div className="flex items-baseline gap-3">
            {all.length > 0 && <span className="flex-none text-[13px] font-semibold whitespace-nowrap">{all.length} valg</span>}
            <span className="min-w-0 flex-1 truncate text-[13px] text-on-ink-2">{all.map((l) => l.short).join(' · ') || 'Ingen valg endnu'}</span>
            <span className="flex-none text-[13px] font-semibold whitespace-nowrap">{sheet ? 'Luk kvittering ↓' : 'Se kvittering ↑'}</span>
          </div>
          <div className="mt-[6px] grid items-end gap-[10px]" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) auto' }}>
            <div className="flex flex-col gap-[3px]">
              <span className="text-xs text-on-ink-2">Engang</span>
              <Total value={receipt.o} unit="kr." size={22} unitSize={12} delay={odoDelay} gap={4} unitPad={1} />
            </div>
            <div className="flex flex-col gap-[3px]">
              <span className="text-xs text-on-ink-2">Pr. måned</span>
              <Total value={receipt.m} unit="kr./md." size={22} unitSize={12} delay={odoDelay} gap={4} unitPad={1} />
            </div>
            <span className="text-right text-[11px] leading-tight text-on-ink-2">
              ekskl.
              <br />
              moms
            </span>
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        onClick={() => dispatch({ type: 'sheet', open: false })}
        className="absolute inset-0 z-40"
        style={{ background: 'var(--scrim)', opacity: sheet ? 1 : 0, pointerEvents: sheet ? 'auto' : 'none', transition: 'opacity 300ms ease-out' }}
      />
      <div
        role="dialog"
        aria-label="Din kvittering"
        aria-modal="true"
        inert={!sheet}
        className="absolute right-0 bottom-0 left-0 z-[41] flex flex-col bg-ink text-paper"
        style={{ maxHeight: '86%', transform, transition: dragging ? 'none' : 'transform 460ms var(--spring-sheet)' }}
      >
        <div className="flex flex-none items-center">
          <div
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            className="flex-1 cursor-grab px-4 pt-2 pb-3 select-none"
            style={{ touchAction: 'none' }}
          >
            <span aria-hidden="true" className="mb-[10px] block h-1 w-9 bg-muted" />
            <span className="text-base font-semibold">Din kvittering</span>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => dispatch({ type: 'sheet', open: false })}
            className="min-h-12 flex-none px-4 text-[15px] font-semibold underline underline-offset-4"
          >
            Luk
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5" style={{ scrollbarWidth: 'none' }}>
          {!any && <p className="mt-2 text-[15px] text-on-ink-2">Ingen valg endnu.</p>}
          {all.map((l) => (
            <ReceiptLine key={l.key + l.pkg} line={l} priceSize={13} />
          ))}
          {showTerms && <p className="mt-3 text-[13px] leading-normal text-on-ink-2">{TERMS_SHORT}</p>}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-[6px]">
              <span className="text-[13px] text-on-ink-2">Engang</span>
              <Total value={receipt.o} unit="kr." size={30} unitSize={13} gap={5} unitPad={2} />
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="text-[13px] text-on-ink-2">Pr. måned</span>
              <Total value={receipt.m} unit="kr./md." size={30} unitSize={13} gap={5} unitPad={2} />
            </div>
          </div>
          <p className="mt-3 text-[13px] text-on-ink-2">Alle priser er ekskl. moms</p>
          {any && (
            <div className="mt-5 flex flex-col gap-2">
              <a href={hrefs.mail} className="btn btn-white px-4 [--press:.98]">
                <span className="whitespace-nowrap">Send mine valg</span>
                <span aria-hidden="true">→</span>
              </a>
              <div className="grid grid-cols-2 gap-2">
                <a href="tel:+4553613699" className="btn btn-surface min-h-[52px] justify-center text-[15px]">
                  Ring til Ronny
                </a>
                <a href={hrefs.sms} className="btn btn-surface min-h-[52px] justify-center text-[15px]">
                  Skriv en SMS
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function Mobile({ calc, barRef, fly }) {
  const { state, dispatch, any, chosenKeys } = calc
  const { step, sub, help } = state
  const web = state.selection.services.web !== null
  const nC = chosenKeys.length
  const subC = Math.min(sub, Math.max(0, nC - 1))
  const inHelp = !!help
  const hq = help ? help.q : 0
  const cur = chosenKeys[step === 2 ? subC : 0]
  const sub3 = sub ? 1 : 0
  const nxt = chosenKeys[subC + 1]

  const stepName =
    step === 1 ? 'Ydelser' : step === 2 ? (cur ? prices.services[cur].name + (nC > 1 ? ` ${subC + 1}/${nC}` : '') : 'Pakker') : step === 3 ? (sub3 ? 'Tilvalg' : 'Driftsplan') : 'Opsummering'
  const nextLabel =
    step === 1
      ? any
        ? 'Næste: Vælg pakke'
        : 'Vælg mindst én ydelse'
      : step === 2
        ? subC < nC - 1 && nxt
          ? 'Næste: ' + prices.services[nxt].name
          : web
            ? 'Næste: Driftsplan'
            : 'Se opsummering'
        : sub3
          ? 'Se opsummering'
          : 'Næste: Tilvalg'
  const nextDisabled = step === 1 && !any
  const canBack = inHelp ? hq > 0 : step > 1 && step < 4
  const barVisible = (!inHelp && step < 4) || (inHelp && hq === 3)
  const multiNextOk = inHelp && hq === 1 && (help.a[1] || []).length > 0

  // Nyt trin: tilbage til toppen og fokus på panelet, så tastatur og skærmlæser følger med.
  const bodyRef = useRef(null)
  const panelRef = useRef(null)
  const first = useRef(true)
  const panelKey = inHelp ? `h${hq}` : `s${step}-${step === 2 ? subC : sub3}`
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    bodyRef.current?.scrollTo({ top: 0 })
    panelRef.current?.focus({ preventScroll: true })
  }, [panelKey])

  return (
    <div className="relative flex h-full flex-col overflow-clip">
      <div className="flex min-h-[52px] flex-none items-center gap-3 px-4 pt-[10px] pb-[2px]">
        {canBack && (
          <button type="button" aria-label="Tilbage" onClick={() => dispatch({ type: 'mBack' })} className="press h-12 w-12 flex-none bg-surface text-lg [--press:.92]">
            ←
          </button>
        )}
        {!inHelp && step < 4 && (
          <div className="min-w-0 flex-1">
            <div className="mb-[7px] text-[13px] whitespace-nowrap text-muted-2">
              Trin {step} af 4 · {stepName}
            </div>
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))' }} aria-hidden="true">
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className="h-[3px]" style={{ background: n <= step ? 'var(--ink)' : 'var(--hairline)', transition: 'background 240ms ease-out' }} />
              ))}
            </div>
          </div>
        )}
        {inHelp && hq < 3 && (
          <>
            <div className="min-w-0 flex-1">
              <div className="mb-[7px] text-[13px] whitespace-nowrap text-muted-2">Spørgsmål {hq + 1} af 3</div>
              <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }} aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-[3px]" style={{ background: i <= hq ? 'var(--ink)' : 'var(--hairline)', transition: 'background 240ms ease-out' }} />
                ))}
              </div>
            </div>
            <button type="button" onClick={() => dispatch({ type: 'helpClose' })} className="min-h-12 flex-none px-1 text-sm underline underline-offset-4">
              Afbryd
            </button>
          </>
        )}
        {inHelp && hq === 3 && (
          <>
            <span className="flex-1 text-[13px] text-muted-2">Mit forslag</span>
            <button type="button" onClick={() => dispatch({ type: 'helpStart' })} className="min-h-12 flex-none px-1 text-sm underline underline-offset-4">
              Start forfra
            </button>
          </>
        )}
        {!inHelp && step === 4 && (
          <button type="button" onClick={() => dispatch({ type: 'mBack' })} className="btn btn-surface min-h-12 px-4 text-[15px] [--press:.96]">
            ← Ret mine valg
          </button>
        )}
      </div>

      <div ref={bodyRef} className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pt-3 pb-4" style={{ scrollbarWidth: 'none' }}>
        <div key={panelKey} ref={panelRef} tabIndex={-1} className="anim-step outline-none">
          {inHelp ? (
            hq < 3 ? (
              <HelpQuestion calc={calc} />
            ) : (
              <HelpResult calc={calc} />
            )
          ) : step === 1 ? (
            <Services calc={calc} />
          ) : step === 2 ? (
            <Packages calc={calc} />
          ) : step === 3 ? (
            sub3 ? (
              <Addons calc={calc} />
            ) : (
              <Drift calc={calc} />
            )
          ) : (
            <Summary calc={calc} />
          )}
        </div>
      </div>

      <div className="flex-none">
        {!inHelp && step < 4 && (
          <div className="px-4 py-2">
            <button
              type="button"
              disabled={nextDisabled}
              onClick={() => dispatch({ type: 'mNext' })}
              className={`btn w-full justify-center ${nextDisabled ? '' : 'btn-ink'}`}
            >
              {nextLabel}
            </button>
          </div>
        )}
        {inHelp && hq === 1 && (
          <div className="px-4 pt-2 pb-4">
            <button
              type="button"
              disabled={!multiNextOk}
              onClick={() => dispatch({ type: 'helpNextQ' })}
              className={`btn w-full justify-center ${multiNextOk ? 'btn-ink' : ''}`}
            >
              Næste spørgsmål
            </button>
          </div>
        )}
        {inHelp && hq === 3 && (
          <div className="grid grid-cols-2 gap-2 px-4 py-2">
            <button type="button" onClick={() => dispatch({ type: 'helpCustomize' })} className="btn btn-surface min-h-14 justify-center px-4 text-[15px]">
              Tilpas selv
            </button>
            <button type="button" onClick={() => dispatch({ type: 'helpToSummary' })} className="btn btn-ink min-h-14 justify-center px-4 text-[15px]">
              Se opsummering
            </button>
          </div>
        )}
        <BarAndSheet calc={calc} barRef={barRef} barVisible={barVisible} />
      </div>
      {fly}
    </div>
  )
}
