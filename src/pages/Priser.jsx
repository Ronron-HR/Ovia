import Contact from '../components/layout/Contact.jsx'
import prices from '../data/prices.json'
import { addonRows, includedText, priceTables } from '../data/pages.js'
import { formatKr } from '../lib/calculate.js'

const heading = 'font-[family-name:var(--font-display)] font-bold [font-stretch:125%]'
const keys = ['web', 'mkt', 'book']

const jump = [
  ['Hjemmeside', '#p-hjemmeside'],
  ['Marketing', '#p-marketing'],
  ['Booking & Google', '#p-booking'],
  ['Drift', '#drift'],
  ['Vilkår', '#vilkaar'],
]

function Cell({ value, tint }) {
  return (
    <span role="cell" className={`flex items-center px-[10px] pt-[2px] pb-[10px] text-[15px] md:min-h-11 md:border-t md:border-hairline md:px-4 md:py-3 ${tint ? 'bg-surface' : ''}`}>
      {value === 1 ? (
        <svg width="14" height="14" viewBox="0 0 12 12" role="img" aria-label="Inkluderet">
          <path d="M2.2 6.4l2.4 2.4 5.2-5.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
        </svg>
      ) : value === 0 ? (
        <span className="text-muted-2" role="img" aria-label="Indgår ikke">
          –
        </span>
      ) : (
        <span>{value}</span>
      )}
    </span>
  )
}

/** Én ydelse: tre pakker side om side. */
function PriceTable({ k }) {
  const service = prices.services[k]
  const table = priceTables[k]
  const month = service.period === 'month'
  return (
    <section id={table.id} aria-labelledby={`${table.id}-t`} className="mx-auto max-w-[1440px] scroll-mt-20 px-5 pt-10 pb-12 md:scroll-mt-[152px] md:px-14 md:pt-[88px] md:pb-16">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id={`${table.id}-t`} className="display t-h2s">
          {service.name}
        </h2>
        <div className="flex items-baseline gap-5">
          <span className="text-sm whitespace-nowrap text-muted-2">{month ? 'Pr. måned' : 'Engang'}</span>
          <a href={service.slug + '/'} className="flex min-h-12 items-center text-[15px] whitespace-nowrap">
            Læs mere
          </a>
        </div>
      </div>
      <div role="table" aria-label={service.name} className="mt-5 grid grid-cols-3 md:grid-cols-[3fr_2fr_2fr_2fr]">
        <div role="row" className="contents">
          <span role="columnheader" className="hidden md:block">
            <span className="sr-only">Pakke</span>
          </span>
          {service.packages.map((p) => (
            <div key={p.key} role="columnheader" className={`flex flex-col gap-[6px] px-[10px] py-[14px] md:px-4 md:py-5 ${p.recommended ? 'bg-surface' : ''}`}>
              <span className={`${heading} text-[15px] tracking-[-0.02em] whitespace-nowrap md:text-xl`}>{p.name}</span>
              <span className="min-h-4 text-xs">{p.recommended ? 'Anbefalet' : ''}</span>
              <span className="price mt-1 text-[13px] md:text-[17px]">
                <span className="md:hidden">{formatKr(p.price)}</span>
                <span className="hidden md:inline">{formatKr(p.price, month)}</span>
              </span>
            </div>
          ))}
        </div>
        {table.rows.map(([label, ...cells]) => (
          <div key={label} role="row" className="contents">
            <span role="rowheader" className="col-span-full border-t border-hairline pt-[14px] pb-[2px] text-sm leading-[1.35] md:col-auto md:py-3 md:pr-4">
              {label}
            </span>
            {cells.map((c, i) => (
              <Cell key={i} value={c} tint={service.packages[i].recommended} />
            ))}
          </div>
        ))}
      </div>
      {table.note && <p className="mt-[14px] text-sm text-muted-2">{table.note}</p>}
    </section>
  )
}

/** /priser: alle pakker side om side, drift, tilvalg og vilkår. */
export default function Priser() {
  return (
    <>
      <section aria-labelledby="priser-titel" className="mx-auto max-w-[1440px] px-5 pt-7 pb-8 md:px-14 md:pt-28 md:pb-24">
        <h1 id="priser-titel" className="display display-hero text-[clamp(40px,12vw,56px)] md:text-[clamp(72px,9vw,140px)]">
          Priser
        </h1>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6 md:mt-14 md:ml-[33%]">
          <p className="m-0 max-w-[36ch] text-[17px] leading-[1.45] text-pretty md:text-[clamp(17px,1.5vw,21px)]">Alle pakker side om side. Alle priser er ekskl. moms.</p>
          <a href="/#prisberegner" className="btn btn-ink hov-ink-soft w-full text-[17px] md:w-auto">
            <span>Beregn din samlede pris</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <nav aria-label="Spring til" className="bg-paper md:sticky md:top-[84px] md:z-10">
        <div className="mx-auto flex max-w-[1440px] flex-wrap gap-2 px-5 pt-2 pb-3 md:px-14">
          {jump.map(([label, href]) => (
            <a key={href} href={href} className="btn btn-surface hov-ink min-h-12 px-4 text-[15px] font-medium [--press:.96]">
              {label}
            </a>
          ))}
        </div>
      </nav>

      {keys.map((k) => (
        <PriceTable key={k} k={k} />
      ))}

      <section id="drift" aria-labelledby="drift-t" className="scroll-mt-20 bg-surface md:scroll-mt-[152px]">
        <div className="mx-auto grid max-w-[1440px] gap-7 section-pad px-5 md:grid-cols-[5fr_7fr] md:gap-14 md:px-14">
          <div className="flex flex-col gap-[14px]">
            <h2 id="drift-t" className="display t-h2s">
              Drift af hjemmesiden
            </h2>
            <p className="m-0 max-w-[34ch] text-base leading-normal">Alle planer: {includedText.toLowerCase()}.</p>
          </div>
          <div className="flex flex-col gap-2">
            {prices.drift.plans.map((d) => (
              <div key={d.key} className="grid items-baseline gap-x-4 gap-y-[6px] bg-paper px-5 py-[18px]" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
                <span className={`${heading} text-[19px] tracking-[-0.02em]`}>{d.name}</span>
                <span className="price text-[15px]">{formatKr(d.price, true)}</span>
                <span className="col-span-full text-sm leading-[1.4]">{d.description}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Tilvalg og vilkår" className="mx-auto grid max-w-[1440px] gap-7 section-pad px-5 md:grid-cols-2 md:gap-14 md:px-14">
        <div>
          <h2 className="display t-h2s mb-4">Tilvalg</h2>
          {addonRows.map((r) => {
            const a = prices.addons[r.key]
            return (
              <div key={r.key} className="grid items-baseline gap-x-4 gap-y-1 border-t border-hairline py-4" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
                <span className="text-base font-medium">{a.name}</span>
                <span className="price text-sm">
                  {r.plus ? '+' : ''}
                  {formatKr(a.price)}
                </span>
                <span className="col-span-full text-sm text-muted-2">{r.note}</span>
              </div>
            )
          })}
        </div>
        <div>
          <h2 id="vilkaar" className="display t-h2s mb-4 scroll-mt-20 md:scroll-mt-[152px]">
            Vilkår
          </h2>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {prices.terms.map((t) => (
              <li key={t} className="bg-surface px-5 py-4 text-base leading-[1.4]">
                {t.replace(/(\d)\.(\d{3}) kr\./, '$1.$2 kr.')}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Contact />
    </>
  )
}
