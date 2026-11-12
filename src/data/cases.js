import { palmyUrl, paths } from './site.js'

/**
 * CASES. Én liste, som forsiden, /cases og de enkelte casesider læser fra. En ny case er en ny post her
 * (plus dens side i src/pages/cases/, en sidenøgle i pageKeys.js og en post i seo.js).
 *
 * Kun fakta: ingen tal, resultater, udtalelser eller anmeldelser. Casesiderne har ingen billeder.
 */

export const cases = [
  {
    slug: 'palmy-spisested',
    path: paths.casePalmy,
    name: 'Palmy Spisested',
    kind: 'Restaurant',
    cuisine: 'Vietnamesisk',
    city: 'Hjortshøj',
    /** Én linje: hvad der blev lavet. */
    line: 'Hjemmeside og fuld SEO til en vietnamesisk restaurant i Hjortshøj.',
    /** Tags på kortet og i casens hero. */
    tags: ['Hjemmeside', 'Lokal SEO', 'Google Business-profil', 'Search Console'],
    /** Tre korte punkter om det leverede (forsiden). */
    delivered: ['Hjemmeside bygget til mobilen', 'Lokal SEO og Google Business-profil', 'Sat op, så Google kan læse siden (Search Console og strukturerede data)'],
    siteUrl: palmyUrl,
    siteLabel: 'palmyspisested.com',
    /**
     * Lighthouse på det live site: kun tal, jeg selv har målt (mobil, median af 3 kørsler), med dato.
     * Mål igen og ret datoen, når sitet ændres.
     */
    lighthouse: {
      date: '2026-11-08',
      dateLabel: '8. november 2026',
      scores: [
        ['Ydeevne', 91],
        ['Tilgængelighed', 100],
        ['Bedste praksis', 100],
        ['SEO', 100],
      ],
    },
  },
]

/** Casen med den slug, eller undefined. */
export const caseBySlug = (slug) => cases.find((c) => c.slug === slug)

