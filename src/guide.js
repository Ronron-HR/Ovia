import { calculator } from './data/pricing.js'
import { cleanAnswers, quote, resultStep, serialize } from './calculator.js'

/**
 * BEHOVSGUIDEN ("Hjælp mig med at vælge") — ren logik uden React og window.
 * Tekster og spørgsmål står i calculator.guide (src/data/pricing.js), priserne
 * kommer fra den samme quote() som den direkte beregner bruger.
 *
 * FORLØB: første spørgsmål (behov), derefter højst to opfølgende spørgsmål, som
 * kun stilles, hvis svaret ændrer anbefalingen. Resultatet er enten et forslag
 * (en pakke fra pricing.js, med beregnerens svar sat, så "Se og ret i beregneren"
 * viser præcis samme pris) eller en kort afklaring ("unclear"), hvis svarene ikke
 * er nok. Der opfindes ingen pakker og ingen priser.
 *
 * REGLER: den mindste eksisterende løsning, der dækker behovet. "Jeg ved det
 * ikke" giver den mindste løsning. Har kunden en hjemmeside, sælges en ny ikke
 * automatisk (booking alene giver aldrig en ny hjemmeside). Hjemmesidens driftsplan
 * vælges ud fra spørgsmålet om ændringer efter lanceringen: aldrig en dyrere plan
 * end svaret kræver. Stilles spørgsmålet ikke (højst to opfølgende), bruges den
 * mindste plan, og begrundelsen siger det.
 *
 * TILSTAND: i adresselinjen som hjaelp=<trin> og g-<spørgsmål>=<svar> (ingen
 * kontaktoplysninger), sat af src/useCalc.js. Trin 1..n er spørgsmålene, n+1 er
 * resultatet.
 */

const G = calculator.guide
export const QUESTIONS = { behov: G.need, ...G.questions }

/** Parameteren i adresselinjen for et spørgsmål. */
export const paramOf = (key) => `g-${QUESTIONS[key].id}`

/** Det første opfølgende spørgsmål for hvert behov. */
const FIRST = { hjemmeside: 'sider', google: 'anmeldelser', booking: 'harSide', sociale: 'opslag' }
/** Behovets opfølgende spørgsmål, når svaret afgør hvilke. */
const FOLLOW = {
  hjemmeside: () => ['sider', 'aendringer'],
  google: () => ['anmeldelser'],
  booking: (a) => ['harSide', ...(a.harSide === 'nej' ? ['ogsaaSide'] : [])],
  sociale: () => ['opslag', 'annoncer'],
}

/** Spørgsmålene i rækkefølge med de svar, der er givet (højst 1 + 2). */
export function questionList(a) {
  if (!a.behov) return ['behov']
  if (a.behov === 'usikker') {
    const focus = a.fokus && a.fokus !== 'ved-ikke' ? a.fokus : null
    return ['behov', 'fokus', ...(focus ? [FIRST[focus]] : [])]
  }
  return ['behov', ...FOLLOW[a.behov](a)].slice(0, 3)
}

/** Antal spørgsmål i alt, når det kendes (ellers null: det afhænger af et svar, der mangler). */
export function plannedTotal(a) {
  if (!a.behov) return null
  if (a.behov === 'usikker' && !a.fokus) return null
  if (a.behov === 'booking' && !a.harSide) return null
  return questionList(a).length
}

/**
 * Renser guidens tilstand: svar, der ikke hører til forløbet, fjernes, og trinnet
 * kan ikke komme længere end det første ubesvarede spørgsmål (eller resultatet).
 */
export function fitGuide(guide) {
  if (!guide) return null
  const a = {}
  let i = 0
  for (;;) {
    const key = questionList(a)[i]
    const value = guide.a?.[key]
    if (!key || !QUESTIONS[key].options.some((o) => o.id === value)) break
    a[key] = value
    i++
  }
  const step = Math.min(Math.max(1, Math.floor(Number(guide.step)) || 1), i + 1)
  return { step, a }
}

/** Svar på ét spørgsmål: senere svar nulstilles, hvis svaret ændrer sig. */
export function withAnswer(guide, key, value) {
  const list = questionList(guide.a)
  const at = list.indexOf(key)
  const a = {}
  for (const k of list.slice(0, at)) a[k] = guide.a[k]
  a[key] = value
  // Er svaret uændret, bevares de senere svar.
  if (guide.a[key] === value) return fitGuide({ ...guide, a: { ...guide.a } })
  return fitGuide({ ...guide, a })
}

/* ---- Adresselinje ------------------------------------------------------ */

export function parseGuide(search) {
  const q = new URLSearchParams(search)
  if (!q.has('hjaelp')) return null
  const a = {}
  for (const key of Object.keys(QUESTIONS)) {
    const v = q.get(paramOf(key))
    if (v) a[key] = v
  }
  return fitGuide({ step: Number(q.get('hjaelp')), a })
}

export function serializeGuide(guide) {
  const g = fitGuide(guide)
  const q = new URLSearchParams()
  q.set('hjaelp', String(g.step))
  for (const key of questionList(g.a)) if (g.a[key]) q.set(paramOf(key), g.a[key])
  return `?${q.toString()}`
}

/* ---- Anbefaling -------------------------------------------------------- */

const tierState = (key, tier, extra = {}) => {
  const selected = [key]
  const answers = cleanAnswers({ ...calculator.tierSwitch[key][tier].answers, ...extra })
  return { selected, answers, step: resultStep(selected) }
}

/** Driftsvalget ud fra svaret om ændringer efter lanceringen (den mindste dækkende plan) og begrundelsen. */
function driftFor(changes) {
  const R = calculator.guide.reasons
  switch (changes) {
    case 'nej':
      return { drift: 'basis', reason: R.driftBasis }
    case 'lidt':
      return { drift: 'plus', reason: R.driftPlus }
    case 'jaevnligt':
      return { drift: 'ekstra', reason: R.driftEkstra }
    case 'egen':
      return { drift: 'egen', reason: R.driftOwn }
    default: // "Jeg ved det ikke" eller ikke stillet
      return { drift: 'basis', reason: R.driftDefault }
  }
}

const RANK = ['start', 'vaekst', 'fuld-fart']
const higher = (x, y) => (RANK.indexOf(x) >= RANK.indexOf(y) ? x : y)

/**
 * Anbefalingen ud fra svarene: { kind: 'plan', state, reasons } eller
 * { kind: 'unclear', reasons }. `state` er beregnerens tilstand (resultattrinnet),
 * så guidens pris og beregnerens pris er den samme udregning.
 */
export function recommend(a) {
  const R = G.reasons
  const reasons = []
  let need = a.behov
  if (need === 'usikker') {
    need = a.fokus && a.fokus !== 'ved-ikke' ? a.fokus : null
    if (!need) return { kind: 'unclear', reasons: [] }
  }
  const unsure = (...keys) => keys.some((k) => a[k] === 'ved-ikke')
  const done = (state) => ({ kind: 'plan', state, reasons })

  if (need === 'hjemmeside') {
    const tier = { 1: 'start', '2-5': 'vaekst', '6-8': 'fuld-fart' }[a.sider] ?? 'start'
    const { drift, reason } = driftFor(a.aendringer)
    reasons.push(tier === 'start' ? R.websiteSmall : R.websitePages)
    reasons.push(R.websiteNoBooking, reason)
    if (unsure('sider', 'aendringer')) reasons.push(R.unsureDefault)
    return done(tierState('hjemmeside', tier, { bestilling: 'nej', drift }))
  }

  if (need === 'google') {
    const qr = a.anmeldelser === 'ja'
    reasons.push(qr ? R.googleReviews : R.googleStart)
    if (unsure('anmeldelser')) reasons.push(R.unsureDefault)
    return done(tierState('bookingGoogle', qr ? 'fuld-fart' : 'start'))
  }

  if (need === 'booking') {
    // Har kunden en hjemmeside, kobles bookingen på den: ingen ny hjemmeside.
    if (a.harSide === 'ja' || a.harSide === 'ved-ikke') {
      reasons.push(a.harSide === 'ja' ? R.bookingHasSite : R.bookingUnsureSite)
      return done(tierState('bookingGoogle', 'vaekst'))
    }
    if (a.ogsaaSide === 'ja') {
      // Kun to opfølgende spørgsmål: driftsplanen spørges ikke, så den mindste vælges.
      reasons.push(R.bookingNewSite, R.websiteBooking, driftFor().reason)
      return done(tierState('hjemmeside', 'start', { bestilling: 'ja', drift: driftFor().drift }))
    }
    reasons.push(R.bookingNoSite)
    if (unsure('ogsaaSide')) reasons.push(R.unsureDefault)
    return done(tierState('bookingGoogle', 'vaekst'))
  }

  if (need === 'sociale') {
    let tier = 'start'
    if (a.opslag === 'ja') tier = higher(tier, 'vaekst')
    if (a.annoncer === 'ja') tier = higher(tier, 'fuld-fart')
    reasons.push(tier === 'fuld-fart' ? R.socialAds : tier === 'vaekst' ? R.socialPost : R.socialStart)
    // Annoncer giver Fuld fart: så er det ikke "den mindste løsning" for et usikkert svar.
    if (unsure('opslag', 'annoncer') && tier !== 'fuld-fart') reasons.push(R.unsureDefault)
    return done(tierState('marketing', tier))
  }

  return { kind: 'unclear', reasons: [] }
}

/** Adresselinjen til beregnerens resultat for et forslag (til formularens link og "Se og ret"). */
export const proposalSearch = (state) => serialize(state)

/** Forslaget med pris, regnet af den samme quote() som beregneren. */
export function proposal(a) {
  const rec = recommend(a)
  return rec.kind === 'plan' ? { ...rec, quote: quote(rec.state) } : rec
}
