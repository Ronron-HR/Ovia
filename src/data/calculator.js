/* =========================================================================
   Beregnerens tekster. Priser, pakker og systemer kommer fra prices.json via
   lib/calculate.js; her står kun teksten omkring dem.
   ========================================================================= */
import prices from './prices.json' with { type: 'json' }

/** Trinnene: pakke → funktioner → sprog og rabat → samlet pris. */
export const stepLabels = ['Pakke', 'Funktioner', 'Sprog og rabat', 'Samlet pris']

/** Vises, hvis nogen åbner et gammelt link fra før pakkerne (se isOldLink i lib/calculate.js). */
export const oldLinkNotice = 'Beregneren er opdateret med nye pakker. Vælg dit tilbud igen.'

/** Guidet hjælp: tre spørgsmål. Spørgsmål 2 er flervalg og følger standardsystemerne i prices.json. */
export const helpQuestions = [
  { title: 'Hvor mange sider skal I bruge?', options: ['1–3 sider: menu, åbningstider og kontakt', 'Op til 6 sider', 'Flere sider og en engelsk version'] },
  { title: 'Hvad skal gæsterne kunne på siden?', options: prices.systems.standard.map((s) => s.name) },
  { title: 'Skal noget bygges specielt til jer?', options: ['Nej', 'Ja, én ting', 'Ved ikke endnu'] },
]
