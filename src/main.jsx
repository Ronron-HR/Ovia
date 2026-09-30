import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import Site from './Site.jsx'

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

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <Site path={pathname} />
  </StrictMode>
)

// Siden er forudrenderet ved build (scripts/prerender.mjs), så indholdet
// står i HTML'en, før JavaScript er hentet. Findes det ikke, fx i dev,
// renderes siden i stedet på klienten.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
