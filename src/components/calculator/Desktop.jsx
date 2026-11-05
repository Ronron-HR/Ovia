import { useState } from 'react'
import prices from '../../data/prices.json'
import { driftChoices, helpQuestions, serviceMeta, SERVICE_KEYS, stepLabels } from '../../data/calculator.js'
import { formatKr } from '../../lib/calculate.js'
import { Check, ReceiptLine, TERMS_SHORT, Total } from './parts.jsx'

const NB = ' '
const drift = (key) => prices.drift.plans.find((p) => p.key === key)
const driftPrice = (c) => (c.key === 'egen' ? `+${formatKr(prices.addons.ownHosting.price)} engang` : formatKr(drift(c.key).price, true))
const driftName = (c) => c.name ?? drift(c.key).name

const heading = 'font-[family-name:var(--font-display)] font-bold [font-stretch:125%]'

/** Glidende mørk markering bag den valgte mulighed (Start/Vækst/Fuld fart, driftsplaner). */
function Segmented({ cols, index, children }) {
  return (
    <div className="relative grid bg-surface" style={{ gridTemplateColumns: `repeat(${cols},minmax(0,1fr))` }}>
      <div
        aria-hidden="true"
        className="absolute top-0 bottom-0 bg-ink"
        style={{ left: `${(index * 100) / cols}%`, width: `${100 / cols}%`, transition: 'left 420ms var(--spring-slide)' }}
      />
      {children}
    </div>
  )
}

function StepServices({ calc }) {
  const { state, dispatch } = calc
  const svc = state.selection.services
  return (
    <div className="anim-step flex flex-col gap-2">
      {SERVICE_KEYS.map((key) => {
        const s = prices.services[key]
        const meta = serviceMeta[key]
        const sel = svc[key] !== null
        return (
          <div
            key={key}
            className={`press relative grid items-center gap-8 px-7 py-7 has-[button.row:active]:scale-[.985] ${sel ? 'bg-ink text-paper' : 'bg-surface text-ink'}`}
            style={{ gridTemplateColumns: 'minmax(0,1fr) 180px 28px', '--press': 1 }}
          >
            <button
              type="button"
              className="row absolute inset-0 z-0"
              aria-pressed={sel}
              aria-label={`${s.name}. ${meta.desc} Fra ${formatKr(s.packages[0].price, meta.month)}`}
              onClick={() => dispatch({ type: 'toggleService', key })}
            />
            <div className="pointer-events-none z-10 flex min-w-0 flex-col gap-2">
              <span className={`${heading} text-[clamp(26px,2.6vw,40px)] leading-none tracking-[-0.03em]`}>{s.name}</span>
              <div className="flex flex-wrap items-baseline gap-x-[18px]">
                <span className="text-[15px]">{meta.desc}</span>
                <a href={meta.href} className="pointer-events-auto relative z-20 inline-flex min-h-6 items-center whitespace-nowrap text-sm">
                  Se ydelsen →
                </a>
              </div>
            </div>
            <span className="price pointer-events-none z-10 text-sm">fra {formatKr(s.packages[0].price, meta.month)}</span>
            <span className="pointer-events-none z-10">
              <Check on={sel} />
            </span>
          </div>
        )
      })}
    </div>
  )
}

function StepPackages({ calc }) {
  const { state, dispatch, chosenKeys } = calc
  const svc = state.selection.services
  return (
    <div className="anim-step flex flex-col gap-10">
      {chosenKeys.map((key) => {
        const s = prices.services[key]
        const month = serviceMeta[key].month
        const cur = svc[key]
        return (
          <div key={key} role="group" aria-label={`${s.name}, vælg pakke`}>
            <div className="mb-3 flex items-baseline justify-between gap-4">
              <span className={`${heading} text-[22px] tracking-[-0.02em]`}>{s.name}</span>
              <span className="text-sm text-muted-2">{month ? 'Pr. måned' : 'Engang'}</span>
            </div>
            <Segmented cols={3} index={cur}>
              {s.packages.map((p, i) => (
                <button
                  key={p.key}
                  type="button"
                  aria-pressed={cur === i}
                  onClick={() => dispatch({ type: 'setService', key, value: i })}
                  className={`press relative flex min-h-[136px] flex-col gap-[10px] bg-transparent px-[22px] pt-5 pb-[22px] text-left [--press:.97] ${cur === i ? 'text-paper' : 'text-ink'}`}
                  style={{ transition: 'transform 260ms var(--spring-press), color 180ms ease-out 60ms' }}
                >
                  <span className="flex w-full items-baseline justify-between gap-2">
                    <span className={`${heading} text-[19px] tracking-[-0.015em]`}>{p.name}</span>
                    <span className="text-xs">{p.recommended ? 'Anbefalet' : ''}</span>
                  </span>
                  <span className="price text-lg">{formatKr(p.price, month)}</span>
                  <span className="text-[13px] leading-[1.45]">{p.points.join(' · ')}</span>
                </button>
              ))}
            </Segmented>
          </div>
        )
      })}
    </div>
  )
}

function StepDrift({ calc }) {
  const { state, dispatch, receipt } = calc
  const sel = state.selection
  const idx = Math.max(0, driftChoices.findIndex((c) => c.key === sel.drift))
  const included = receipt.bookingIncluded
  const addonOn = sel.bookingAddon && !included
  const full = sel.services.web === 2
  return (
    <div className="anim-step flex flex-col gap-11">
      <div role="group" aria-label="Driftsplan">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <span className={`${heading} text-[22px] tracking-[-0.02em]`}>Driftsplan</span>
          <span className="text-sm text-muted-2">Ingen binding. 1{NB}md. opsigelse.</span>
        </div>
        <Segmented cols={4} index={idx}>
          {driftChoices.map((c) => (
            <button
              key={c.key}
              type="button"
              aria-pressed={sel.drift === c.key}
              onClick={() => dispatch({ type: 'setDrift', drift: c.key })}
              className={`press relative flex min-h-[140px] flex-col gap-[10px] bg-transparent px-[18px] pt-5 pb-[22px] text-left [--press:.97] ${sel.drift === c.key ? 'text-paper' : 'text-ink'}`}
              style={{ transition: 'transform 260ms var(--spring-press), color 180ms ease-out 60ms' }}
            >
              <span className={`${heading} text-lg tracking-[-0.015em]`}>{driftName(c)}</span>
              <span className="price text-sm">{driftPrice(c)}</span>
              <span className="text-[13px] leading-[1.45]">{c.desc}</span>
            </button>
          ))}
        </Segmented>
        <p className="mt-3 text-sm text-muted-2">Alle planer: online, sikker, domæne og backup. Domænet står i dit navn.</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className={`${heading} mb-1 text-[22px] tracking-[-0.02em]`}>Tilvalg</span>
        <button
          type="button"
          aria-pressed={addonOn}
          disabled={included}
          onClick={() => dispatch({ type: 'toggleBooking' })}
          className={`press grid items-center gap-8 px-6 py-5 text-left [--press:.99] ${addonOn ? 'bg-ink text-paper' : 'bg-surface text-ink'}`}
          style={{ gridTemplateColumns: 'minmax(0,1fr) 160px auto' }}
        >
          <span className="flex flex-col gap-1">
            <span className="text-[17px] font-semibold">{prices.addons.booking.name}</span>
            <span className="text-sm">{included ? `Indgår i Booking & Google · ${prices.services.book.packages[sel.services.book].name}` : 'Abonnementet betales til udbyderen.'}</span>
          </span>
          <span className="price text-sm">+{formatKr(prices.addons.booking.price)}</span>
          {included ? <span className="bg-paper px-[10px] py-[6px] text-[13px] font-medium text-ink">Indgår</span> : <Check on={addonOn} />}
        </button>

        <div className="grid items-center gap-8 bg-surface px-6 py-5" style={{ gridTemplateColumns: 'minmax(0,1fr) 160px auto' }}>
          <div className="flex flex-col gap-1">
            <span className="text-[17px] font-semibold">{prices.addons.extraPage.name}</span>
            <span className="text-sm">{full ? 'Ud over de 8 sider i Fuld fart.' : 'Kun med Fuld fart.'}</span>
          </div>
          <span className="price text-sm">
            +{formatKr(prices.addons.extraPage.price).replace('kr.', 'kr./side')}
          </span>
          {full ? (
            <div className="grid h-12 bg-paper" style={{ gridTemplateColumns: "48px 52px 48px" }}>
              <button
                type="button"
                aria-label="Færre undersider"
                disabled={sel.extraPages <= 0}
                onClick={() => dispatch({ type: 'setExtra', value: sel.extraPages - 1 })}
                className="press text-lg [--press:.88] disabled:opacity-40"
              >
                −
              </button>
              <span className="price flex items-center justify-center text-[15px]" aria-live="polite">
                {sel.extraPages}
              </span>
              <button
                type="button"
                aria-label="Flere undersider"
                onClick={() => dispatch({ type: 'setExtra', value: sel.extraPages + 1 })}
                className="press text-lg [--press:.88]"
              >
                +
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => dispatch({ type: 'upgradeFull' })} className="btn btn-white hov-ink min-h-12 px-4 text-sm [--press:.96]">
              Skift til Fuld fart
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function StepSummary({ calc }) {
  const { hrefs } = calc
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
  const tile = 'press flex items-end p-6 bg-surface text-ink hov-ink [--press:.98]'
  return (
    <div className="anim-step">
      <h3 className="text-[clamp(36px,4.4vw,68px)] leading-[.95] tracking-[-0.035em]">Din pris er klar.</h3>
      <p className="mt-4 text-[17px] text-muted-2">Send valgene, så svarer jeg inden for 24 timer.</p>
      <div className="mt-11 grid gap-2" style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
        <a href={hrefs.mail} className="press hov-ink-soft flex min-h-[180px] flex-col justify-end gap-2 bg-ink p-6 text-paper no-underline [--press:.98]">
          <span className={`${heading} text-[30px] leading-none tracking-[-0.03em]`}>Send mine valg →</span>
          <span className="text-sm text-on-ink-2">Åbner din mail med alle valg og priser.</span>
        </a>
        <a href="tel:+4553613699" className={`${tile} no-underline`}>
          <span className={`${heading} text-xl leading-[1.1] tracking-[-0.02em]`}>Ring til Ronny</span>
        </a>
        <a href={hrefs.sms} className={`${tile} no-underline`}>
          <span className={`${heading} text-xl leading-[1.1] tracking-[-0.02em]`}>Skriv en SMS</span>
        </a>
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
      <div className="flex flex-col gap-2" role="group" aria-label={helpQuestions[q].title}>
        {helpQuestions[q].options.map((label, i) => {
          const on = multi ? answers.includes(i) : help.a[q] === i
          return (
            <button
              key={label}
              type="button"
              aria-pressed={on}
              onClick={() => dispatch({ type: 'helpAnswer', i })}
              className={`press flex min-h-[72px] w-full items-center gap-5 px-6 text-left [--press:.985] ${on ? 'bg-ink text-paper' : 'bg-surface text-ink'}`}
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
        <button type="button" onClick={() => dispatch({ type: 'helpPrev' })} className="mt-5 min-h-12 text-sm">
          ← Forrige spørgsmål
        </button>
      )}
    </div>
  )
}

function HelpResult({ calc }) {
  const { dispatch, state } = calc
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
    <div className="anim-step max-w-[760px]">
      <div className="flex items-center justify-between gap-6">
        <span className="text-sm text-muted-2">Mit forslag</span>
        <button type="button" onClick={() => dispatch({ type: 'helpStart' })} className="min-h-12 text-sm underline underline-offset-4">
          Start forfra
        </button>
      </div>
      <h3 className="mt-14 mb-7 text-[clamp(32px,3.6vw,56px)] leading-none tracking-[-0.035em]">Det her ville jeg starte med.</h3>
      <div className="flex flex-col gap-2">
        {rows.map((r) => (
          <div key={r.name} className="anim-line grid items-baseline gap-5 bg-surface px-6 py-5" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
            <span className="flex flex-wrap items-baseline gap-3">
              <span className={`${heading} text-[22px] tracking-[-0.02em]`}>{r.name}</span>
              <span className="text-base">{r.pkg}</span>
            </span>
            <span className="price text-sm">{r.price}</span>
          </div>
        ))}
      </div>
      <div className="mt-7 flex gap-2">
        <button type="button" onClick={() => dispatch({ type: 'helpToSummary' })} className="btn btn-ink hov-ink-soft">
          Se opsummering
        </button>
        <button type="button" onClick={() => dispatch({ type: 'helpCustomize' })} className="btn btn-surface">
          Tilpas selv
        </button>
      </div>
    </div>
  )
}

function Aside({ calc }) {
  const { state, dispatch, receipt, any, hrefs } = calc
  const [copied, setCopied] = useState(false)
  const web = state.selection.services.web !== null
  const showTerms = web && state.selection.drift !== 'egen'
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
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {!any && <p className="m-0 text-[15px] leading-normal text-on-ink-2">Vælg en ydelse, så står prisen her.</p>}
        {receipt.once.length > 0 && (
          <div className="mb-7">
            <span className="text-[13px] text-on-ink-2">Engang</span>
            {receipt.once.map((l) => (
              <ReceiptLine key={l.key + l.pkg} line={l} animate />
            ))}
          </div>
        )}
        {receipt.month.length > 0 && (
          <div>
            <span className="text-[13px] text-on-ink-2">Pr. måned</span>
            {receipt.month.map((l) => (
              <ReceiptLine key={l.key + l.pkg} line={l} animate />
            ))}
            {showTerms && <p className="mt-3 text-[13px] leading-normal text-on-ink-2">{TERMS_SHORT}</p>}
          </div>
        )}
      </div>
      <div className="mt-5 flex flex-col gap-4 pt-6">
        <div className="flex items-end justify-between gap-3">
          <span className="pb-[6px] text-[13px] text-on-ink-2">Engang</span>
          <Total value={receipt.o} unit="kr." size={48} unitSize={15} />
        </div>
        <div className="flex items-end justify-between gap-3">
          <span className="pb-[6px] text-[13px] text-on-ink-2">Pr. måned</span>
          <Total value={receipt.m} unit="kr./md." size={48} unitSize={15} />
        </div>
        <span className="text-[13px] text-on-ink-2">Alle priser er ekskl. moms</span>
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
  const web = state.selection.services.web !== null
  const inHelp = !!help
  const next =
    step === 1 ? (any ? 'Næste: Vælg pakker' : 'Vælg mindst én ydelse') : step === 2 ? (web ? 'Næste: Drift og tilvalg' : 'Næste: Se opsummering') : 'Næste: Se opsummering'
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
        {!inHelp && step !== 4 && (
          <nav aria-label="Trin i beregneren" className="relative">
            <div className="absolute top-0 right-0 left-0 h-[3px] bg-hairline" />
            <div className="absolute top-0 left-0 h-[3px] bg-ink" style={{ width: `${step * 25}%`, transition: 'width 420ms var(--spring-slide)' }} />
            <ol className="m-0 grid list-none p-0" style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))' }}>
              {stepLabels.map((label, i) => {
                const n = i + 1
                const enabled = n === 1 || (any && (n !== 3 || web))
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
                      {n === 3 && !web && <span className="text-xs text-muted-2">Kun hjemmeside</span>}
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
            <StepServices calc={calc} />
          ) : step === 2 ? (
            <StepPackages calc={calc} />
          ) : step === 3 ? (
            <StepDrift calc={calc} />
          ) : (
            <StepSummary calc={calc} />
          )}
        </div>

        {!inHelp && (
          <div className="mt-10 flex items-center justify-between gap-6">
            <button
              type="button"
              onClick={() => dispatch({ type: 'back' })}
              className="min-h-12 text-[15px]"
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
