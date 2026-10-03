import {
  formatKr,
  formatPrice,
  priceNote,
  recommendedLabel,
  recommendedTier,
  tierName,
} from '../data/pricing.js'
import Amount from './Amount.jsx'

/**
 * PAKKER — alle tal og al tekst kommer fra src/data/pricing.js.
 *
 * PackageCard: én pakke. Den anbefalede (Vækst) får kant i blæk og mærket
 * "Anbefalet". En pakke med `limit` (fx "Max 1 kunde ad gangen") viser det
 * som et lille mærke; det er en oplysning, ikke en nedtælling. Mærkerne sidder
 * på kortets overkant, så de ikke skubber titlen ned.
 *
 * Fra md står kortene i faste rækker (CSS subgrid i .package-grid): titel,
 * tekst, pris, driftlinje, liste og note. Derfor er driftlinjen og noten
 * altid i markuppen, også når de er tomme, så pris og liste står på samme
 * linje på tværs af kortene, og Fuld farts ekstra linje ikke flytter listen.
 */
export function PackageCard({ service, tier, headingLevel = 3 }) {
  const H = `h${headingLevel}`
  const recommended = tier.id === recommendedTier
  return (
    <article className="package" data-recommended={recommended}>
      {(recommended || tier.limit) && (
        <p className="package-flags">
          {recommended && <span className="badge badge-ink">{recommendedLabel}</span>}
          {tier.limit && <span className="badge">{tier.limit}</span>}
        </p>
      )}
      <H className="t-display t-h4">
        <span className="sr-only">{service.name}: </span>
        {tierName(tier)}
      </H>
      <p className="package-summary t-body text-[15px]">{tier.summary}</p>

      <p className="package-price amount-lg">
        <Amount text={formatKr(tier.price)} />
        {service.billing === 'monthly' && <span className="package-per">/md</span>}
      </p>
      <p className="package-drift t-body text-[14px]">
        {tier.monthly && (
          <>
            + drift <span className="whitespace-nowrap text-ink tabular-nums">{formatKr(tier.monthly)}/md</span>
            {tier.monthlyNote && <span className="block">{tier.monthlyNote}</span>}
          </>
        )}
      </p>

      <ul className="spec-list package-list">
        {tier.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
        {(tier.optional ?? []).map((id) => (
          <li key={id} className="text-muted">
            Tilvalg: {service.addons[id].short} (+{formatPrice(service, service.addons[id].price)})
          </li>
        ))}
      </ul>
      <p className="package-note t-body text-[14px]">{tier.note}</p>
    </article>
  )
}

/** De tre pakker for én ydelse, side om side fra md (faste rækker, se .package-grid). */
export function PackageGrid({ service, headingLevel = 3 }) {
  return (
    <div className="package-grid">
      {service.tiers.map((tier) => (
        <PackageCard key={tier.id} service={service} tier={tier} headingLevel={headingLevel} />
      ))}
    </div>
  )
}

/** Momslinjen, fx "Alle priser er ekskl. moms." (priceNote i pricing.js) */
export function PriceNote({ className = '' }) {
  if (!priceNote) return null
  return <p className={`text-[14px] text-muted ${className}`}>{priceNote}</p>
}

/** Tilvalg til hjemmesiden (ekstra underside, egen konto). */
export function Addons({ service }) {
  if (!service.addons) return null
  return (
    <ul className="mt-6 grid grid-cols-1 gap-x-8 border-t border-rule md:grid-cols-2">
      {Object.values(service.addons).map((a) => (
        <li key={a.label} className="flex items-baseline justify-between gap-4 border-b border-rule py-3 text-[15px]">
          <span>
            {a.label}
            {a.note && <span className="mt-0.5 block text-[13px] text-muted">{a.note}</span>}
          </span>
          <span className="shrink-0 font-medium tabular-nums">
            +{formatPrice(service, a.price)}
            {a.unit && ` ${a.unit}`}
          </span>
        </li>
      ))}
      {service.upgradeNote && <li className="py-3 text-[15px] md:col-span-2">{service.upgradeNote}</li>}
    </ul>
  )
}

/** Driftsvilkår for hjemmesiden. */
export function DriftTerms({ service, className = '', headingLevel = 3 }) {
  const H = `h${headingLevel}`
  const d = service.drift
  if (!d) return null
  const monthly = [...new Set(service.tiers.map((t) => t.monthly))].map((m) => `${formatKr(m)}/md`).join(' eller ')
  return (
    <div className={`rounded-[14px] border border-rule bg-surface p-5 md:p-7 ${className}`}>
      <H className="t-display t-h4">Drift ({monthly})</H>
      <ul className="spec-list mt-4">
        {d.included.map((x) => (
          <li key={x}>{x}</li>
        ))}
        <li>{d.fast}</li>
      </ul>
      <ul className="t-body mt-4 flex flex-col gap-1.5 text-[14px]">
        <li>{d.notIncluded}</li>
        <li>{d.domain}</li>
        <li>{d.binding}</li>
        <li>{d.buyout(formatKr(d.buyoutPrice))}</li>
      </ul>
    </div>
  )
}
