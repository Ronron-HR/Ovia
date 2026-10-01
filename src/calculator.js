import { useSyncExternalStore } from 'react'
import { calculator, formatKr, services, tierName } from './data/pricing.js'

/**
 * PRISBEREGNERENS LOGIK — tilstand, pakkevalg, interval og opsummering.
 * Spørgsmål, svar og priser står i src/data/pricing.js.
 *
 * TILSTAND: kun i adresselinjen (?ydelser=hjemmeside,marketing&sider=2-5&…&trin=3),
 * sat med replaceState, så et link med valgene virker, og intet gemmes andre
 * steder. Ingen cookies, intet lager, intet sendes nogen steder hen.
 * Serveren og første klient-render får EMPTY (forudrendering og hydrering er ens).
 */

/** Ydelsernes rækkefølge i beregneren. */
export const ORDER = ['hjemmeside', 'marketing', 'bookingGoogle']
const RANK = ['start', 'vaekst', 'fuld-fart']

const allQuestions = ORDER.flatMap((key) => calculator.questions[key])

export const EMPTY = Object.freeze({ selected: [], answers: {}, step: 0 })

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

export function parse(search) {
  const q = new URLSearchParams(search)
  const wanted = (q.get('ydelser') ?? '').split(',')
  const selected = ORDER.filter((k) => wanted.includes(k))
  const answers = {}
  for (const question of allQuestions) {
    const v = q.get(question.id)
    if (question.options.some((o) => o.id === v)) answers[question.id] = v
  }
  return fit({ selected, answers, step: (Number(q.get('trin')) || 1) - 1 })
}

export function serialize({ selected, answers, step }) {
  const q = new URLSearchParams()
  if (selected.length) q.set('ydelser', selected.join(','))
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
let cache = { search: null, state: EMPTY }

function snapshot() {
  const { search } = window.location
  if (cache.search !== search) cache = { search, state: parse(search) }
  return cache.state
}

function subscribe(fn) {
  listeners.add(fn)
  window.addEventListener('popstate', fn)
  return () => {
    listeners.delete(fn)
    window.removeEventListener('popstate', fn)
  }
}

export function useCalc() {
  const state = useSyncExternalStore(subscribe, snapshot, () => EMPTY)
  const set = (next) => {
    const url = `${window.location.pathname}${serialize(fit(next))}${window.location.hash}`
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

  let once = 0
  let monthly = 0
  if (service.billing === 'monthly') {
    monthly = tier.price
  } else {
    once = tier.price + options.reduce((sum, o) => sum + (o.addon ? service.addons[o.addon].price : 0), 0)
    monthly = options.some((o) => o.noDrift) ? 0 : (tier.monthly ?? 0)
  }
  return {
    key,
    service,
    tier,
    chosen,
    low: once,
    high: once ? once + service.buffer : 0,
    monthly,
    notes: options.map((o) => o.note).filter(Boolean),
  }
}

/** Hele tilbuddet: én linje pr. valgt ydelse og en samlet pris. */
export function quote({ selected, answers }) {
  const lines = selected.map((key) => line(key, answers))
  return {
    lines,
    total: {
      low: lines.reduce((s, l) => s + l.low, 0),
      high: lines.reduce((s, l) => s + l.high, 0),
      monthly: lines.reduce((s, l) => s + l.monthly, 0),
    },
  }
}

const plain = (n) => formatKr(n).replace(' kr.', '')

/** Engangsdelen og månedsdelen hver for sig: { once: "ca. 5.500–6.500 kr.", month: "400 kr./md" }. */
export function priceParts({ low, high, monthly }) {
  return {
    once: low ? (high > low ? `ca. ${plain(low)}–${formatKr(high)}` : formatKr(low)) : '',
    month: monthly ? `${formatKr(monthly)}/md` : '',
  }
}

/** "ca. 5.500–6.500 kr. + 400 kr./md", "3.500 kr./md" eller "ca. 1.000–1.500 kr." */
export function priceText(price) {
  const { once, month } = priceParts(price)
  return once && month ? `${once} + ${month}` : once || month
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
    `${calculator.finalNote}.`,
    '',
    ...calculator.mailOutro,
  ].join('\n')
}
