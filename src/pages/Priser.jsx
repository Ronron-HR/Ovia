import ContactSection from '../components/ContactSection.jsx'
import { Addons, DriftTerms, PackageGrid, PriceNote } from '../components/Packages.jsx'
import PriceCalculator from '../components/PriceCalculator.jsx'
import { Arrow } from '../components/Shots.jsx'
import { flags, services } from '../data/pricing.js'
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
      <section className="pt-[calc(var(--nav-h)+36px)] pb-[var(--space-section)] md:pt-[calc(var(--nav-h)+64px)]">
        <div className="shell">
          <div className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-12">
            <header className="lg:col-span-4">
              <p data-hero="fade" className="t-eyebrow t-eyebrow-accent">
                {p.eyebrow}
              </p>
              <h1 data-hero="fade" style={{ '--d': '60ms' }} className="t-display t-hero mt-5">
                {p.title}
              </h1>
              <p data-hero="fade" style={{ '--d': '140ms' }} className="t-body t-lead mt-5 max-w-[40ch]">
                {p.lead}
              </p>
            </header>
            <div data-hero="fade" style={{ '--d': '200ms' }} className="lg:col-span-8">
              <PriceCalculator />
            </div>
          </div>
        </div>
      </section>

      <section id="pakker" aria-labelledby="alle-titel" className="section-y bg-paper-2">
        <div className="shell">
          <header data-reveal>
            <p className="t-eyebrow t-eyebrow-accent">{p.all.eyebrow}</p>
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
                {service.drift && <DriftTerms service={service} className="mt-6" headingLevel={4} />}
                {key === 'marketing' && !flags.hasMarketingCases && (
                  <p className="mt-5 text-[15px]">
                    {p.pilotNote}{' '}
                    <a href={`${paths.marketing}#pilot`} className="link-underline font-medium">
                      {p.pilotLink}
                    </a>
                  </p>
                )}
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
