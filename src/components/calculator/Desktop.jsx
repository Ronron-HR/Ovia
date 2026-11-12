import { useState } from 'react'
import prices from '../../data/prices.json'
import { helpQuestions, needTitle, needs, nextLabels, stepLabels } from '../../data/calculator.js'
import { formatKr } from '../../lib/calculate.js'
import { deliveryText, termsShort } from '../../lib/receipt.js'
import InquirySlot from './InquirySlot.jsx'
import { Check, DeltaChip, ReceiptLine, Total } from './parts.jsx'
import { ExampleOffer, NeedList, ProblemList, SiteBlock, functionsIntro } from './steps.jsx'
import { useExitList } from './useExitList.js'

const heading = 'font-[family-name:var(--font-display)] font-bold [font-stretch:125%]'

/** Kvitteringskolonnens bredde og sidens luft vokser med skærmen, så venstre kolonne aldrig bliver klemt (fra 1024 px). */
const ASIDE_W = 'clamp(360px,31vw,440px)'
const PAD_L = 'clamp(32px,4.4vw,64px)'
const PAD_R = 'clamp(32px,5vw,72px)'

/** Glidende mørk markering bag den valgte mulighed. index < 0 = intet valgt (markeringen skjules). */
function Segmented({ cols, index, children }) {
  return (
    <div className="relative grid border-2 border-ink bg-paper [&>button+button]:border-l-2 [&>button+button]:border-ink" style={{ gridTemplateColumns: `repeat(${cols},minmax(0,1fr))` }}>
      <div
        aria-hidden="true"
        className="absolute top-0 bottom-0 bg-ink"
        style={{ left: `${(Math.max(index, 0) * 100) / cols}%`, width: `${100 / cols}%`, opacity: index < 0 ? 0 : 1, transition: 'left 420ms var(--spring-slide), opacity 200ms ease-out' }}
      />
      {children}
    </div>
  )
}

/** Pakkens pris på to linjer: engang og pr. måned (kolonnerne er smalle). */
function PackagePrice({ pkg }) {
  return (
    <span className="flex flex-col gap-1">
      <span className="price text-lg">{formatKr(pkg.once)}</span>
      <span className="price text-sm">+ {formatKr(pkg.monthly, true)}</span>
    </span>
  )
}

function StepNeed({ calc }) {
  const { state } = calc
  return (
    <div className="anim-step max-w-[760px]">
      {state.notice && (
        <p role="status" className="mt-0 mb-6 bg-surface p-4 text-[15px] leading-normal">
          {state.notice}
        </p>
      )}
      <h3 className="mb-6 text-[clamp(28px,3vw,44px)] leading-[1.05] tracking-[-0.03em]">{needTitle}</h3>
      <NeedList calc={calc} wide />
    </div>
  )
}

function StepPackages({ calc }) {
  const { state, dispatch } = calc
  const sel = state.selection
  return (
    <div className="anim-step">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="m-0 max-w-[60ch] text-[15px] leading-normal">Tryk på den pakke, der passer bedst. Priserne er faste. Drift, domæne og sikkerhedskopi er med i den månedlige pris.</p>
        <button type="button" onClick={() => dispatch({ type: 'helpStart' })} className="press hov-ink flex min-h-12 flex-none items-center gap-4 bg-surface px-5">
          <span className="text-[15px] font-medium whitespace-nowrap">Hjælp mig med at vælge</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <div role="group" aria-label="Vælg pakke">
        <Segmented cols={3} index={sel.pkg ?? -1}>
          {prices.packages.map((p, i) => {
            const on = sel.pkg === i
            return (
              <button
                key={p.key}
                type="button"
                aria-pressed={on}
                onClick={() => dispatch({ type: 'togglePkg', pkg: i })}
                className={`press relative flex min-h-[340px] flex-col gap-4 bg-transparent pt-6 pb-6 text-left [--press:.97] ${on ? 'text-paper' : 'text-ink'}`}
                style={{ paddingLeft: 'clamp(14px,1.7vw,24px)', paddingRight: 'clamp(14px,1.7vw,24px)', transition: 'transform 260ms var(--spring-press), color 180ms ease-out 60ms' }}
              >
                <span className="flex w-full items-baseline justify-between gap-2">
                  <span className={`${heading} text-[22px] tracking-[-0.02em]`}>{p.name}</span>
                </span>
                <PackagePrice pkg={p} />
                <SiteBlock pkg={p} wide />
                <ul className="m-0 flex list-none flex-col gap-[6px] p-0">
                  {p.points.map((pt) => (
                    <li key={pt} className="text-[13px] leading-[1.45]">
                      – {pt}
                    </li>
                  ))}
                </ul>
              </button>
            )
          })}
        </Segmented>
      </div>
      {sel.path === 'site' && <p className="mt-3 mb-0 text-sm leading-normal text-muted-2">Vil I også løse et problem? Gå tilbage og vælg “Begge dele”.</p>}
    </div>
  )
}

function StepSystems({ calc }) {
  const { state } = calc
  const sel = state.selection
  return (
    <div className="anim-step flex flex-col gap-2">
      <p className="m-0 text-[15px] leading-normal">{functionsIntro(sel)}</p>
      <p className="m-0 mb-2 text-[15px] leading-normal">Vælg det, I vil have hjælp til. Tryk igen for at fjerne det.</p>
      <ProblemList calc={calc} wide />
      <p className="mt-2 mb-0 text-sm leading-normal text-muted-2">
        {prices.systems.thirdParty} {prices.systems.excluded}
      </p>
    </div>
  )
}

function StepSummary({ calc }) {
  const { hrefs, receipt } = calc
  const [copied, setCopied] = useState(false)
  const copy = () => {
    try {
      navigator.clipboard?.writeText(hrefs.url)
    } catch {
      /* ingen udklipsholder: linket står i adresselinjen */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className="anim-step max-w-[680px]">
      <h3 className="text-[clamp(36px,4.4vw,68px)] leading-[.95] tracking-[-0.035em]">{receipt.quoteOnly ? 'Din forespørgsel er klar.' : 'Din pris er klar.'}</h3>
      <p className="mt-4 mb-0 text-[17px] text-muted-2">Send valgene til Ronny. Han svarer inden for 24 timer.</p>
      <p className="mt-1 mb-0 text-[17px]">
        Hvad I har brug for: <span className="font-semibold">{needs.find((n) => n.key === receipt.path)?.title}</span>
      </p>
      {deliveryText(receipt.selection) && <p className="mt-4 mb-0 max-w-[60ch] text-[15px] leading-normal">{deliveryText(receipt.selection)}</p>}
      <div className="mt-6">
        <ExampleOffer calc={calc} wide />
      </div>
      <div className="mt-6">
        <InquirySlot receipt={receipt} hrefs={hrefs} />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-7">
        <button type="button" onClick={copy} className="min-h-12 text-[15px] font-medium underline underline-offset-4">
          {copied ? 'Link kopieret' : 'Kopiér link til min pris'}
        </button>
        <span className="price max-w-[420px] truncate text-xs text-muted-2">{hrefs.url.replace(/^https?:\/\//, '')}</span>
      </div>
    </div>
  )
}

function Help({ calc }) {
  const { state, dispatch } = calc
  const help = state.help
  const q = help.q
  if (q === 3) return <HelpResult calc={calc} />
  const multi = q === 1
  const answers = multi ? help.a[1] || [] : []
  const hasAnswer = answers.length > 0
  return (
    <div className="max-w-[760px]">
      <div className="flex items-center gap-6">
        <span className="text-sm whitespace-nowrap text-muted-2">Spørgsmål {q + 1} af 3</span>
        <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-[3px]" style={{ background: i <= q ? 'var(--ink)' : 'var(--hairline)', transition: 'background 240ms ease-out' }} />
          ))}
        </div>
        <button type="button" onClick={() => dispatch({ type: 'helpClose' })} className="min-h-12 text-sm underline underline-offset-4">
          Afbryd
        </button>
      </div>
      <h3 className="mt-14 mb-7 text-[clamp(32px,3.6vw,56px)] leading-none tracking-[-0.035em]">{helpQuestions[q].title}</h3>
      <div className="flex flex-col gap-3" role="group" aria-label={helpQuestions[q].title}>
        {helpQuestions[q].options.map((label, i) => {
          const on = multi ? answers.includes(i) : help.a[q] === i
          return (
            <button
              key={label}
              type="button"
              aria-pressed={on}
              onClick={() => dispatch({ type: 'helpAnswer', i })}
              className={`press flex min-h-[72px] w-full items-center gap-5 px-6 text-left [--press:.985] border-2 border-ink ${on ? 'bg-ink text-paper' : 'bg-paper text-ink'}`}
            >
              <span className="flex-1 text-xl font-medium">{label}</span>
              <Check on={on} />
            </button>
          )
        })}
      </div>
      {multi && (
        <div className="mt-5 flex items-center justify-between gap-5">
          <span className="text-sm text-muted-2">Vælg en eller flere.</span>
          <button
            type="button"
            disabled={!hasAnswer}
            onClick={() => dispatch({ type: 'helpNextQ' })}
            className={`btn ${hasAnswer ? 'btn-ink' : ''}`}
          >
            Næste spørgsmål
          </button>
        </div>
      )}
      {q > 0 && (
        <button type="button" onClick={() => dispatch({ type: 'helpPrev' })} className="press mt-5 min-h-12 border-2 border-ink bg-paper px-5 text-sm font-medium">
          ← Forrige spørgsmål
        </button>
      )}
    </div>
  )
}

function HelpResult({ calc }) {
  const { dispatch, receipt } = calc
  return (
    <div className="anim-step max-w-[760px]">
      <div className="flex items-center justify-between gap-6">
        <span className="text-sm text-muted-2">Mit forslag</span>
        <button type="button" onClick={() => dispatch({ type: 'helpStart' })} className="min-h-12 text-sm underline underline-offset-4">
          Start forfra
        </button>
      </div>
      <h3 className="mt-14 mb-7 text-[clamp(32px,3.6vw,56px)] leading-none tracking-[-0.035em]">Det her ville vi starte med.</h3>
      <div className="flex flex-col gap-2">
        {receipt.all.map((l) => (
          <div key={l.key} className="anim-line flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 bg-surface px-6 py-5">
            <span className="flex min-w-0 flex-wrap items-baseline gap-3">
              <span className={`${heading} text-[22px] tracking-[-0.02em]`}>{l.label}</span>
              <span className="text-base">{l.pkg}</span>
            </span>
            <span className="price text-sm">{l.price}</span>
          </div>
        ))}
      </div>
      <div className="mt-7 flex gap-2">
        <button type="button" onClick={() => dispatch({ type: 'helpToSummary' })} className="btn btn-ink hov-ink-soft">
          Se samlet pris
        </button>
        <button type="button" onClick={() => dispatch({ type: 'helpCustomize' })} className="btn btn-surface">
          Tilpas selv
        </button>
      </div>
    </div>
  )
}

/** Kvitteringens linjer: de folder sig sammen, når de fjernes, og sektionen med dem. */
function ReceiptSection({ lines }) {
  const rows = useExitList(lines, (l) => l.key)
  return (
    <div className="fold" data-exiting={lines.length === 0 ? '' : undefined}>
      <div>
        <div className="pb-5">
          <span className="text-[13px] text-on-ink-2">Dine valg</span>
          {rows.map(({ item: l, exiting }) => (
            <div key={l.key} className="fold" data-exiting={exiting ? '' : undefined}>
              <ReceiptLine line={l} animate tight priceSize={13} labelSmall={12} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Den sorte kvittering til højre. Bredden er 340–440 px og alt indhold ombrydes i den (intet er nowrap undtagen selve tallet,
 * hvis størrelse er sat, så fem cifre og enheden altid er inden for 340 px), så intet går ud over skærmkanten.
 */
function Aside({ calc }) {
  const { state, dispatch, receipt, any, complete, hrefs, delta } = calc
  const [copied, setCopied] = useState(false)
  const copy = () => {
    try {
      navigator.clipboard?.writeText(hrefs.url)
    } catch {
      /* se StepSummary */
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <aside
      aria-label="Din pris"
      className="sticky top-[84px] flex min-w-0 flex-col overflow-hidden bg-ink px-8 pt-10 pb-7 text-paper"
      style={{ height: 'calc(100svh - 84px)', minHeight: 560 }}
    >
      <span className="text-[15px] font-semibold">Din pris</span>
      <div className="relative mt-4 min-h-0 flex-1 overflow-x-hidden overflow-y-auto" style={{ scrollbarWidth: 'none', maskImage: 'linear-gradient(to bottom, #000 calc(100% - 24px), transparent)' }}>
        <p className="swap-in absolute top-0 left-0 m-0 text-[15px] leading-normal text-on-ink-2" data-on={!any ? '' : undefined}>
          Vælg, hvad I har brug for, for at se prisen.
        </p>
        <ReceiptSection lines={receipt.all} />
      </div>
      <div className="mt-3 flex flex-col gap-3 pt-3">
        <div className="swap-out flex flex-col gap-3" data-off={!any ? '' : undefined} aria-hidden={!any}>
          {receipt.quoteOnly && <p className="m-0 text-[15px] leading-normal">Prisen aftales, når vi har talt om, hvad I har brug for.</p>}
          <div className="relative flex flex-col gap-[2px]" style={receipt.quoteOnly ? { display: 'none' } : undefined}>
            <span className="text-[13px] text-on-ink-2">Én gang</span>
            {delta?.o < 0 && <DeltaChip key={delta.id} amount={delta.o} className="top-0 right-0" />}
            <Total value={receipt.o} unit="kr." size={38} unitSize={14} />
          </div>
          <div className="relative flex flex-col gap-[2px]" style={receipt.quoteOnly ? { display: 'none' } : undefined}>
            <span className="text-[13px] text-on-ink-2">Hver måned</span>
            {delta?.m < 0 && <DeltaChip key={delta.id} amount={delta.m} monthly className="top-0 right-0" />}
            <Total value={receipt.m} unit="kr./md." size={38} unitSize={14} />
          </div>
          {receipt.hasQuote && !receipt.quoteOnly && <p className="m-0 text-[13px] leading-[1.4] text-on-ink-2">Oveni kommer det, der bygges specielt. Prisen aftales.</p>}
          {!receipt.quoteOnly && <p className="m-0 text-[13px] leading-[1.4] text-on-ink-2">Alle priser er ekskl. moms. {termsShort(receipt)}</p>}
        </div>
        {state.step !== 'sum' ? (
          <button
            type="button"
            disabled={!complete}
            onClick={() => dispatch({ type: 'go', step: 'sum' })}
            className="press mt-1 flex min-h-14 items-center justify-between gap-3 bg-paper px-5 text-left text-base font-semibold text-ink [--press:.98] disabled:opacity-40"
          >
            <span>Se samlet pris</span>
            <span aria-hidden="true">→</span>
          </button>
        ) : (
          <button type="button" onClick={copy} className="mt-1 min-h-12 text-left text-[15px] font-medium text-paper underline underline-offset-4">
            {copied ? 'Link kopieret' : 'Kopiér link til min pris'}
          </button>
        )}
      </div>
    </aside>
  )
}

export default function Desktop({ calc }) {
  const { state, dispatch, flow } = calc
  const { help } = state
  const step = flow.step
  const inHelp = !!help
  const next = flow.next ? nextLabels[flow.next] : 'Vælg, hvad I har brug for'
  return (
    <div className="grid items-start" style={{ gridTemplateColumns: `minmax(0,1fr) ${ASIDE_W}`, minHeight: '100svh' }}>
      <div className="flex min-w-0 flex-col pt-14 pb-12" style={{ minHeight: '100svh', paddingLeft: PAD_L, paddingRight: PAD_R }}>
        {step === 'need' && !inHelp && (
          <div className="mb-10">
            <h2 className="text-[clamp(40px,5.4vw,84px)] leading-[.9] tracking-[-0.04em]">Prisberegner</h2>
          </div>
        )}
        {!inHelp && step !== 'sum' && (
          <nav aria-label="Trin i beregneren" className="relative">
            <div className="absolute top-0 right-0 left-0 h-[3px] bg-hairline" />
            <div className="absolute top-0 left-0 h-[3px] bg-ink" style={{ width: `${((flow.index + 1) * 100) / flow.total}%`, transition: 'width 420ms var(--spring-slide)' }} />
            <ol className="m-0 grid list-none p-0" style={{ gridTemplateColumns: `repeat(${flow.total},minmax(0,1fr))` }}>
              {flow.steps.map((key, i) => {
                const enabled = i <= flow.reach
                return (
                  <li key={key}>
                    <button
                      type="button"
                      disabled={!enabled}
                      aria-current={i === flow.index ? 'step' : undefined}
                      onClick={() => dispatch({ type: 'go', step: key })}
                      className="flex min-h-12 flex-wrap items-baseline gap-x-2 gap-y-[2px] bg-transparent pt-4 pr-3 text-left"
                      style={{ opacity: enabled ? 1 : 0.4 }}
                    >
                      <span className="text-[15px]" style={{ fontWeight: i === flow.index ? 600 : 400 }}>
                        {stepLabels[key]}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>
        )}
        <div className="flex-1" style={{ marginTop: inHelp ? 0 : step === 'need' ? 32 : 40 }}>
          {inHelp ? (
            <Help calc={calc} />
          ) : step === 'need' ? (
            <StepNeed calc={calc} />
          ) : step === 'pkg' ? (
            <StepPackages calc={calc} />
          ) : step === 'sys' ? (
            <StepSystems calc={calc} />
          ) : (
            <StepSummary calc={calc} />
          )}
        </div>

        {!inHelp && (
          <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <button
              type="button"
              onClick={() => dispatch({ type: 'back' })}
              className="press min-h-12 border-2 border-ink bg-paper px-5 text-[15px] font-medium [--press:.97]"
              style={{ visibility: flow.prev ? 'visible' : 'hidden' }}
            >
              ← Tilbage
            </button>
            {step !== 'sum' && (
              <button
                type="button"
                disabled={!flow.canNext}
                onClick={() => dispatch({ type: 'next' })}
                className={`btn ${flow.canNext ? 'btn-ink hov-ink-soft' : ''}`}
              >
                {next}
              </button>
            )}
          </div>
        )}
      </div>
      <Aside calc={calc} />
    </div>
  )
}
