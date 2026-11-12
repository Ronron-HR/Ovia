import { cases } from '../../data/cases.js'
import ImageSlot from '../ui/ImageSlot.jsx'

/**
 * Forsidens case: står under prisberegneren. Én case, ingen karrusel; den første post i
 * src/data/cases.js. Tekst og knapper i venstre side, skærmbillede af det live site i højre.
 * Billedet er `palmy-case` i src/assets/billeder/ (2240 × 1400, taget af palmyspisested.com).
 */
export default function CaseFeature() {
  const c = cases[0]
  return (
    <section id="case" aria-labelledby="case-titel" className="bg-surface">
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-12 md:grid-cols-[5fr_7fr] md:items-center md:gap-14 md:px-14 md:py-20">
        <div className="flex flex-col gap-4 md:gap-5">
          <span className="text-[15px] font-semibold">Case</span>
          <h2 id="case-titel" className="display t-h2">
            {c.name}
          </h2>
          <p className="m-0 max-w-[34ch] text-[17px] leading-[1.45] text-pretty">{c.line}</p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {c.delivered.map((p) => (
              <li key={p} className="bg-paper px-5 py-3 text-base leading-[1.4]">
                {p}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 md:flex-row">
            <a href={c.path} className="btn btn-ink hov-ink-soft w-full md:w-auto md:min-w-48">
              <span>Se casen</span>
              <span aria-hidden="true">→</span>
            </a>
            <a href={c.siteUrl} target="_blank" rel="noopener" className="btn btn-white w-full md:w-auto md:min-w-48">
              <span>Besøg sitet</span>
              <span aria-hidden="true">↗</span>
              <span className="sr-only">(åbner i ny fane)</span>
            </a>
          </div>
        </div>
        <a href={c.path} className="block">
          <ImageSlot
            name="palmy-case"
            ratio="16 / 10"
            width={2240}
            height={1400}
            alt="Forsiden på palmyspisested.com: logo, telefonnummer til forudbestilling og menu"
            className="border border-hairline"
          />
        </a>
      </div>
    </section>
  )
}
