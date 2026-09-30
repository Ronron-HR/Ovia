import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import Site from './Site.jsx'
import { pageKeyFor } from './pageKeys.js'
import { pageLoaders } from './pageLoaders.js'

/**
 * Gamle ankerlinks til den lange forside (fx oviaspecs.com/#ydelser) føres
 * videre til den nye side, så delte og gemte links stadig virker.
 */
const OLD_ANCHORS = {
  '#ydelser': '/hjemmesider/',
  '#hjemmesider': '/hjemmesider/',
  '#systemer': '/ai-automatisering/',
  '#synlighed': '/seo/',
  '#arbejde': '/demoer/',
  '#om': '/om/',
  '#sporgsmaal': '/kontakt/',
}

const { pathname, hash } = window.location
if (pathname === '/' && OLD_ANCHORS[hash]) {
  window.location.replace(OLD_ANCHORS[hash])
}

// Kun den side, adressen viser, hentes, og den hentes FØR hydreringen, så
// første render er identisk med den forudrenderede HTML.
const load = pageLoaders[pageKeyFor(pathname)]
const Page = load ? await load() : undefined

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <Site path={pathname} Page={Page} />
  </StrictMode>
)

// Siden er forudrenderet ved build (scripts/prerender.mjs), så indholdet
// står i HTML'en, før JavaScript er hentet. Findes det ikke, fx i dev,
// renderes siden i stedet på klienten.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
