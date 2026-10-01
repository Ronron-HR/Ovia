import { demos, kontakt, paths } from './content.js'
import { services } from './services.js'
import { meta, paths as newPaths } from './data/texts.js'
import * as pages from './data/services.js'

/**
 * Sidernes adresser og metadata. Bruges af klienten (hvilken side skal
 * vises), af forudrenderingen (én HTML-fil pr. side, med egen titel og
 * beskrivelse) og til sitemap.xml.
 *
 * `page` er navnet på siden i src/Site.jsx. Privatlivspolitikken er sin egen
 * indgang (se vite.config.js) og er derfor ikke med her.
 */
export const routes = [
  {
    path: paths.home,
    page: 'home',
    title: meta.home.title,
    description: meta.home.description,
  },
  {
    path: newPaths.hjemmeside,
    page: 'hjemmeside',
    title: pages.hjemmeside.meta.title,
    description: pages.hjemmeside.meta.description,
  },
  {
    path: newPaths.marketing,
    page: 'marketing',
    title: pages.marketing.meta.title,
    description: pages.marketing.meta.description,
  },
  {
    path: newPaths.bookingGoogle,
    page: 'bookingGoogle',
    title: pages.bookingGoogle.meta.title,
    description: pages.bookingGoogle.meta.description,
  },
  {
    path: paths.hjemmesider,
    page: 'hjemmesider',
    title: services.hjemmesider.metaTitle,
    description: services.hjemmesider.metaDescription,
  },
  {
    path: paths.booking,
    page: 'booking',
    title: services.booking.metaTitle,
    description: services.booking.metaDescription,
  },
  {
    path: paths.seo,
    page: 'seo',
    title: services.seo.metaTitle,
    description: services.seo.metaDescription,
  },
  {
    path: paths.googleAds,
    page: 'googleAds',
    title: services.googleAds.metaTitle,
    description: services.googleAds.metaDescription,
  },
  {
    path: paths.sociale,
    page: 'sociale',
    title: services.sociale.metaTitle,
    description: services.sociale.metaDescription,
  },
  {
    path: paths.ai,
    page: 'ai',
    title: services.ai.metaTitle,
    description: services.ai.metaDescription,
  },
  {
    path: paths.demoer,
    page: 'demoer',
    title: 'Demoer: fire fiktive hjemmesider at prøve | OviaSpecs',
    description: demos.intro,
  },
  ...demos.projects.map((p) => ({
    path: p.path,
    page: `demo-${p.id}`,
    demo: p.id,
    title: p.metaTitle,
    description: p.metaDescription,
  })),
  {
    path: paths.om,
    page: 'om',
    title: 'Om OviaSpecs | Ronny Hong, digital handyman',
    description:
      'Jeg hedder Ronny Hong og står bag OviaSpecs. Du har én kontaktperson til hjemmesider, booking, marketing og automatisering.',
  },
  {
    path: paths.kontakt,
    page: 'kontakt',
    title: 'Kontakt OviaSpecs | Fortæl om din opgave',
    description: kontakt.bodyShort,
  },
  {
    path: paths.prisberegner,
    page: 'prisberegner',
    title: 'Beregn din hjemmesidepris | OviaSpecs',
    description:
      'Beregn prisen på en almindelig virksomhedshjemmeside i tre korte trin. Du ser prisen uden at oplyse kontaktoplysninger.',
  },
]

/** Finder siden til en adresse (med eller uden efterstillet skråstreg). */
export function findRoute(pathname) {
  const clean = pathname.replace(/\/+$/, '') || '/'
  return routes.find((r) => r.path.replace(/\/+$/, '') === clean || (r.path === '/' && clean === '/')) ?? null
}
