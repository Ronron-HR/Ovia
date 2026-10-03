import { useSyncExternalStore } from 'react'
import { EMPTY, NONE, ORDER, fit, parse, serialize } from './calculator.js'

/**
 * Prisberegnerens tilstand i adresselinjen (useSyncExternalStore). Serveren og
 * første klient-render får starttilstanden (forudrendering og hydrering er ens).
 */

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
