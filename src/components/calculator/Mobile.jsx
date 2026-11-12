import { useEffect, useRef, useState } from 'react'
import prices from '../../data/prices.json'
import { helpQuestions, needTitle, needs, nextLabels, stepLabels } from '../../data/calculator.js'
import InquirySlot from './InquirySlot.jsx'
import { Check, DeltaChip, PkgPrice, ReceiptLine, TERMS_SHORT, Total } from './parts.jsx'
import { ExampleOffer, NeedList, ProblemList, SiteBlock, choice, functionsIntro } from './steps.jsx'
import { useExitList } from './useExitList.js'

const heading = 'font-[family-name:var(--font-display)] font-bold [font-stretch:125%]'

function StepHead({ children, aside }) {
  return (
    <div className="mb-2 flex min-h-12 items-center justify-between gap-3">
      <h3 className="text-[clamp(19px,5.6vw,24px)] leading-[1.05] tracking-[-0.025em]">{children}</h3>
      {aside}
    </div>
  )
}

function Need({ calc }) {
  const { state } = calc
  return (
    <div>
      <h2 className="text-[clamp(26px,8vw,36px)] leading-none tracking-[-0.035em]">Prisberegner</h2>
      {state.notice && (
        <p role="status" className="mt-3 mb-0 bg-surface p-3 text-sm leading-normal">
          {state.notice}
        </p>
      )}
      <h3 className="mt-4 mb-3 text-[clamp(19px,5.6vw,24px)] leading-[1.1] tracking-[-0.025em]">{needTitle}</h3>
      <NeedList calc={calc} autoNext />
    </div>
  )
}

function Packages({ calc }) {
  const { state, dispatch } = calc
  const sel = state.selection
  return (
    <div>
      <StepHead>Vælg pakke</StepHead>
      <button
        type="button"
        onClick={() => dispatch({ type: 'helpStart' })}
        className="press flex min-h-12 w-full items-center justify-between bg-surface px-4 active:bg-ink active:text-paper"
      >
        <span className="text-[15px] font-medium whitespace-nowrap">Hjælp mig med at vælge</span>
        <span aria-hidden="true">→</span>
      </button>
      <p className="mt-3 mb-0 text-[15px] leading-normal">Tryk på den pakke, der passer bedst. I kan altid gå tilbage og ændre.</p>
      <div className="mt-3 flex flex-col gap-3" role="group" aria-label="Vælg pakke">
        {prices.packages.map((p, i) => {
          const on = sel.pkg === i
          return (
            <button
              key={p.key}
              type="button"
              aria-pressed={on}
              data-removal={on || (sel.pkg !== null && i < sel.pkg) ? '' : undefined}
              onClick={() => dispatch({ type: 'togglePkg', pkg: i })}
              className={`${choice(on)} flex flex-col gap-2 p-4 [--press:.98]`}
            >
              <span className="flex w-full items-center gap-[10px]">
                <span className={`${heading} text-[clamp(18px,5.2vw,22px)] leading-[1.1] tracking-[-0.025em]`}>{p.name}</span>
                <span className="ml-auto">
                  <Check on={on} size={24} />
                </span>
              </span>
              <span className="text-[13px] leading-4">
                <PkgPrice pkg={p} />
              </span>
              <SiteBlock pkg={p} />
              <span className="flex flex-col gap-[2px]">
                {p.short.map((pt) => (
                  <span key={pt} className="text-sm leading-[1.35]">
                    – {pt}
                  </span>
                ))}
              </span>
            </button>
          )
        })}
      </div>
      {sel.path === 'site' && <p className="mt-3 mb-0 text-[13px] leading-normal text-muted-2">Vil I også løse et problem? Gå tilbage og vælg “Begge dele”.</p>}
    </div>
  )
}

function Systems({ calc }) {
  const { state } = calc
  const sel = state.selection
  return (
    <div>
      <StepHead>Hvad skal løses?</StepHead>
      <p className="m-0 mb-1 text-[15px] leading-normal">{functionsIntro(sel)}</p>
      <p className="m-0 mb-3 text-[15px] leading-normal">Vælg det, I vil have hjælp til. Tryk igen for at fjerne det.</p>
      <ProblemList calc={calc} />
      <p className="mt-3 mb-0 text-[13px] leading-normal text-muted-2">
        {prices.systems.thirdParty} {prices.systems.excluded}
      </p>
    </div>
  )
}

function Summary({ calc }) {
  const { receipt, hrefs, dispatch } = calc
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
      <h3 className="text-[clamp(26px,8vw,36px)] leading-none tracking-[-0.035em]">{receipt.quoteOnly ? 'Din forespørgsel er klar.' : 'Din pris er klar.'}</h3>
      <p className="mt-2 mb-0 text-[15px] text-muted-2">Send valgene til Ronny. Han svarer inden for 24 timer.</p>
      <p className="mt-1 mb-0 text-[15px]">
        Hvad I har brug for: <span className="font-semibold">{needs.find((n) => n.key === receipt.path)?.title}</span>
      </p>
      <div className="mt-5 bg-surface px-4 pt-1 pb-4">
        {receipt.all.map((l) => (
          <ReceiptLine key={l.key + l.pkg} line={l} dark={false} priceSize={13} labelSmall={13} />
        ))}
        {receipt.quoteOnly ? (
          <p className="mt-4 mb-0 text-[15px]">Prisen aftales, når vi har talt om, hvad I har brug for.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-[6px]">
              <span className="text-[13px]">Én gang</span>
              <Total value={receipt.o} unit="kr." size={28} unitSize={12} gap={5} unitPad={2} />
            </div>
            <div className="flex flex-col gap-[6px]">
              <span className="text-[13px]">Hver måned</span>
              <Total value={receipt.m} unit="kr./md." size={28} unitSize={12} gap={5} unitPad={2} />
            </div>
          </div>
        )}
        {receipt.hasQuote && !receipt.quoteOnly && <p className="mt-3 mb-0 text-[13px]">Det, der bygges specielt, er ikke med i tallene. Prisen aftales.</p>}
        <p className="mt-3 text-[13px]">Alle priser er ekskl. moms</p>
      </div>
      <div className="mt-4">
        <ExampleOffer calc={calc} />
      </div>
      <div className="mt-5">
        <InquirySlot receipt={receipt} hrefs={hrefs} />
      </div>
      <div className="mt-2 flex flex-col gap-2">
        <button type="button" onClick={() => dispatch({ type: 'mBack' })} className="press min-h-12 w-full border-2 border-ink bg-paper px-4 text-[15px] font-medium [--press:.98]">
          ← Tilbage og ret mine valg
        </button>
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
      <div className="flex flex-col gap-3" role="group" aria-label={helpQuestions[q].title}>
        {helpQuestions[q].options.map((label, i) => {
          const on = multi ? answers.includes(i) : help.a[q] === i
          return (
            <button
              key={label}
              type="button"
              aria-pressed={on}
              onClick={() => dispatch({ type: 'helpAnswer', i })}
              className={`${choice(on)} flex min-h-14 items-center gap-3 px-4 [--press:.98]`}
            >
              <span className="flex-1 py-[10px] text-[17px] leading-[1.3] font-medium">{label}</span>
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
  const { receipt } = calc
  return (
    <div>
      <h3 className="mt-2 mb-5 text-[clamp(24px,7.2vw,32px)] leading-[1.05] tracking-[-0.03em]">Det her ville vi starte med.</h3>
      <div className="flex flex-col gap-2">
        {receipt.all.map((l) => (
          <div key={l.key} className="anim-line grid items-baseline gap-3 bg-surface p-4" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
            <span className="flex flex-col gap-[2px]">
              <span className={`${heading} text-[17px] tracking-[-0.015em]`}>{l.label}</span>
              <span className="text-sm">{l.pkg}</span>
            </span>
            <span className="price text-[13px]">{l.price}</span>
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
  const { state, dispatch, receipt, any, complete, hrefs, delta } = calc
  const { sheet } = state
  const [drag, setDrag] = useState({ dy: 0, active: false, from: false })
  const ds = useRef(null)
  const closeRef = useRef(null)
  const wasOpen = useRef(false)
  const showTerms = any

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
  const shortRows = useExitList(all, (l) => l.key + l.pkg)
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
          aria-label={sheet ? 'Luk dine valg' : 'Se dine valg'}
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
            <span className="relative block min-w-0 flex-1 overflow-hidden text-[13px] leading-[1.35] text-ellipsis whitespace-nowrap text-on-ink-2">
              <span className="swap-in absolute top-0 left-0" data-on={any ? undefined : ''}>
                Vælg for at se prisen
              </span>
              <span className="swap-out block overflow-hidden text-ellipsis" data-off={any ? undefined : ''}>
                {shortRows.map(({ item: l, exiting }, i) => (
                  <span key={l.key + l.pkg} className="fold-x align-top" data-exiting={exiting ? '' : undefined}>
                    <span>
                      {i > 0 ? ' · ' : ''}
                      {l.short}
                    </span>
                  </span>
                ))}
                {!any && ' '}
              </span>
            </span>
            <span className="flex-none text-[13px] font-semibold whitespace-nowrap">{sheet ? 'Luk dine valg ↓' : 'Se dine valg ↑'}</span>
          </div>
          {/* Kun de totaler, der har et beløb (en total uden beløb vises ikke); en total folder sig ud, når den får et beløb, og sammen efter nedtællingen, når den mister det. */}
          <div className="swap-out mt-[6px] flex items-end" data-off={any ? undefined : ''}>
            <div className="fold-x after-count" data-exiting={receipt.o > 0 ? undefined : ''}>
              <div className="relative flex flex-col gap-[3px] pr-5">
                <span className="text-xs text-on-ink-2">Én gang</span>
                {delta?.o < 0 && <DeltaChip key={delta.id} amount={delta.o} className="top-0 right-0" />}
                <Total value={receipt.o} unit="kr." size={22} unitSize={12} gap={4} unitPad={1} />
              </div>
            </div>
            <div className="fold-x after-count" data-exiting={receipt.m > 0 ? undefined : ''}>
              <div className="relative flex flex-col gap-[3px] pr-5">
                <span className="text-xs text-on-ink-2">Hver måned</span>
                {delta?.m < 0 && <DeltaChip key={delta.id} amount={delta.m} monthly className="top-0 right-0" />}
                <Total value={receipt.m} unit="kr./md." size={22} unitSize={12} gap={4} unitPad={1} />
              </div>
            </div>
            <span className="ml-auto flex-none self-end pb-[2px] text-[13px] leading-tight whitespace-nowrap text-on-ink-2">ekskl. moms</span>
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
        aria-label="Din pris"
        aria-modal="true"
        inert={!sheet}
        className="absolute right-0 bottom-0 left-0 z-[41] flex flex-col bg-ink text-paper"
        style={{
          maxHeight: '86%',
          transform,
          // Lukket ark tegnes ikke: visibility skifter først, når lukkeanimationen er færdig.
          visibility: sheet || dragging ? 'visible' : 'hidden',
          transition: dragging ? 'none' : `transform 460ms var(--spring-sheet), visibility 0s linear ${sheet ? '0s' : '460ms'}`,
        }}
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
            <span className="text-base font-semibold">Din pris</span>
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
          {!any && <p className="mt-2 text-[15px] text-on-ink-2">Vælg for at se prisen.</p>}
          {all.map((l) => (
            <ReceiptLine key={l.key + l.pkg} line={l} priceSize={13} />
          ))}
          {showTerms && <p className="mt-3 text-[13px] leading-normal text-on-ink-2">{TERMS_SHORT}</p>}
          {receipt.quoteOnly ? (
            <p className="mt-5 mb-0 text-[15px]">Prisen aftales, når vi har talt om, hvad I har brug for.</p>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-[6px]">
                <span className="text-[13px] text-on-ink-2">Én gang</span>
                <Total value={receipt.o} unit="kr." size={30} unitSize={13} gap={5} unitPad={2} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <span className="text-[13px] text-on-ink-2">Hver måned</span>
                <Total value={receipt.m} unit="kr./md." size={30} unitSize={13} gap={5} unitPad={2} />
              </div>
            </div>
          )}
          {receipt.hasQuote && !receipt.quoteOnly && <p className="mt-3 mb-0 text-[13px] text-on-ink-2">Det, der bygges specielt, er ikke med i tallene. Prisen aftales.</p>}
          <p className="mt-3 text-[13px] text-on-ink-2">Alle priser er ekskl. moms</p>
          {any && (
            <div className="mt-5 flex flex-col gap-2">
              {complete && (
                <button type="button" onClick={() => dispatch({ type: 'go', step: 'sum' })} className="btn btn-white px-4 [--press:.98]">
                  <span className="whitespace-nowrap">Se samlet pris</span>
                  <span aria-hidden="true">→</span>
                </button>
              )}
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
  const { state, dispatch, flow } = calc
  const { help } = state
  const step = flow.step
  const inHelp = !!help
  const hq = help ? help.q : 0
  const stepName = stepLabels[step]
  const nextLabel = flow.next ? nextLabels[flow.next] : 'Vælg, hvad I har brug for'
  const nextDisabled = !flow.canNext
  const canBack = inHelp && hq > 0
  const canBackStep = !inHelp && !!flow.prev && step !== 'sum'
  const barVisible = (!inHelp && step !== 'sum') || (inHelp && hq === 3)
  const multiNextOk = inHelp && hq === 1 && (help.a[1] || []).length > 0

  // Nyt trin: tilbage til toppen og fokus på panelet, så tastatur og skærmlæser følger med.
  const bodyRef = useRef(null)
  const panelRef = useRef(null)
  const first = useRef(true)
  const panelKey = inHelp ? `h${hq}` : `s${step}`
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    bodyRef.current?.scrollTo({ top: 0 })
    panelRef.current?.focus({ preventScroll: true })
  }, [panelKey])

  // Handlingsknapperne ligger i rullefeltet: lige under sidste valg (16 px margen + 8 px polstring = 24 px), og klæbet til bunden over bundbaren, hvis indholdet er højere.
  const actions =
    !inHelp && step !== 'sum' ? (
      <div className={canBackStep ? 'grid gap-2' : ''} style={canBackStep ? { gridTemplateColumns: 'auto minmax(0,1fr)' } : undefined}>
        {canBackStep && (
          <button
            type="button"
            aria-label="Tilbage"
            onClick={() => dispatch({ type: 'mBack' })}
            className="press min-h-14 border-2 border-ink bg-paper px-5 text-[15px] font-medium [--press:.96]"
          >
            <span aria-hidden="true">← </span>Tilbage
          </button>
        )}
        <button
          type="button"
          disabled={nextDisabled}
          onClick={() => dispatch({ type: 'mNext' })}
          className={`btn w-full justify-center ${nextDisabled ? '' : 'btn-ink'}`}
        >
          {nextLabel}
        </button>
      </div>
    ) : inHelp && hq === 1 ? (
      <button
        type="button"
        disabled={!multiNextOk}
        onClick={() => dispatch({ type: 'helpNextQ' })}
        className={`btn w-full justify-center ${multiNextOk ? 'btn-ink' : ''}`}
      >
        Næste spørgsmål
      </button>
    ) : inHelp && hq === 3 ? (
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => dispatch({ type: 'helpCustomize' })} className="btn btn-surface min-h-14 justify-center px-4 text-[15px]">
          Tilpas selv
        </button>
        <button type="button" onClick={() => dispatch({ type: 'helpToSummary' })} className="btn btn-ink min-h-14 justify-center px-4 text-[15px]">
          Se samlet pris
        </button>
      </div>
    ) : null

  return (
    <div className="relative flex h-full flex-col overflow-clip">
      <div className="flex min-h-[52px] flex-none items-center gap-3 px-4 pt-[10px] pb-[2px]">
        {canBack && (
          <button type="button" aria-label="Tilbage" onClick={() => dispatch({ type: 'mBack' })} className="press min-h-12 flex-none border-2 border-ink bg-paper px-4 text-[15px] font-medium [--press:.96]">
            <span aria-hidden="true">← </span>Tilbage
          </button>
        )}
        {!inHelp && step !== 'sum' && (
          <div className="min-w-0 flex-1">
            <div className="mb-[7px] text-[13px] whitespace-nowrap text-muted-2">
              {flow.total > 1 ? `Trin ${flow.index + 1} af ${flow.total} · ${stepName}` : `Trin 1 · ${stepName}`}
            </div>
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${flow.total},minmax(0,1fr))` }} aria-hidden="true">
              {flow.steps.map((k, i) => (
                <span key={k} className="h-[3px]" style={{ background: i <= flow.index ? 'var(--ink)' : 'var(--hairline)', transition: 'background 240ms ease-out' }} />
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
        {!inHelp && step === 'sum' && (
          <button type="button" onClick={() => dispatch({ type: 'mBack' })} className="press min-h-12 border-2 border-ink bg-paper px-4 text-[15px] font-medium [--press:.96]">
            ← Tilbage og ret mine valg
          </button>
        )}
      </div>

      <div ref={bodyRef} className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pt-3 pb-3" style={{ scrollbarWidth: 'none' }}>
        <div key={panelKey} ref={panelRef} tabIndex={-1} className="anim-step outline-none">
          {inHelp ? (
            hq < 3 ? (
              <HelpQuestion calc={calc} />
            ) : (
              <HelpResult calc={calc} />
            )
          ) : step === 'need' ? (
            <Need calc={calc} />
          ) : step === 'pkg' ? (
            <Packages calc={calc} />
          ) : step === 'sys' ? (
            <Systems calc={calc} />
          ) : (
            <Summary calc={calc} />
          )}
        </div>
        {actions && (
          <div className="sticky bottom-0 z-[1] -mx-4 mt-4 bg-paper px-4 pt-2 pb-3">{actions}</div>
        )}
      </div>

      <div className="flex-none">
        <BarAndSheet calc={calc} barRef={barRef} barVisible={barVisible} />
      </div>
      {fly}
    </div>
  )
}
