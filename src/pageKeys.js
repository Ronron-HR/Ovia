import { demos } from './content.demos.js'

/**
 * Adresse → sidenøgle (samme nøgler som `page` i routes.js og som i pages.jsx og
 * pageLoaders.js; prerender.mjs fejler, hvis de ikke passer sammen). Holdes adskilt
 * fra routes.js, så klienten ikke skal hente alle ydelsesteksterne for at finde ud af,
 * hvilken side der skal vises.
 */
export const pageKeyByPath = {
  '/': 'home',
  '/hjemmeside/': 'hjemmeside',
  '/marketing/': 'marketing',
  '/booking-google/': 'bookingGoogle',
  '/hjemmesider/': 'hjemmesider',
  '/booking-integrationer/': 'booking',
  '/seo/': 'seo',
  '/google-ads/': 'googleAds',
  '/sociale-medier-annoncering/': 'sociale',
  '/ai-automatisering/': 'ai',
  '/demoer/': 'demoer',
  '/om/': 'om',
  '/kontakt/': 'kontakt',
  '/prisberegner/': 'prisberegner',
  ...Object.fromEntries(demos.projects.map((p) => [p.path, `demo-${p.id}`])),
}

/** Sidens kildefil: prerender.mjs finder dens JS-filer i byggets manifest og forhåndshenter dem. */
export const pageFiles = {
  home: 'src/pages/Home.jsx',
  hjemmeside: 'src/pages/Service.jsx',
  marketing: 'src/pages/Service.jsx',
  bookingGoogle: 'src/pages/Service.jsx',
  hjemmesider: 'src/pages/Services.jsx',
  booking: 'src/pages/Services.jsx',
  seo: 'src/pages/Services.jsx',
  googleAds: 'src/pages/Services.jsx',
  sociale: 'src/pages/Services.jsx',
  ai: 'src/pages/Services.jsx',
  demoer: 'src/pages/Demoer.jsx',
  om: 'src/pages/Om.jsx',
  kontakt: 'src/pages/Kontakt.jsx',
  prisberegner: 'src/pages/Prisberegner.jsx',
  'demo-cafe': 'src/demos/Cafe.jsx',
  'demo-restaurant': 'src/demos/Restaurant.jsx',
  'demo-salon': 'src/demos/Salon.jsx',
  'demo-vinbar': 'src/demos/Vinbar.jsx',
}

/** Adressens sidenøgle, med eller uden efterstillet skråstreg. */
export const pageKeyFor = (pathname) => pageKeyByPath[pathname.endsWith('/') ? pathname : pathname + '/'] ?? null
