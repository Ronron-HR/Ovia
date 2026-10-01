import {
  formatKr,
  formatPrice,
  priceNote,
  recommendedLabel,
  recommendedTier,
  tierName,
} from '../data/pricing.js'

/**
 * PAKKER — alle tal og al tekst kommer fra src/data/pricing.js.
 *
 * PackageCard: én pakke. Den anbefalede (Vækst) får mørk kant og mærket
 * "Anbefalet". En pakke med `limit` (fx "Max 1 kunde ad gangen") viser det
 * som et lille mærke; det er en oplysning, ikke en nedtælling.
 */
export function PackageCard({ service, tier, headingLevel = 3 }) {
  const H = `h${headingLevel}`
  const recommended = tier.id === recommendedTier
  return (
    <article className="package" data-recommended={recommended}>
      <header>
        {/* Mærkerækken holder pakkerne på linje side om side; på mobil fylder den kun, når der er et mærke. */}
        <div className={`${recommended || tier.limit ? 'flex mb-3' : 'hidden md:flex md:mb-3'} min-h-7 flex-wrap items-center gap-2`}>
          {recommended && <span className="badge badge-accent">{recommendedLabel}</span>}
          {tier.limit && <span className="badge">{tier.limit}</span>}
        </div>
        <H className="t-display t-h4">
          <span className="sr-only">{service.name}: </span>
          {tierName(tier)}
        </H>
        <p className="t-body mt-1.5 text-[15px]">{tier.summary}</p>
      </header>

      <p className="mt-6">
        <span className="text-[32px] leading-none font-medium tracking-tight tabular-nums">{formatKr(tier.price)}</span>
        {service.billing === 'monthly' && <span className="t-body ml-1 text-[15px]">/md</span>}
      </p>
      {tier.monthly && (
        <p className="t-body mt-2 text-[14px]">
          + drift {formatKr(tier.monthly)}/md
          {tier.monthlyNote && <span className="block text-muted">{tier.monthlyNote}</span>}
        </p>
      )}

      <ul className="spec-list mt-6">
        {tier.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
    </article>
  )
}

/** De tre pakker for én ydelse, side om side fra md. */
export function PackageGrid({ service, headingLevel = 3 }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
      {service.tiers.map((tier) => (
        <PackageCard key={tier.id} service={service} tier={tier} headingLevel={headingLevel} />
      ))}
    </div>
  )
}

/** "Priserne er endelige. OviaSpecs er ikke momsregistreret." (styres i pricing.js) */
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
          <span>{a.label}</span>
          <span className="shrink-0 font-medium tabular-nums">+{formatPrice(service, a.price)}</span>
        </li>
      ))}
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
        <li>{d.buyout(formatKr(service.addons.ownAccount.price))}</li>
      </ul>
    </div>
  )
}
