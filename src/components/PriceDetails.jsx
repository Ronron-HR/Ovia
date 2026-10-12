import { minimumText, partText, priceParts } from '../calculator.js'
import { calculator, formatKr } from '../data/pricing.js'
import Amount from './Amount.jsx'

/**
 * Hvad prisen består af: én række pr. del (pakke, tilvalg, driftsplan, fradrag)
 * med engangs- og månedsbeløb hver for sig. Delene er præcis dem, quote() lægger
 * sammen (line.parts), så rækkerne altid giver linjens pris.
 */
export function PriceParts({ parts, className = '' }) {
  return (
    <ul className={`calc-parts t-body text-[14px] ${className}`}>
      {parts.map((p) => (
        <li key={p.id}>
          <span>{p.label}</span>
          <Amount text={partText(p)} serif={false} className="tabular-nums" />
        </li>
      ))}
    </ul>
  )
}

/**
 * Totalen: "Nu" og "Pr. måned" hver for sig (et beløb på 0 vises ikke), og for Lokal altid opstarten
 * (nul) samt en linje med minimumsperioden og den mindste betaling, så et engangsbeløb og et
 * abonnement aldrig blandes uklart. `labels` er etiketterne over beløbene; `always` viser begge
 * felter også ved 0 (guiden).
 */
export function TotalBlock({ q, labels, always = false, sub = false, className = '' }) {
  const parts = priceParts(q.total)
  const lokal = q.total.lokal
  const onceText = parts.once || (lokal ? formatKr(0) : '')
  const main = sub ? 'calc-total-sub' : 'calc-total-main'
  const G = calculator.guide
  return (
    <div className={className}>
      <div className="calc-total amount-lg flex flex-wrap items-end gap-x-10 gap-y-3 tabular-nums">
        {(onceText || always) && (
          <p className="calc-total-part">
            <span aria-hidden={sub ? undefined : 'true'} className="t-eyebrow block">
              {labels.once}
            </span>
            <span className={`${main} block`}>
              {onceText ? <Amount text={onceText} /> : <span className="text-[20px]">{G.noOnce}</span>}
              {!sub && <span className="sr-only"> {calculator.nowLabel},</span>}
            </span>
          </p>
        )}
        {(parts.month || always) && (
          <p className="calc-total-part">
            <span aria-hidden={sub ? undefined : 'true'} className="t-eyebrow block">
              {labels.month}
            </span>
            <span className={`${main} block`}>
              {parts.month ? <Amount text={parts.month.replace('/md', '')} /> : <span className="text-[20px]">{G.noMonthly}</span>}
              {!sub && <span className="sr-only"> {labels.month.toLowerCase()}</span>}
            </span>
          </p>
        )}
      </div>
      {lokal && (
        <p className="calc-minimum mt-3 text-[16px] font-medium" data-lokal-minimum>
          <Amount text={minimumText(q.total)} serif={false} className="tabular-nums" />
        </p>
      )}
    </div>
  )
}

/**
 * Løbende samarbejde (Lokal): det kunden forpligter sig til, vist i resultatet FØR formularen beder om
 * kontaktoplysninger: opstart, månedspris, minimumsperiode, mindste betaling, opsigelse, eksterne udgifter
 * og hvad der sker med hjemmesiden efter minimumsperioden. Tekster: calculator.lokalTerms (pricing.js).
 */
export function LokalTerms({ line, headingLevel = 3 }) {
  const T = calculator.lokalTerms
  const H = `h${headingLevel}`
  const Sub = `h${headingLevel + 1}`
  return (
    <section className="lokal-terms mt-6" aria-labelledby="lokal-terms-title" data-lokal-terms>
      <H id="lokal-terms-title" className="text-[17px] font-medium">
        {T.title}
      </H>
      <dl className="lokal-terms-rows mt-3 text-[15px]">
        {T.rows(line.systemReady).map((r) => (
          <div key={r.id}>
            <dt className="t-body">{r.label}</dt>
            <dd className="font-medium tabular-nums">
              <Amount text={r.value} serif={false} />
            </dd>
          </div>
        ))}
      </dl>
      <p className="t-body mt-3 max-w-[60ch] text-[14px]">{T.payment}</p>

      <Sub className="mt-5 text-[15px] font-medium">{T.externalTitle}</Sub>
      <ul className="t-body mt-1 list-disc pl-5 text-[14px]">
        {T.external.map((x) => (
          <li key={x}>{x}</li>
        ))}
        <li>{T.domain}</li>
      </ul>

      <Sub className="mt-4 text-[15px] font-medium">{T.notIncludedTitle}</Sub>
      <p className="t-body mt-1 max-w-[60ch] text-[14px]">{T.notIncluded}</p>

      <Sub className="mt-4 text-[15px] font-medium">{T.handoverTitle}</Sub>
      <ul className="t-body mt-1 list-disc pl-5 text-[14px]">
        {T.handover.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
    </section>
  )
}

/**
 * Hvad månedsprisen dækker, og hvad kunden selv overtager (egen konto). Står under
 * priserne i beregnerens resultat og i guidens forslag. Tekster: calculator.help
 * i src/data/pricing.js; kun dokumenterede vilkår.
 */
export default function PriceDetails({ lines }) {
  const help = calculator.help
  const monthly = lines.filter((l) => l.monthly > 0 && help.monthly[l.key])
  const own = lines.some((l) => l.noDrift)
  if (!monthly.length && !own) return null
  return (
    <div className="mt-5 flex flex-col gap-3 text-[15px]">
      {monthly.map((l) => (
        <details key={l.key} className="calc-details">
          <summary>
            {help.monthly.title}
            {monthly.length > 1 && <span className="text-muted"> ({l.service.name})</span>}
          </summary>
          <ul className="t-body mt-2 list-disc pl-5 text-[14px]">
            {help.monthly[l.key](l).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </details>
      ))}
      {own && (
        <details className="calc-details">
          <summary>{help.ownAccount.title}</summary>
          <ul className="t-body mt-2 list-disc pl-5 text-[14px]">
            {help.ownAccount.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}
