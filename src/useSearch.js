import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}

/**
 * Adresselinjens søgedel (?emne=seo). Serveren og første klient-render får
 * en tom streng, så forudrenderingen og hydreringen er ens; derefter læser
 * React den rigtige værdi. Adresselinjen ændrer sig ikke, mens siden er åben,
 * uden at komponenten selv har gjort det (beregneren skriver med replaceState).
 */
export function useSearch() {
  return useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => '',
  )
}
