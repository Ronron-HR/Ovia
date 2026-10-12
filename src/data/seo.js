import { demos } from '../content.demos.js'
import {
  contact,
  driftPlanList,
  formatKr,
  lokal,
  lokalMinimum,
  lokalMonthly,
  priceNote,
  services,
  systemModule,
  tierName,
} from './pricing.js'
import { paths } from './texts.js'

/**
 * SEO for OviaSpecs' egen side: titler, metabeskrivelser, sidens "sidst
 * opdateret" (til sitemap.xml) og de strukturerede data (JSON-LD).
 *
 * Ren JavaScript uden React, så det kan indlæses direkte i Node (se
 * scripts/prerender.mjs og routes.js). Beløb kommer fra pricing.js via
 * formatKr; der står aldrig et tal som tekst her (scripts/test-pricing.mjs).
 *
 * Reglerne (docs/rebrand/brief.md, afsnit J):
 * - én tydelig, unik hensigt pr. side; titler højst ca. 60 tegn, beskrivelser
 *   ca. 120-158 tegn;
 * - ingen løfter om placering, indeksering eller AI-citering;
 * - søgetemaerne er forslag, ikke validerede søgevolumener: hjemmeside til små
 *   virksomheder, hjemmeside Aarhus, hjemmeside på abonnement, lokal SEO
 *   Aarhus, hjælp til booking.
 */

const lowestOnce = (service) => Math.min(...service.tiers.map((t) => t.price))

/**
 * `updated`: dato for seneste væsentlige ændring af sidens indhold (ÅÅÅÅ-MM-DD).
 * Den bruges som <lastmod> i sitemap.xml. Ret den, når siden ændres
 * indholdsmæssigt; en dato, der skifter ved hvert build, lærer Google at
 * ignorere feltet. Mangler den, udelades <lastmod> for siden.
 */
const UPDATED = '2026-10-12'

export const seo = {
  home: {
    title: 'Hjemmesider og lokal SEO i Aarhus | OviaSpecs',
    description:
      'Få hjælp til hjemmeside, lokal Google-synlighed og enklere henvendelser. Se priser og løsninger hos OviaSpecs. Direkte kontakt med Ronny.',
    updated: UPDATED,
  },
  hjemmeside: {
    title: 'Hjemmeside til små virksomheder | OviaSpecs',
    description: `Hjemmeside uden opstartspris på abonnement (${formatKr(lokal.monthly)}/md., mindst ${lokal.minMonths} mdr.) eller som engangskøb fra ${formatKr(lowestOnce(services.hjemmeside))} Du taler med Ronny.`,
    updated: UPDATED,
  },
  bookingGoogle: {
    title: 'Lokal SEO og Google-profil i Aarhus | OviaSpecs',
    description:
      'Hjælp til din Google-profil, lokal SEO, booking og et QR-skilt til anmeldelser. Konkret arbejde uden løfter om placering. Start med et gratis tjek.',
    updated: UPDATED,
  },
  systemer: {
    title: 'Små systemer til henvendelser og opfølgning | OviaSpecs',
    description:
      'Små digitale arbejdsgange til fx catering, tilbudsopfølgning og booking, kun hvis du har et konkret behov. Se en demo. Pris som særskilt fast tilbud.',
    updated: UPDATED,
  },
  marketing: {
    title: 'Korte videoer og opslag til sociale medier | OviaSpecs',
    description: `Korte videoer og opslag til dine sociale medier hver måned, fra ${formatKr(lowestOnce(services.marketing))}/md. Annoncebudget er særskilt. Kontakt Ronny direkte.`,
    updated: UPDATED,
  },
  priser: {
    title: 'Priser på hjemmeside og lokal synlighed | OviaSpecs',
    description: `${formatKr(lokal.start)} i opstart og ${formatKr(lokal.monthly)}/md. i mindst ${lokal.minMonths} mdr., eller køb hjemmesiden fra ${formatKr(lowestOnce(services.hjemmeside))} Beregn din pris. ${priceNote}`,
    updated: UPDATED,
  },
  demoer: {
    title: 'Eksempler på hjemmesider til café og salon | OviaSpecs',
    description:
      'Fire demoer af hjemmesider til café, restaurant, salon og vinbar. De er koncepter, ikke kundeopgaver, men de virker på din telefon. Prøv dem selv.',
    updated: UPDATED,
  },
}

/**
 * Demoernes titler og beskrivelser bor i content.demos.js (C ejer teksten);
 * her samles de med siden "Eksempler" til én liste med sidenøgle.
 */
export const demoSeo = Object.fromEntries(
  demos.projects.map((p) => [
    `demo-${p.id}`,
    { title: p.metaTitle, description: p.metaDescription, updated: UPDATED },
  ]),
)

/** Privatlivspolitikken er sin egen indgang (ikke i routes.js), men står i sitemap.xml. */
export const privacySeo = { path: paths.privatliv, updated: '2026-10-07' }

/* ---- Strukturerede data (JSON-LD) ----------------------------------------
   Kun det, der står på siden og er verificeret: navn, adresse på nettet, mail,
   telefon, grundlægger, sprog og de priser, pricing.js har. Bevidst ikke med:
   - adresse og LocalBusiness-egenskaber (der er ingen offentlig adresse;
     company.address er tom, og der opdigtes ingen),
   - aggregateRating / review (der er ingen anmeldelser),
   - FAQPage (Google viser ikke længere FAQ-rich results),
   - BreadcrumbList og Service pr. side (der er ingen synlig brødkrumme, og
     siden er flad; markup uden synligt modstykke giver ingen gevinst),
   - systemModule som tilbud med pris, mens systemModule.ready er false.
   Typen er Organization og ikke LocalBusiness/ProfessionalService: tilbuddet
   gælder hele Danmark, og en lokal-virksomhedstype signalerer en adresse.
------------------------------------------------------------------------- */
const ORIGIN = 'https://oviaspecs.com'
const ORG_ID = `${ORIGIN}/#organisation`

const vat = { valueAddedTaxIncluded: false } // priceNote: "Alle priser er ekskl. moms."

const monthlySpec = (price, name) => ({
  '@type': 'UnitPriceSpecification',
  ...(name ? { name } : {}),
  price,
  priceCurrency: 'DKK',
  unitCode: 'MON',
  ...vat,
})

const onceSpec = (price, name) => ({
  '@type': 'UnitPriceSpecification',
  ...(name ? { name } : {}),
  price,
  priceCurrency: 'DKK',
  ...vat,
})

/** Lokal (abonnement uden opstartspris) og, kun når modulet findes, Lokal med systemtilvalg. */
const lokalOffers = () => [
  {
    '@type': 'Offer',
    name: `Hjemmeside på abonnement: ${lokal.name}`,
    description: `${formatKr(lokal.start)} i opstart, ${formatKr(lokal.monthly)}/md., mindst ${lokal.minMonths} måneder (i alt mindst ${formatKr(lokalMinimum())}). ${lokal.pages.min}-${lokal.pages.max} indholdssider, hosting og teknisk vedligeholdelse, indledende Google/SEO-opsætning og månedligt op til ${lokal.minutes.seo} minutters lokal SEO og ${lokal.minutes.content} minutters mindre rettelser. ${priceNote}`,
    priceSpecification: [onceSpec(lokal.start, 'Opstart'), monthlySpec(lokal.monthly, 'Pr. måned')],
    itemOffered: { '@type': 'Service', name: 'Hjemmeside og lokal synlighed på abonnement' },
  },
  ...(systemModule.ready
    ? [
        {
          '@type': 'Offer',
          name: `Hjemmeside på abonnement: ${lokal.name} med systemtilvalg`,
          description: `${formatKr(lokal.start)} i opstart, ${formatKr(lokalMonthly(true))}/md., mindst ${lokal.minMonths} måneder (i alt mindst ${formatKr(lokalMinimum(true))}). ${priceNote}`,
          priceSpecification: [onceSpec(lokal.start, 'Opstart'), monthlySpec(lokalMonthly(true), 'Pr. måned')],
          itemOffered: { '@type': 'Service', name: 'Hjemmeside, lokal synlighed og ét standardmodul på abonnement' },
        },
      ]
    : []),
]

/** Engangspakker og abonnementer fra pricing.js (hjemmeside, marketing, Booking & Google). */
const packageOffers = () =>
  Object.values(services).flatMap((service) =>
    service.tiers.map((tier) => ({
      '@type': 'Offer',
      name: `${service.name}: ${tierName(tier)}`,
      description: tier.features.join(', '),
      priceSpecification: service.billing === 'monthly' ? monthlySpec(tier.price) : onceSpec(tier.price),
      itemOffered: { '@type': 'Service', name: service.name },
    })),
  )

/** Hjemmesidens drift er et særskilt valg pr. måned, uafhængigt af pakken. */
const driftOffers = () =>
  driftPlanList.map((plan) => ({
    '@type': 'Offer',
    name: `${services.hjemmeside.name}, drift: ${plan.name}`,
    description: [...services.hjemmeside.drift.included, plan.content].join(', '),
    priceSpecification: monthlySpec(plan.monthly),
    itemOffered: { '@type': 'Service', name: `${services.hjemmeside.name}, drift` },
  }))

/** Forsidens JSON-LD: organisationen, websitet og tilbuddene. Kun forsiden; undersiderne har ingen. */
export const organisationLd = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'OviaSpecs',
      url: `${ORIGIN}/`,
      logo: `${ORIGIN}/logo.svg`,
      image: `${ORIGIN}/og.jpg`,
      email: contact.email,
      telephone: contact.phoneHref,
      description:
        'Hjemmesider, lokal Google-synlighed og små digitale arbejdsgange til mindre danske virksomheder. Base i Aarhusområdet.',
      founder: { '@type': 'Person', name: contact.name },
      areaServed: { '@type': 'Country', name: 'Danmark' },
      knowsLanguage: 'da',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: contact.email,
        telephone: contact.phoneHref,
        availableLanguage: 'da',
      },
      makesOffer: [...lokalOffers(), ...packageOffers(), ...driftOffers()],
    },
    {
      '@type': 'WebSite',
      '@id': `${ORIGIN}/#website`,
      url: `${ORIGIN}/`,
      name: 'OviaSpecs',
      inLanguage: 'da',
      publisher: { '@id': ORG_ID },
    },
  ],
})
