/* =========================================================================
   Beregnerens tekster. Priser, pakker og systemer kommer fra prices.json via
   lib/calculate.js; her står kun teksten omkring dem.
   ========================================================================= */
import prices from './prices.json' with { type: 'json' }

/** Første trin: Hvad har I brug for? `mail` er den linje, Ronny ser i mailen. */
export const needTitle = 'Hvad har I brug for?'
export const needs = [
  { key: 'site', title: 'Ny hjemmeside', desc: 'Vi laver en ny hjemmeside til jer, med Google-profil og det hele.', mail: 'Kun en ny hjemmeside' },
  {
    key: 'system',
    title: 'Løs et problem',
    desc: 'Et system, der tager det, der æder jeres tid. Fx at svare på mails, poste indhold eller tælle lageret. Kræver ikke en ny hjemmeside.',
    mail: 'Løs et problem (uden ny hjemmeside)',
  },
  { key: 'both', title: 'Begge dele', desc: 'En ny hjemmeside og et system, der tager det, der æder jeres tid, bygget sammen.', mail: 'Ny hjemmeside og en løsning på et problem (begge dele)' },
]

/** Trinnenes navne i trin-baren. Hvilke trin der vises, afhænger af vejen (stepsFor i lib/calculate.js). */
export const stepLabels = { need: 'Behov', pkg: 'Pakke', sys: 'Hvad skal løses?', sum: 'Samlet pris' }

/** Teksten på knappen, der går til det næste trin (nøglen er det næste trin). */
export const nextLabels = { pkg: 'Næste: Vælg pakke', sys: 'Næste: Hvad skal løses?', sum: 'Se samlet pris' }

/** Vises, hvis nogen åbner et gammelt link fra før pakkerne (se isOldLink i lib/calculate.js). */
export const oldLinkNotice = 'Beregneren er opdateret med nye pakker. Vælg dit tilbud igen.'

/** Guidet hjælp: tre spørgsmål. Spørgsmål 2 er flervalg og følger funktionerne i prices.json. */
export const helpQuestions = [
  { title: 'Hvor mange sider skal I bruge?', options: ['1–3 sider: menu, åbningstider og kontakt', 'Op til 6 sider', 'Så mange sider, som vi har brug for'] },
  { title: 'Hvad skal gæsterne selv kunne?', options: prices.systems.standard.map((s) => s.title) },
  { title: 'Skal noget bygges specielt til jer?', options: ['Nej', 'Ja, én ting', 'Ved ikke endnu'] },
]
