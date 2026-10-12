import { introNote, introText, services } from '../data/pricing.js'
import { calcIntro, home } from '../data/texts.js'
import { process } from '../data/offer.js'
import BuyModes from './BuyModes.jsx'
import ContactButtons from './ContactButtons.jsx'
import ContactSection from './ContactSection.jsx'
import Faq from './Faq.jsx'
import Icon from './Icon.jsx'
import PriceCalculator from './PriceCalculator.jsx'
import { Addons, DriftTerms, PackageGrid, PriceNote } from './Packages.jsx'
import { Arrow } from './Shots.jsx'
import Steps from './Steps.jsx'

/**
 * FÆLLES SKABELON FOR YDELSESSIDERNE
 *
 * Overskrift, problemet og kontakt → hvad du får → [valgfrie sektioner efter
 * sidens indhold: de to købsmåder (page.modes, /hjemmeside/), omfang
 * (page.scope, /marketing/), konkret lokal SEO (page.localSeo, /booking-google/)]
 * → [ekstra sektion: koncepter, pilotforløb eller gratis Google-tjek]
 * → pakker → beregneren (sidens ydelse forvalgt) → forløb → FAQ → kontakt.
 * Flader: hero lys, "det får du" tonet, valgfrie sektioner lys, ekstra sektion
 * tonet (ConceptGrid og FreeCheck; pilotforløbet er mørkt), pakker lys, beregner
 * tonet, forløb lys, FAQ tonet, kontakt mørk.
 * Teksterne står i src/data/services.js og offer.js, alle priser og pakker i
 * src/data/pricing.js. Heroen har én primær handling ("Se din pris", der hopper
 * til beregneren længere nede) og Ring ved siden af.
 */
const ICON = { hjemmeside: 'browser', marketing: 'video', bookingGoogle: 'pin' }
const SEO_ICON = { atStart: 'list', monthly: 'calendar', measurement: 'search', reviews: 'user' }

function LocalSeo({ data }) {
  const blocks = ['atStart', 'monthly', 'measurement', 'reviews'].filter((k) => data[k])
  return (
    <section aria-labelledby="lokalseo-titel" className="section-y bg-paper">
      <div className="shell">
        <header data-reveal className="max-w-[48rem]">
          {data.eyebrow && <p className="t-eyebrow t-eyebrow-strong">{data.eyebrow}</p>}
          <h2 id="lokalseo-titel" className="t-display t-h2 mt-3">
            {data.title}
          </h2>
          {data.intro && <p className="t-body t-lead mt-4 max-w-[60ch]">{data.intro}</p>}
        </header>

        <div className="mt-9 grid grid-cols-1 gap-5 md:mt-12 md:grid-cols-2 lg:gap-6">
          {blocks.map((key, i) => (
            <article key={key} data-reveal style={{ '--d': `${(i % 2) * 80}ms` }} className="term-block" aria-labelledby={`seo-${key}`}>
              <div className="flex items-center gap-3.5">
                <span className="icon-tile">
                  <Icon name={SEO_ICON[key]} size={22} />
                </span>
                <h3 id={`seo-${key}`} className="t-display t-h4">
                  {data[key].title}
                </h3>
              </div>
              <ul className="rows">
                {data[key].items.map((item) => (
                  <li key={item.slice(0, 48)}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {(data.oneOff || data.excluded || data.goalNote) && (
          <div className="mt-5 grid grid-cols-1 gap-5 lg:mt-6 lg:grid-cols-2 lg:gap-6">
            {data.oneOff && (
              <article data-reveal className="term-block" aria-labelledby="seo-oneoff">
                <h3 id="seo-oneoff" className="t-display t-h4">
                  {data.oneOff.title}
                </h3>
                <ul className="rows">
                  {data.oneOff.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            )}
            <div data-reveal style={{ '--d': '80ms' }} className="flex flex-col gap-4">
              {data.goalNote && (
                <div className="callout">
                  <Icon name="info" size={20} className="mt-0.5 text-cta" />
                  <p className="text-[16px] font-medium">{data.goalNote}</p>
                </div>
              )}
              {data.excluded && (
                <p className="t-body flex gap-3 px-1 text-[16px]">
                  <Icon name="minus" size={20} className="mt-0.5" />
                  <span>{data.excluded}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default function ServicePage({ page, extra = null }) {
  const service = services[page.service]
  return (
    <>
      <section className="hero" aria-labelledby="side-titel">
        <div className="shell">
          <div className="max-w-[56rem]">
            <p data-hero="fade" className="flex items-center gap-3 text-[15px] font-semibold text-cta">
              <span className="icon-tile">
                <Icon name={ICON[page.service] ?? 'arrow'} size={22} />
              </span>
              {page.eyebrow}
            </p>
            <h1 id="side-titel" data-hero="lift" style={{ '--d': '60ms' }} className="t-display t-hero mt-5 max-w-[20ch]">
              {page.title}
            </h1>
            <div data-hero="lift" style={{ '--d': '100ms' }} className="mt-5 max-w-[56ch] md:mt-6">
              {page.problem.map((p) => (
                <p key={p.slice(0, 24)} className="t-body t-lead mt-3 first:mt-0">
                  {p}
                </p>
              ))}
            </div>
            <div data-hero="fade" style={{ '--d': '160ms' }} data-callbar-hide>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center md:mt-8">
                <a href="#beregner" className="btn btn-cta btn-lg">
                  {page.toCalculator.label}
                  <Arrow />
                </a>
                <ContactButtons className="[&>a]:btn-lg" />
              </div>
              <p className="mt-4 flex flex-col items-start gap-x-8 gap-y-1 text-[16px] sm:flex-row sm:flex-wrap">
                {page.heroLink && (
                  <a href={page.heroLink.href} className="link-underline hit font-medium text-ink">
                    {page.heroLink.label}
                  </a>
                )}
                <a href="#pakker" className="link-underline hit font-medium text-ink">
                  {page.toPackages}
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="faar-titel" className="section-y bg-paper-2">
        <div className="shell">
          <div className="grid grid-cols-1 gap-x-14 gap-y-8 lg:grid-cols-12">
            <header data-reveal className="lg:col-span-4">
              <p className="t-eyebrow t-eyebrow-strong">{page.get.eyebrow}</p>
              <h2 id="faar-titel" className="t-display t-h2 mt-3">
                {page.get.title}
              </h2>
            </header>
            <ul data-reveal style={{ '--d': '80ms' }} className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:col-span-8">
              {page.get.items.map((item) => (
                <li key={item.title} className="border-t border-rule-strong py-5">
                  <h3 className="text-[18px] leading-snug font-semibold">{item.title}</h3>
                  <p className="t-body mt-1.5 text-[16px]">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {page.modes && (
        <BuyModes tone="paper" eyebrow={page.modes.eyebrow} title={page.modes.title} intro={page.modes.lead} />
      )}

      {page.scope && (
        <section aria-labelledby="omfang-titel" className="section-y bg-paper">
          <div className="shell">
            <header data-reveal className="max-w-[48rem]">
              <p className="t-eyebrow t-eyebrow-strong">{page.scope.eyebrow}</p>
              <h2 id="omfang-titel" className="t-display t-h2 mt-3">
                {page.scope.title}
              </h2>
              <p className="t-body t-lead mt-4 max-w-[60ch]">{page.scope.intro}</p>
            </header>
            <ul data-reveal style={{ '--d': '80ms' }} className="mt-8 grid grid-cols-1 gap-x-8 sm:grid-cols-2 lg:grid-cols-3 md:mt-10">
              {page.scope.items.map((item) => (
                <li key={item.title} className="border-t border-rule-strong py-5">
                  <h3 className="text-[18px] leading-snug font-semibold">{item.title}</h3>
                  <p className="t-body mt-1.5 text-[16px]">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {page.localSeo && <LocalSeo data={page.localSeo} />}

      {extra}

      <section id="pakker" aria-labelledby="pakker-titel" className="section-y bg-paper">
        <div className="shell">
          <header data-reveal className="max-w-[48rem]">
            <div className="flex flex-wrap items-center gap-3">
              <p className="t-eyebrow t-eyebrow-strong">{page.packages.eyebrow}</p>
              {introText && <span className="badge">{introText}</span>}
              {introNote && <span className="text-[14px] text-muted">{introNote}</span>}
            </div>
            <h2 id="pakker-titel" className="t-display t-h2 mt-3">
              {page.packages.title}
            </h2>
            {page.packages.intro && <p className="t-body t-lead mt-4 max-w-[60ch]">{page.packages.intro}</p>}
          </header>

          <div data-reveal className="mt-10">
            <PackageGrid service={service} />
          </div>
          <Addons service={service} />
          {page.packages.notes?.map((n, i) => (
            <p key={n} className={`${i ? 'mt-1.5' : 'mt-5'} max-w-[70ch] text-[16px] text-ink`}>
              {n}
            </p>
          ))}
          <PriceNote className="mt-5" />
          {service.drift && <DriftTerms service={service} className="mt-10" />}
        </div>
      </section>

      <section aria-labelledby="beregner-titel" className="section-y bg-paper-2">
        <div className="shell">
          <header data-reveal className="max-w-[48rem]">
            <h2 id="beregner-titel" className="t-display t-h2">
              {home.calc.title}
            </h2>
            <p className="t-body t-lead mt-3 max-w-[60ch]">{calcIntro}</p>
          </header>
          <div className="mt-7 md:mt-9">
            <PriceCalculator defaults={[page.service]} />
          </div>
        </div>
      </section>

      <Steps data={process} tone="paper" />

      <Faq id="faq" tone="grey" eyebrow={page.faq.eyebrow} title={page.faq.title} items={page.faq.items} />

      <ContactSection title={page.contact.title} body={page.contact.body} />
    </>
  )
}
