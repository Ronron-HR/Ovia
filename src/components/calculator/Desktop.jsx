import { useState } from 'react'
import prices from '../../data/prices.json'
import { helpQuestions, stepLabels } from '../../data/calculator.js'
import { formatKr, introActive, nextSystemCost } from '../../lib/calculate.js'
import { priceText } from '../../lib/receipt.js'
import InquirySlot from './InquirySlot.jsx'
import { Check, DeltaChip, ReceiptLine, TERMS_SHORT, Total, slotsText } from './parts.jsx'
import { useExitList } from './useExitList.js'

const heading = 'font-[family-name:var(--font-display)] font-bold [font-stretch:125%]'

/** Hvad et ekstra system koster oven i valget nu: "Indgår" (der er plads i pakken) eller "+2.000 kr. + 99 kr./md.". */
const extraText = (c) => (!c ? '' : c.once === 0 && c.monthly === 0 ? 'Indgår' : '+' + priceText({ once: c.once, monthly: c.monthly }))

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

/** Pakkens pris på to linjer: engang og pr. måned (kolonnerne er smalle). Intro: normalprisen overstreget. */
function PackagePrice({ pkg, intro }) {
  const saving = intro && introActive() ? Math.round(pkg.once * prices.intro.discount) : 0
  return (
    <span className="flex flex-col gap-1">
      <span className="price text-lg">
        {saving > 0 ? (
          <>
            <s className="text-sm opacity-70">{formatKr(pkg.once)}</s> {formatKr(pkg.once - saving)}
          </>
        ) : (
          formatKr(pkg.once)
        )}
      </span>
      <span className="price text-sm">+ {formatKr(pkg.monthly, true)}</span>
    </span>
  )
}

function StepPackages({ calc }) {
  const { state, dispatch } = calc
  const sel = state.selection
  return (
    <div className="anim-step">
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
                className={`press relative flex min-h-[340px] flex-col gap-4 bg-transparent px-6 pt-6 pb-6 text-left [--press:.97] ${on ? 'text-paper' : 'text-ink'}`}
                style={{ transition: 'transform 260ms var(--spring-press), color 180ms ease-out 60ms' }}
              >
                <span className="flex w-full items-baseline justify-between gap-2">
                  <span className={`${heading} text-[22px] tracking-[-0.02em]`}>{p.name}</span>
                </span>
                <PackagePrice pkg={p} intro={sel.intro} />
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
      <p className="mt-3 mb-0 text-[15px] leading-normal">Tryk på den pakke, der passer bedst. Priserne er faste. Drift, domæne og sikkerhedskopi er med i den månedlige pris.</p>
    </div>
  )
}

function StepSystems({ calc }) {
  const { state, dispatch, receipt } = calc
  const sel = state.selection
  const pkg = prices.packages[sel.pkg]
  const byKey = Object.fromEntries(receipt.all.map((l) => [l.key, l]))
  const nextStd = nextSystemCost(sel, 'standard')
  const nextCustom = nextSystemCost(sel, 'custom')
  const intro =
    pkg.slots === 0
      ? `${pkg.name} har ingen funktioner med. Hver funktion, I vælger, lægges til som ekstra.`
      : pkg.customSlots
        ? `${pkg.name} har ${pkg.slots} funktioner med. Én af dem kan være bygget specielt til jer. Flere lægges til som ekstra.`
        : `${pkg.name} har ${pkg.slots} funktion med, efter eget valg. Flere lægges til som ekstra.`
  return (
    <div className="anim-step flex flex-col gap-2">
      <p className="m-0 text-[15px] leading-normal">{intro}</p>
      <p className="m-0 mb-2 text-[15px] leading-normal">Tryk på en funktion for at vælge den. Tryk igen for at fjerne den.</p>
      <div className="flex flex-col gap-3" role="group" aria-label="Funktioner">
        {prices.systems.standard.map((s) => {
          const on = sel.systems.includes(s.key)
          const line = byKey['sys-' + s.key]
          const tag = on ? (line.included ? line.price : '+' + line.price) : extraText(nextStd)
          return (
            <button
              key={s.key}
              type="button"
              aria-pressed={on}
              onClick={() => dispatch({ type: 'toggleSystem', key: s.key })}
              className={`press grid items-center gap-8 px-6 py-5 text-left [--press:.99] border-2 border-ink ${on ? 'bg-ink text-paper' : 'bg-paper text-ink'}`}
              style={{ gridTemplateColumns: 'minmax(0,1fr) 230px 28px' }}
            >
              <span className="flex flex-col gap-1">
                <span className="text-[17px] font-semibold">{s.name}</span>
                <span className="text-sm leading-normal">{s.desc}</span>
              </span>
              <span className="price text-sm">{tag}</span>
              <Check on={on} />
            </button>
          )
        })}
        <div className="grid items-center gap-8 bg-surface px-6 py-5" style={{ gridTemplateColumns: 'minmax(0,1fr) 230px auto' }}>
          <div className="flex flex-col gap-1">
            <span className="text-[17px] font-semibold">{prices.systems.custom.name}</span>
            <span className="text-sm leading-normal">{prices.systems.custom.desc}</span>
          </div>
          <span className="price text-sm">{sel.custom < prices.systems.custom.max ? `Næste opgave: ${extraText(nextCustom)}` : 'Højeste antal nået'}</span>
          <div className="grid h-12" style={{ gridTemplateColumns: '48px 52px 48px' }}>
            <button
              type="button"
              aria-label="Fjern én bygget til jer"
              disabled={sel.custom <= 0}
              onClick={() => dispatch({ type: 'setCustom', value: sel.custom - 1 })}
              className="press border-2 border-ink bg-paper text-lg [--press:.88] disabled:opacity-40"
            >
              −
            </button>
            <span className="price flex items-center justify-center text-[15px]" aria-live="polite">
              {sel.custom}
            </span>
            <button
              type="button"
              aria-label="Tilføj én bygget til jer"
              disabled={sel.custom >= prices.systems.custom.max}
              onClick={() => dispatch({ type: 'setCustom', value: sel.custom + 1 })}
              className="press border-2 border-ink bg-paper text-lg [--press:.88] disabled:opacity-40"
            >
              +
            </button>
          </div>
        </div>
      </div>
      <p className="mt-2 mb-0 text-sm leading-normal text-muted-2">
        {prices.systems.thirdParty} {prices.systems.excluded}
      </p>
    </div>
  )
}

function StepAddons({ calc }) {
  const { state, dispatch } = calc
  const sel = state.selection
  const pkg = prices.packages[sel.pkg]
  const englishIncluded = pkg.english === 'included'
  const saving = Math.round(pkg.once * prices.intro.discount)
  return (
    <div className="anim-step flex flex-col gap-3">
      <span className={`${heading} mb-1 text-[22px] tracking-[-0.02em]`}>Sprog og rabat</span>
      <p className="m-0 mb-2 text-[15px] leading-normal">Begge dele er valgfrie. Tryk for at vælge, tryk igen for at fjerne.</p>
      {englishIncluded ? (
        <div className="grid items-center gap-8 bg-surface px-6 py-5" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
          <span className="flex flex-col gap-1">
            <span className="text-[17px] font-semibold">{prices.addons.english.name}</span>
            <span className="text-sm">Indgår i {pkg.name}.</span>
          </span>
          <span className="bg-paper px-[10px] py-[6px] text-[13px] font-medium text-ink">Indgår</span>
        </div>
      ) : (
        <button
          type="button"
          aria-pressed={sel.english}
          onClick={() => dispatch({ type: 'toggleEnglish' })}
          className={`press grid items-center gap-8 px-6 py-5 text-left [--press:.99] border-2 border-ink ${sel.english ? 'bg-ink text-paper' : 'bg-paper text-ink'}`}
          style={{ gridTemplateColumns: 'minmax(0,1fr) 230px 28px' }}
        >
          <span className="flex flex-col gap-1">
            <span className="text-[17px] font-semibold">{prices.addons.english.name}</span>
            <span className="text-sm">Hele siden på engelsk.</span>
          </span>
          <span className="price text-sm">+{formatKr(prices.addons.english.once)}</span>
          <Check on={sel.english} />
        </button>
      )}
      {introActive() && (
        <button
          type="button"
          aria-pressed={sel.intro}
          onClick={() => dispatch({ type: 'toggleIntro' })}
          className={`press grid items-center gap-8 px-6 py-5 text-left [--press:.99] border-2 border-ink ${sel.intro ? 'bg-ink text-paper' : 'bg-paper text-ink'}`}
          style={{ gridTemplateColumns: 'minmax(0,1fr) 28px' }}
        >
          <span className="flex flex-col gap-1">
            <span className="text-[17px] font-semibold">Introduktionspris: {Math.round(prices.intro.discount * 100)}&nbsp;% rabat på engangsprisen</span>
            <span className="text-sm leading-normal">
              De første {prices.intro.total} kunder får rabat, hvis vi må vise jeres side som eksempel på vores hjemmeside. {slotsText()}. Rabatten gælder ikke den månedlige pris.
            </span>
            <span className="text-sm font-semibold">Ja, I må vise siden som case (eksempel){sel.intro ? ` · du sparer ${formatKr(saving)} på engangsprisen` : ''}</span>
          </span>
          <Check on={sel.intro} />
        </button>
      )}
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
      <h3 className="text-[clamp(36px,4.4vw,68px)] leading-[.95] tracking-[-0.035em]">Din pris er klar.</h3>
      <p className="mt-4 text-[17px] text-muted-2">Send valgene. Svar inden for 24 timer.</p>
      <div className="mt-10">
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
          <div key={l.key} className="anim-line grid items-baseline gap-5 bg-surface px-6 py-5" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
            <span className="flex flex-wrap items-baseline gap-3">
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
function ReceiptSection({ lines, terms }) {
  const rows = useExitList(lines, (l) => l.key)
  return (
    <div className="fold" data-exiting={lines.length === 0 ? '' : undefined}>
      <div>
        <div className="pb-5">
          <span className="text-[13px] text-on-ink-2">Dine valg</span>
          {rows.map(({ item: l, exiting }) => (
            <div key={l.key} className="fold" data-exiting={exiting ? '' : undefined}>
              <ReceiptLine line={l} animate />
            </div>
          ))}
          {terms}
        </div>
      </div>
    </div>
  )
}

function Aside({ calc }) {
  const { state, dispatch, receipt, any, hrefs, delta } = calc
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
      aria-label="Din kvittering"
      className="sticky top-[84px] flex flex-col bg-ink px-10 pt-14 pb-10 text-paper"
      style={{ height: 'calc(100svh - 84px)', minHeight: 560 }}
    >
      <span className="text-[15px] font-semibold">Din kvittering</span>
      <div className="relative mt-5 min-h-0 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <p className="swap-in absolute top-0 left-0 m-0 text-[15px] leading-normal text-on-ink-2" data-on={!any ? '' : undefined}>
          Vælg en pakke for at se prisen.
        </p>
        <ReceiptSection
          lines={receipt.all}
          terms={
            <div className="fold" data-exiting={any ? undefined : ''}>
              <p className="m-0 pt-3 text-[13px] leading-normal text-on-ink-2">{TERMS_SHORT}</p>
            </div>
          }
        />
      </div>
      <div className="mt-5 flex flex-col gap-4 pt-6">
        <div className="swap-out flex flex-col gap-4" data-off={!any ? '' : undefined} aria-hidden={!any}>
          <div className="relative flex items-end justify-between gap-3">
            <span className="pb-[6px] text-[13px] text-on-ink-2">Én gang</span>
            {delta?.o < 0 && <DeltaChip key={delta.id} amount={delta.o} className="-top-[18px] right-0" />}
            <Total value={receipt.o} unit="kr." size={48} unitSize={15} />
          </div>
          <div className="fold" data-exiting={receipt.introApplied ? undefined : ''}>
            <span className="-mt-2 block text-[13px] text-on-ink-2">
              Normalpris <s>{formatKr(receipt.onceNormal)}</s>, intropris valgt
            </span>
          </div>
          <div className="relative flex items-end justify-between gap-3">
            <span className="pb-[6px] text-[13px] text-on-ink-2">Hver måned</span>
            {delta?.m < 0 && <DeltaChip key={delta.id} amount={delta.m} monthly className="-top-[18px] right-0" />}
            <Total value={receipt.m} unit="kr./md." size={48} unitSize={15} />
          </div>
          <span className="text-[13px] text-on-ink-2">Alle priser er ekskl. moms</span>
        </div>
        {state.step !== 4 ? (
          <button
            type="button"
            disabled={!any}
            onClick={() => dispatch({ type: 'go', step: 4 })}
            className="press mt-2 flex min-h-14 items-center justify-between bg-paper px-5 text-left text-base font-semibold text-ink [--press:.98] disabled:opacity-40"
          >
            <span className="whitespace-nowrap">Gå til opsummering</span>
            <span aria-hidden="true">→</span>
          </button>
        ) : (
          <button type="button" onClick={copy} className="mt-2 min-h-12 text-left text-[15px] font-medium text-paper underline underline-offset-4">
            {copied ? 'Link kopieret' : 'Kopiér link til min pris'}
          </button>
        )}
      </div>
    </aside>
  )
}

export default function Desktop({ calc }) {
  const { state, dispatch, any } = calc
  const { step, help } = state
  const inHelp = !!help
  const next =
    step === 1 ? (any ? 'Næste: Vælg funktioner' : 'Vælg en pakke') : step === 2 ? 'Næste: Sprog og rabat' : 'Næste: Se samlet pris'
  const nextDisabled = step === 1 && !any
  return (
    <div className="grid items-start" style={{ gridTemplateColumns: 'minmax(0,1fr) 440px', minHeight: '100svh' }}>
      <div className="flex flex-col pt-14 pr-[72px] pb-12 pl-16" style={{ minHeight: '100svh' }}>
        {step === 1 && !inHelp && (
          <div className="mb-10 flex items-end justify-between gap-8">
            <h2 className="text-[clamp(40px,5.4vw,84px)] leading-[.9] tracking-[-0.04em]">Prisberegner</h2>
            <button
              type="button"
              onClick={() => dispatch({ type: 'helpStart' })}
              className="press hov-ink flex min-h-[52px] flex-none items-center gap-4 bg-surface px-5"
            >
              <span className="text-[15px] font-medium whitespace-nowrap">Hjælp mig med at vælge</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        )}
        {step === 1 && !inHelp && state.notice && (
          <p role="status" className="mt-0 mb-6 bg-surface p-4 text-[15px] leading-normal">
            {state.notice}
          </p>
        )}
        {!inHelp && step !== 4 && (
          <nav aria-label="Trin i beregneren" className="relative">
            <div className="absolute top-0 right-0 left-0 h-[3px] bg-hairline" />
            <div className="absolute top-0 left-0 h-[3px] bg-ink" style={{ width: `${step * 25}%`, transition: 'width 420ms var(--spring-slide)' }} />
            <ol className="m-0 grid list-none p-0" style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))' }}>
              {stepLabels.map((label, i) => {
                const n = i + 1
                const enabled = n === 1 || any
                return (
                  <li key={label}>
                    <button
                      type="button"
                      disabled={!enabled}
                      aria-current={n === step ? 'step' : undefined}
                      onClick={() => dispatch({ type: 'go', step: n })}
                      className="flex min-h-12 flex-wrap items-baseline gap-x-2 gap-y-[2px] bg-transparent pt-4 pr-3 text-left"
                      style={{ opacity: enabled ? 1 : 0.4 }}
                    >
                      <span className="text-[15px]" style={{ fontWeight: n === step ? 600 : 400 }}>
                        {label}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>
        )}
        <div className="flex-1" style={{ marginTop: step === 1 && !inHelp ? 32 : inHelp ? 0 : 40 }}>
          {inHelp ? (
            <Help calc={calc} />
          ) : step === 1 ? (
            <StepPackages calc={calc} />
          ) : step === 2 ? (
            <StepSystems calc={calc} />
          ) : step === 3 ? (
            <StepAddons calc={calc} />
          ) : (
            <StepSummary calc={calc} />
          )}
        </div>

        {!inHelp && (
          <div className="mt-10 flex items-center justify-between gap-6">
            <button
              type="button"
              onClick={() => dispatch({ type: 'back' })}
              className="press min-h-12 border-2 border-ink bg-paper px-5 text-[15px] font-medium [--press:.97]"
              style={{ visibility: step > 1 ? 'visible' : 'hidden' }}
            >
              ← Tilbage
            </button>
            {step < 4 && (
              <button
                type="button"
                disabled={nextDisabled}
                onClick={() => dispatch({ type: 'next' })}
                className={`btn ${nextDisabled ? '' : 'btn-ink hov-ink-soft'}`}
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
