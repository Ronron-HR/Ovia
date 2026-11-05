import { demos } from './content.demos.js'
import { demoSeo, seo } from './data/seo.js'
import { paths } from './data/site.js'

/**
 * Sidernes adresser og metadata. Bruges af forudrenderingen (én HTML-fil pr.
 * side, med egen titel og beskrivelse) og til sitemap.xml.
 *
 * Titler, beskrivelser og `updated` (sidst ændret, til sitemap) står i
 * src/data/seo.js; demoernes titler og beskrivelser i content.demos.js.
 *
 * `page` er sidens nøgle (pageKeys.js, pages.jsx og pageLoaders.js).
 * Privatlivspolitikken er sin egen indgang (se vite.config.js) og er derfor
 * ikke med her (dens sitemap-post er `privacySeo` i seo.js). Gamle adresser
 * viderestilles i public/_redirects.
 */
export const routes = [
  { path: paths.home, page: 'home', ...seo.home },
  { path: paths.hjemmeside, page: 'hjemmeside', ...seo.hjemmeside },
  { path: paths.bookingGoogle, page: 'bookingGoogle', ...seo.bookingGoogle },
  { path: paths.marketing, page: 'marketing', ...seo.marketing },
  { path: paths.priser, page: 'priser', ...seo.priser },
  { path: paths.demoer, page: 'demoer', ...seo.demoer },
  ...demos.projects.map((p) => ({ path: p.path, page: `demo-${p.id}`, ...demoSeo[`demo-${p.id}`] })),
]
