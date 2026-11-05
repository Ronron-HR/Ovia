/**
 * Klientens indlæsning af sider: kun den side, adressen viser, hentes (ét modul,
 * som deles af ydelsessiderne). Forudrenderingen bruger i stedet alle sider
 * (pages.jsx). Nøglerne står i pageKeys.js.
 */
const service = () => import('./pages/Service.jsx')

export const pageLoaders = {
  home: () => import('./pages/Home.jsx').then((m) => m.default),
  hjemmeside: () => service().then((m) => m.hjemmeside),
  marketing: () => service().then((m) => m.marketing),
  bookingGoogle: () => service().then((m) => m.bookingGoogle),
  priser: () => import('./pages/Priser.jsx').then((m) => m.default),
  demoer: () => import('./pages/Demoer.jsx').then((m) => m.default),
  'demo-cafe': () => import('./demos/Cafe.jsx').then((m) => m.default),
  'demo-restaurant': () => import('./demos/Restaurant.jsx').then((m) => m.default),
  'demo-salon': () => import('./demos/Salon.jsx').then((m) => m.default),
  'demo-vinbar': () => import('./demos/Vinbar.jsx').then((m) => m.default),
}
