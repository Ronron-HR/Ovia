/**
 * Test af priserne i src/data/pricing.js. Kører med `npm test` og som første
 * led i `npm run build`, så en pris, der bryder reglerne, stopper udgivelsen.
 *
 * 1. Fast pris: alle kombinationer giver én pris (intet interval, ingen "ca.")
 *    for hver ydelse og i totalen. Alle ydelsers buffer er 0.
 * 2. Ingen hjemmesidepakke + buffer må gå over maxWebsitePackage (6.000 kr.).
 *    Tilvalg som egen konto tæller ikke med i loftet (de vises i resultatet,
 *    så kunden ser det, der reelt betales). Alle kombinationer af svar på
 *    hjemmesidespørgsmålene prøves, alene og med alle Booking & Google-pakker.
 * 3. Booking & Google-pakkernes pris = summen af deres komponenter.
 * 4. Booking & Google-prisen bliver aldrig negativ efter overlap.
 */
import { calculator, components, maxWebsitePackage, services } from '../src/data/pricing.js'
import { priceText, quote } from '../src/calculator.js'

const failures = []
const fail = (msg) => failures.push(msg)

/** Alle kombinationer af svar på en ydelses spørgsmål. */
function combos(questions) {
  return questions.reduce(
    (acc, q) => acc.flatMap((a) => q.options.map((o) => ({ ...a, [q.id]: o.id }))),
    [{}],
  )
}

const webAnswers = combos(calculator.questions.hjemmeside)
const bgAnswers = combos(calculator.questions.bookingGoogle)
let checked = 0

for (const web of webAnswers) {
  for (const bg of [null, ...bgAnswers]) {
    const selected = bg ? ['hjemmeside', 'bookingGoogle'] : ['hjemmeside']
    const q = quote({ selected, answers: { ...web, ...bg } })
    const line = q.lines.find((l) => l.key === 'hjemmeside')
    checked++
    for (const l of [...q.lines, q.total]) {
      if (l.low !== l.high) fail(`Interval i stedet for fast pris: ${l.low}–${l.high} kr. (${JSON.stringify({ web, bg })})`)
      if (priceText(l).includes('ca.')) fail(`"ca." i en fast pris: "${priceText(l)}" (${JSON.stringify({ web, bg })})`)
    }
    if (line.custom) continue
    if (line.packageHigh > maxWebsitePackage) {
      fail(`Hjemmesidepakke + buffer ${line.packageHigh} kr. er over ${maxWebsitePackage} kr. (${JSON.stringify(web)})`)
    }
    const bgLine = q.lines.find((l) => l.key === 'bookingGoogle')
    if (bgLine && (bgLine.low < 0 || bgLine.high < 0)) fail(`Negativ Booking & Google-pris (${JSON.stringify({ web, bg })})`)
  }
}

// Pakkepris + buffer må heller ikke i sig selv gå over grænsen, og ingen ydelse må have buffer.
for (const tier of services.hjemmeside.tiers) {
  const high = tier.price + services.hjemmeside.buffer
  if (high > maxWebsitePackage) fail(`Hjemmeside ${tier.id}: ${tier.price} + buffer = ${high} kr. er over ${maxWebsitePackage} kr.`)
}
for (const service of Object.values(services)) {
  if (service.buffer !== 0) fail(`${service.name}: buffer er ${service.buffer} kr. (skal være 0 for fast pris)`)
}

for (const tier of services.bookingGoogle.tiers) {
  const sum = tier.includes.reduce((s, id) => s + components[id].price, 0)
  if (sum !== tier.price) fail(`Booking & Google ${tier.id}: pris ${tier.price} kr. ≠ komponenter ${sum} kr.`)
}

if (failures.length) {
  console.error(`Pristest FEJLEDE (${failures.length}):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log(`Pristest bestået: ${checked} kombinationer med fast pris, ingen hjemmesidepakke over ${maxWebsitePackage} kr.`)
