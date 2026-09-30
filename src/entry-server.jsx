import { renderToString } from 'react-dom/server'
import Privatlivspolitik from './components/Privatlivspolitik.jsx'
import Site from './Site.jsx'
import { routes } from './routes.js'

/**
 * Bruges kun ved build: scripts/prerender.mjs kalder disse og lægger
 * resultatet ind i dist/. Komponenterne må derfor ikke røre window eller
 * document, mens de renderes — det hører til i useEffect.
 */
export { routes }
export const renderPage = (path) => renderToString(<Site path={path} />)
export const renderPrivacy = () => renderToString(<Privatlivspolitik />)
