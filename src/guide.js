import { calculator, systemModule } from './data/pricing.js'
import { cleanAnswers, quote, resultStep, serialize } from './calculator.js'

/**
 * BEHOVSGUIDEN ("Hjælp mig med at vælge") — ren logik uden React og window.
 * Tekster og spørgsmål står i calculator.guide (src/data/pricing.js), priserne
 * kommer fra den samme quote() som den direkte beregner bruger.
 *
 * FORLØB: højst TRE spørgsmål i alt: behov, så (forgrenet) det, der er relevant for
 * behovet: eksisterende løsning, omfang og ønsket betalingsmodel. Der spørges aldrig om alt.
 * Resultatet er et forslag (en pakke fra pricing.js, med beregnerens svar sat, så
 * "Se og ret i beregneren" viser præcis samme pris), en samtale uden pris ("talk": et system
 * kan være relevant, men der findes endnu ikke et færdigt standardmodul, eller kunden har
 * allerede et) eller en kort afklaring ("unclear"). Der opfindes ingen pakker og ingen priser.
 *
 * REGLER: den mindste eksisterende løsning, der dækker behovet. "Jeg ved det ikke"
 * giver den mindste løsning.
 * - Google alene → Booking & Google Start (engangsopgave); med QR-skilt: Start + QR, aldrig booking.
 * - Booking → kobles på det system/den hjemmeside, kunden har (aldrig en ny kalender).
 * - Hjemmeside → Lokal (løbende) eller Køb (engang) efter betalingsmodel; ved køb den mindste
 *   pakke, der dækker sidebehovet, og driftsplanen Basis (begrundet).
 * - Arbejdsgang → kun et system, hvis arbejdsgangen er relevant (mange sager, intet system i dag), og
 *   aldrig med en pris, mens systemModule.ready er false.
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
const FIRST = { hjemmeside: 'sider', google: 'anmeldelser', booking: 'harSide', arbejdsgang: 'volumen', sociale: 'opslag' }
/** Behovets opfølgende spørgsmål, når svaret afgør hvilke. */
const FOLLOW = {
  hjemmeside: () => ['sider', 'model'],
  google: () => ['anmeldelser'],
  booking: (a) => ['harSide', ...(a.harSide === 'nej' ? ['ogsaaSide'] : [])],
  arbejdsgang: (a) => ['volumen', ...(a.volumen === 'mange' ? ['eksisterende'] : [])],
  sociale: () => ['opslag', 'annoncer'],
}

/** Spørgsmålene i rækkefølge med de svar, der er givet (højst 3). */
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
  if (a.behov === 'arbejdsgang' && !a.volumen) return null
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

/** Beregnerens tilstand (resultattrinnet) for et forslag; svarene renses som i beregneren. */
const stateOf = (selected, answers) => ({ selected, answers: cleanAnswers(answers), step: resultStep(selected) })

/** Køb hjemmesiden: pakkens svar fra tierSwitch, uden booking og med driftsplanen Basis (den mindste). */
const koebState = (tier, extra = {}) =>
  stateOf(['hjemmeside'], { ...calculator.tierSwitch.hjemmeside[tier].answers, bestilling: 'nej', drift: 'basis', ...extra })

/** Pakken for sidebehovet (den mindste, der kan rumme siderne). */
const TIER_FOR_PAGES = { 1: 'start', '2-3': 'vaekst', '4-5': 'vaekst', '6-8': 'fuld-fart' }
/** Sidebehov, som Lokal kan rumme (1-3 indholdssider). */
const LOKAL_FITS = new Set(['1', '2-3', 'ved-ikke'])

const RANK = ['start', 'vaekst', 'fuld-fart']
const higher = (x, y) => (RANK.indexOf(x) >= RANK.indexOf(y) ? x : y)

/**
 * Anbefalingen ud fra svarene: { kind: 'plan', state, reasons }, { kind: 'talk', title, text, sms, reasons }
 * eller { kind: 'unclear', reasons }. `state` er beregnerens tilstand (resultattrinnet),
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
    const wantsLokal = a.model === 'lokal'
    // Lokal rummer 1-3 sider: kræver sidebehovet flere, foreslås den mindste købspakke, der kan rumme dem.
    if (wantsLokal && LOKAL_FITS.has(a.sider)) {
      reasons.push(R.payLokal, R.lokalFits)
      if (unsure('sider')) reasons.push(R.unsureDefault)
      return done(stateOf(['lokal'], { system: 'nej' }))
    }
    const tier = TIER_FOR_PAGES[a.sider] ?? 'start'
    if (wantsLokal) reasons.push(R.lokalTooSmall)
    else reasons.push(a.model === 'koeb' ? R.payKoeb : R.payDefault)
    reasons.push(tier === 'start' ? R.websiteSmall : R.websitePages, R.websiteNoBooking, R.driftDefault)
    if (unsure('sider')) reasons.push(R.unsureDefault)
    return done(koebState(tier))
  }

  if (need === 'google') {
    // Google alene er en engangsopgave. QR-skiltet vælges uden booking.
    const qr = a.anmeldelser === 'ja'
    reasons.push(R.googleStart)
    if (qr) reasons.push(R.googleQr)
    if (unsure('anmeldelser')) reasons.push(R.unsureDefault)
    return done(stateOf(['bookingGoogle'], { booking: 'nej', anmeldelser: qr ? 'ja' : 'nej' }))
  }

  if (need === 'booking') {
    // Har kunden en hjemmeside, kobles bookingen på den: ingen ny hjemmeside og aldrig en ny kalender.
    if (a.harSide === 'ja' || a.harSide === 'ved-ikke') {
      reasons.push(a.harSide === 'ja' ? R.bookingHasSite : R.bookingUnsureSite, R.bookingSubscription)
      return done(stateOf(['bookingGoogle'], { booking: 'ja', anmeldelser: 'nej' }))
    }
    if (a.ogsaaSide === 'koeb') {
      reasons.push(R.bookingNewSite, R.websiteBooking, R.driftDefault, R.bookingSubscription)
      return done(koebState('start', { bestilling: 'ja' }))
    }
    if (a.ogsaaSide === 'lokal') {
      reasons.push(R.bookingLokal, R.bookingSubscription)
      return done(stateOf(['lokal', 'bookingGoogle'], { system: 'nej', booking: 'ja', anmeldelser: 'nej' }))
    }
    reasons.push(R.bookingNoSite, R.bookingSubscription)
    if (unsure('ogsaaSide')) reasons.push(R.unsureDefault)
    return done(stateOf(['bookingGoogle'], { booking: 'ja', anmeldelser: 'nej' }))
  }

  if (need === 'arbejdsgang') {
    if (a.volumen === 'mange') {
      // Har kunden et system, der virker, sælges et nyt ikke.
      if (a.eksisterende === 'ja') return { kind: 'talk', title: G.haveTitle, text: G.haveText, sms: G.haveSms, reasons }
      if (systemModule.ready) {
        reasons.push(R.arbejdsgangSystem)
        return done(stateOf(['lokal'], { system: 'ja' }))
      }
      // Intet færdigt standardmodul: ingen pris, kun et særskilt fast tilbud efter en snak.
      return { kind: 'talk', title: G.offerTitle, text: G.offerText, sms: G.offerSms, reasons }
    }
    reasons.push(R.arbejdsgangLidt)
    if (unsure('volumen')) reasons.push(R.unsureDefault)
    return done(stateOf(['lokal'], { system: 'nej' }))
  }

  if (need === 'sociale') {
    let tier = 'start'
    if (a.opslag === 'ja') tier = higher(tier, 'vaekst')
    if (a.annoncer === 'ja') tier = higher(tier, 'fuld-fart')
    reasons.push(tier === 'fuld-fart' ? R.socialAds : tier === 'vaekst' ? R.socialPost : R.socialStart)
    // Annoncer giver Fuld fart: så er det ikke "den mindste løsning" for et usikkert svar.
    if (unsure('opslag', 'annoncer') && tier !== 'fuld-fart') reasons.push(R.unsureDefault)
    return done(stateOf(['marketing'], calculator.tierSwitch.marketing[tier].answers))
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
