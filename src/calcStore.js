import { useSyncExternalStore } from 'react'
import { businessTypes, demoById, pageOptions, purposes } from './content.js'

/**
 * BEREGNERENS TILSTAND — ét sted, brugt af forsiden og /prisberegner/.
 *
 * Tilstanden er kundens valg (formål, sideantal, valgfri virksomhedstype og
 * et eventuelt demovalg) plus hvilket trin, der vises. Den lever to steder:
 *
 *   - adresselinjen (?formaal=…&sider=…&demo=…&trin=…), som sættes med
 *     replaceState. Stien ændres aldrig: forsiden bliver på "/", og
 *     /prisberegner/ bliver på /prisberegner/. Et link med valgene virker altså.
 *   - sessionStorage, så valgene følger med, når kunden skifter mellem forsiden,
 *     /prisberegner/ og en demo i samme browserfane, og ved genindlæsning.
 *     Det ligger kun i den enkelte fane, forlader aldrig browseren og forsvinder,
 *     når fanen lukkes. Der er ingen cookies.
 *
 * Adresselinjen vinder over lageret for de felter, den nævner (fx ?demo=cafe
 * fra en demo). Ukendte eller udgåede værdier, også gamle demoer, ignoreres, så
 * beregningen bliver neutral.
 *
 * Serveren og første klient-render får EMPTY (forudrenderingen og hydreringen er
 * ens); derefter læser React den rigtige tilstand.
 */

const KEY = 'oviaspecs-beregner'
const PARAMS = ['virksomhed', 'formaal', 'sider', 'demo', 'trin']

export const EMPTY = Object.freeze({ type: '', purpose: '', pages: '', demo: '', step: 1 })

const has = (list, id) => list.some((x) => x.id === id)

/** Kun gyldige værdier slipper igennem. */
function clean(raw = {}) {
  const demo = demoById(String(raw.demo ?? ''))
  return {
    type: has(businessTypes, raw.type) ? raw.type : '',
    purpose: has(purposes, raw.purpose) ? raw.purpose : '',
    pages: has(pageOptions, raw.pages) ? raw.pages : '',
    demo: demo?.id ?? '',
    step: Number(raw.step) || 1,
  }
}

/** Trinnet må ikke vise noget, der kræver svar, som mangler. */
function fit(s) {
  const step = s.step >= 3 && s.purpose && s.pages ? 3 : s.step >= 2 && s.purpose ? 2 : 1
  return { ...s, step }
}

function fromUrl(search) {
  const q = new URLSearchParams(search)
  const found = PARAMS.filter((k) => q.has(k))
  const demo = demoById(q.get('demo') ?? '')
  const out = {}
  if (has(businessTypes, q.get('virksomhed'))) out.type = q.get('virksomhed')
  if (has(purposes, q.get('formaal'))) out.purpose = q.get('formaal')
  if (has(pageOptions, q.get('sider'))) out.pages = q.get('sider')
  if (demo) out.demo = demo.id
  if (Number(q.get('trin'))) out.step = Number(q.get('trin'))
  return { out, found, demo }
}

function load() {
  let stored = {}
  try {
    stored = JSON.parse(window.sessionStorage.getItem(KEY) ?? '{}') ?? {}
  } catch {
    /* lager ikke tilgængeligt: fortsæt uden */
  }
  const { out, demo } = fromUrl(window.location.search)
  const merged = { ...clean(stored), ...out }
  // Et demovalg udfylder det, kunden ikke selv har svaret på.
  if (demo) {
    if (!out.type && !stored.type && demo.calcType) merged.type = demo.calcType
    if (!out.purpose && !stored.purpose && demo.calcPurpose) merged.purpose = demo.calcPurpose
  }
  // Et nyt demovalg fra adresselinjen starter ved første trin.
  if (out.demo && out.step == null && out.demo !== clean(stored).demo) merged.step = 1
  return fit(merged)
}

let current = EMPTY
let loaded = false
const listeners = new Set()

function ensure() {
  if (!loaded && typeof window !== 'undefined') {
    loaded = true
    current = load()
    // Adresselinjen og lageret gøres ens med det samme (fjerner fx ukendte demoer).
    persist(current)
  }
  return current
}

/** Adresse med kundens valg, på den side, kunden står på. */
function urlFor(s) {
  const q = new URLSearchParams(window.location.search)
  PARAMS.forEach((k) => q.delete(k))
  if (s.type) q.set('virksomhed', s.type)
  if (s.purpose) q.set('formaal', s.purpose)
  if (s.pages) q.set('sider', s.pages)
  if (s.demo) q.set('demo', s.demo)
  if (s.step > 1) q.set('trin', String(s.step))
  const qs = q.toString()
  return `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`
}

function persist(s) {
  try {
    const empty = !s.type && !s.purpose && !s.pages && !s.demo && s.step === 1
    if (empty) window.sessionStorage.removeItem(KEY)
    else window.sessionStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* ikke tilgængeligt: adresselinjen bærer valgene */
  }
  try {
    const next = urlFor(s)
    if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(window.history.state, '', next)
    }
  } catch {
    /* ignoreres */
  }
}

function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Sæt (en del af) tilstanden. Trinnet tilpasses til, hvad der er besvaret. */
export function setCalc(patch) {
  const next = fit({ ...ensure(), ...patch })
  current = next
  persist(next)
  listeners.forEach((fn) => fn())
}

export function resetCalc() {
  setCalc({ ...EMPTY })
}

export function useCalc() {
  return useSyncExternalStore(subscribe, ensure, () => EMPTY)
}
