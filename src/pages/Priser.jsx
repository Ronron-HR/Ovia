import Contact from '../components/layout/Contact.jsx'
import prices from '../data/prices.json'
import { addonRows, compareRows, systemOnlyRows } from '../data/pages.js'
import { formatKr, introActive } from '../lib/calculate.js'
import { priceText } from '../lib/receipt.js'

const heading = 'font-[family-name:var(--font-display)] font-bold [font-stretch:125%]'

/** En række med navn og pris: funktion, bygget specielt (pris aftales) eller frikøb. */
function rowInfo(key) {
  const f = prices.systems.standard.find((s) => s.key === key)
  if (f) return { name: f.name, price: priceText({ once: f.once, monthly: f.monthly }) }
  if (key === 'custom') return { name: prices.systems.custom.name, price: prices.systems.custom.price }
  return { name: prices.addons[key].name, price: priceText({ once: prices.addons[key].once, monthly: 0 }) }
}

const jump = [
  ['Pakker', '#pakker'],
  ['Løs et problem', '#system-alene'],
  ['Ekstra ting', '#ekstra'],
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
        <span className="text-[13px] leading-[1.35] md:text-[15px]">{value}</span>
      )}
    </span>
  )
}

/** /priser: de tre pakker side om side, tilvalg og vilkår. Faste priser, ekskl. moms. */
export default function Priser() {
  const intro = introActive()
  return (
    <>
      <section aria-labelledby="priser-titel" className="mx-auto max-w-[1440px] px-5 pt-7 pb-8 md:px-14 md:pt-28 md:pb-24">
        <h1 id="priser-titel" className="display display-hero text-[clamp(40px,12vw,56px)] md:text-[clamp(72px,9vw,140px)]">
          Priser
        </h1>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6 md:mt-14 md:ml-[33%]">
          <p className="m-0 max-w-[36ch] text-[17px] leading-[1.45] text-pretty md:text-[clamp(17px,1.5vw,21px)]">Tre pakker side om side. Faste priser, ekskl. moms.</p>
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

      <section id="pakker" aria-labelledby="pakker-t" className="mx-auto max-w-[1440px] scroll-mt-20 px-5 pt-10 pb-12 md:scroll-mt-[152px] md:px-14 md:pt-[88px] md:pb-16">
        <h2 id="pakker-t" className="display t-h2s">
          Pakker
        </h2>
        <div role="table" aria-label="Pakker" className="mt-5 grid grid-cols-3 md:grid-cols-[3fr_2fr_2fr_2fr]">
          <div role="row" className="contents">
            <span role="columnheader" className="hidden md:block">
              <span className="sr-only">Pakke</span>
            </span>
            {prices.packages.map((p) => (
              <div key={p.key} role="columnheader" className={`flex flex-col gap-[6px] px-[10px] py-[14px] md:px-4 md:py-5 ${p.recommended ? 'bg-surface' : ''}`}>
                <span className={`${heading} text-[15px] tracking-[-0.02em] whitespace-nowrap md:text-xl`}>{p.name}</span>
                <span className="price mt-1 text-[13px] md:text-[17px]">{formatKr(p.once)}</span>
                <span className="price text-xs md:text-sm">+ {formatKr(p.monthly, true)}</span>
              </div>
            ))}
          </div>
          {compareRows.map((row) =>
            Array.isArray(row) ? (
              <div key={row[0]} role="row" className="contents">
                <span role="rowheader" className="col-span-full border-t border-hairline pt-[14px] pb-[2px] text-sm leading-[1.35] md:col-auto md:py-3 md:pr-4">
                  {row[0]}
                </span>
                {row.slice(1).map((c, i) => (
                  <Cell key={i} value={c} tint={prices.packages[i].recommended} />
                ))}
              </div>
            ) : (
              <div key={row.group} role="row" className="contents">
                <span role="rowheader" className={`${heading} col-span-full border-t-2 border-ink pt-5 pb-1 text-base tracking-[-0.01em] md:pt-7`}>
                  {row.group}
                </span>
              </div>
            ),
          )}
        </div>
        <p className="mt-[14px] mb-0 text-sm text-muted-2">Engangsbeløbet betales én gang for at bygge siden. Den månedlige pris dækker drift, domæne, sikkerhedskopi og det, pakken ellers indeholder.</p>
        {intro && (
          <div className="mt-6 bg-surface p-5 md:p-6">
            <h3 className="text-xl tracking-[-0.02em]">Introduktionspris, hvis vi må vise jeres side som eksempel</h3>
            <p className="mt-2 mb-0 max-w-[60ch] text-[15px] leading-normal">
              Må vi vise siden som eksempel hos os, er engangsprisen lidt lavere:{' '}
              {prices.packages.map((p, i) => (
                <span key={p.key}>
                  {i ? ', ' : ''}
                  {p.name} {formatKr(p.introOnce)}
                </span>
              ))}
              . Det gælder ikke den månedlige pris eller ekstra ting.
            </p>
          </div>
        )}
      </section>

      <section id="system-alene" aria-labelledby="system-alene-t" className="mx-auto max-w-[1440px] scroll-mt-20 px-5 pb-12 md:scroll-mt-[152px] md:px-14 md:pb-16">
        <h2 id="system-alene-t" className="display t-h2s">
          Løs et problem
        </h2>
        <p className="mt-4 mb-0 max-w-[60ch] text-[17px] leading-normal">
          Vil I ikke have en ny hjemmeside, men løse noget, der driller? {prices.systemOnly.note}{intro && ' Introduktionsprisen gælder kun, når I får en ny hjemmeside hos os.'}
        </p>
        <div className="mt-5 max-w-[760px]">
          {systemOnlyRows.map((r) => {
            const a = rowInfo(r.key)
            return (
              <div key={r.key} className="grid items-baseline gap-x-4 gap-y-1 border-t border-hairline py-4" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
                <span className="text-base font-medium">{a.name}</span>
                <span className="price text-sm">{a.price}</span>
                <span className="col-span-full text-sm text-muted-2">{r.note}</span>
              </div>
            )
          })}
        </div>
        <a href="/#prisberegner" className="btn btn-ink hov-ink-soft mt-6 w-full text-[17px] md:w-auto">
          <span>Beregn prisen</span>
          <span aria-hidden="true">→</span>
        </a>
      </section>

      <section id="ekstra" aria-label="Ekstra ting og vilkår" className="mx-auto grid max-w-[1440px] scroll-mt-20 gap-7 section-pad px-5 md:scroll-mt-[152px] md:grid-cols-2 md:gap-14 md:px-14">
        <div>
          <h2 className="display t-h2s mb-4">Ekstra ting</h2>
          {addonRows.map((r) => {
            const a = rowInfo(r.key)
            return (
              <div key={r.key} className="grid items-baseline gap-x-4 gap-y-1 border-t border-hairline py-4" style={{ gridTemplateColumns: 'minmax(0,1fr) auto' }}>
                <span className="text-base font-medium">{a.name}</span>
                <span className="price text-sm">
                  {r.key === 'buyout' || r.key === 'custom' ? '' : '+'}
                  {a.price}
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
