import Cafe from './demos/Cafe.jsx'
import Restaurant from './demos/Restaurant.jsx'
import Salon from './demos/Salon.jsx'
import Vinbar from './demos/Vinbar.jsx'
import Demoer from './pages/Demoer.jsx'
import Home from './pages/Home.jsx'
import Kontakt from './pages/Kontakt.jsx'
import Om from './pages/Om.jsx'
import Prisberegner from './pages/Prisberegner.jsx'
import * as services from './pages/Services.jsx'
import * as service from './pages/Service.jsx'

/**
 * SIDERNE, alle samlet. Bruges kun af forudrenderingen (entry-server.jsx).
 * Hver adresse har sin egen side (se routes.js), og klienten henter kun den
 * ene side, den skal bruge (pageLoaders.js). Nøglerne her og dér skal være ens.
 */
export const pages = {
  home: Home,
  hjemmeside: service.hjemmeside,
  hjemmesider: services.hjemmesider,
  booking: services.booking,
  seo: services.seo,
  googleAds: services.googleAds,
  sociale: services.sociale,
  ai: services.ai,
  demoer: Demoer,
  'demo-cafe': Cafe,
  'demo-restaurant': Restaurant,
  'demo-salon': Salon,
  'demo-vinbar': Vinbar,
  om: Om,
  kontakt: Kontakt,
  prisberegner: Prisberegner,
}
