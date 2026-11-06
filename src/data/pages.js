/* =========================================================================
   Tekst og tabelrækker til /priser og /hjemmeside. Beløb og pakkenavne kommer
   fra prices.json; her står kun det, der ikke er et beløb.
   Vi beskriver, hvad vi GØR. Vi lover ingen placeringer på Google, flere gæster
   eller andre resultater.
   ========================================================================= */

import prices from './prices.json' with { type: 'json' }

const YES = 1
const NO = 0

/**
 * Prisoversigten: rækker, der sammenligner de tre pakker (i rækkefølgen i prices.json).
 * Hver række er [tekst, Start, Anbefalet, Max]; 1 = indgår (flueben), 0 = indgår ikke (–), tekst = værdi.
 * { group } er en overskrift i tabellen. Først selve hjemmesiden, så funktioner og Google, så drift og hjælp.
 */
export const compareRows = [
  { group: prices.website.title },
  ['Sider', ...prices.packages.map((p) => p.pages)],
  ...prices.website.parts.map((part) => [part, YES, YES, YES]),
  { group: 'Funktioner og Google' },
  ['Funktioner med i prisen', 'Link til jeres egen booking', '1 funktion', '2 (1 kan være bygget til jer)'],
  ['Jeres Google-profil sat op og udfyldt', YES, YES, YES],
  ['Opslag på Google-profilen', NO, '1 om måneden', '2 om måneden'],
  ['Svar på anmeldelser', NO, NO, YES],
  ['Bliv fundet lokalt på Google', 'Det grundlæggende', 'Også de ord, gæsterne søger på', 'Gennemgang hvert kvartal'],
  { group: 'Drift og hjælp' },
  ['Rettelser', 'Små rettelser af tekst og billeder', '1 time om måneden', '2 timer om måneden'],
  ['Kort status hver måned', NO, NO, YES],
  ['Drift, domæne og sikkerhedskopi', YES, YES, YES],
]

/** Ekstra ting på /priser: beløbene kommer fra prices.json (addons). `note` er sidens egen tekst. */
export const addonRows = [
  { key: 'extraStandard', note: 'Pr. ekstra funktion (fx gavekort), ud over dem pakken har med.' },
  { key: 'custom', note: 'Én afgrænset opgave, vi bygger til jer. Flere opgaver koster det samme pr. stk.' },
  { key: 'buyout', note: 'Hvis I stopper hos os og vil beholde siden. Så stopper den månedlige betaling.' },
]

/** Et system alene (uden ny hjemmeside) på /priser: beløbene kommer fra prices.json (systemOnly). */
export const systemOnlyRows = [
  { key: 'standard', note: 'Fx bordbooking, online bestilling, gavekort, nyhedsbrev eller anmeldelser. Pr. stk.' },
  { key: 'custom', note: 'Én afgrænset opgave, vi bygger til jer. Pr. stk.' },
]

/** /hjemmeside: hvad systemerne er, og hvad vi gør for Google og lokal SEO. */
export const systemExamples = [
  'Automatisk svar og overblik over forespørgsler på selskaber og catering.',
  'En oversigt over bestillinger til jer selv.',
  'En lille hjælper, der svarer gæster på åbningstider, menu og allergener ud fra jeres egne oplysninger.',
]

export const googleWork = [
  'Jeres Google-profil sættes op og udfyldes: åbningstider, billeder, menu og kontaktoplysninger.',
  'Siden gøres klar til at blive fundet lokalt: de rigtige titler, jeres adresse og åbningstider på en måde, Google kan læse, og hurtig indlæsning på mobil.',
  'Med Anbefalet og Max arbejder vi også med de ord, jeres gæster søger på, og med opslag på Google-profilen.',
  'Vi kan ikke love en bestemt placering på Google. Vi fortæller, hvad vi gør, og gør det.',
]
