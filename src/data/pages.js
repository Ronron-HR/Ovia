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
  ['Bordbooking og online bestilling', 'Kan lægges til (link til jeres egen booking er med)', 'Én af dem er med', 'Begge er med'],
  ['Jeres Google-profil sat op og udfyldt', YES, YES, YES],
  ['Opslag på Google-profilen', NO, '1 om måneden', '2 om måneden'],
  ['Svar på anmeldelser', NO, NO, YES],
  ['Bliv fundet lokalt på Google', 'Det grundlæggende', 'Også de ord, gæsterne søger på', 'Gennemgang hvert kvartal'],
  { group: 'Drift og hjælp' },
  ['Rettelser', 'Små rettelser af tekst og billeder', '1 time om måneden', '2 timer om måneden'],
  ['Kort status hver måned', NO, NO, YES],
  ['Drift, domæne og sikkerhedskopi', YES, YES, YES],
]

/**
 * Ekstra ting på /priser: beløbene kommer fra prices.json (systems.standard, systems.custom og addons.buyout). `note` er sidens egen tekst.
 * En funktion koster det samme, hvad enten den lægges til en pakke (ud over dem, pakken har med) eller købes alene.
 */
export const addonRows = [
  { key: 'booking', note: 'Ud over de funktioner, pakken har med.' },
  { key: 'bestilling', note: 'Ud over de funktioner, pakken har med.' },
  { key: 'custom', note: 'Et system, vi bygger efter jeres behov. Prisen aftales.' },
  { key: 'buyout', note: 'Hvis I stopper hos os og vil beholde siden. Så stopper den månedlige betaling.' },
]

/** At løse et problem uden ny hjemmeside, på /priser: beløbene kommer fra prices.json (systems). */
export const systemOnlyRows = [
  { key: 'booking', note: 'Gæsterne booker selv, så I får færre opkald.' },
  { key: 'bestilling', note: 'Gæsterne bestiller selv til afhentning eller levering.' },
  { key: 'custom', note: 'Noget andet, vi bygger til jer. Prisen aftales.' },
]

/** /hjemmeside: hvad vi gør for Google og lokal SEO. (Idéerne til, hvad der kan bygges, står i prices.json: systems.custom.ideas.) */

export const googleWork = [
  'Jeres Google-profil sættes op og udfyldes: åbningstider, billeder, menu og kontaktoplysninger.',
  'Siden gøres klar til lokale søgninger: de rigtige titler, adresse og åbningstider i en form, Google kan læse, og hurtig indlæsning på mobil.',
  'Med Anbefalet og Max arbejder vi også med de ord, jeres gæster søger på, og med opslag på Google-profilen.',
  'Vi kan ikke love en bestemt placering på Google. Vi fortæller, hvad vi gør, og gør det.',
]
