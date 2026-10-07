import {
  driftFrom,
  driftPlanList,
  formatKr,
  formatPrice,
  priceNote,
  recommendedFor,
  tierName,
} from '../data/pricing.js'
import Amount from './Amount.jsx'
import '../calc.css'

/**
 * PAKKER — alle tal og al tekst kommer fra src/data/pricing.js.
 *
 * PackageCard: én pakke. Den anbefalede (Vækst) får kant i blæk og mærket
 * "Anbefalet". En pakke med `limit` (fx "Højst 1 kunde ad gangen") viser det
 * som et lille mærke; det er en oplysning, ikke en nedtælling. Mærkerne sidder
 * på kortets overkant, så de ikke skubber titlen ned.
 *
 * Fra md står kortene i faste rækker (CSS subgrid i .package-grid): titel,
 * tekst, pris, driftlinje, liste og note. Derfor er driftlinjen og noten
 * altid i markuppen, også når de er tomme, så pris og liste står på samme
 * linje på tværs af kortene.
 *
 * Hjemmesidens drift er IKKE en del af pakken: kortet viser kun engangsprisen og
 * en kort linje om, at drift vælges særskilt (fra laveste plan). De tre
 * driftsplaner står i blokken DriftTerms under pakkerne.
 */
export function PackageCard({ service, tier, headingLevel = 3 }) {
  const H = `h${headingLevel}`
  const rec = recommendedFor[service.id]
  const recommended = rec?.tier === tier.id
  return (
    <article className="package" data-recommended={recommended}>
      {(recommended || tier.limit) && (
        <p className="package-flags">
          {recommended && <span className="badge badge-ink">{rec.label}</span>}
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
      <p className="package-drift t-body text-[14px]">{service.drift ? service.drift.fromLine(formatKr(driftFrom)) : ''}</p>

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

/** Tilvalg og tillæg til hjemmesiden (egen konto/hosting, booking, ekstra underside). */
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

/**
 * Drift: valg 2 efter pakken. De tre planer som tre kort på bred plads (én kolonne
 * på mobil, tre kolonner fra md), med den tekniske drift, der er ens i alle tre,
 * og vilkårene under. Pakke og plan er uafhængige: alle planer kan vælges til alle pakker.
 */
export function DriftTerms({ service, className = '', headingLevel = 3 }) {
  const H = `h${headingLevel}`
  const d = service.drift
  if (!d) return null
  const b = d.block
  return (
    <div className={`drift-block ${className}`} data-drift-block>
      <p className="t-eyebrow t-eyebrow-strong">{b.eyebrow}</p>
      <H className="t-display t-h4 mt-2">{b.title}</H>
      <p className="t-body mt-2 max-w-[60ch] text-[15px]">{b.intro}</p>

      <ul className="drift-plans mt-5">
        {driftPlanList.map((p) => (
          <li key={p.id} className="drift-plan">
            <p className="drift-plan-name">{p.name}</p>
            <p className="drift-plan-price amount-lg">
              <Amount text={formatKr(p.monthly)} />
              <span className="package-per">{b.perMonth}</span>
            </p>
            <p className="drift-plan-content">{p.content}</p>
            <p className="t-body text-[14px]">{p.summary}</p>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-[15px] font-medium">{b.sharedLead}</p>
      <ul className="spec-list mt-2">
        {d.included.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <ul className="t-body mt-4 flex flex-col gap-1.5 text-[14px]">
        <li>{d.contentWork}</li>
        <li>{d.notContentWork}</li>
        <li>{d.unusedTime}</li>
        <li>{d.extraWork}</li>
        <li>{d.domain}</li>
        <li>{d.binding}</li>
        <li>{d.buyout(formatKr(d.buyoutPrice))}</li>
      </ul>
    </div>
  )
}
