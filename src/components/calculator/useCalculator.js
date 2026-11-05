import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { clean, emptySelection, fromQuery, guidedHelp, toQuery } from '../../lib/calculate.js'
import { buildReceipt, mailtoHref, smsHref } from '../../lib/receipt.js'
import { oldLinkNotice } from '../../data/calculator.js'

/**
 * Beregnerens tilstand. Valget (selection) har samme form som calculate() i lib/calculate.js; resten er trin,
 * guidet hjælp og kvitteringsarket.
 *
 *   step 1 Pakke · 2 Systemer · 3 Tilvalg · 4 Opsummering
 *   help  null eller { q: 0..3, a: [svar 1, [svar 2 (flervalg)], svar 3] }; q 3 = forslaget
 */

export const initialState = {
  selection: emptySelection(),
  step: 1,
  help: null,
  sheet: false,
  notice: '',
}

/** Gør et trin gyldigt: uden pakke findes kun trin 1. */
function sane(state) {
  const step = state.selection.pkg === null ? 1 : state.step
  return step === state.step ? state : { ...state, step }
}

const withSelection = (state, patch) => sane({ ...state, selection: clean({ ...state.selection, ...patch }), notice: '' })

export function reducer(state, action) {
  const sel = state.selection
  switch (action.type) {
    case 'hydrate':
      return sane({ ...state, selection: action.selection, step: action.step, notice: '' })
    case 'oldLink':
      return { ...state, notice: oldLinkNotice }
    // Pakken er et valg mellem tre; et tryk på den valgte pakke fjerner den igen (så starter alt forfra).
    case 'togglePkg':
      return sane({ ...state, selection: sel.pkg === action.pkg ? emptySelection() : clean({ ...sel, pkg: action.pkg }), notice: '' })
    case 'toggleSystem': {
      const on = sel.systems.includes(action.key)
      return withSelection(state, { systems: on ? sel.systems.filter((k) => k !== action.key) : [...sel.systems, action.key] })
    }
    case 'setCustom':
      return withSelection(state, { custom: action.value })
    case 'toggleEnglish':
      return withSelection(state, { english: !sel.english })
    case 'toggleIntro':
      return withSelection(state, { intro: !sel.intro })
    case 'go':
      return sane({ ...state, step: action.step, help: null, sheet: false })
    case 'sheet':
      return { ...state, sheet: action.open }
    case 'next':
    case 'mNext':
      return sane({ ...state, step: Math.min(4, state.step + 1), help: null })
    case 'back':
    case 'mBack':
      if (state.help) return state.help.q > 0 ? { ...state, help: { ...state.help, q: state.help.q - 1 } } : { ...state, help: null }
      return sane({ ...state, step: Math.max(1, state.step - 1) })
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
      const L = 'ABCDE'
      const picked = guidedHelp({ q1: L[a[0]], q2: (a[1] || []).map((i) => L[i]), q3: L[a[2]] })
      return sane({ ...state, selection: picked, help: { q: 3, a }, notice: '' })
    }
    case 'helpToSummary':
      return sane({ ...state, step: 4, help: null })
    case 'helpCustomize':
      return sane({ ...state, step: 2, help: null })
    default:
      return state
  }
}

const QUERY_KEYS = ['p', 'y', 'c', 'e', 'i', 't', 'w', 'm', 'b', 'd', 'bk', 'x', 's']

/**
 * Hook til hele beregneren: tilstand, kvittering, del-link (opdateres med history.replaceState, aldrig pushState)
 * og mail/SMS.
 */
export function useCalculator() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const ready = useRef(false)

  // Efter hydrering: læs valget fra adresselinjen (del-link og knapper fra andre sider).
  useEffect(() => {
    const parsed = fromQuery(window.location.search)
    if (parsed.old) dispatch({ type: 'oldLink' })
    else if (parsed.selection.pkg !== null) dispatch({ type: 'hydrate', selection: parsed.selection, step: parsed.step })
    ready.current = true
  }, [])

  // Skriv valget til adresselinjen. Først når den er læst, så et link aldrig overskrives. Skrivningen venter til efter
  // billedet er malet, så et tryk ikke betaler for den.
  useEffect(() => {
    if (!ready.current) return
    let timer
    const frame = requestAnimationFrame(() => {
      timer = setTimeout(() => {
        // Et gammelt link står, til der vælges noget nyt.
        if (state.selection.pkg === null && state.notice) return
        const q = new URLSearchParams(window.location.search)
        QUERY_KEYS.forEach((k) => q.delete(k))
        new URLSearchParams(toQuery(state.selection, state.step)).forEach((v, k) => q.set(k, v))
        const search = q.toString()
        const next = window.location.pathname + (search ? '?' + search : '') + window.location.hash
        if (next !== window.location.pathname + window.location.search + window.location.hash) {
          window.history.replaceState(window.history.state, '', next)
        }
      }, 0)
    })
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
    }
  }, [state.selection, state.step, state.notice])

  // Formularen (lazy) hentes, når kunden er nået til Tilvalg: så er den klar, når opsummeringen vises, og trykket på
  // "Se opsummering" venter ikke på en netværkshentning (INP). Forsiden og de første trin henter den ikke.
  const nearSummary = state.step >= 3
  useEffect(() => {
    if (nearSummary) import('./InquiryForm.jsx')
  }, [nearSummary])

  const receipt = useMemo(() => buildReceipt(state.selection), [state.selection])

  const shareUrl = useCallback(() => {
    const base = typeof window === 'undefined' ? 'https://oviaspecs.com/' : window.location.origin + '/'
    const q = toQuery(state.selection, state.step)
    return base + (q ? '?' + q : '') + '#prisberegner'
  }, [state.selection, state.step])

  // Mail og SMS bygges først i browseren (del-linket kender adressen); på serveren et neutralt link.
  const hrefs = useMemo(() => {
    const url = shareUrl()
    return { mail: mailtoHref(state.selection, url), sms: smsHref(url), url }
  }, [shareUrl, state.selection])

  return { state, dispatch, receipt, hrefs, any: state.selection.pkg !== null }
}
