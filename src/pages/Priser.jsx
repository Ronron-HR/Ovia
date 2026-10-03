import ContactSection from '../components/ContactSection.jsx'
import { Addons, DriftTerms, PackageGrid, PriceNote } from '../components/Packages.jsx'
import PriceCalculator from '../components/PriceCalculator.jsx'
import { Arrow } from '../components/Shots.jsx'
import { calculator, introNote, introText, services } from '../data/pricing.js'
import { priser as p } from '../data/services.js'
import { paths } from '../data/texts.js'

const SERVICES = [
  { key: 'hjemmeside', href: paths.hjemmeside },
  { key: 'marketing', href: paths.marketing },
  { key: 'bookingGoogle', href: paths.bookingGoogle },
]

/** /priser/: prisberegneren øverst og alle pakker for alle tre ydelser under den. */
export default function Priser() {
  return (
    <>
      {/* Overskriften og så straks beregneren; forklaringen står under den. */}
      <section className="pt-[calc(var(--nav-h)+20px)] pb-[var(--space-section)] md:pt-[calc(var(--nav-h)+48px)]">
        <div className="shell">
          <div className="max-w-[880px]">
            <h1 data-hero="lift" className="t-display text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.06]">
              {p.title}
            </h1>
            <div data-hero="fade" style={{ '--d': '80ms' }} className="mt-4 md:mt-6">
              <PriceCalculator />
            </div>
            <p className="t-body mt-4 text-[15px]">{p.lead}</p>
          </div>
        </div>
      </section>

      <section id="pakker" aria-labelledby="alle-titel" className="section-y bg-paper-2">
        <div className="shell">
          <header data-reveal>
            <div className="flex flex-wrap items-center gap-3">
              <p className="t-eyebrow t-eyebrow-strong">{p.all.eyebrow}</p>
              {introText && <span className="badge">{introText}</span>}
              {introNote && <span className="text-[14px] text-muted">{introNote}</span>}
            </div>
            <h2 id="alle-titel" className="t-display t-h2 mt-4">
              {p.all.title}
            </h2>
            <PriceNote className="mt-4" />
          </header>

          {SERVICES.map(({ key, href }) => {
            const service = services[key]
            return (
              <div key={key} className="mt-14 first-of-type:mt-10">
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink pb-3">
                  <h3 className="t-display t-h3">{service.name}</h3>
                  <a href={href} className="btn-text inline-flex items-center gap-2">
                    {p.all.more}
                    <span className="sr-only"> om {service.name}</span>
                    <Arrow />
                  </a>
                </div>
                <div className="mt-6">
                  <PackageGrid service={service} headingLevel={4} />
                </div>
                <Addons service={service} />
                {key === 'bookingGoogle' && calculator.bookingDriftNote && (
                  <p className="mt-5 text-[15px] text-ink">{calculator.bookingDriftNote}</p>
                )}
                {service.drift && <DriftTerms service={service} className="mt-6" headingLevel={4} />}
              </div>
            )
          })}

          <PriceNote className="mt-10" />
        </div>
      </section>

      <ContactSection title={p.contact.title} body={p.contact.body} />
    </>
  )
}
