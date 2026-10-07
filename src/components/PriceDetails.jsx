import { partText } from '../calculator.js'
import { calculator } from '../data/pricing.js'
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
