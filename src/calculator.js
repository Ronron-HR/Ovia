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

/* ---- Spørgsmål, der vises, og svar, der må vælges ----------------------- */

/** Spørgsmålene for en ydelse, der vises med de givne svar (`showIf` i pricing.js). */
export function visibleQuestions(key, answers) {
  return calculator.questions[key].filter(
    (q) => !q.showIf || Object.entries(q.showIf).every(([id, v]) => answers[id] === v),
  )
}

const optionOf = (q, answers) => q.options.find((o) => o.id === answers[q.id])

/**
 * Pakken, svarene peger på: den højeste `tier` blandt de valgte svar. Svar med
 * `onlyTiers` (fx egen konto) bestemmer ikke pakken, de begrænses af den.
 */
export function tierFor(key, answers) {
  const tiers = visibleQuestions(key, answers)
    .map((q) => optionOf(q, answers))
    .filter((o) => o && o.tier)
    .map((o) => RANK.indexOf(o.tier))
  return RANK[Math.max(0, ...tiers)]
}

/**
 * Får hjemmesiden booking? Enten valgt direkte ("booke via siden: Ja") eller via
 * Booking & Google Vækst/Fuld fart sammen med hjemmesiden. Booking betyder altid drift.
 */
export function bookingOnWebsite(selected, answers) {
  if (!selected.includes('hjemmeside')) return false
  const web = calculator.questions.hjemmeside.flatMap((q) => q.options.filter((o) => o.addsBooking && answers[q.id] === o.id))
  if (web.length) return true
  if (!selected.includes('bookingGoogle')) return false
  const bg = services.bookingGoogle.tiers.find((t) => t.id === tierFor('bookingGoogle', answers))
  return bg.includes.includes('booking')
}

/**
 * Hvorfor svaret ikke kan vælges (tom = det kan). `onlyTiers`: kun med de pakker
 * (egen konto: Start og Vækst, ellers "Fuld fart kører med drift").
 * `notWithBooking`: ikke når hjemmesiden får booking.
 */
export function blockedReason(option, tierId, booking = false) {
  if (option.onlyTiers && !option.onlyTiers.includes(tierId)) return option.disabledNotes?.tier ?? ' '
  if (option.notWithBooking && booking) return option.disabledNotes?.booking ?? ' '
  return ''
}

/** Må svaret vælges? */
export const allowed = (option, tierId, booking = false) => !blockedReason(option, tierId, booking)

/**
 * Fjerner svar på skjulte spørgsmål. Et svar, der ikke er tilladt (fx egen konto
 * til Fuld fart eller sammen med booking), skiftes til spørgsmålets `fallback`
 * (drift) eller fjernes, hvis der ikke er en.
 */
export function cleanAnswers(answers, selected = ORDER) {
  const out = { ...answers }
  const booking = bookingOnWebsite(selected, out)
  for (const key of ORDER) {
    const visible = visibleQuestions(key, out)
    for (const q of calculator.questions[key]) {
      if (!visible.includes(q)) delete out[q.id]
    }
    const tier = tierFor(key, out)
    for (const q of visible) {
      const o = optionOf(q, out)
      if (o && !allowed(o, tier, key === 'hjemmeside' && booking)) {
        if (q.fallback) out[q.id] = q.fallback
        else delete out[q.id]
      }
    }
  }
  return out
}

/* ---- Adresselinje ------------------------------------------------------ */

/** Trinnet må ikke vise noget, der kræver svar, som mangler. */
function fit(state) {
  const { selected } = state
  const answers = cleanAnswers(state.answers, selected)
  const last = selected.length + 1 // resultatet
  let step = Math.min(Math.max(0, state.step), last)
  if (!selected.length) return { ...state, answers, step: 0 }
  for (let i = 0; i < selected.length && step > i + 1; i++) {
    const missing = visibleQuestions(selected[i], answers).some((q) => !answers[q.id])
    if (missing) step = i + 1
  }
  return { ...state, answers, step }
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
    for (const question of visibleQuestions(key, answers)) {
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

/**
 * Pris for én ydelse ud fra svarene. Alle priser er faste: `once` er det, der
 * betales nu (pakke + tilvalg), `monthly` det, der betales pr. måned.
 */
function line(key, answers, booking = false) {
  const service = services[key]
  const tierId = tierFor(key, answers)
  const tier = service.tiers.find((t) => t.id === tierId)
  const chosen = visibleQuestions(key, answers).map((q) => ({ question: q, option: optionOf(q, answers) }))
  // Svar, der ikke er tilladt med pakken (fx egen konto til Fuld fart), tæller ikke.
  const options = chosen.map((c) => c.option).filter((o) => o && allowed(o, tierId, booking))
  const notes = options.map((o) => o.note).filter(Boolean)

  let once = 0
  let monthly = 0
  let noDrift = false
  let extraPagesCost = 0
  if (service.billing === 'monthly') {
    monthly = tier.price
  } else {
    once = tier.price
    for (const o of options) {
      const addon = o.addon && service.addons[o.addon]
      if (addon) once += addon.price
      if (o.extraPages) {
        const page = service.addons.extraPage
        extraPagesCost = o.extraPages * page.price
        once += extraPagesCost
        notes.push(calculator.extraPagesNote(o.extraPages, formatKr(page.price)))
      }
    }
    noDrift = options.some((o) => o.noDrift)
    monthly = noDrift ? 0 : (tier.monthly ?? 0)
    // Hvorfor hjemmesiden kører med drift: Fuld fart, ellers booking (Start/Vækst).
    if (key === 'hjemmeside') {
      if (!service.addons.ownAccount.tiers.includes(tier.id)) notes.push(calculator.driftFuldFart)
      else if (booking || options.some((o) => o.addsBooking)) notes.push(calculator.driftWithBooking)
    }
  }
  // Det, hjemmesiden reelt indeholder: pakkens dele + booking, hvis den er valgt som tilvalg.
  const includes = [...new Set([...(tier.includes ?? []), ...options.filter((o) => o.addsBooking).map(() => 'booking')])]
  /** Prisen uden ekstra sider ud over 8 (loftet for hjemmesider uden integrationer). */
  const withoutExtraPages = once - extraPagesCost
  return { key, service, tier, chosen, once, monthly, noDrift, notes, includes, withoutExtraPages }
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
 * Booking & Google-prisen, og noten siger, hvad og hvorfor. Prisen bliver
 * aldrig negativ: er hele pakken dækket, koster den ingenting, linjen får
 * `allIncluded`, og intet lægges til totalen.
 */
function applyOverlap(web, bg) {
  if (!web || !bg) return
  const shared = bg.tier.includes.filter((id) => web.includes.includes(id))
  if (!shared.length) return
  const amount = Math.min(bg.once, shared.reduce((sum, id) => sum + components[id].price, 0))
  bg.notes.push(overlap.note(partList(shared), formatKr(amount), tierName(web.tier)))
  bg.once = Math.max(0, bg.once - amount)
  if (bg.once === 0) bg.allIncluded = true
}

/** Hele tilbuddet: én linje pr. valgt ydelse, en samlet pris og fælles noter. */
export function quote({ selected, answers }) {
  const clean = cleanAnswers(answers, selected)
  const booking = bookingOnWebsite(selected, clean)
  const lines = selected.map((key) => line(key, clean, key === 'hjemmeside' && booking))
  const web = lines.find((l) => l.key === 'hjemmeside')
  const bg = lines.find((l) => l.key === 'bookingGoogle')
  applyOverlap(web, bg)
  const hasBooking = [web, bg].some((l) => l?.includes.includes('booking'))
  return {
    lines,
    notes: hasBooking ? [bookingSubscriptionNote] : [],
    total: {
      once: lines.reduce((s, l) => s + l.once, 0),
      monthly: lines.reduce((s, l) => s + l.monthly, 0),
      noDrift: lines.some((l) => l.noDrift),
    },
  }
}

/** Engangsdelen og månedsdelen hver for sig som tekst (formatKr); et beløb på 0 giver tom tekst. */
export function priceParts({ once, monthly }) {
  return {
    once: once ? formatKr(once) : '',
    month: monthly ? `${formatKr(monthly)}/md` : '',
  }
}

/**
 * En linjes pris: engangsbeløb + månedsbeløb, kun månedsbeløb eller kun
 * engangsbeløb. Egen konto: beløbet + calculator.noDriftSuffix. En Booking & Google-
 * linje, der er helt dækket af hjemmesiden, får overlap.allIncluded.
 */
export function priceText(price) {
  if (price.allIncluded) return overlap.allIncluded
  const { once, month } = priceParts(price)
  if (price.noDrift && once && !month) return `${once} ${calculator.noDriftSuffix}`
  return once && month ? `${once} + ${month}` : once || month
}

/** Totalen: engangsbeløbet + calculator.nowLabel og månedsbeløbet (et beløb på 0 udelades). */
export function totalText(total) {
  const { once, month } = priceParts(total)
  return [once && `${once} ${calculator.nowLabel}`, month].filter(Boolean).join(' + ')
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
  out.push(`I alt: ${totalText(q.total)}`)
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
    ...(calculator.finalNote ? [sentence(calculator.finalNote)] : []),
    '',
    ...calculator.mailOutro,
  ].join('\n')
}
