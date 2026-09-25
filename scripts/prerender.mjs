/**
 * Forudrendering: lægger den færdige HTML ind i dist/, så indholdet står i
 * dokumentet, før JavaScript er hentet — til søgemaskiner, deling, læsere
 * uden script og et hurtigere første billede. Klienten hydrerer bagefter.
 *
 * Kører som sidste led i `npm run build`:
 *   vite build                                     -> dist/
 *   vite build --ssr src/entry-server.jsx          -> dist-ssr/
 *   node scripts/prerender.mjs                     -> skriver ind i dist/*.html
 *
 * Fejler forudrenderingen, fejler bygget. Så står der aldrig en tom side.
 */
import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const { renderHome, renderPrivacy } = await import(
  pathToFileURL('dist-ssr/entry-server.js').href
)

const MARK = '<div id="root"></div>'

function inject(file, html) {
  const source = readFileSync(file, 'utf8')
  if (!source.includes(MARK)) throw new Error(`${file}: fandt ikke ${MARK}`)
  writeFileSync(file, source.replace(MARK, `<div id="root">${html}</div>`))
  console.log(`  ${file}  ${(html.length / 1024).toFixed(1)} kB HTML`)
}

/**
 * Forsiden får sit stylesheet indlejret: så venter første maling ikke på en
 * ekstra forespørgsel (én rundtur mindre, hvor det gør mest ondt: på mobil).
 * Stien til skrifterne i CSS'en er absolut, så den virker uændret. Privatlivs-
 * siden beholder linket og genbruger filen fra browserens cache.
 */
function inlineCss(file) {
  const html = readFileSync(file, 'utf8')
  const match = html.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/)
  if (!match) throw new Error(`${file}: fandt intet stylesheet at indlejre`)
  const css = readFileSync(`dist${match[1]}`, 'utf8')
  writeFileSync(file, html.replace(match[0], () => `<style>${css}</style>`))
  console.log(`  ${file}  stylesheet indlejret (${(css.length / 1024).toFixed(1)} kB)`)
}

inject('dist/index.html', renderHome())
inlineCss('dist/index.html')
inject('dist/privatlivspolitik/index.html', renderPrivacy())

rmSync('dist-ssr', { recursive: true, force: true })
