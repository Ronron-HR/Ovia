import { ai } from './services.ai.js'
import { googleAds, seo, sociale } from './services.marketing.js'
import { booking, hjemmesider } from './services.web.js'

/** Alle ydelsessider. Nøglen er den samme som `page` i routes.js. */
export const services = { hjemmesider, booking, seo, googleAds, sociale, ai }
