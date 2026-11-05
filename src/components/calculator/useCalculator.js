import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { fromQuery, guidedHelp, toQuery } from '../../lib/calculate.js'
import { buildReceipt, mailtoHref, smsHref } from '../../lib/receipt.js'
import { SERVICE_KEYS } from '../../data/calculator.js'

/**
 * Beregnerens tilstand. Valget (selection) har samme form som calculate() i
 * lib/calculate.js; resten er trin, delskridt på mobil, guidet hjælp og kvitteringsarket.
 *
 *   step 1 Ydelser · 2 Pakker · 3 Drift og tilvalg · 4 Opsummering
 *   sub   mobil: hvilken ydelse (trin 2) eller delskridt (trin 3: 0 drift, 1 tilvalg)
 *   help  null eller { q: 0..3, a: [svar 1, [svar 2 (flervalg)], svar 3] }; q 3 = forslaget
 */

const EMPTY = { services: { web: null, mkt: null, book: null }, drift: 'basis', bookingAddon: false, extraPages: 0 }

export const initialState = {
  selection: EMPTY,
  step: 1,
  sub: 0,
  help: null,
  sheet: false,
}

const chosen = (sel) => SERVICE_KEYS.filter((k) => sel.services[k] !== null)

/** Gør et trin gyldigt for det valg, der er: ingen ydelser → 1, trin 3 kræver hjemmeside. */
function sane(state) {
  const sel = state.selection
  const n = chosen(sel).length
  let { step, sub } = state
  if (!n) step = 1
  else if (step === 3 && sel.services.web === null) step = 2
  if (step === 2) sub = Math.min(sub, Math.max(0, n - 1))
  return step === state.step && sub === state.sub ? state : { ...state, step, sub }
}

const withSelection = (state, patch) => ({ ...state, selection: { ...state.selection, ...patch } })

export function reducer(state, action) {
  const sel = state.selection
  switch (action.type) {
    case 'hydrate': {
      return sane({ ...state, selection: action.selection, step: action.step, sub: 0 })
    }
    case 'setService': {
      const services = { ...sel.services, [action.key]: action.value }
      const extraPages = action.key === 'web' && action.value !== 2 ? 0 : sel.extraPages
      return sane({ ...state, selection: { ...sel, services, extraPages } })
    }
    case 'toggleService':
      return reducer(state, { type: 'setService', key: action.key, value: sel.services[action.key] === null ? 1 : null })
    case 'setDrift':
      return withSelection(state, { drift: action.drift })
    case 'toggleBooking':
      return sel.services.book !== null && sel.services.book >= 1 ? state : withSelection(state, { bookingAddon: !sel.bookingAddon })
    case 'setExtra':
      return withSelection(state, { extraPages: Math.max(0, Math.min(20, action.value)) })
    case 'upgradeFull':
      return reducer(state, { type: 'setService', key: 'web', value: 2 })
    case 'go':
      return sane({ ...state, step: action.step, sub: 0, help: null, sheet: false })
    case 'sheet':
      return { ...state, sheet: action.open }
    // Mobil: ét delskridt ad gangen.
    case 'mNext': {
      const n = chosen(sel).length
      const web = sel.services.web !== null
      if (state.step === 1) return n ? { ...state, step: 2, sub: 0 } : state
      if (state.step === 2) return state.sub < n - 1 ? { ...state, sub: state.sub + 1 } : { ...state, step: web ? 3 : 4, sub: 0 }
      if (state.step === 3) return state.sub === 0 ? { ...state, sub: 1 } : { ...state, step: 4, sub: 0 }
      return state
    }
    case 'mBack': {
      const n = chosen(sel).length
      const web = sel.services.web !== null
      if (state.help) return state.help.q > 0 ? { ...state, help: { ...state.help, q: state.help.q - 1 } } : { ...state, help: null }
      if (state.step === 4) return web ? { ...state, step: 3, sub: 1 } : { ...state, step: 2, sub: Math.max(0, n - 1) }
      if (state.step === 3) return state.sub === 1 ? { ...state, sub: 0 } : { ...state, step: 2, sub: Math.max(0, n - 1) }
      if (state.step === 2) return state.sub > 0 ? { ...state, sub: state.sub - 1 } : { ...state, step: 1, sub: 0 }
      return state
    }
    // Desktop: Næste/Tilbage mellem hele trin.
    case 'next':
      return sane({ ...state, step: state.step === 1 ? 2 : state.step === 2 ? (sel.services.web !== null ? 3 : 4) : 4, sub: 0, help: null })
    case 'back':
      return sane({ ...state, step: state.step === 4 ? (sel.services.web !== null ? 3 : 2) : Math.max(1, state.step - 1), sub: 0, help: null })
    // Guidet hjælp.
    case 'helpStart':
      return { ...state, help: { q: 0, a: [] } }
    case 'helpClose':
      return { ...state, help: null }
    case 'helpPrev':
      return state.help ? { ...state, help: { ...state.help, q: Math.max(0, state.help.q - 1) } } : state
    case 'helpNextQ':
      return state.help && (state.help.a[1] || []).length ? { ...state, help: { ...state.help, q: 2 } } : state
    case 'helpAnswer': {
      if (!state.help) return state
      const { q } = state.help
      const a = [...state.help.a]
      if (q === 1) {
        const cur = a[1] || []
        a[1] = cur.includes(action.i) ? cur.filter((x) => x !== action.i) : cur.concat(action.i).sort()
        return { ...state, help: { q: 1, a } }
      }
      a[q] = action.i
      if (q < 2) return { ...state, help: { q: q + 1, a } }
      // Sidste svar: forslaget lægges direkte i beregneren, og tallene ruller.
      const L = 'ABC'
      const picked = guidedHelp({ q1: L[a[0]], q2: (a[1] || []).map((i) => L[i]), q3: L[a[2]] })
      return sane({ ...state, selection: picked, help: { q: 3, a } })
    }
    case 'helpToSummary':
      return sane({ ...state, step: 4, sub: 0, help: null })
    case 'helpCustomize':
      return sane({ ...state, step: 2, sub: 0, help: null })
    default:
      return state
  }
}

const QUERY_KEYS = ['w', 'm', 'b', 'd', 'bk', 'x', 's']

/**
 * Hook til hele beregneren: tilstand, kvittering, del-link (opdateres med
 * history.replaceState, aldrig pushState) og mail/SMS.
 */
export function useCalculator() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const ready = useRef(false)

  // Efter hydrering: læs valget fra adresselinjen (del-link og knapper fra andre sider).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (q.has('w') || q.has('m') || q.has('b')) {
      const { selection, step } = fromQuery(window.location.search)
      dispatch({ type: 'hydrate', selection, step })
    }
    ready.current = true
  }, [])

  // Skriv valget til adresselinjen. Først når den er læst, så et link aldrig overskrives.
  useEffect(() => {
    if (!ready.current) return
    const q = new URLSearchParams(window.location.search)
    QUERY_KEYS.forEach((k) => q.delete(k))
    new URLSearchParams(toQuery(state.selection, state.step)).forEach((v, k) => q.set(k, v))
    const search = q.toString()
    const next = window.location.pathname + (search ? '?' + search : '') + window.location.hash
    if (next !== window.location.pathname + window.location.search + window.location.hash) {
      window.history.replaceState(window.history.state, '', next)
    }
  }, [state.selection, state.step])

  const receipt = useMemo(() => buildReceipt(state.selection), [state.selection])

  const shareUrl = useCallback(() => {
    const base = typeof window === 'undefined' ? 'https://oviaspecs.com/' : window.location.origin + window.location.pathname
    const q = toQuery(state.selection, state.step)
    return base + (q ? '?' + q : '')
  }, [state.selection, state.step])

  // Mail og SMS bygges først i browseren (del-linket kender adressen); på serveren et neutralt link.
  const hrefs = useMemo(() => {
    const url = shareUrl()
    return { mail: mailtoHref(state.selection, url), sms: smsHref(url), url }
  }, [shareUrl, state.selection])

  return { state, dispatch, receipt, hrefs, any: chosen(state.selection).length > 0, chosenKeys: chosen(state.selection) }
}
