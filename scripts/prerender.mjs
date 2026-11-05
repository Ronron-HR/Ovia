/**
 * Forudrendering: lægger den færdige HTML ind i dist/, så indholdet står i
 * dokumentet, før JavaScript er hentet — til søgemaskiner, deling, læsere
 * uden script og et hurtigere første billede. Klienten hydrerer bagefter.
 *
 * Hver side har sin egen adresse og sin egen fil (dist/<adresse>/index.html)
 * med egen titel, beskrivelse og canonical-adresse, så en direkte åbning eller
 * genindlæsning af fx /prisberegner/ virker uden omskrivninger på serveren.
 * Sitemap.xml skrives ud fra samme liste (src/routes.js).
 *
 * Kører som sidste led i `npm run build`:
 *   vite build                                     -> dist/
 *   vite build --ssr src/entry-server.jsx          -> dist-ssr/
 *   node scripts/prerender.mjs                     -> skriver ind i dist/
 *
 * Fejler forudrenderingen, fejler bygget. Så står der aldrig en tom side.
 */
import { createHash } from 'node:crypto'
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { pathToFileURL } from 'node:url'

const { routes, renderPage, renderPrivacy, pageFiles, pageKeyFor, organisationLd, privacySeo } = await import(
  pathToFileURL('dist-ssr/entry-server.js').href
)

const ORIGIN = 'https://oviaspecs.com'
const MARK = '<div id="root"></div>'
const template = readFileSync('dist/index.html', 'utf8')
if (!template.includes(MARK)) throw new Error(`dist/index.html: fandt ikke ${MARK}`)

// Skabelonens grundlag for SEO: sprog, viewport og de felter, der skiftes pr. side.
for (const needle of ['<html lang="da">', '<meta name="viewport" content="width=device-width, initial-scale=1.0" />', '<link rel="canonical" href="']) {
  if (!template.includes(needle)) throw new Error(`dist/index.html: mangler ${needle}`)
}

// Titler og beskrivelser: unikke pr. side og inden for rimelig længde (brief afsnit J).
// Hård grænse fejler bygget; blød grænse (titel > 60, beskrivelse uden for 110-165) advarer.
const unique = { title: new Map(), description: new Map() }
for (const r of routes) {
  for (const field of ['title', 'description']) {
    const v = r[field]
    if (typeof v !== 'string' || !v.trim()) throw new Error(`${r.path}: ${field} mangler (src/data/seo.js)`)
    if (unique[field].has(v)) throw new Error(`${r.path} og ${unique[field].get(v)} har samme ${field}`)
    unique[field].set(v, r.path)
  }
  if (r.title.length > 70) throw new Error(`${r.path}: titlen er ${r.title.length} tegn (højst 70)`)
  if (r.description.length > 180) throw new Error(`${r.path}: beskrivelsen er ${r.description.length} tegn (højst 180)`)
  if (r.title.length > 60) console.warn(`  advarsel: ${r.path} titel er ${r.title.length} tegn (ca. 60 anbefales)`)
  if (r.description.length < 110 || r.description.length > 165) {
    console.warn(`  advarsel: ${r.path} beskrivelse er ${r.description.length} tegn (ca. 120-158 anbefales)`)
  }
}

// Sidenøglerne i routes.js, pages.jsx og pageKeys.js/pageLoaders.js skal passe sammen.
for (const route of routes) {
  if (pageKeyFor(route.path) !== route.page || !pageFiles[route.page]) {
    throw new Error(`routes.js og pageKeys.js er uenige om ${route.path} (${route.page} / ${pageKeyFor(route.path)})`)
  }
}

// Byggets manifest: hvilke JS-filer hører til hvilken side. Siden hentes af main.js
// (dynamisk import), så uden et hint bliver hentningen en vandfald efter main.js.
const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8'))
function chunksFor(file) {
  const seen = new Set()
  const walk = (key) => {
    const c = manifest[key]
    if (!c || seen.has(c.file)) return
    seen.add(c.file)
    for (const i of c.imports ?? []) walk(i)
  }
  walk(file)
  return [...seen]
}
const entryChunks = new Set(chunksFor('index.html'))

/** CSS-filer hørende til en kildefil og dens importer (Vite lægger dem på chunken, fx demoernes stilark). */
function cssFor(file) {
  const seen = new Set()
  const out = new Set()
  const walk = (key) => {
    const c = manifest[key]
    if (!c || seen.has(key)) return
    seen.add(key)
    for (const f of c.css ?? []) out.add(f)
    for (const i of c.imports ?? []) walk(i)
  }
  walk(file)
  return [...out]
}
const entryCss = new Set(cssFor('index.html'))

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

/** Skifter content-værdien i en <meta>, og fejler højt, hvis meta'en ikke findes. */
function setMeta(html, attr, name, value) {
  const re = new RegExp(`(<meta\\s+${attr}="${name}"\\s+content=")[^"]*(")`)
  if (!re.test(html)) throw new Error(`fandt ikke meta ${attr}="${name}" i indeks-skabelonen`)
  return html.replace(re, (_, a, b) => `${a}${esc(value)}${b}`)
}

/**
 * Forsidens stylesheet indlejres: så venter første maling ikke på en ekstra
 * forespørgsel (én rundtur mindre, hvor det gør mest ondt: på mobil). Stien til
 * skrifterne i CSS'en er absolut, så den virker uændret på alle adresser.
 */
const linkMatch = template.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/)
if (!linkMatch) throw new Error('dist/index.html: fandt intet stylesheet at indlejre')
const css = readFileSync(`dist${linkMatch[1]}`, 'utf8')

/**
 * Overskriftsfonten (Archivo) og brødtekstens (Geist) forhåndshentes, så de ikke venter på stilarket
 * (som er indlejret, men peger på dem). Geist Mono (priser og tal) forhåndshentes også: den er kun 14 kB, og uden hint opdager browseren den først, når stilarket er bygget (målt: simuleret LCP 1,9 s mod 0,9 s).
 */
const fontPreloads = [...css.matchAll(/url\(["']?(\/assets\/(?:archivo|geist|geist-mono)-latin-[^)"']+\.woff2)/g)]
  .map((m) => `<link rel="preload" as="font" type="font/woff2" crossorigin href="${m[1]}">`)
  .join('')
if (!fontPreloads.includes('archivo-latin')) throw new Error('fandt ikke Archivo i det indlejrede stilark (preload)')

function build(route) {
  const url = ORIGIN + route.path
  // Sidens egne stilark (ud over forsidens) lægges også ind, så fx demoerne ikke blinker uden stil.
  const extraCss = cssFor(pageFiles[route.page])
    .filter((f) => !entryCss.has(f))
    .map((f) => readFileSync(`dist/${f}`, 'utf8'))
    .join('')
  let html = template.replace(linkMatch[0], () => `${fontPreloads}<style>${css}${extraCss}</style>`)

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(route.title)}</title>`)
  html = setMeta(html, 'name', 'description', route.description)
  html = setMeta(html, 'property', 'og:title', route.title)
  html = setMeta(html, 'property', 'og:description', route.description)
  html = setMeta(html, 'property', 'og:url', url)
  html = setMeta(html, 'name', 'twitter:title', route.title)
  html = setMeta(html, 'name', 'twitter:description', route.description)
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => `${a}${url}${b}`)
  if (!html.includes(`<link rel="canonical" href="${url}"`)) throw new Error(`${route.path}: canonical blev ikke sat`)

  // Organisationens strukturerede data (bygget fra pricing.js) hører til forsiden.
  const ld = /<script type="application\/ld\+json">[\s\S]*?<\/script>/
  if (!ld.test(html)) throw new Error('dist/index.html: fandt ikke JSON-LD-pladsholderen')
  html = html.replace(
    ld,
    route.path === '/'
      ? () => `<script type="application/ld+json">${JSON.stringify(organisationLd()).replace(/</g, '\\u003c')}</script>`
      : '',
  )

  // Sidens egne JS-filer (ud over dem, forsiden allerede henter) forhåndshentes.
  const hints = chunksFor(pageFiles[route.page])
    .filter((f) => !entryChunks.has(f))
    .map((f) => `<link rel="modulepreload" crossorigin href="/${f}">`)
    .join('')
  if (hints) html = html.replace('</head>', () => `${hints}</head>`)

  return html.replace(MARK, () => `<div id="root">${renderPage(route.path)}</div>`)
}

function write(path, html) {
  const file = path === '/' ? 'dist/index.html' : `dist${path}index.html`
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, html)
  console.log(`  ${file}  ${(html.length / 1024).toFixed(1)} kB`)
}

for (const route of routes) write(route.path, build(route))

// Privatlivspolitikken er sin egen indgang og har sin egen skabelon.
const privacyFile = 'dist/privatlivspolitik/index.html'
const privacy = readFileSync(privacyFile, 'utf8')
if (!privacy.includes(MARK)) throw new Error(`${privacyFile}: fandt ikke ${MARK}`)
writeFileSync(privacyFile, privacy.replace(MARK, () => `<div id="root">${renderPrivacy()}</div>`))
console.log(`  ${privacyFile}`)

// Sitemap ud fra samme liste (src/routes.js) plus privatlivspolitikken. <lastmod> er
// sidens `updated` i src/data/seo.js (ikke byggedatoen: en dato, der skifter ved
// hvert build, lærer søgemaskiner at ignorere feltet). Mangler den, udelades feltet.
const entries = [...routes, privacySeo]
for (const e of entries) {
  if (e.updated && !/^\d{4}-\d{2}-\d{2}$/.test(e.updated)) throw new Error(`${e.path}: updated skal være ÅÅÅÅ-MM-DD`)
}
const urlEntry = (e) =>
  ['  <url>', `    <loc>${ORIGIN}${e.path}</loc>`, ...(e.updated ? [`    <lastmod>${e.updated}</lastmod>`] : []), '  </url>'].join('\n')
const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries.map(urlEntry),
  '</urlset>',
  '',
].join('\n')
writeFileSync('dist/sitemap.xml', sitemap)
console.log(`  dist/sitemap.xml  ${entries.length} adresser`)

// Sikkerhedsheaders: indlejrede scripts tillades med hash (public/_headers).
const htmlFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? htmlFiles(`${dir}/${e.name}`) : e.name.endsWith('.html') ? [`${dir}/${e.name}`] : [],
  )
const hashes = new Set()
for (const file of htmlFiles('dist')) {
  const html = readFileSync(file, 'utf8')
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)) {
    hashes.add(`'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`)
  }
}
const headers = readFileSync('dist/_headers', 'utf8')
if (!headers.includes('__SCRIPT_HASHES__')) throw new Error('dist/_headers: __SCRIPT_HASHES__ mangler')
writeFileSync('dist/_headers', headers.replaceAll('__SCRIPT_HASHES__', [...hashes].join(' ')))
console.log(`  dist/_headers  CSP med ${hashes.size} script-hash`)

rmSync('dist-ssr', { recursive: true, force: true })
rmSync('dist/.vite', { recursive: true, force: true })
