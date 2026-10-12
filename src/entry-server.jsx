import { renderToString } from 'react-dom/server'
import Privatlivspolitik from './components/Privatlivspolitik.jsx'
import Site from './Site.jsx'
import { pages } from './pages.jsx'
import { pageFiles, pageKeyFor } from './pageKeys.js'
import { routes } from './routes.js'
import { organisationLd, privacySeo } from './data/seo.js'

/**
 * Bruges kun ved build: scripts/prerender.mjs kalder disse og lægger
 * resultatet ind i dist/. Komponenterne må derfor ikke røre window eller
 * document, mens de renderes — det hører til i useEffect.
 *
 * Forsidens strukturerede data (JSON-LD) bygges i src/data/seo.js ud fra
 * pricing.js, så priserne kun står ét sted. Se begrundelsen dér for, hvad der
 * er med (og hvad der bevidst ikke er).
 */
export { routes }
export { organisationLd, privacySeo }
export { pageFiles, pageKeyFor }
export const renderPage = (path) => {
  const Page = pages[pageKeyFor(path)]
  return renderToString(<Site path={path} Page={Page} />)
}
export const renderPrivacy = () => renderToString(<Privatlivspolitik />)
