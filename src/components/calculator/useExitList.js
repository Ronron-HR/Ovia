import { useEffect, useState } from 'react'

/**
 * Holder fjernede elementer i listen, indtil deres udgangsanimation er færdig.
 *
 * Giver listen med `{ item, exiting }`. Et element, der var i forrige liste og nu mangler, bliver stående på sin gamle
 * plads med exiting = true i `ms` ms (CSS .fold folder det sammen), og forsvinder så. Kommer det tilbage inden da,
 * er det et almindeligt element igen. `items` skal have stabil identitet mellem renders (fx fra useMemo).
 * Uden bevægelse (prefers-reduced-motion) fjernes elementet med det samme.
 */
export function useExitList(items, keyOf, ms = 340) {
  const [state, setState] = useState({ prev: items, exiting: [] })
  if (state.prev !== items) {
    const keys = new Set(items.map(keyOf))
    const gone = state.prev.filter((i) => !keys.has(keyOf(i))).map((item) => ({ item, at: state.prev.indexOf(item) }))
    setState({ prev: items, exiting: [...state.exiting.filter((e) => !keys.has(keyOf(e.item))), ...gone] })
  }
  useEffect(() => {
    if (!state.exiting.length) return
    const timer = setTimeout(() => setState((s) => ({ ...s, exiting: [] })), ms)
    return () => clearTimeout(timer)
  }, [state.exiting, ms])

  const merged = items.map((item) => ({ item, exiting: false }))
  for (const { item, at } of state.exiting) merged.splice(Math.min(at, merged.length), 0, { item, exiting: true })
  return merged
}
