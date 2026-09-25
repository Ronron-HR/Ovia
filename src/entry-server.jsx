import { renderToString } from 'react-dom/server'
import App from './App.jsx'
import Privatlivspolitik from './components/Privatlivspolitik.jsx'

/**
 * Bruges kun ved build: scripts/prerender.mjs kalder disse og lægger
 * resultatet ind i dist/*.html. Komponenterne må derfor ikke røre window
 * eller document, mens de renderes — det hører til i useEffect.
 */
export const renderHome = () => renderToString(<App />)
export const renderPrivacy = () => renderToString(<Privatlivspolitik />)
