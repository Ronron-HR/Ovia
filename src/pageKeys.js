/**
 * Adresse → sidenøgle (samme nøgler som `page` i routes.js og som i pages.jsx og
 * pageLoaders.js; prerender.mjs fejler, hvis de ikke passer sammen). Holdes adskilt
 * fra routes.js, så klienten ikke skal hente alle tekster for at finde ud af,
 * hvilken side der skal vises.
 */
export const pageKeyByPath = {
  '/': 'home',
  '/hjemmeside/': 'hjemmeside',
  '/priser/': 'priser',
  '/cases/': 'cases',
  '/cases/palmy-spisested/': 'case-palmy-spisested',
}

/** Sidens kildefil: prerender.mjs finder dens JS-filer i byggets manifest og forhåndshenter dem. */
export const pageFiles = {
  home: 'src/pages/Home.jsx',
  hjemmeside: 'src/pages/Hjemmeside.jsx',
  priser: 'src/pages/Priser.jsx',
  cases: 'src/pages/Cases.jsx',
  'case-palmy-spisested': 'src/pages/cases/PalmySpisested.jsx',
}

/** Adressens sidenøgle, med eller uden efterstillet skråstreg. */
export const pageKeyFor = (pathname) => pageKeyByPath[pathname.endsWith('/') ? pathname : pathname + '/'] ?? null
