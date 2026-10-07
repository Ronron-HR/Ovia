import {
  bookingSubscriptionNote,
  calculator,
  components,
  driftPlans,
  formatKr,
  legacyDriftPlan,
  overlap,
  priceNote,
  services,
  tierName,
} from './data/pricing.js'

/**
 * PRISBEREGNERENS LOGIK — tilstand, pakkevalg og opsummering.
 * Spørgsmål, svar og priser står i src/data/pricing.js.
 *
 * TILSTAND: kun i adresselinjen (?ydelser=hjemmeside,marketing&sider=2-5&drift=plus&…&trin=3),
 * sat med replaceState (src/useCalc.js), så et link med valgene virker, og intet
 * gemmes andre steder. Ingen cookies, intet lager i browseren og ingen personoplysninger.
 * Filen er ren logik uden React og window, så workeren (worker/index.js) kan regne
 * den samme opsummering ud fra linket, når kunden sender forespørgslen.
 *
 * TRIN: trin 0 er valget af ydelser, derefter ét trin pr. valgt ydelse og til
 * sidst resultatet. Hjemmesiden har to trin (siderne og så driften): spørgsmål
 * med `page: 2` i pricing.js er et trin for sig (stepsFor).
 *
 * FORVALG: på ydelsessiderne er sidens ydelse valgt på forhånd (`defaults`).
 * Står der intet `ydelser` i adresselinjen, bruges forvalget; har kunden
 * fravalgt alt, skrives `ydelser=` (tom), så forvalget ikke kommer tilbage.
 *
 * DRIFT: hjemmesidens pakke (sider) og driftsvalget (basis, plus, ekstra eller
 * egen) er uafhængige. Driftsvalget har ingen standardværdi: mangler det, flytter
 * fit() kunden til driftstrinnet, og quote() regner ingen månedspris.
 */

/** Ydelsernes rækkefølge i beregneren. */
export const ORDER = ['hjemmeside', 'marketing', 'bookingGoogle']
const RANK = ['start', 'vaekst', 'fuld-fart']

const allQuestions = ORDER.flatMap((key) => calculator.questions[key])

export const EMPTY = Object.freeze({ selected: [], answers: {}, step: 0 })
export const NONE = Object.freeze([])

/* ---- Spørgsmål, trin og pakker ------------------------------------------ */

/** Spørgsmålene for en ydelse, der vises med de givne svar (`showIf` i pricing.js). */
export function visibleQuestions(key, answers) {
  return calculator.questions[key].filter(
    (q) => !q.showIf || Object.entries(q.showIf).every(([id, v]) => answers[id] === v),
  )
}

const optionOf = (q, answers) => q.options.find((o) => o.id === answers[q.id])

/**
 * Trinnene for de valgte ydelser (efter trin 0): { key, page } pr. trin. Spørgsmål
 * med samme `page` (standard 1) står i samme trin.
 */
export function stepsFor(selected) {
  return selected.flatMap((key) => {
    const pages = [...new Set(calculator.questions[key].map((q) => q.page ?? 1))].sort((a, b) => a - b)
    return pages.map((page) => ({ key, page }))
  })
}

/** Spørgsmålene, et trin viser lige nu. */
export const stepQuestions = (step, answers) =>
  visibleQuestions(step.key, answers).filter((q) => (q.page ?? 1) === step.page)

/** Resultatets trin (0-baseret): efter ydelsesvalget og alle ydelsernes trin. */
export const resultStep = (selected) => stepsFor(selected).length + 1

/** Pakken, svarene peger på: den højeste `tier` blandt de valgte svar. */
export function tierFor(key, answers) {
  const tiers = visibleQuestions(key, answers)
    .map((q) => optionOf(q, answers))
    .filter((o) => o && o.tier)
    .map((o) => RANK.indexOf(o.tier))
  return RANK[Math.max(0, ...tiers)]
}

/** Fjerner svar på skjulte spørgsmål (fx ekstra sider uden "Flere end 8 sider"). */
export function cleanAnswers(answers) {
  const out = { ...answers }
  for (const key of ORDER) {
    const visible = visibleQuestions(key, out)
    for (const q of calculator.questions[key]) {
      if (!visible.includes(q)) delete out[q.id]
    }
  }
  return out
}

/**
 * Skift pakke for én ydelse fra resultatet: pakkens svar (calculator.tierSwitch)
 * erstatter ydelsens svar, og resten (booking via siden, driftsvalget) beholdes
 * uændret. Ekstra sider ryddes bagefter, som ved ethvert svar.
 */
export function switchTier(key, tierId, answers) {
  return cleanAnswers({ ...answers, ...calculator.tierSwitch[key][tierId].answers })
}

/* ---- Adresselinje ------------------------------------------------------ */

/** Trinnet må ikke vise noget, der kræver svar, som mangler. */
export function fit(state) {
  const { selected } = state
  const answers = cleanAnswers(state.answers)
  const steps = stepsFor(selected)
  const last = steps.length + 1 // resultatet
  let step = Math.min(Math.max(0, state.step), last)
  if (!selected.length) return { ...state, answers, step: 0 }
  for (let i = 0; i < steps.length && step > i + 1; i++) {
    const missing = stepQuestions(steps[i], answers).some((q) => !answers[q.id])
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
  let step = (Number(q.get('trin')) || 1) - 1
  // Gamle links: drift=drift skifter til planen med samme månedspris som dengang
  // (Start/Vækst → Plus, Fuld fart → Ekstra). Uden sider kender vi ikke pakken, og
  // så gættes der ikke: kunden vælger selv. "trin" talte før hjemmesiden som ét trin.
  if (q.get('drift') === 'drift' && !answers.drift && answers.sider) {
    answers.drift = legacyDriftPlan[tierFor('hjemmeside', answers)]
    if (step >= selected.length + 1) step = resultStep(selected)
  }
  return fit({ selected, answers, step })
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

/* ---- Beregning ---------------------------------------------------------- */

const sum = (parts, field) => parts.reduce((s, p) => s + p[field], 0)

/**
 * Pris for én ydelse ud fra svarene. Alle priser er faste: `once` er det, der
 * betales nu (pakke + tilvalg), `monthly` det, der betales pr. måned. `parts`
 * er præcis det, der indgår i summen ([{ id, label, once, monthly }], fradrag
 * har negativt beløb), og `driftPlan` er hjemmesidens driftsplan (id eller null).
 */
function line(key, answers) {
  const service = services[key]
  const tierId = tierFor(key, answers)
  const tier = service.tiers.find((t) => t.id === tierId)
  const chosen = visibleQuestions(key, answers).map((q) => ({ question: q, option: optionOf(q, answers) }))
  const options = chosen.map((c) => c.option).filter(Boolean)
  const notes = options.map((o) => o.note).filter(Boolean)

  const packageLabel = `${service.name} ${tierName(tier)}`
  const parts = [
    service.billing === 'monthly'
      ? { id: tier.id, label: packageLabel, once: 0, monthly: tier.price }
      : { id: tier.id, label: packageLabel, once: tier.price, monthly: 0 },
  ]
  let driftPlan = null
  let noDrift = false
  let extraPagesCost = 0
  if (service.billing !== 'monthly') {
    for (const o of options) {
      const addon = o.addon && service.addons[o.addon]
      if (o.extraPages) {
        const page = service.addons.extraPage
        extraPagesCost = o.extraPages * page.price
        parts.push({ id: 'extraPage', label: `${o.extraPages} ${o.extraPages === 1 ? 'ekstra underside' : 'ekstra undersider'}`, once: extraPagesCost, monthly: 0 })
        notes.push(calculator.extraPagesNote(o.extraPages, formatKr(page.price)))
      } else if (addon) {
        parts.push({ id: o.addon, label: addon.short ?? addon.label, once: addon.price, monthly: 0 })
      }
      if (o.plan) {
        driftPlan = o.plan
        parts.push({ id: `drift-${o.plan}`, label: `Drift ${driftPlans[o.plan].name}`, once: 0, monthly: driftPlans[o.plan].monthly })
      }
      if (o.noDrift) noDrift = true
    }
  }
  const once = sum(parts, 'once')
  const monthly = sum(parts, 'monthly')
  // Det, hjemmesiden reelt indeholder: pakkens dele + booking, hvis den er valgt som tilvalg.
  const includes = [...new Set([...(tier.includes ?? []), ...options.filter((o) => o.addsBooking).map(() => 'booking')])]
  /** Hjemmesiden uden valgt drift: priserne er ufuldstændige (fit() sender kunden til driftstrinnet). */
  const driftMissing = key === 'hjemmeside' && chosen.some((c) => c.question.id === 'drift' && !c.option)
  return { key, service, tier, chosen, once, monthly, noDrift, driftPlan, driftMissing, parts, notes, includes, withoutExtraPages: once - extraPagesCost }
}

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)

/**
 * Komponenter tælles kun én gang: de dele af Booking & Google, der allerede er
 * med i den valgte hjemmesidepakke (`includes` i pricing.js), trækkes fra
 * Booking & Google-prisen, og noten siger, hvad og hvorfor (og fradraget står
 * som en negativ del i `parts`). Prisen bliver aldrig negativ: er hele pakken
 * dækket, koster den ingenting, linjen får `allIncluded`, og intet lægges til totalen.
 */
function applyOverlap(web, bg) {
  if (!web || !bg) return
  const shared = bg.tier.includes.filter((id) => web.includes.includes(id))
  if (!shared.length) return
  let left = bg.once
  for (const id of shared) {
    // Aldrig mere end det, der er tilbage: linjen bliver ikke negativ.
    const amount = Math.min(left, components[id].price)
    left -= amount
    bg.notes.push(overlap.note(capitalize(components[id].label), formatKr(amount), overlap.reasons[id](tierName(web.tier))))
    bg.parts.push({ id: `fradrag-${id}`, label: `Trukket fra: ${capitalize(components[id].label)}`, once: -amount, monthly: 0 })
  }
  bg.once = sum(bg.parts, 'once')
  if (bg.once === 0) bg.allIncluded = true
}

/** Hele tilbuddet: én linje pr. valgt ydelse, en samlet pris og fælles noter. */
export function quote({ selected, answers }) {
  const clean = cleanAnswers(answers)
  const lines = selected.map((key) => line(key, clean))
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

/** En del af en linjes pris som tekst (engangsbeløb, månedsbeløb med /md eller et fradrag med minus). */
export function partText({ once, monthly }) {
  if (once < 0) return `−${formatKr(-once)}`
  return [once && formatKr(once), monthly && `${formatKr(monthly)}/md`].filter(Boolean).join(' + ')
}

/** Totalen: engangsbeløbet + calculator.nowLabel og månedsbeløbet (et beløb på 0 udelades). */
export function totalText(total) {
  const { once, month } = priceParts(total)
  return [once && `${once} ${calculator.nowLabel}`, month].filter(Boolean).join(' + ')
}

/** Opsummering til SMS og mail: pakke, drift og beløb pr. ydelse og totalen. */
export function summaryLines(q) {
  const out = q.lines.map((l) => {
    const answers = l.chosen
      .filter((c) => c.option)
      .map((c) => `${c.question.short}: ${c.option.summary ?? c.option.label}`)
    if (l.driftMissing) answers.push('Drift: ikke valgt')
    return `${l.service.name}, ${tierName(l.tier)}: ${priceText(l)} (${answers.join('; ')})`
  })
  out.push(`I alt: ${totalText(q.total)}`)
  return out
}

/** Noter til mailen: pr. ydelse og fælles (fx bookingabonnement), hver som en sætning. */
export function quoteNotes(q) {
  return [...q.lines.flatMap((l) => l.notes), ...q.notes].map((n) => sentence(n))
}

/** Sætning med punktum til sidst, også når prisen ender på "kr.". */
export const sentence = (text) => (text.endsWith('.') ? text : `${text}.`)

/** SMS-kladden: indledning, opsummering og momsnoten. */
export function smsBody(q) {
  return [calculator.smsIntro, ...summaryLines(q), ...(priceNote ? [priceNote] : [])].join('\n')
}
