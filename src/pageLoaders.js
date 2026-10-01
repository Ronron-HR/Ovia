/**
 * Klientens indlæsning af sider: kun den side, adressen viser, hentes (ét modul,
 * som deles med de sider der bruger de samme komponenter). Forudrenderingen
 * bruger i stedet alle sider (pages.jsx). Nøglerne står i pageKeys.js.
 */
const services = () => import('./pages/Services.jsx')
const service = () => import('./pages/Service.jsx')

export const pageLoaders = {
  home: () => import('./pages/Home.jsx').then((m) => m.default),
  hjemmeside: () => service().then((m) => m.hjemmeside),
  hjemmesider: () => services().then((m) => m.hjemmesider),
  booking: () => services().then((m) => m.booking),
  seo: () => services().then((m) => m.seo),
  googleAds: () => services().then((m) => m.googleAds),
  sociale: () => services().then((m) => m.sociale),
  ai: () => services().then((m) => m.ai),
  demoer: () => import('./pages/Demoer.jsx').then((m) => m.default),
  om: () => import('./pages/Om.jsx').then((m) => m.default),
  kontakt: () => import('./pages/Kontakt.jsx').then((m) => m.default),
  prisberegner: () => import('./pages/Prisberegner.jsx').then((m) => m.default),
  'demo-cafe': () => import('./demos/Cafe.jsx').then((m) => m.default),
  'demo-restaurant': () => import('./demos/Restaurant.jsx').then((m) => m.default),
  'demo-salon': () => import('./demos/Salon.jsx').then((m) => m.default),
  'demo-vinbar': () => import('./demos/Vinbar.jsx').then((m) => m.default),
}
