/**
 * Test af priserne i src/data/pricing.js. Kører med `npm test` og som første
 * led i `npm run build`, så en pris, der bryder reglerne, stopper udgivelsen.
 *
 * Alle kombinationer af valgte ydelser og svar (pakker, sider, egen konto/drift,
 * Booking & Google) gennemløbes. Testen fejler, hvis:
 * - en linje eller totalen er negativ
 * - en hjemmeside uden integrationer (Start/Vækst) overstiger maxWebsiteNoIntegrations
 * - Fuld fart kan vælges med egen konto
 * - en hjemmeside med Booking & Google Vækst/Fuld fart (booking) har egen konto
 * - "aftales" eller "ca." står ved en pris
 * - drift + frikøb kan blive billigere end egen konto fra start
 * - Booking & Google-pakkernes pris ≠ summen af deres komponenter
 * - et beløb ("123 kr.", "1.500 kr./md") står hardkodet uden for pricing.js
 *   (koncepterne i src/demos er undtaget: deres menupriser er fiktivt indhold)
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { calculator, components, maxWebsiteNoIntegrations, services } from '../src/data/pricing.js'
import { ORDER, priceText, quote, totalText } from '../src/calculator.js'

const failures = []
const fail = (msg) => failures.push(msg)

const shown = (q, answers) => !q.showIf || Object.entries(q.showIf).every(([id, v]) => answers[id] === v)

/** Alle svar-kombinationer for én ydelse (et spørgsmål tæller kun med, når det vises). */
function combos(key) {
  let out = [{}]
  for (const q of calculator.questions[key]) {
    out = out.flatMap((a) => (shown(q, a) ? q.options.map((o) => ({ ...a, [q.id]: o.id })) : [a]))
  }
  return out
}

const answerSets = Object.fromEntries(ORDER.map((k) => [k, combos(k)]))
const subsets = ORDER.reduce((acc, k) => [...acc, ...acc.map((s) => [...s, k])], [[]]).filter((s) => s.length)
const ctx = (selected, answers) => JSON.stringify({ selected, answers })

let checked = 0
for (const selected of subsets) {
  const product = selected
    .map((k) => answerSets[k])
    .reduce((acc, list) => acc.flatMap((a) => list.map((b) => ({ ...a, ...b }))), [{}])
  for (const answers of product) {
    const q = quote({ selected, answers })
    checked++
    for (const l of q.lines) {
      if (l.once < 0 || l.monthly < 0) fail(`Negativ linje (${l.service.name}: ${l.once} / ${l.monthly}) ${ctx(selected, answers)}`)
      const text = priceText(l)
      if (/aftales|ca\./i.test(text)) fail(`"${text}" ${ctx(selected, answers)}`)
      if (l.key === 'hjemmeside') {
        if (l.tier.id === 'fuld-fart' && l.noDrift) fail(`Fuld fart med egen konto ${ctx(selected, answers)}`)
        const bgLine = q.lines.find((x) => x.key === 'bookingGoogle')
        if (bgLine && bgLine.tier.includes.includes('booking') && l.noDrift) {
          fail(`Hjemmeside med egen konto + Booking & Google ${bgLine.tier.id} ${ctx(selected, answers)}`)
        }
        const integrations = l.tier.includes.includes('booking')
        if (!integrations && l.once > maxWebsiteNoIntegrations) {
          fail(`Hjemmeside uden integrationer ${l.once} kr. > ${maxWebsiteNoIntegrations} kr. ${ctx(selected, answers)}`)
        }
      }
    }
    if (q.total.once < 0 || q.total.monthly < 0) fail(`Negativ total ${ctx(selected, answers)}`)
    if (/aftales|ca\./i.test(totalText(q.total))) fail(`Total "${totalText(q.total)}" ${ctx(selected, answers)}`)
  }
}

// Teksten under prisen må heller ikke sige "aftales" eller "ca.".
if (/aftales|ca\./i.test(calculator.finalNote)) fail(`finalNote: "${calculator.finalNote}"`)

// Drift + frikøb må aldrig blive billigere end egen konto fra start (for ethvert antal måneder).
const web = services.hjemmeside
for (const tier of web.tiers.filter((t) => web.addons.ownAccount.tiers.includes(t.id))) {
  for (let months = 0; months <= 60; months++) {
    const viaDrift = tier.price + months * tier.monthly + web.drift.buyoutPrice
    const ownFromStart = tier.price + web.addons.ownAccount.price
    if (viaDrift < ownFromStart) fail(`${tier.id}: drift i ${months} md + frikøb (${viaDrift}) < egen konto fra start (${ownFromStart})`)
  }
}

for (const tier of services.bookingGoogle.tiers) {
  const sum = tier.includes.reduce((s, id) => s + components[id].price, 0)
  if (sum !== tier.price) fail(`Booking & Google ${tier.id}: pris ${tier.price} kr. ≠ komponenter ${sum} kr.`)
}

// Ingen hardkodede beløb uden for pricing.js: alle priser skal læses derfra.
const AMOUNT = /\b\d{1,3}(?:\.\d{3})*\s?kr\b/i
const SKIP = ['src/data/pricing.js', 'src/demos']
const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const path = join(dir, e.name).replaceAll('\\', '/')
    if (SKIP.some((x) => path === x || path.startsWith(`${x}/`))) return []
    return e.isDirectory() ? files(path) : /\.(jsx?|mjs|html|css)$/.test(e.name) ? [path] : []
  })
const scanned = [...files('src'), 'index.html', 'privatlivspolitik/index.html', 'public/404.html', 'scripts/og/og.html']
for (const file of scanned) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((text, i) => {
      if (AMOUNT.test(text)) fail(`Hardkodet beløb i ${file}:${i + 1}: ${text.trim().slice(0, 100)}`)
    })
}

if (failures.length) {
  console.error(`Pristest FEJLEDE (${failures.length}):\n- ${failures.slice(0, 20).join('\n- ')}`)
  process.exit(1)
}
console.log(`Pristest bestået: ${checked} kombinationer af ydelser og svar, ${scanned.length} filer uden hardkodede beløb.`)
