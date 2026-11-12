import prices from '../../data/prices.json'
import { needTitle, needs } from '../../data/calculator.js'
import { introActive, optionTag, usesSite } from '../../lib/calculate.js'
import { priceText } from '../../lib/receipt.js'
import { Check } from './parts.jsx'

/**
 * Trinene, som mobil og desktop deler: Hvad har I brug for?, Hvad skal løses? og rabatlinjen.
 * `wide` er desktop (større luft og skrift). Layoutet er en enkelt kolonne af bokse, så det også holder i smalle kolonner.
 */

const heading = 'font-[family-name:var(--font-display)] font-bold [font-stretch:125%]'

/** Valgflade: mørk når valgt, lys med tydelig ramme ellers (så den ser trykbar ud). Hele fladen er en knap (≥ 48 px). */
export const choice = (on) => `press w-full min-h-12 text-left border-2 border-ink ${on ? 'bg-ink text-paper' : 'bg-paper text-ink'}`

const pad = (wide) => (wide ? 'px-6 py-5' : 'p-4')

/** Hvad en funktion koster, som tekst under den: "Indgår", "Med i prisen (ellers +2.500 kr. + 299 kr./md.)", "+2.500 kr. + 299 kr./md." eller bare prisen. */
export function tagText(tag) {
  if (!tag) return ''
  const price = priceText({ once: tag.once, monthly: tag.monthly })
  if (tag.kind === 'included') return 'Indgår'
  if (tag.kind === 'free') return `Med i prisen (ellers +${price})`
  if (tag.kind === 'extra') return '+' + price
  return price
}

/** Teksten over valgene: hvad pakken har med (bordbooking, online bestilling), eller hvor løsningen sidder, hvis der ikke er en ny hjemmeside. */
export function functionsIntro(sel) {
  if (sel.path === 'system') return prices.systemOnly.note
  const pkg = prices.packages[sel.pkg]
  if (pkg.slots === 0) return `${pkg.name} har hverken bordbooking eller online bestilling med i prisen. Hver af dem kan lægges til.`
  if (pkg.slots === 1) return `${pkg.name} har én af dem med i prisen: bordbooking eller online bestilling. Den anden kan lægges til.`
  return `${pkg.name} har både bordbooking og online bestilling med i prisen.`
}

/** "Hjemmeside designet til jer": de konkrete dele og antal sider. Står øverst i hver pakke, før funktioner og Google. */
export function SiteBlock({ pkg, wide = false }) {
  const parts = prices.website.parts.map((p, i) => (i === 0 ? p : p.charAt(0).toLowerCase() + p.slice(1))).join(', ')
  return (
    <span className="flex flex-col gap-[3px]">
      <span className={`${wide ? 'text-[15px]' : 'text-sm'} font-semibold leading-[1.3]`}>{prices.website.title}</span>
      <span className={`${wide ? 'text-[13px] leading-[1.45]' : 'text-sm leading-[1.35]'}`}>
        {pkg.pages}. {parts}.
      </span>
    </span>
  )
}

/** Første trin: tre store valg. */
export function NeedList({ calc, wide = false, autoNext = false }) {
  const { state, dispatch } = calc
  return (
    <div className="flex flex-col gap-3" role="group" aria-label={needTitle}>
      {needs.map((n) => {
        const on = state.selection.path === n.key
        return (
          <button
            key={n.key}
            type="button"
            aria-pressed={on}
            onClick={() => {
              dispatch({ type: 'setPath', path: n.key })
              if (autoNext) dispatch({ type: 'next' })
            }}
            className={`${choice(on)} flex items-center gap-4 ${wide ? 'px-6 py-6' : 'p-4'} [--press:.98]`}
          >
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <span className={`${heading} ${wide ? 'text-[22px]' : 'text-[clamp(18px,5.2vw,22px)]'} leading-[1.15] tracking-[-0.02em]`}>{n.title}</span>
              <span className="text-sm leading-[1.35]">{n.desc}</span>
            </span>
            <Check on={on} size={wide ? 28 : 24} />
          </button>
        )
      })}
    </div>
  )
}

/**
 * Hvad skal løses? Tre kort, aldrig flere: bordbooking, online bestilling og noget bygget specielt. Flervalg. Prisen står ved hvert kort,
 * før man trykker; bygget specielt har ingen pris (den aftales).
 */
export function ProblemList({ calc, wide = false }) {
  const { state, dispatch } = calc
  const sel = state.selection
  const custom = prices.systems.custom
  const card = (on) => `${choice(on)} flex flex-col gap-1 ${pad(wide)} [--press:.98]`
  const title = `${heading} ${wide ? 'text-[19px]' : 'text-[17px]'} leading-[1.15] tracking-[-0.015em]`
  return (
    <div className="flex flex-col gap-3" role="group" aria-label="Hvad skal løses?">
      <button
        type="button"
        aria-pressed={sel.custom > 0}
        data-removal={sel.custom > 0 ? '' : undefined}
        onClick={() => dispatch({ type: 'setCustom', value: sel.custom > 0 ? 0 : 1 })}
        className={card(sel.custom > 0)}
      >
        <span className="flex w-full items-center justify-between gap-3">
          <span className={title}>{custom.title}</span>
          <Check on={sel.custom > 0} size={wide ? 28 : 24} />
        </span>
        <span className="text-sm leading-[1.35]">{custom.desc}</span>
        <span className="flex flex-col gap-[3px]">
          {custom.ideas.map((idea) => (
            <span key={idea} className="text-sm leading-[1.35]">
              – {idea}
            </span>
          ))}
        </span>
        <span className="price text-[13px] leading-[1.4] whitespace-normal">
          {custom.price}. {custom.priceNote}
        </span>
      </button>
      {prices.systems.standard.map((s) => {
        const on = sel.systems.includes(s.key)
        return (
          <button key={s.key} type="button" aria-pressed={on} data-removal={on ? '' : undefined} onClick={() => dispatch({ type: 'toggleSystem', key: s.key })} className={card(on)}>
            <span className="flex w-full items-center justify-between gap-3">
              <span className={title}>{s.title}</span>
              <Check on={on} size={wide ? 28 : 24} />
            </span>
            <span className="text-sm leading-[1.35]">{s.desc}</span>
            <span className="price text-[13px] leading-[1.4] whitespace-normal">{tagText(optionTag(sel, s.key))}</span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Introduktionspris: ét lille, roligt spørgsmål på sidste trin, når prisen er klar (ikke en rabatboks, ingen tal og ingen knaphed).
 * Siger kunden ja, må siden vises som eksempel, og engangsprisen er pakkens introOnce; ændringen ses i totalen og i kvitteringen.
 * Vises kun for hjemmesider og kun, mens introprisen er i gang.
 */
export function ExampleOffer({ calc, wide = false }) {
  const { state, dispatch } = calc
  const sel = state.selection
  if (!introActive() || !usesSite(sel) || sel.pkg === null) return null
  return (
    <button
      type="button"
      aria-pressed={sel.intro}
      data-removal={sel.intro ? '' : undefined}
      onClick={() => dispatch({ type: 'toggleIntro' })}
      className={`press flex w-full items-center gap-3 bg-surface px-4 py-3 text-left [--press:.99] ${wide ? 'max-w-[680px]' : ''}`}
    >
      <Check on={sel.intro} size={22} />
      <span className="text-[15px] leading-[1.4]">Må vi vise jeres side som eksempel hos os? Så er engangsprisen lidt lavere.</span>
    </button>
  )
}
