import { seo } from './data/seo.js'
import { paths } from './data/site.js'

/**
 * Sidernes adresser og metadata. Bruges af forudrenderingen (én HTML-fil pr.
 * side, med egen titel og beskrivelse) og til sitemap.xml.
 *
 * Titler, beskrivelser, `updated` (sidst ændret, til sitemap) og
 * strukturerede data (`ld`) står i src/data/seo.js.
 *
 * `page` er sidens nøgle (pageKeys.js, pages.jsx og pageLoaders.js).
 * Privatlivspolitikken er sin egen indgang (se vite.config.js) og er derfor
 * ikke med her (dens sitemap-post er `privacySeo` i seo.js). Gamle adresser
 * viderestilles i public/_redirects.
 */
export const routes = [
  { path: paths.home, page: 'home', ...seo.home },
  { path: paths.hjemmeside, page: 'hjemmeside', ...seo.hjemmeside },
  { path: paths.priser, page: 'priser', ...seo.priser },
  { path: paths.cases, page: 'cases', ...seo.cases },
  { path: paths.casePalmy, page: 'case-palmy-spisested', ...seo.casePalmy },
]
