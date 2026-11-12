import { cases } from './cases.js'
import prices from './prices.json' with { type: 'json' }
import { formatKr } from '../lib/calculate.js'
import { contact, paths } from './site.js'

/**
 * SEO for OviaSpecs' egen side: titler, metabeskrivelser, sidens "sidst
 * opdateret" (til sitemap.xml) og de strukturerede data (JSON-LD).
 *
 * Ren JavaScript uden React, så det kan indlæses direkte i Node (se
 * scripts/prerender.mjs og routes.js). Beløb kommer fra prices.json via
 * formatKr; der står aldrig et tal som tekst her.
 *
 * Reglerne: én tydelig, unik hensigt pr. side; titler højst ca. 60 tegn,
 * beskrivelser ca. 120-158 tegn; ingen løfter om placering.
 */

/** Hårdt mellemrum → almindeligt, så metatekster ikke indeholder U+00A0. */
const plain = (s) => s.replace(/ /g, ' ')
const pkg = (key) => prices.packages.find((p) => p.key === key)
/** "5.000 kr. + 299 kr./md." for en pakke (alle priser er faste). */
const priceOf = (key) => plain(`${formatKr(pkg(key).once)} + ${formatKr(pkg(key).monthly, true)}`)

/**
 * `updated`: dato for seneste væsentlige ændring af sidens indhold (ÅÅÅÅ-MM-DD),
 * brugt som <lastmod> i sitemap.xml. Ret den, når siden ændres indholdsmæssigt.
 */
const UPDATED = '2026-11-05'
/** Casesiderne er lavet 8. nov. 2026; ret datoen, når de ændres indholdsmæssigt. */
const CASES_UPDATED = '2026-11-08'
const VAT = 'Alle priser er ekskl. moms.'

export const seo = {
  home: {
    title: 'Hjemmeside til restauranter og caféer i Aarhus | OviaSpecs',
    description: `Hjemmeside og Google-profil til restauranter og caféer i Aarhus, med bordbooking og online bestilling. Start: ${priceOf('start')} ${VAT}`,
    updated: UPDATED,
  },
  hjemmeside: {
    title: 'Hjemmeside, Google og bordbooking til restauranter | OviaSpecs',
    description: `Hjemmeside, Google-profil og bordbooking eller online bestilling til din restaurant eller café. Faste priser: Start ${priceOf('start')} ${VAT}`,
    updated: UPDATED,
  },
  priser: {
    title: 'Priser: Start, Anbefalet og Max | OviaSpecs',
    description: `Tre pakker side om side: Start ${priceOf('start')}, Anbefalet ${priceOf('anbefalet')} og Max ${priceOf('max')} ${VAT}`,
    updated: UPDATED,
  },
  cases: {
    title: 'Cases: hjemmeside og SEO til restauranter | OviaSpecs',
    description:
      'Se, hvad vi har bygget til en restaurant: hjemmeside og lokal SEO til Palmy Spisested i Hjortshøj, med fakta om forløbet og det, der blev leveret.',
    updated: CASES_UPDATED,
    ld: () => casesLd(),
  },
  casePalmy: {
    title: 'Case: Palmy Spisested, hjemmeside og SEO | OviaSpecs',
    description:
      'Hjemmeside og SEO til Palmy Spisested, en vietnamesisk restaurant i Hjortshøj: bygget til mobilen, med lokal SEO, Google-profil og Search Console.',
    updated: CASES_UPDATED,
    ld: () => caseLd(cases[0]),
  },
}

/** Privatlivspolitikken er sin egen indgang (ikke i routes.js), men står i sitemap.xml. */
export const privacySeo = { path: paths.privatliv, updated: UPDATED }

/* ---- Strukturerede data (JSON-LD) ----------------------------------------
   Kun det, der står på siden og er verificeret: navn, mail, telefon,
   sprog og pakkepriserne i prices.json (uden introprisen, som er midlertidig). Bevidst ikke med: adresse
   (der er ingen offentlig), anmeldelser (der er ingen) og FAQ.
------------------------------------------------------------------------- */
const ORIGIN = 'https://oviaspecs.com'
const ORG_ID = `${ORIGIN}/#organisation`

const spec = (price, { monthly = false, name } = {}) => ({
  '@type': 'UnitPriceSpecification',
  ...(name ? { name } : {}),
  price,
  priceCurrency: 'DKK',
  ...(monthly ? { unitCode: 'MON' } : {}),
  valueAddedTaxIncluded: false,
})

const packageOffers = () =>
  prices.packages.map((p) => ({
    '@type': 'Offer',
    name: `Hjemmeside: ${p.name}`,
    description: p.points.join(', '),
    priceSpecification: [spec(p.once, { name: 'Engangspris' }), spec(p.monthly, { monthly: true, name: 'Pr. måned' })],
    itemOffered: { '@type': 'Service', name: 'Hjemmeside og Google-profil' },
  }))

/** Forsidens JSON-LD: organisationen, websitet og tilbuddene. Kun forsiden. */
export const organisationLd = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'OviaSpecs',
      url: `${ORIGIN}/`,
      logo: `${ORIGIN}/oviaspecs-logo.svg`,
      image: `${ORIGIN}/og.jpg`,
      email: contact.email,
      telephone: contact.phoneHref,
      description: 'Hjemmeside, Google-profil og funktioner som bordbooking og online bestilling til restauranter og caféer. Base i Aarhusområdet.',
      areaServed: [
        { '@type': 'City', name: 'Aarhus' },
        { '@type': 'Country', name: 'Danmark' },
      ],
      knowsLanguage: 'da',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: contact.email,
        telephone: contact.phoneHref,
        availableLanguage: 'da',
      },
      makesOffer: packageOffers(),
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

/* ---- Cases: strukturerede data ---------------------------------------------
   /cases: CollectionPage + brødkrummer. Casesiden: CreativeWork + brødkrummer. Kun det, der står på siden. Der er
   ingen anmeldelser, ratings eller resultater, og datePublished udelades, til leveringsdatoen er bekræftet.
------------------------------------------------------------------------- */
const crumbs = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${ORIGIN}${path}` })),
})

const casesLd = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CollectionPage',
      '@id': `${ORIGIN}${paths.cases}#side`,
      url: `${ORIGIN}${paths.cases}`,
      name: 'Cases',
      description: seo.cases.description,
      inLanguage: 'da',
      isPartOf: { '@id': `${ORIGIN}/#website` },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: cases.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, url: `${ORIGIN}${c.path}` })),
      },
    },
    crumbs([['Forside', paths.home], ['Cases', paths.cases]]),
  ],
})

const caseLd = (c) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'CreativeWork',
      '@id': `${ORIGIN}${c.path}#case`,
      url: `${ORIGIN}${c.path}`,
      name: `Case: ${c.name}`,
      headline: `${c.name}: hjemmeside og SEO`,
      description: seo.casePalmy.description,
      inLanguage: 'da',
      keywords: c.tags.join(', '),
      creator: { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
      isPartOf: { '@id': `${ORIGIN}${paths.cases}#side` },
      mainEntityOfPage: `${ORIGIN}${c.path}`,
      dateModified: CASES_UPDATED,
      about: {
        '@type': 'Restaurant',
        name: c.name,
        url: c.siteUrl,
        servesCuisine: 'Vietnamese',
        address: { '@type': 'PostalAddress', addressLocality: c.city, addressCountry: 'DK' },
      },
    },
    crumbs([['Forside', paths.home], ['Cases', paths.cases], [c.name, c.path]]),
  ],
})
