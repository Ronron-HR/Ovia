/**
 * Test af priserne i src/data/pricing.js. Kører med `npm test` og som første
 * led i `npm run build`, så en pris, der bryder reglerne, stopper udgivelsen.
 *
 * De forventede priser er regnet ud for hånd her i testen (ikke hentet fra koden):
 * hjemmesidepakker 2.500 / 4.000 / 5.000 kr. engangs, driftsplaner Basis 99 /
 * Plus 199 / Ekstra 399 kr. pr. måned (0 / 15 / 30 min. indholdsarbejde), egen konto
 * +1.000 kr. engangs (ingen månedspris), booking på siden +500 kr., ekstra sider i
 * Fuld fart 400 kr. pr. side over 8.
 *
 * Alle kombinationer af valgte ydelser og svar (pakker, sider, drift, Booking & Google)
 * gennemløbes. Testen fejler, hvis:
 * - en linje eller totalen er negativ, eller delene (line.parts) ikke giver linjens pris
 * - en hjemmeside på Start eller Vækst uden integrationer overstiger maxWebsiteNoIntegrations
 * - samme slutresultat (pakke, sider, drift og dele) har to forskellige priser
 * - "aftales" eller "ca." står ved en pris
 * - drift + frikøb kan blive billigere end egen konto fra start
 * - Booking & Google-pakkernes pris ≠ summen af deres komponenter
 * - et beløb ("123 kr.", "1.500 kr./md") står hardkodet uden for pricing.js
 * - de 9 kombinationer pakke × plan (+ egen konto) ikke giver de håndregnede beløb, eller
 *   booking, ekstra sider, Booking & Google-overlap eller marketing giver dobbeltregning
 * - gamle links (drift=drift) ikke migreres til planen med samme månedspris, eller drift
 *   får en standardværdi
 * - et pakkeskift i resultatet giver noget andet end at svare direkte med pakkens svar,
 *   eller ændrer driftsvalget
 * - gamle driftløfter (2 hverdage, 2 små ændringer) eller "mest populær" står et sted
 *   (koncepterne i src/demos er undtaget: deres menupriser er fiktivt indhold)
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { calculator, components, driftPlans, maxWebsiteNoIntegrations, services } from '../src/data/pricing.js'
import { ORDER, parse, priceText, quote, resultStep, serialize, summaryLines, switchTier, totalText } from '../src/calculator.js'
const NONE = []

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

/* ---- Håndregnede forventninger (uafhængige af koden) --------------------- */
const PACKAGE = { '1': ['start', 2500], '2-5': ['vaekst', 4000], '6-8': ['fuld-fart', 5000] }
const PLAN = { basis: 99, plus: 199, ekstra: 399 }
const OWN_ACCOUNT = 1000
const BOOKING = 500
const EXTRA_PAGE = 400

let checked = 0
const outcomes = new Map()
for (const selected of subsets) {
  const product = selected
    .map((k) => answerSets[k])
    .reduce((acc, list) => acc.flatMap((a) => list.map((b) => ({ ...a, ...b }))), [{}])
  for (const answers of product) {
    const q = quote({ selected, answers })
    checked++
    for (const l of q.lines) {
      if (l.once < 0 || l.monthly < 0) fail(`Negativ linje (${l.service.name}: ${l.once} / ${l.monthly}) ${ctx(selected, answers)}`)
      // Delene giver præcis linjens pris (hvad der indgår i summen).
      const onceParts = l.parts.reduce((s, p) => s + p.once, 0)
      const monthParts = l.parts.reduce((s, p) => s + p.monthly, 0)
      if (onceParts !== l.once || monthParts !== l.monthly) fail(`Delene (${onceParts} / ${monthParts}) ≠ linjen (${l.once} / ${l.monthly}) ${ctx(selected, answers)}`)
      if (l.parts.some((p) => !p.id || !p.label || typeof p.once !== 'number' || typeof p.monthly !== 'number')) fail(`Del uden id/label/beløb ${ctx(selected, answers)}`)
      const text = priceText(l)
      if (/aftales|ca\./i.test(text)) fail(`"${text}" ${ctx(selected, answers)}`)
      if (l.key === 'hjemmeside') {
        // Egen konto = ingen månedspris og ingen plan; en plan = dens månedspris og ingen egen konto.
        if (l.noDrift && (l.monthly !== 0 || l.driftPlan)) fail(`Egen konto med månedspris/plan ${ctx(selected, answers)}`)
        if (l.driftPlan && l.monthly !== PLAN[l.driftPlan]) fail(`Plan ${l.driftPlan} koster ${l.monthly}/md, forventet ${PLAN[l.driftPlan]} ${ctx(selected, answers)}`)
        if (!l.driftPlan && !l.noDrift && (l.monthly !== 0 || !l.driftMissing)) fail(`Ingen drift valgt, men månedspris/mangel ikke markeret ${ctx(selected, answers)}`)
        // Loftet gælder Start og Vækst uden integrationer (uden booking).
        const integrations = l.includes.includes('booking')
        if (l.tier.id !== 'fuld-fart' && !integrations && l.withoutExtraPages > maxWebsiteNoIntegrations) {
          fail(`Hjemmeside uden integrationer (${l.tier.id}) ${l.withoutExtraPages} kr. > ${maxWebsiteNoIntegrations} kr. ${ctx(selected, answers)}`)
        }
      } else if (l.driftPlan || l.noDrift) {
        fail(`${l.key} har driftplan ${ctx(selected, answers)}`)
      }
    }
    if (q.total.once < 0 || q.total.monthly < 0) fail(`Negativ total ${ctx(selected, answers)}`)

    // Slutresultatet: hvad kunden får (pakker, sider, drift og alle dele). Samme resultat = samme pris.
    const web = q.lines.find((l) => l.key === 'hjemmeside')
    const bg = q.lines.find((l) => l.key === 'bookingGoogle')
    const mk = q.lines.find((l) => l.key === 'marketing')
    const parts = [...new Set([...(web?.includes ?? []), ...(bg?.tier.includes ?? [])])].sort()
    const outcome = JSON.stringify({
      web: web && { tier: web.tier.id, pages: answers.ekstra ?? answers.sider, plan: web.driftPlan, own: web.noDrift },
      bgAlone: !web && bg ? bg.tier.id : null,
      parts: web ? parts : [],
      marketing: mk?.tier.id ?? null,
    })
    const price = `${q.total.once}/${q.total.monthly}`
    const seen = outcomes.get(outcome)
    if (seen && seen.price !== price) {
      fail(`Samme resultat, to priser: ${seen.price} (${seen.ctx}) og ${price} (${ctx(selected, answers)})`)
    } else if (!seen) outcomes.set(outcome, { price, ctx: ctx(selected, answers) })
    if (/aftales|ca\./i.test(totalText(q.total))) fail(`Total "${totalText(q.total)}" ${ctx(selected, answers)}`)
  }
}

const web1 = (answers, selected = ['hjemmeside']) => quote({ selected, answers }).lines.find((l) => l.key === 'hjemmeside')
const total = (selected, answers) => quote({ selected, answers }).total

// De 9 kombinationer pakke × plan, begge uafhængige: engangs 2.500/4.000/5.000, måned 99/199/399.
for (const [sider, [tier, once]] of Object.entries(PACKAGE)) {
  for (const [plan, monthly] of Object.entries(PLAN)) {
    const answers = { sider, bestilling: 'nej', drift: plan }
    const t = total(['hjemmeside'], answers)
    if (t.once !== once || t.monthly !== monthly || t.noDrift) fail(`${tier} + ${plan}: ${t.once} + ${t.monthly}/md (forventet ${once} + ${monthly})`)
    const l = web1(answers)
    if (l.driftPlan !== plan || l.tier.id !== tier) fail(`${tier} + ${plan}: driftPlan ${l.driftPlan}, pakke ${l.tier.id}`)
    // Booking: præcis +500 engangs, ingen anden plan og ingen månedlig ændring.
    const b = total(['hjemmeside'], { ...answers, bestilling: 'ja' })
    if (b.once !== once + BOOKING || b.monthly !== monthly) fail(`${tier} + ${plan} + booking: ${b.once} + ${b.monthly}/md (forventet ${once + BOOKING} + ${monthly})`)
  }
  // Egen konto: +1.000 engangs, ingen månedspris; med booking +500 (antaget muligt).
  const own = total(['hjemmeside'], { sider, bestilling: 'nej', drift: 'egen' })
  if (own.once !== once + OWN_ACCOUNT || own.monthly !== 0 || !own.noDrift) fail(`${tier} + egen konto: ${own.once} + ${own.monthly}/md (forventet ${once + OWN_ACCOUNT} + 0)`)
  const ownBooking = total(['hjemmeside'], { sider, bestilling: 'ja', drift: 'egen' })
  if (ownBooking.once !== once + OWN_ACCOUNT + BOOKING || ownBooking.monthly !== 0) fail(`${tier} + egen konto + booking: ${ownBooking.once} + ${ownBooking.monthly}/md`)
}

// Ekstra sider i Fuld fart: 400 kr. pr. side over 8 (9 sider = 1 ekstra), uafhængigt af planen.
for (const [ekstra, extra] of [['9', 1], ['12', 4], ['20', 12]]) {
  for (const [plan, monthly] of Object.entries(PLAN)) {
    const t = total(['hjemmeside'], { sider: '9+', ekstra, bestilling: 'nej', drift: plan })
    if (t.once !== 5000 + extra * EXTRA_PAGE || t.monthly !== monthly) fail(`${ekstra} sider + ${plan}: ${t.once} + ${t.monthly}/md (forventet ${5000 + extra * EXTRA_PAGE} + ${monthly})`)
  }
  const t = total(['hjemmeside'], { sider: '9+', ekstra, bestilling: 'ja', drift: 'egen' })
  if (t.once !== 5000 + extra * EXTRA_PAGE + OWN_ACCOUNT + BOOKING || t.monthly !== 0) fail(`${ekstra} sider + egen konto + booking: ${t.once} + ${t.monthly}/md`)
}

// Fuld fart kræver ikke Ekstra, og ingen plan er forvalgt: uden drift er der ingen månedspris, og det markeres.
{
  const basis = web1({ sider: '6-8', bestilling: 'nej', drift: 'basis' })
  if (basis.monthly !== 99) fail(`Fuld fart + Basis: ${basis.monthly}/md`)
  const none = web1({ sider: '6-8', bestilling: 'nej' })
  if (none.monthly !== 0 || !none.driftMissing || none.driftPlan) fail(`Uden drift er der en standard: ${none.monthly}/md ${none.driftPlan}`)
  const drift = calculator.questions.hjemmeside.find((x) => x.id === 'drift')
  if (drift.default !== undefined || drift.options.map((o) => o.id).join() !== 'basis,plus,ekstra,egen') fail(`Driftspørgsmålet: ${drift.options.map((o) => o.id)}`)
}

// Overlap med Booking & Google (håndregnet): delene tælles kun én gang.
{
  // Vækst indeholder Google-profilen: Booking & Google Vækst (1.000) minus 500 = 500.
  const a = total(['hjemmeside', 'bookingGoogle'], { sider: '2-5', bestilling: 'nej', drift: 'plus', booking: 'ja', anmeldelser: 'nej' })
  if (a.once !== 4500 || a.monthly !== 199) fail(`Vækst + B&G Vækst: ${a.once} + ${a.monthly}/md (forventet 4500 + 199)`)
  // Med booking på siden er hele B&G Vækst dækket.
  const b = quote({ selected: ['hjemmeside', 'bookingGoogle'], answers: { sider: '2-5', bestilling: 'ja', drift: 'plus', booking: 'ja', anmeldelser: 'nej' } })
  if (b.total.once !== 4500 || b.total.monthly !== 199 || !b.lines[1].allIncluded) fail(`Vækst + booking + B&G Vækst: ${b.total.once} + ${b.total.monthly}/md`)
  // Start har ikke Google-profilen: B&G Fuld fart (1.500) uden fradrag = 2.500 + 1.500.
  const c = total(['hjemmeside', 'bookingGoogle'], { sider: '1', bestilling: 'nej', drift: 'basis', booking: 'ja', anmeldelser: 'ja' })
  if (c.once !== 4000 || c.monthly !== 99) fail(`Start + B&G Fuld fart: ${c.once} + ${c.monthly}/md (forventet 4000 + 99)`)
  // Start + booking på siden + B&G Fuld fart: booking (500) trækkes fra B&G.
  const d = total(['hjemmeside', 'bookingGoogle'], { sider: '1', bestilling: 'ja', drift: 'basis', booking: 'ja', anmeldelser: 'ja' })
  if (d.once !== 4000 || d.monthly !== 99) fail(`Start + booking + B&G Fuld fart: ${d.once} + ${d.monthly}/md (forventet 4000 + 99)`)
  // "1 side + booking via siden" = "Start + Booking & Google Vækst" minus Google-profilen.
  const viaSite = total(['hjemmeside'], { sider: '1', bestilling: 'ja', drift: 'plus' })
  const viaBg = total(['hjemmeside', 'bookingGoogle'], { sider: '1', bestilling: 'nej', drift: 'plus', booking: 'ja', anmeldelser: 'nej' })
  if (viaSite.once !== viaBg.once - components.googleProfile.price || viaSite.monthly !== viaBg.monthly) {
    fail(`1 side + booking via siden (${viaSite.once} + ${viaSite.monthly}/md) ≠ Start + Booking & Google Vækst (${viaBg.once} + ${viaBg.monthly}/md) minus Google-profil`)
  }
  // Booking på siden og booking-planer ændrer aldrig driftsplanen.
  for (const plan of Object.keys(PLAN)) {
    const l = web1({ sider: '1', bestilling: 'ja', drift: plan, booking: 'ja', anmeldelser: 'ja' }, ['hjemmeside', 'bookingGoogle'])
    if (l.driftPlan !== plan) fail(`Booking ændrede driftsplanen ${plan} til ${l.driftPlan}`)
  }
}

// Marketing: sin egen månedspris, lagt oven i hjemmesidens drift uden dobbeltregning.
{
  const t = total(['hjemmeside', 'marketing'], { sider: '2-5', bestilling: 'nej', drift: 'plus', videoer: '8', poste: 'ja', annoncer: 'nej' })
  if (t.once !== 4000 || t.monthly !== 199 + 2500) fail(`Hjemmeside + marketing: ${t.once} + ${t.monthly}/md (forventet 4000 + 2699)`)
  const own = total(['hjemmeside', 'marketing'], { sider: '1', bestilling: 'nej', drift: 'egen', videoer: '4', poste: 'nej', annoncer: 'nej' })
  if (own.once !== 3500 || own.monthly !== 1500 || !own.noDrift) fail(`Egen konto + marketing: ${own.once} + ${own.monthly}/md (forventet 3500 + 1500)`)
}

// Gamle links: drift=drift → planen med samme indhold som linket viste (Start/Vækst → Plus, Fuld fart 399 → Ekstra).
for (const [search, plan, monthly] of [
  ['sider=1', 'plus', 199],
  ['sider=2-5', 'plus', 199],
  ['sider=6-8', 'ekstra', 399],
  ['sider=9%2B&ekstra=10', 'ekstra', 399],
]) {
  const state = parse(`?ydelser=hjemmeside&${search}&bestilling=nej&drift=drift&trin=3`)
  const l = quote(state).lines[0]
  if (state.answers.drift !== plan || l.monthly !== monthly) fail(`Gammelt link ${search}: drift=${state.answers.drift}, ${l.monthly}/md (forventet ${plan}, ${monthly})`)
  // Et gammelt resultatlink (trin=3) lander på resultatet, ikke på driftstrinnet.
  if (state.step !== resultStep(['hjemmeside'])) fail(`Gammelt resultatlink ${search} lander på trin ${state.step + 1}`)
  const round = serialize(parse(serialize(state)))
  if (/drift=drift/.test(round) || !round.includes(`drift=${plan}`)) fail(`Gammelt link skrives stadig som drift=drift: ${round}`)
}
{
  // Uden sider kendes pakken ikke: der gættes ikke, og kunden vælger selv.
  const state = parse('?ydelser=hjemmeside&bestilling=nej&drift=drift&trin=3')
  if (state.answers.drift) fail(`Gammelt link uden sider fik drift=${state.answers.drift}`)
  // Manglende drift: trinnet flyttes til driftstrinnet (trin 3 af hjemmesidens to).
  const missing = parse('?ydelser=hjemmeside&sider=2-5&bestilling=nej&trin=4')
  if (missing.step !== 2 || missing.answers.drift) fail(`Manglende drift: trin ${missing.step + 1}, drift=${missing.answers.drift}`)
  // Ugyldig plan afvises.
  if (parse('?ydelser=hjemmeside&sider=2-5&drift=gratis').answers.drift) fail('Ugyldig driftplan blev accepteret')
  // Ingen personoplysninger i adresselinjen: kun spørgsmålenes id'er, ydelser og trin.
  const ids = new Set(['ydelser', 'trin', ...ORDER.flatMap((k) => calculator.questions[k].map((x) => x.id))])
  const all = { selected: ORDER, answers: { sider: '9+', ekstra: '10', bestilling: 'ja', drift: 'ekstra', videoer: '4', poste: 'ja', annoncer: 'nej', booking: 'ja', anmeldelser: 'ja' }, step: 5 }
  for (const k of new URLSearchParams(serialize(all)).keys()) if (!ids.has(k)) fail(`Ukendt parameter i adresselinjen: ${k}`)
}

// Pakkevælgeren: et skift bevarer driftsvalget (alle planer og egen konto), også med booking og Fuld fart.
for (const drift of [...Object.keys(PLAN), 'egen']) {
  for (const bestilling of ['nej', 'ja']) {
    for (const tierId of ['start', 'vaekst', 'fuld-fart']) {
      const switched = switchTier('hjemmeside', tierId, { sider: '2-5', bestilling, drift }, ['hjemmeside'])
      if (switched.drift !== drift || switched.bestilling !== bestilling) fail(`Skift til ${tierId} ændrede drift ${drift} / booking ${bestilling}: ${JSON.stringify(switched)}`)
    }
  }
}

// Teksten under prisen må heller ikke sige "aftales" eller "ca.".
if (/aftales|ca\./i.test(calculator.finalNote)) fail(`finalNote: "${calculator.finalNote}"`)

// Planerne: tre, i rækkefølge, med de forventede minutter, og ingen er "mest populær".
{
  const list = Object.values(driftPlans)
  const want = [['basis', 99, 0], ['plus', 199, 15], ['ekstra', 399, 30]]
  if (list.length !== 3 || want.some(([id, m, min], i) => list[i].id !== id || list[i].monthly !== m || list[i].minutes !== min)) {
    fail(`Driftsplaner: ${JSON.stringify(list.map((p) => [p.id, p.monthly, p.minutes]))}`)
  }
  for (const p of services.hjemmeside.tiers) {
    if ('monthly' in p || 'monthlyNote' in p) fail(`Pakken ${p.id} har stadig en månedspris/drift-note`)
  }
  if (services.hjemmeside.tiers.find((t) => t.id === 'fuld-fart').features[0] !== 'Op til 8 sider') fail('Fuld fart skal hedde "Op til 8 sider"')
}

// Drift + frikøb må aldrig blive billigere end egen konto fra start (for ethvert antal måneder og enhver plan).
const web = services.hjemmeside
for (const tier of web.tiers.filter((t) => web.addons.ownAccount.tiers.includes(t.id))) {
  for (const plan of Object.values(driftPlans)) {
    for (let months = 0; months <= 60; months++) {
      const viaDrift = tier.price + months * plan.monthly + web.drift.buyoutPrice
      const ownFromStart = tier.price + web.addons.ownAccount.price
      if (viaDrift < ownFromStart) fail(`${tier.id}/${plan.id}: drift i ${months} md + frikøb (${viaDrift}) < egen konto fra start (${ownFromStart})`)
    }
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

// Pakkeskift i resultatet: resultatet efter et skift skal være det samme som at
// svare direkte med den nye pakkes svar. DIRECT er pakkernes svar skrevet ud her
// i testen (ikke læst fra calculator.tierSwitch), så en fejl i opsætningen fanges.
const DIRECT = {
  hjemmeside: { start: { sider: '1' }, vaekst: { sider: '2-5' }, 'fuld-fart': { sider: '6-8' } },
  marketing: {
    start: { videoer: '4', poste: 'nej', annoncer: 'nej' },
    vaekst: { videoer: '8', poste: 'ja', annoncer: 'nej' },
    'fuld-fart': { videoer: '12', poste: 'ja', annoncer: 'ja' },
  },
  bookingGoogle: {
    start: { booking: 'nej', anmeldelser: 'nej' },
    vaekst: { booking: 'ja', anmeldelser: 'nej' },
    'fuld-fart': { booking: 'ja', anmeldelser: 'ja' },
  },
}
/** Det, kunden ser: pakke, pris, drift og noter pr. linje, totalen og svarene (adresselinjen). */
const result = (selected, answers) => {
  const q = quote({ selected, answers })
  return JSON.stringify({
    lines: q.lines.map((l) => [l.key, l.tier.id, l.once, l.monthly, l.noDrift, l.driftPlan, priceText(l), l.notes]),
    total: totalText(q.total),
    url: serialize(parse(serialize({ selected, answers, step: resultStep(selected) })), NONE),
  })
}
/** Antal skift, hvor resultatet ikke passer med de direkte svar. */
function switchMismatches(switchFn, report) {
  let bad = 0
  for (const selected of subsets) {
    const product = selected
      .map((k) => answerSets[k])
      .reduce((acc, list) => acc.flatMap((a) => list.map((b) => ({ ...a, ...b }))), [{}])
    for (const answers of product) {
      for (const key of selected) {
        for (const tierId of Object.keys(DIRECT[key])) {
          const switched = switchFn(key, tierId, answers, selected)
          // Direkte: ydelsens egne svar skiftes ud (ekstra sider fjernes), resten beholdes.
          const direct = { ...answers, ...DIRECT[key][tierId] }
          if (key === 'hjemmeside') delete direct.ekstra
          const wrongTier = quote({ selected, answers: switched }).lines.find((l) => l.key === key).tier.id !== tierId
          if (wrongTier || result(selected, switched) !== result(selected, direct)) {
            bad++
            if (report && bad <= 5) fail(`Pakkeskift ${key} → ${tierId} ≠ direkte svar ${ctx(selected, answers)}`)
          }
        }
      }
    }
  }
  return bad
}
switchMismatches(switchTier, true)
// Beviset for, at testen virker: et skift, der ikke opdaterer svarene, skal fanges.
if (switchMismatches((key, tierId, answers) => answers, false) === 0) {
  fail('Pakkeskift-testen fanger ikke et skift, der lader svarene stå uændret')
}

// Opsummeringen (mail og SMS) viser planen og beløbene.
{
  const q = quote({ selected: ['hjemmeside'], answers: { sider: '2-5', bestilling: 'nej', drift: 'plus' } })
  const text = summaryLines(q).join('\n')
  for (const want of ['Hjemmeside, Vækst: 4.000 kr. + 199 kr./md', 'Drift: Plus, 199 kr./md, hjælp til billeder, tekst og nyheder', 'I alt: 4.000 kr. nu + 199 kr./md']) {
    if (!text.includes(want)) fail(`Opsummeringen mangler "${want}":\n${text}`)
  }
}

// Gamle driftløfter og popularitetsmærker må ikke stå nogen steder (tekster, kode, beregner).
// Drift lover kun den tekniske drift og planens minutter (ingen døgnsupport eller overvågning).
const FORBIDDEN = [
  [/2 hverdage|inden 2 hver/i, 'gammelt løfte om svartid ("2 hverdage")'],
  [/2 små ændringer|op til 2 ændringer/i, 'gammelt løfte om "2 små ændringer"'],
  [/mest populær|mest valgte|populær/i, '"mest populær"'],
  [/døgnsupport|24\/7|overvåg/i, 'løfte om support eller overvågning'],
  [/fuldFartNote|driftWithBooking|notWithBooking|switchedToDrift/, 'gammel driftregel'],
]
for (const file of [...scanned, 'src/data/pricing.js']) {
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((text, i) => {
      for (const [re, what] of FORBIDDEN) if (re.test(text)) fail(`${what} i ${file}:${i + 1}: ${text.trim().slice(0, 100)}`)
    })
}
for (const old of ['driftWithBooking', 'fuldFartNote', 'switchedToDrift']) {
  if (old in calculator) fail(`calculator.${old} findes stadig`)
}

if (failures.length) {
  console.error(`Pristest FEJLEDE (${failures.length}):\n- ${failures.slice(0, 20).join('\n- ')}`)
  process.exit(1)
}
console.log(`Pristest bestået: ${checked} kombinationer af ydelser og svar, 9 pakke × plan, egen konto, booking, ekstra sider, overlap, gamle links og ${scanned.length} filer uden hardkodede beløb.`)
