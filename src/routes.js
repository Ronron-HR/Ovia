import { demos } from './content.demos.js'
import * as pages from './data/services.js'
import { meta, paths } from './data/texts.js'

/**
 * Sidernes adresser og metadata. Bruges af forudrenderingen (én HTML-fil pr.
 * side, med egen titel og beskrivelse) og til sitemap.xml.
 *
 * `page` er sidens nøgle (pageKeys.js, pages.jsx og pageLoaders.js).
 * Privatlivspolitikken er sin egen indgang (se vite.config.js) og er derfor
 * ikke med her. Gamle adresser viderestilles i public/_redirects.
 */
export const routes = [
  { path: paths.home, page: 'home', ...meta.home },
  { path: paths.hjemmeside, page: 'hjemmeside', ...pages.hjemmeside.meta },
  { path: paths.marketing, page: 'marketing', ...pages.marketing.meta },
  { path: paths.bookingGoogle, page: 'bookingGoogle', ...pages.bookingGoogle.meta },
  { path: paths.priser, page: 'priser', ...pages.priser.meta },
  {
    path: paths.demoer,
    page: 'demoer',
    title: 'Koncepter: fire hjemmesider at prøve | OviaSpecs',
    description: demos.intro,
  },
  ...demos.projects.map((p) => ({
    path: p.path,
    page: `demo-${p.id}`,
    title: p.metaTitle,
    description: p.metaDescription,
  })),
]
