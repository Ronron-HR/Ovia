/* =========================================================================
   Beregnerens tekster. Priser, pakker og systemer kommer fra prices.json via
   lib/calculate.js; her står kun teksten omkring dem.
   ========================================================================= */
import prices from './prices.json' with { type: 'json' }

/** Første trin: Hvad har I brug for? `mail` er den linje, Ronny ser i mailen. */
export const needTitle = 'Hvad har I brug for?'
export const needs = [
  { key: 'site', title: 'En hjemmeside', desc: 'Vi laver en ny hjemmeside til jer, med Google-profil og det hele.', mail: 'Kun en hjemmeside' },
  {
    key: 'system',
    title: 'Et system til vores nuværende hjemmeside',
    desc: 'Fx booking, takeaway, gavekort eller noget bygget specielt til jer.',
    mail: 'Kun et system til deres nuværende hjemmeside',
  },
  { key: 'both', title: 'Begge dele', desc: 'En ny hjemmeside og funktioner til den, så det hænger sammen.', mail: 'Hjemmeside og system (begge dele)' },
]

/** Trinnenes navne i trin-baren. Hvilke trin der vises, afhænger af vejen (stepsFor i lib/calculate.js). */
export const stepLabels = { need: 'Behov', pkg: 'Pakke', sys: 'Funktioner', disc: 'Rabat', sum: 'Samlet pris' }

/** Teksten på knappen, der går til det næste trin (nøglen er det næste trin). */
export const nextLabels = { pkg: 'Næste: Vælg pakke', sys: 'Næste: Vælg funktioner', disc: 'Næste: Rabat', sum: 'Se samlet pris' }

/** Vises, hvis nogen åbner et gammelt link fra før pakkerne (se isOldLink i lib/calculate.js). */
export const oldLinkNotice = 'Beregneren er opdateret med nye pakker. Vælg dit tilbud igen.'

/** Guidet hjælp: tre spørgsmål. Spørgsmål 2 er flervalg og følger de almindelige funktioner i prices.json. */
export const helpQuestions = [
  { title: 'Hvor mange sider skal I bruge?', options: ['1–3 sider: menu, åbningstider og kontakt', 'Op til 6 sider', 'Så mange sider, som vi har brug for'] },
  { title: 'Hvad skal gæsterne kunne på siden?', options: prices.systems.standard.map((s) => s.name) },
  { title: 'Skal noget bygges specielt til jer?', options: ['Nej', 'Ja, én ting', 'Ved ikke endnu'] },
]
