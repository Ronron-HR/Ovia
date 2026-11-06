import prices from '../../data/prices.json'
import { needTitle, needs } from '../../data/calculator.js'
import { customInfo, formatKr, optionTag } from '../../lib/calculate.js'
import { priceText } from '../../lib/receipt.js'
import { Check, slotsText } from './parts.jsx'

/**
 * Trinene, som mobil og desktop deler: Hvad har I brug for?, funktioner, "bygget specielt til jer" og rabat.
 * `wide` er desktop (større luft og skrift). Layoutet er en enkelt kolonne af bokse, så det også holder i smalle kolonner.
 */

const heading = 'font-[family-name:var(--font-display)] font-bold [font-stretch:125%]'

/** Valgflade: mørk når valgt, lys med tydelig ramme ellers (så den ser trykbar ud). Hele fladen er en knap (≥ 48 px). */
export const choice = (on) => `press w-full min-h-12 text-left border-2 border-ink ${on ? 'bg-ink text-paper' : 'bg-paper text-ink'}`

const pad = (wide) => (wide ? 'px-6 py-5' : 'p-4')

/** Hvad en funktion koster, som tekst under den: "Indgår", "Med i prisen (ellers +2.000 kr. + 99 kr./md.)" eller "+2.000 kr. + 99 kr./md.". */
export function tagText(tag) {
  if (!tag) return ''
  const price = priceText({ once: tag.once, monthly: tag.monthly })
  if (tag.kind === 'included') return 'Indgår'
  if (tag.kind === 'free') return `Med i prisen (ellers +${price})`
  if (tag.kind === 'extra') return '+' + price
  return price
}

/** Teksten over funktionerne: hvor mange der er med i prisen, eller at de kobles på den nuværende hjemmeside. */
export function functionsIntro(sel) {
  if (sel.path === 'system') return `${prices.systemOnly.note} Vælg mindst én funktion. Prisen står ved hver.`
  const pkg = prices.packages[sel.pkg]
  if (pkg.slots === 0) return `${pkg.name} har ingen funktioner med i prisen. Hver funktion lægges til som ekstra, og prisen står ved hver.`
  const n = pkg.slots === 1 ? '1 funktion er' : `${pkg.slots} funktioner er`
  const custom = pkg.customSlots ? ' Én af dem kan være bygget specielt til jer.' : ''
  return `${n} med i prisen i ${pkg.name}.${custom} Flere lægges til som ekstra, og prisen står ved hver.`
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
export function NeedList({ calc, wide = false }) {
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
            onClick={() => dispatch({ type: 'setPath', path: n.key })}
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

/** De almindelige funktioner. Prisen står ved hver, før man trykker. */
export function FunctionList({ calc, wide = false }) {
  const { state, dispatch } = calc
  const sel = state.selection
  return (
    <div className="flex flex-col gap-3" role="group" aria-label="Funktioner">
      {prices.systems.standard.map((s) => {
        const on = sel.systems.includes(s.key)
        return (
          <button
            key={s.key}
            type="button"
            aria-pressed={on}
            data-removal={on ? '' : undefined}
            onClick={() => dispatch({ type: 'toggleSystem', key: s.key })}
            className={`${choice(on)} flex flex-col gap-1 ${pad(wide)} [--press:.98]`}
          >
            <span className="flex w-full items-center justify-between gap-3">
              <span className={`${heading} ${wide ? 'text-[19px]' : 'text-[17px]'} leading-[1.15] tracking-[-0.015em]`}>{s.name}</span>
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

/** "Bygget specielt til jer": pris pr. stk. og en −/antal/+-styring med knapper på 48 × 48 px. Teksten og styringen ombrydes, så intet overlapper. */
export function CustomCard({ calc, wide = false }) {
  const { state, dispatch } = calc
  const sel = state.selection
  const info = customInfo(sel)
  const price = priceText({ once: info.once, monthly: info.monthly })
  const btn = 'press flex h-12 w-12 items-center justify-center border-2 border-ink bg-paper text-2xl leading-none [--press:.9] disabled:opacity-40'
  return (
    <div className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-3 bg-surface ${pad(wide)}`}>
      <div className="flex min-w-0 flex-[1_1_220px] flex-col gap-1">
        <span className={`${heading} ${wide ? 'text-[19px]' : 'text-[17px]'} leading-[1.15] tracking-[-0.015em]`}>{prices.systems.custom.name}</span>
        <span className="text-sm leading-[1.35]">{prices.systems.custom.desc}</span>
        <span className="price text-[13px] leading-[1.4] whitespace-normal">{`${sel.path === 'system' ? '' : '+'}${price} pr. stk.`}</span>
        {info.free && <span className="text-[13px] leading-[1.4]">Den næste er med i prisen.</span>}
        {info.atMax && <span className="text-[13px] leading-[1.4]">Højeste antal nået.</span>}
      </div>
      <div role="group" aria-label="Antal bygget specielt til jer" className="flex flex-none items-center">
        <button
          type="button"
          aria-label="Fjern én bygget til jer"
          data-removal=""
          disabled={sel.custom <= 0}
          onClick={() => dispatch({ type: 'setCustom', value: sel.custom - 1 })}
          className={btn}
        >
          <span aria-hidden="true">−</span>
        </button>
        <span className="price flex h-12 min-w-14 items-center justify-center text-lg" aria-live="polite">
          {sel.custom}
        </span>
        <button
          type="button"
          aria-label="Tilføj én bygget til jer"
          disabled={sel.custom >= prices.systems.custom.max}
          onClick={() => dispatch({ type: 'setCustom', value: sel.custom + 1 })}
          className={btn}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
    </div>
  )
}

/** Rabat: introduktionsprisen (kun hjemmesider, kun mens der er pladser). */
export function DiscountCard({ calc, wide = false }) {
  const { state, dispatch } = calc
  const sel = state.selection
  const pkg = prices.packages[sel.pkg]
  const saving = Math.round(pkg.once * prices.intro.discount)
  return (
    <button
      type="button"
      aria-pressed={sel.intro}
      data-removal={sel.intro ? '' : undefined}
      onClick={() => dispatch({ type: 'toggleIntro' })}
      className={`${choice(sel.intro)} flex items-start gap-3 ${pad(wide)} [--press:.98]`}
    >
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={`${wide ? 'text-[17px]' : 'text-base'} font-semibold`}>Introduktionspris: {Math.round(prices.intro.discount * 100)}&nbsp;% rabat på engangsprisen</span>
        <span className="text-sm leading-normal">
          De første {prices.intro.total} kunder får rabat, hvis vi må vise jeres side som eksempel på vores hjemmeside. {slotsText()}. Rabatten gælder ikke den månedlige pris.
        </span>
        <span className="text-sm font-semibold">Ja, I må vise siden som case (eksempel){sel.intro ? ` · du sparer ${formatKr(saving)}` : ''}</span>
      </span>
      <Check on={sel.intro} size={wide ? 28 : 24} />
    </button>
  )
}
