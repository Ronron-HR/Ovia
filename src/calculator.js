import { useSyncExternalStore } from 'react'
import { bookingSubscriptionNote, calculator, components, formatKr, overlap, services, tierName } from './data/pricing.js'

/**
 * PRISBEREGNERENS LOGIK — tilstand, pakkevalg, interval og opsummering.
 * Spørgsmål, svar og priser står i src/data/pricing.js.
 *
 * TILSTAND: kun i adresselinjen (?ydelser=hjemmeside,marketing&sider=2-5&…&trin=3),
 * sat med replaceState, så et link med valgene virker, og intet gemmes andre
 * steder. Ingen cookies, intet lager, intet sendes nogen steder hen.
 * Serveren og første klient-render får starttilstanden (forudrendering og
 * hydrering er ens).
 *
 * FORVALG: på ydelsessiderne er sidens ydelse valgt på forhånd (`defaults`).
 * Står der intet `ydelser` i adresselinjen, bruges forvalget; har kunden
 * fravalgt alt, skrives `ydelser=` (tom), så forvalget ikke kommer tilbage.
 */

/** Ydelsernes rækkefølge i beregneren. */
export const ORDER = ['hjemmeside', 'marketing', 'bookingGoogle']
const RANK = ['start', 'vaekst', 'fuld-fart']

const allQuestions = ORDER.flatMap((key) => calculator.questions[key])

export const EMPTY = Object.freeze({ selected: [], answers: {}, step: 0 })
const NONE = Object.freeze([])

/* ---- Adresselinje ------------------------------------------------------ */

/** Trinnet må ikke vise noget, der kræver svar, som mangler. */
function fit(state) {
  const { selected, answers } = state
  const last = selected.length + 1 // resultatet
  let step = Math.min(Math.max(0, state.step), last)
  if (!selected.length) return { ...state, step: 0 }
  for (let i = 0; i < selected.length && step > i + 1; i++) {
    const missing = calculator.questions[selected[i]].some((q) => !answers[q.id])
    if (missing) step = i + 1
  }
  return { ...state, step }
}

export function parse(search, defaults = NONE) {
  const q = new URLSearchParams(search)
  const wanted = q.has('ydelser') ? q.get('ydelser').split(',') : defaults
  const selected = ORDER.filter((k) => wanted.includes(k))
  const answers = {}
  for (const question of allQuestions) {
    const v = q.get(question.id)
    if (question.options.some((o) => o.id === v)) answers[question.id] = v
  }
  return fit({ selected, answers, step: (Number(q.get('trin')) || 1) - 1 })
}

export function serialize({ selected, answers, step }, defaults = NONE) {
  const q = new URLSearchParams()
  const isDefault = selected.join(',') === ORDER.filter((k) => defaults.includes(k)).join(',')
  if (!isDefault || step > 0 || Object.keys(answers).length) q.set('ydelser', selected.join(','))
  for (const key of selected) {
    for (const question of calculator.questions[key]) {
      if (answers[question.id]) q.set(question.id, answers[question.id])
    }
  }
  if (step > 0) q.set('trin', String(step + 1))
  const s = q.toString()
  return s ? `?${s}` : ''
}

/* ---- Lager (useSyncExternalStore over adresselinjen) ------------------- */

const listeners = new Set()
/** Én gemt tilstand pr. forvalg, så useSyncExternalStore får samme objekt igen. */
const cache = new Map()

function snapshot(defaults) {
  const key = defaults.join(',')
  const { search } = window.location
  const hit = cache.get(key)
  if (hit?.search === search) return hit.state
  const state = parse(search, defaults)
  cache.set(key, { search, state })
  return state
}

const initial = new Map()
/** Starttilstanden (server og første klient-render): kun forvalget. */
function initialState(defaults) {
  const key = defaults.join(',')
  if (!initial.has(key)) initial.set(key, defaults.length ? fit({ ...EMPTY, selected: ORDER.filter((k) => defaults.includes(k)) }) : EMPTY)
  return initial.get(key)
}

function subscribe(fn) {
  listeners.add(fn)
  window.addEventListener('popstate', fn)
  return () => {
    listeners.delete(fn)
    window.removeEventListener('popstate', fn)
  }
}

export function useCalc(defaults = NONE) {
  const state = useSyncExternalStore(
    subscribe,
    () => snapshot(defaults),
    () => initialState(defaults),
  )
  const set = (next) => {
    const url = `${window.location.pathname}${serialize(fit(next), defaults)}${window.location.hash}`
    window.history.replaceState(window.history.state, '', url)
    listeners.forEach((fn) => fn())
  }
  return [state, set]
}

/* ---- Beregning ---------------------------------------------------------- */

/** Pris for én ydelse ud fra svarene. */
function line(key, answers) {
  const service = services[key]
  const chosen = calculator.questions[key].map((q) => ({
    question: q,
    option: q.options.find((o) => o.id === answers[q.id]),
  }))
  const options = chosen.map((c) => c.option).filter(Boolean)
  const tierId = RANK[Math.max(0, ...options.map((o) => RANK.indexOf(o.tier)))]
  const tier = service.tiers.find((t) => t.id === tierId)

  const notes = options.map((o) => o.note).filter(Boolean)

  // Prisen aftales (fx flere end 8 sider): ingen beløb, kun en note.
  if (options.some((o) => o.custom)) {
    return { key, service, tier, chosen, low: 0, high: 0, monthly: 0, packageHigh: 0, custom: true, notes: [...notes, calculator.customNote] }
  }

  let once = 0
  let monthly = 0
  let noDrift = false
  if (service.billing === 'monthly') {
    monthly = tier.price
  } else {
    // Tilvalg (fx egen konto) lægges i prisen: resultatet viser det, kunden reelt betaler.
    once = tier.price + options.reduce((sum, o) => sum + (o.addon ? service.addons[o.addon].price : 0), 0)
    noDrift = options.some((o) => o.noDrift)
    monthly = noDrift ? 0 : (tier.monthly ?? 0)
  }
  return {
    key,
    service,
    tier,
    chosen,
    low: once,
    high: once ? once + service.buffer : 0,
    monthly,
    noDrift,
    /** Pakkeprisen + buffer uden tilvalg (loftet i scripts/test-pricing.mjs). */
    packageHigh: service.billing === 'once' ? tier.price + service.buffer : 0,
    notes,
  }
}

/** "Google-profil", "Google-profil og booking", "Google-profil, booking og …" med stort forbogstav. */
function partList(ids) {
  const labels = ids.map((id) => components[id].label)
  const text = labels.length > 1 ? `${labels.slice(0, -1).join(', ')} og ${labels.at(-1)}` : labels[0]
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Komponenter tælles kun én gang: de dele af Booking & Google, der allerede er
 * med i den valgte hjemmesidepakke (`includes` i pricing.js), trækkes fra
 * Booking & Google-prisen, og noten nævner hvilke. Er hele pakken dækket,
 * bliver prisen 0, linjen får `allIncluded`, og intet lægges til totalen.
 */
function applyOverlap(web, bg) {
  if (!web || !bg) return
  const shared = bg.tier.includes.filter((id) => web.tier.includes.includes(id))
  if (!shared.length) return
  const amount = shared.reduce((sum, id) => sum + components[id].price, 0)
  bg.notes.push(overlap.note(partList(shared), tierName(web.tier)))
  if (amount >= bg.low) {
    bg.low = 0
    bg.high = 0
    bg.allIncluded = true
  } else {
    bg.low -= amount
    bg.high -= amount
  }
}

/** Hele tilbuddet: én linje pr. valgt ydelse, en samlet pris og fælles noter. */
export function quote({ selected, answers }) {
  const lines = selected.map((key) => line(key, answers))
  const web = lines.find((l) => l.key === 'hjemmeside')
  const bg = lines.find((l) => l.key === 'bookingGoogle')
  applyOverlap(web, bg)
  const hasBooking = [web, bg].some((l) => l?.tier.includes.includes('booking'))
  return {
    lines,
    notes: hasBooking ? [bookingSubscriptionNote] : [],
    total: {
      low: lines.reduce((s, l) => s + l.low, 0),
      high: lines.reduce((s, l) => s + l.high, 0),
      monthly: lines.reduce((s, l) => s + l.monthly, 0),
      custom: lines.some((l) => l.custom),
      noDrift: lines.some((l) => l.noDrift),
    },
  }
}

const plain = (n) => formatKr(n).replace(' kr.', '')

/** Engangsdelen og månedsdelen hver for sig: { once: "4.000 kr.", month: "300 kr./md" }. "ca. X–Y" kun ved buffer over 0. */
export function priceParts({ low, high, monthly }) {
  return {
    once: low ? (high > low ? `ca. ${plain(low)}–${formatKr(high)}` : formatKr(low)) : '',
    month: monthly ? `${formatKr(monthly)}/md` : '',
  }
}

/**
 * "4.000 kr. + 300 kr./md", "2.500 kr./md" eller "500 kr."
 * En linje, der er helt dækket af hjemmesidepakken, får overlap.allIncluded,
 * og en pris, der aftales, får calculator.customPrice (i totalen tilføjes
 * calculator.customTotal).
 */
export function priceText(price) {
  if (price.allIncluded) return overlap.allIncluded
  const { once, month } = priceParts(price)
  let base = once && month ? `${once} + ${month}` : once || month
  // Egen konto: "6.500 kr. i alt — ingen månedlig drift".
  if (price.noDrift && once && !month) base = `${once} ${calculator.noDriftSuffix}`
  if (price.custom) return base ? `${base} + ${calculator.customTotal}` : calculator.customPrice
  return base
}

/** Opsummering til SMS og mail. */
export function summaryLines(q) {
  const out = q.lines.map((l) => {
    const answers = l.chosen
      .filter((c) => c.option)
      .map((c) => `${c.question.short}: ${c.option.label}`)
      .join('; ')
    return `${l.service.name}, ${tierName(l.tier)}: ${priceText(l)} (${answers})`
  })
  if (q.lines.length > 1) out.push(`I alt: ${priceText(q.total)}`)
  return out
}

/** Noter til mailen: pr. ydelse og fælles (fx bookingabonnement). */
function allNotes(q) {
  return [...q.lines.flatMap((l) => l.notes), ...q.notes]
}

/** Sætning med punktum til sidst, også når prisen ender på "kr.". */
export const sentence = (text) => (text.endsWith('.') ? text : `${text}.`)

export function smsBody(q) {
  return [calculator.smsIntro, ...summaryLines(q)].join('\n')
}

export function mailBody(q) {
  return [
    ...calculator.mailIntro,
    '',
    ...summaryLines(q).map((s) => `- ${s}`),
    '',
    ...allNotes(q).map((n) => sentence(n)),
    `${calculator.finalNote}.`,
    '',
    ...calculator.mailOutro,
  ].join('\n')
}
