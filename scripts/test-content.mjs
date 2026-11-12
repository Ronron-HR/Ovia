/**
 * Indholdstjek af det BYGGEDE site (kræver `npm run build`): ingen rester af det gamle tilbud, ingen links til
 * udgåede sider, redirects uden kæder, og sitemap uden udgåede adresser. Kør: node scripts/test-content.mjs
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import prices from '../src/data/prices.json' with { type: 'json' }
import { formatKr } from '../src/lib/calculate.js'

if (!existsSync('dist/index.html')) {
  console.error('Kør npm run build først.')
  process.exit(1)
}

let ok = 0
const fails = []
const check = (cond, msg) => (cond ? ok++ : fails.push(msg))

const walk = (dir, test, out = []) => {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) walk(p, test, out)
    else if (test(f)) out.push(p)
  }
  return out
}
const pages = walk('dist', (f) => /\.(html|xml)$/.test(f))
const text = new Map(pages.map((p) => [p, readFileSync(p, 'utf8')]))

// 1. Ord, der ikke må stå nogen steder på siden (HTML, metatekster, JSON-LD, sitemap).
const forbidden = [
  'bureau', 'marketing', 'tiktok', 'meta ads', 'vores team', 'vores udviklere', 'erfaring', 'én person', 'ny virksomhed', 'vi er små',
  'mange års', 'ansatte', 'mest valgt', 'booking-google', '/marketing/', 'vækst', 'fuld fart', 'filmer videoerne', 'bor lige uden for',
  // fagsprog, som en café- eller restaurantejer ikke bruger
  'standardsystem', 'skræddersy', 'arbejdsflow', 'localbusiness', 'tilvalg',
]
const report = []
for (const w of forbidden) {
  const hits = []
  for (const [p, t] of text) if (t.toLowerCase().includes(w)) hits.push(p.replace(/^dist[\\/]/, '').replace(/\\/g, '/'))
  report.push(`${w.padEnd(18)} ${hits.length ? hits.join(', ') : '-'}`)
  check(hits.length === 0, `"${w}" findes i: ${hits.join(', ')}`)
}
// Ingen "fra 5.000 kr."-priser og ingen "pris efter en snak".
for (const [p, t] of text) {
  check(!/\bfra\s+\d[\d.]*\s*(?:&nbsp;| |\s)*kr/i.test(t), `"fra … kr." i ${p}`)
  check(!/efter en snak/i.test(t), `"pris efter en snak" i ${p}`)
}

// 2. Ingen links til udgåede sider (i det byggede og i kilden).
const srcFiles = walk('src', (f) => /\.(jsx?|json)$/.test(f))
for (const f of srcFiles) {
  const t = readFileSync(f, 'utf8')
  check(!/['"`(]\/(marketing|booking-google)\/?['"`#?)]/.test(t), `link til udgået side i ${f}`)
}
for (const [p, t] of text) {
  check(!/href="\/?(marketing|booking-google)/.test(t), `link til udgået side i ${p}`)
}

// 3. Redirects: hvert mål er en endelig adresse (ingen kæder), og alle er 301.
const lines = readFileSync('public/_redirects', 'utf8').split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'))
const sources = new Set(lines.map((l) => l.trim().split(/\s+/)[0]))
const targets = lines.map((l) => l.trim().split(/\s+/))
for (const [from, to, code] of targets) {
  check(code === '301', `${from}: ikke 301`)
  check(!sources.has(to) && !sources.has(to.split('#')[0]) && !sources.has(to.replace(/\/$/, '')), `${from} → ${to}: kæde (målet er selv en omdirigering)`)
  const base = to.split('#')[0]
  const file = base === '/' ? 'dist/index.html' : join('dist', base, 'index.html')
  check(existsSync(file), `${from} → ${to}: målet findes ikke i dist (${file})`)
}
for (const must of ['/marketing/', '/marketing', '/booking-google/', '/booking-google', '/seo/', '/systemer/']) {
  check(sources.has(must), `${must} mangler i _redirects`)
}
for (const [from, to] of targets) {
  if (['/marketing/', '/marketing', '/booking-google/', '/booking-google', '/seo/', '/seo'].includes(from)) check(to === '/hjemmeside/', `${from} skal pege direkte på /hjemmeside/ (peger på ${to})`)
}

// 4. Sitemap: kun eksisterende sider, ingen udgåede.
const sitemap = text.get(join('dist', 'sitemap.xml')) ?? ''
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace('https://oviaspecs.com', ''))
check(locs.includes('/hjemmeside/') && locs.includes('/priser/') && locs.includes('/'), 'sitemap mangler hovedsiderne')
for (const l of locs) {
  check(!/marketing|booking-google/.test(l), `sitemap indeholder ${l}`)
  check(existsSync(l === '/' ? 'dist/index.html' : join('dist', l, 'index.html')), `sitemap peger på en side, der ikke findes: ${l}`)
}

// 5. Metatekster: ingen dobbelt punktum, længde, og forsiden/hjemmeside/priser har hver sin titel.
const titles = new Set()
for (const [p, t] of text) {
  if (!p.endsWith('index.html') || p.includes('privatlivspolitik')) continue
  const title = /<title>([^<]*)<\/title>/.exec(t)?.[1] ?? ''
  const desc = /<meta name="description" content="([^"]*)"/.exec(t)?.[1] ?? ''
  check(title && !titles.has(title), `titel mangler eller er ens: ${p}`)
  titles.add(title)
  check(desc.length >= 100 && desc.length <= 175, `beskrivelsens længde ${desc.length} i ${p}`)
  check(!/\.\./.test(desc.replace(/\.\.\./g, '')), `dobbelt punktum i beskrivelsen: ${p}`)
}

// 6. Hjemmesiden, at løse et problem alene og engelsk: priserne kommer fra prices.json, og der er intet tilvalg "Engelsk version".
const flat = (p) => (text.get(join('dist', p, 'index.html')) ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/\s+/g, ' ')
const kr = (o, m) => `${formatKr(o)} + ${formatKr(m, true)}`.replace(/ /g, ' ')
for (const page of ['priser', 'hjemmeside']) {
  const t = flat(page)
  check(t.includes(prices.website.title), `/${page}/ mangler "${prices.website.title}"`)
  for (const part of prices.website.parts) check(t.toLowerCase().includes(part.toLowerCase()), `/${page}/ mangler "${part}"`)
  check(t.includes(prices.systemOnly.note), `/${page}/ mangler "${prices.systemOnly.note}"`)
  for (const f of prices.systems.standard) check(t.includes(kr(f.once, f.monthly)), `/${page}/ mangler prisen på ${f.name}`)
  check(t.includes(prices.systems.custom.price), `/${page}/ mangler "${prices.systems.custom.price}" ved bygget specielt`)
}
for (const [p, t] of text) check(!/engelsk version|english version/i.test(t), `tilvalget "Engelsk version" findes i ${p}`)
check(!JSON.stringify(prices).toLowerCase().includes('"english"'), 'prices.json har stadig et english-felt')

console.log(report.join('\n'))
if (fails.length) {
  console.error(`\nIndholdstjek FEJLEDE (${fails.length}):\n- ${fails.join('\n- ')}`)
  process.exit(1)
}
console.log(`\nIndholdstjek: ${ok} kontroller, 0 fejl (${pages.length} sider, ${locs.length} adresser i sitemap, ${targets.length} omdirigeringer)`)
