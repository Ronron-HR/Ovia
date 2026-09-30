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
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { pathToFileURL } from 'node:url'

const { routes, renderPage, renderPrivacy } = await import(
  pathToFileURL('dist-ssr/entry-server.js').href
)

const ORIGIN = 'https://oviaspecs.com'
const MARK = '<div id="root"></div>'
const template = readFileSync('dist/index.html', 'utf8')
if (!template.includes(MARK)) throw new Error(`dist/index.html: fandt ikke ${MARK}`)

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

function build(route) {
  const url = ORIGIN + route.path
  let html = template.replace(linkMatch[0], () => `<style>${css}</style>`)

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(route.title)}</title>`)
  html = setMeta(html, 'name', 'description', route.description)
  html = setMeta(html, 'property', 'og:title', route.title)
  html = setMeta(html, 'property', 'og:description', route.description)
  html = setMeta(html, 'property', 'og:url', url)
  html = setMeta(html, 'name', 'twitter:title', route.title)
  html = setMeta(html, 'name', 'twitter:description', route.description)
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, (_, a, b) => `${a}${url}${b}`)

  // Organisationens strukturerede data hører til forsiden.
  if (route.path !== '/') {
    html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, '')
  }

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

// Sitemap ud fra samme liste.
const today = new Date().toISOString().slice(0, 10)
const urls = [...routes.map((r) => r.path), '/privatlivspolitik/']
writeFileSync(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((p) => `  <url>\n    <loc>${ORIGIN}${p}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
    .join('\n')}\n</urlset>\n`,
)
console.log(`  dist/sitemap.xml  ${urls.length} adresser`)

rmSync('dist-ssr', { recursive: true, force: true })
