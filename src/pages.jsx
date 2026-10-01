import Cafe from './demos/Cafe.jsx'
import Restaurant from './demos/Restaurant.jsx'
import Salon from './demos/Salon.jsx'
import Vinbar from './demos/Vinbar.jsx'
import Demoer from './pages/Demoer.jsx'
import Home from './pages/Home.jsx'
import Priser from './pages/Priser.jsx'
import * as service from './pages/Service.jsx'

/**
 * SIDERNE, alle samlet. Bruges kun af forudrenderingen (entry-server.jsx).
 * Klienten henter kun den ene side, den skal bruge (pageLoaders.js).
 * Nøglerne her og dér skal være ens.
 */
export const pages = {
  home: Home,
  hjemmeside: service.hjemmeside,
  marketing: service.marketing,
  bookingGoogle: service.bookingGoogle,
  priser: Priser,
  demoer: Demoer,
  'demo-cafe': Cafe,
  'demo-restaurant': Restaurant,
  'demo-salon': Salon,
  'demo-vinbar': Vinbar,
}
