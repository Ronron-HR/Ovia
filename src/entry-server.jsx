import { renderToString } from 'react-dom/server'
import Privatlivspolitik from './components/Privatlivspolitik.jsx'
import Site from './Site.jsx'
import { pages } from './pages.jsx'
import { pageFiles, pageKeyFor } from './pageKeys.js'
import { routes } from './routes.js'

/**
 * Bruges kun ved build: scripts/prerender.mjs kalder disse og lægger
 * resultatet ind i dist/. Komponenterne må derfor ikke røre window eller
 * document, mens de renderes — det hører til i useEffect.
 */
export { routes }
export { pageFiles, pageKeyFor }
export const renderPage = (path) => {
  const Page = pages[pageKeyFor(path)]
  return renderToString(<Site path={path} Page={Page} />)
}
export const renderPrivacy = () => renderToString(<Privatlivspolitik />)
