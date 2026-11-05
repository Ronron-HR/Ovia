/**
 * Klientens indlæsning af sider: kun den side, adressen viser, hentes. Forudrenderingen bruger i stedet alle sider
 * (pages.jsx). Nøglerne står i pageKeys.js.
 */
export const pageLoaders = {
  home: () => import('./pages/Home.jsx').then((m) => m.default),
  hjemmeside: () => import('./pages/Hjemmeside.jsx').then((m) => m.default),
  priser: () => import('./pages/Priser.jsx').then((m) => m.default),
  demoer: () => import('./pages/Demoer.jsx').then((m) => m.default),
  'demo-cafe': () => import('./demos/Cafe.jsx').then((m) => m.default),
  'demo-restaurant': () => import('./demos/Restaurant.jsx').then((m) => m.default),
  'demo-salon': () => import('./demos/Salon.jsx').then((m) => m.default),
  'demo-vinbar': () => import('./demos/Vinbar.jsx').then((m) => m.default),
}
