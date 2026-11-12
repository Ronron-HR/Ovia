/**
 * Klientens indlæsning af sider: kun den side, adressen viser, hentes. Forudrenderingen bruger i stedet alle sider
 * (pages.jsx). Nøglerne står i pageKeys.js.
 */
export const pageLoaders = {
  home: () => import('./pages/Home.jsx').then((m) => m.default),
  hjemmeside: () => import('./pages/Hjemmeside.jsx').then((m) => m.default),
  priser: () => import('./pages/Priser.jsx').then((m) => m.default),
  cases: () => import('./pages/Cases.jsx').then((m) => m.default),
  'case-palmy-spisested': () => import('./pages/cases/PalmySpisested.jsx').then((m) => m.default),
}
