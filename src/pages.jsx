import Cases from './pages/Cases.jsx'
import PalmySpisested from './pages/cases/PalmySpisested.jsx'
import Hjemmeside from './pages/Hjemmeside.jsx'
import Home from './pages/Home.jsx'
import Priser from './pages/Priser.jsx'

/**
 * SIDERNE, alle samlet. Bruges kun af forudrenderingen (entry-server.jsx).
 * Klienten henter kun den ene side, den skal bruge (pageLoaders.js).
 * Nøglerne her og dér skal være ens.
 */
export const pages = {
  home: Home,
  hjemmeside: Hjemmeside,
  priser: Priser,
  cases: Cases,
  'case-palmy-spisested': PalmySpisested,
}
