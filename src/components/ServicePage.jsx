import { services } from '../data/pricing.js'
import { home } from '../data/texts.js'
import ContactButtons from './ContactButtons.jsx'
import ContactSection from './ContactSection.jsx'
import Faq from './Faq.jsx'
import { Addons, DriftTerms, PackageGrid, PriceNote } from './Packages.jsx'
import { Arrow } from './Shots.jsx'
import Steps from './Steps.jsx'

/**
 * FÆLLES SKABELON FOR YDELSESSIDERNE
 *
 * Problemet → hvad du får → [ekstra sektion] → 3 pakker → sådan foregår det
 * → FAQ → kontakt. Teksterne står i src/data/services.js, alle priser og
 * pakker i src/data/pricing.js. `extra` er sidens egen sektion (koncepter,
 * pilotforløb eller gratis Google-tjek) og står før pakkerne.
 */
export default function ServicePage({ page, extra = null }) {
  const service = services[page.service]
  return (
    <>
      <section className="pt-[calc(var(--nav-h)+36px)] pb-12 md:pt-[calc(var(--nav-h)+64px)] md:pb-16">
        <div className="shell">
          <p data-hero="fade" className="t-eyebrow t-eyebrow-accent">
            {page.eyebrow}
          </p>
          <h1 data-hero="fade" style={{ '--d': '60ms' }} className="t-display t-hero mt-5 max-w-[20ch]">
            {page.title}
          </h1>
          <div data-hero="fade" style={{ '--d': '140ms' }} className="mt-6 max-w-[52ch]">
            {page.problem.map((p) => (
              <p key={p.slice(0, 24)} className="t-body t-lead mt-3 first:mt-0">
                {p}
              </p>
            ))}
          </div>
          <div data-hero="fade" style={{ '--d': '220ms' }} data-callbar-hide>
            <ContactButtons className="mt-8" stretch />
          </div>
          <a data-hero="fade" style={{ '--d': '300ms' }} href="#pakker" className="btn-text mt-6 inline-flex items-center gap-2">
            {page.toPackages}
            <Arrow className="rotate-90" />
          </a>
        </div>
      </section>

      <section aria-labelledby="faar-titel" className="section-y bg-paper-2">
        <div className="shell">
          <div className="grid grid-cols-1 gap-x-14 gap-y-8 lg:grid-cols-12">
            <header data-reveal className="lg:col-span-4">
              <p className="t-eyebrow t-eyebrow-accent">{page.get.eyebrow}</p>
              <h2 id="faar-titel" className="t-display t-h2 mt-4">
                {page.get.title}
              </h2>
            </header>
            <ul data-reveal style={{ '--d': '80ms' }} className="grid grid-cols-1 gap-x-8 border-t border-ink sm:grid-cols-2 lg:col-span-8">
              {page.get.items.map((item) => (
                <li key={item.title} className="border-b border-rule py-5">
                  <h3 className="text-[18px] leading-snug font-medium">{item.title}</h3>
                  <p className="t-body mt-1.5 text-[15px]">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {extra}

      <section id="pakker" aria-labelledby="pakker-titel" className="section-y bg-paper">
        <div className="shell">
          <header data-reveal className="max-w-[46ch]">
            <p className="t-eyebrow t-eyebrow-accent">{page.packages.eyebrow}</p>
            <h2 id="pakker-titel" className="t-display t-h2 mt-4">
              {page.packages.title}
            </h2>
            {page.packages.intro && <p className="t-body t-lead mt-4">{page.packages.intro}</p>}
          </header>

          <div data-reveal className="mt-10">
            <PackageGrid service={service} />
          </div>
          <Addons service={service} />
          <PriceNote className="mt-5" />
          {service.drift && <DriftTerms service={service} className="mt-10" />}
          <a href={page.toCalculator.href} className="btn btn-ghost mt-8">
            {page.toCalculator.label}
            <Arrow />
          </a>
        </div>
      </section>

      <Steps data={home.steps} tone="grey" />

      <Faq id="faq" eyebrow={page.faq.eyebrow} title={page.faq.title} items={page.faq.items} />

      <ContactSection title={page.contact.title} body={page.contact.body} />
    </>
  )
}
