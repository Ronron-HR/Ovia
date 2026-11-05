import { demos } from '../content.demos.js'
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
const from = (key) => plain(formatKr(prices.services[key].packages[0].price, prices.services[key].period === 'month'))

/**
 * `updated`: dato for seneste væsentlige ændring af sidens indhold (ÅÅÅÅ-MM-DD),
 * brugt som <lastmod> i sitemap.xml. Ret den, når siden ændres indholdsmæssigt.
 */
const UPDATED = '2026-11-05'
const VAT = 'Alle priser er ekskl. moms.'

export const seo = {
  home: {
    title: 'Hjemmesider og lokal SEO i Aarhus | OviaSpecs',
    description: `Hjemmeside, Google-profil, booking og korte videoer til restauranter og caféer i Aarhus. Hjemmeside fra ${from('web')} ${VAT}`,
    updated: UPDATED,
  },
  hjemmeside: {
    title: 'Hjemmeside til små virksomheder | OviaSpecs',
    description: `En hurtig hjemmeside, der virker på telefonen og bliver fundet på Google. Tre pakker fra ${from('web')} og drift fra ${plain(formatKr(prices.drift.plans[0].price, true))} ${VAT}`,
    updated: UPDATED,
  },
  bookingGoogle: {
    title: 'Google-profil og booking i Aarhus | OviaSpecs',
    description: `Hjælp til din Google-profil, booking på hjemmeside eller Instagram og et QR-skilt til anmeldelser. Fra ${from('book')}. ${VAT}`,
    updated: UPDATED,
  },
  marketing: {
    title: 'Korte videoer og opslag til sociale medier | OviaSpecs',
    description: `Korte videoer og opslag til dine sociale medier hver måned, fra ${from('mkt')}. Annoncebudget betales direkte til Meta. ${VAT}`,
    updated: UPDATED,
  },
  priser: {
    title: 'Priser på hjemmeside, marketing og booking | OviaSpecs',
    description: `Alle pakker side om side: hjemmeside fra ${from('web')}, marketing fra ${from('mkt')} og Booking & Google fra ${from('book')}. ${VAT}`,
    updated: UPDATED,
  },
  demoer: {
    title: 'Eksempler på hjemmesider til café og salon | OviaSpecs',
    description:
      'Fire koncepter med opdigtet indhold: en café, en restaurant, en salon og en vinbar. De virker på din telefon, så du kan prøve dem selv.',
    updated: UPDATED,
  },
}

/** Demoernes titler og beskrivelser bor i content.demos.js; her samles de med sidenøgle. */
export const demoSeo = Object.fromEntries(
  demos.projects.map((p) => [`demo-${p.id}`, { title: p.metaTitle, description: p.metaDescription, updated: UPDATED }]),
)

/** Privatlivspolitikken er sin egen indgang (ikke i routes.js), men står i sitemap.xml. */
export const privacySeo = { path: paths.privatliv, updated: UPDATED }

/* ---- Strukturerede data (JSON-LD) ----------------------------------------
   Kun det, der står på siden og er verificeret: navn, mail, telefon,
   grundlægger, sprog og priserne i prices.json. Bevidst ikke med: adresse
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
  Object.values(prices.services).flatMap((service) =>
    service.packages.map((pkg) => ({
      '@type': 'Offer',
      name: `${service.name}: ${pkg.name}`,
      description: pkg.points.join(', '),
      priceSpecification: spec(pkg.price, { monthly: service.period === 'month' }),
      itemOffered: { '@type': 'Service', name: service.name },
    })),
  )

const driftOffers = () =>
  prices.drift.plans.map((plan) => ({
    '@type': 'Offer',
    name: `Hjemmeside, drift: ${plan.name}`,
    description: [...prices.drift.includedInAll, plan.description].join(', '),
    priceSpecification: spec(plan.price, { monthly: true }),
    itemOffered: { '@type': 'Service', name: 'Hjemmeside, drift' },
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
      description: 'Hjemmeside, Google-profil, booking og korte videoer til restauranter og caféer. Base i Aarhusområdet.',
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
      makesOffer: [...packageOffers(), ...driftOffers()],
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
