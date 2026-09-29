import { useSyncExternalStore } from 'react'

/**
 * Valgt emne i kontaktformularen. Ydelsesknapperne kalder setTopic, så emnet
 * allerede står valgt, når man lander i formularen. En lille ekstern store i
 * stedet for props eller context, fordi knapperne og formularen står i hver
 * sin sektion.
 *
 * Serveren (prerender) og første klient-render bruger begge 'andet', så
 * hydreringen passer. Ændringer sker kun ved klik.
 */
let topic = 'andet'
const listeners = new Set()

export function setTopic(next) {
  if (next === topic) return
  topic = next
  listeners.forEach((l) => l())
}

const subscribe = (l) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useTopic() {
  return useSyncExternalStore(subscribe, () => topic, () => 'andet')
}
