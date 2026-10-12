import { buyModes } from '../data/offer.js'
import { paths } from '../data/texts.js'
import Amount from './Amount.jsx'
import { Arrow } from './Shots.jsx'

/**
 * TO MÅDER AT KØBE (id="koebsmaader"): Løbende samarbejde (Lokal) og Køb
 * hjemmesiden, side om side med pris, minimumsbetaling, hvad der er med og
 * hvad der ikke er, én handling pr. kort og en note. Læses af forsiden og /priser/
 * (F) og /hjemmeside/. Teksterne står i src/data/offer.js; tallene kommer derfra
 * via pricing.js, så kortene aldrig skriver et beløb selv.
 *
 * Lokal står først og har accentkant og den blå knap (sidens hovedtilbud);
 * Køb hjemmesiden har en rolig knap, så der kun er én primær handling i sektionen.
 *
 * headingLevel: 2 som standard (efter sidens h1). tone: 'paper' | 'grey'.
 * eyebrow, title og intro kan overstyres af siden (fx /hjemmeside/).
 */
const LABEL = { includes: 'Det er med', excludes: 'Det er ikke med' }

function Mode({ mode, primary, level }) {
  const H = `h${level}`
  return (
    <article className="mode" data-primary={primary} aria-labelledby={primary ? 'mode-lokal' : 'mode-koeb'}>
      <p className="t-eyebrow">{mode.label}</p>
      <H id={primary ? 'mode-lokal' : 'mode-koeb'} className="t-display t-h3 mt-2">
        {mode.name}
      </H>
      <p className="t-body mt-3 max-w-[46ch]">{mode.headline}</p>

      <div className="mode-price">
        <p className="mode-main">
          <Amount text={mode.priceLine} />
        </p>
        <p className="t-body mt-2 max-w-[52ch] text-[15px]">
          <Amount text={mode.minimumLine} serif={false} />
        </p>
      </div>

      <p className="mode-label !mt-0">{LABEL.includes}</p>
      <ul className="spec-list !border-0 !pt-2">
        {mode.includes.map((line) => (
          <li key={line}>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      {mode.excludes?.length > 0 && (
        <>
          <p className="mode-label">{LABEL.excludes}</p>
          <ul className="x-list pt-2">
            {mode.excludes.map((line) => (
              <li key={line}>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="mt-auto pt-8">
        <a href={mode.cta.href} className={`btn ${primary ? 'btn-cta' : 'btn-ghost'} w-full sm:w-auto`}>
          {mode.cta.label}
          <Arrow />
        </a>
        {mode.note && <p className="t-body mt-4 text-[14px]">{mode.note}</p>}
      </div>
    </article>
  )
}

export default function BuyModes({ headingLevel = 2, tone = 'grey', eyebrow, title, intro }) {
  const b = { ...buyModes, eyebrow: eyebrow ?? buyModes.eyebrow, title: title ?? buyModes.title, intro: intro ?? buyModes.intro }
  const H = `h${headingLevel}`
  return (
    <section
      id="koebsmaader"
      aria-labelledby="koebsmaader-titel"
      className={`section-y ${tone === 'grey' ? 'bg-paper-2' : 'bg-paper'}`}
    >
      <div className="shell">
        <header data-reveal className="max-w-[48rem]">
          {b.eyebrow && <p className="t-eyebrow t-eyebrow-strong">{b.eyebrow}</p>}
          <H id="koebsmaader-titel" className="t-display t-h2 mt-3">
            {b.title}
          </H>
          <p className="t-body t-lead mt-4 max-w-[60ch]">{b.intro}</p>
        </header>

        <div className="mt-9 grid grid-cols-1 gap-5 md:mt-12 lg:grid-cols-2 lg:gap-6">
          <div data-reveal className="flex *:w-full">
            <Mode mode={b.lokal} primary level={headingLevel + 1} />
          </div>
          <div data-reveal style={{ '--d': '80ms' }} className="flex *:w-full">
            <Mode mode={b.koeb} primary={false} level={headingLevel + 1} />
          </div>
        </div>

        <div data-reveal className="callout mt-6 md:mt-8">
          <p className="max-w-[78ch] text-[16px]">
            {b.compareNote}{' '}
            <a href={paths.vilkaar} className="link-underline hit font-semibold text-cta">
              Læs vilkårene
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
