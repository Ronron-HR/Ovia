import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import Site from './Site.jsx'
import { pageKeyFor } from './pageKeys.js'
import { pageLoaders } from './pageLoaders.js'

const { pathname } = window.location

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
