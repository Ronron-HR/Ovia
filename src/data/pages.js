/* =========================================================================
   Tekst og tabelrækker til /priser og /hjemmeside. Beløb og pakkenavne kommer
   fra prices.json; her står kun det, der ikke er et beløb.
   Vi beskriver, hvad vi GØR. Vi lover ingen placeringer på Google, flere gæster
   eller andre resultater.
   ========================================================================= */

const YES = 1
const NO = 0

/**
 * Prisoversigten: rækker, der sammenligner de tre pakker (i rækkefølgen i prices.json).
 * Hver række er [tekst, Start, Anbefalet, Max]; 1 = indgår (flueben), 0 = indgår ikke (–), tekst = værdi.
 */
export const compareRows = [
  ['Sider', '1–3', 'Op til 6', 'Efter behov'],
  ['Engelsk version', 'Tilvalg', 'Tilvalg', YES],
  ['Google-profil opsat og udfyldt', YES, YES, YES],
  ['Opslag på Google-profilen', NO, '1 pr. måned', '2 pr. måned'],
  ['Svar på anmeldelser', NO, NO, YES],
  ['Lokal SEO', 'Grundlæggende', 'Med lokale søgeord', 'Med kvartalsvis gennemgang'],
  ['Systemer med i pakken', 'Link til jeres eget', '1 standardsystem', '2 (højst 1 skræddersyet)'],
  ['Rettelser', 'Små tekst- og billedrettelser', '1 time pr. måned', '2 timer pr. måned'],
  ['Kort månedlig status', NO, NO, YES],
  ['Hosting, domæne og backup', YES, YES, YES],
]

/** Tilvalg på /priser: beløbene kommer fra prices.json (addons). `note` er sidens egen tekst. */
export const addonRows = [
  { key: 'extraStandard', note: 'Pr. ekstra standardsystem ud over dem, pakken har med.' },
  { key: 'custom', note: 'Ét afgrænset arbejdsflow bygget til jer. Mere end ét flow er flere tilvalg.' },
  { key: 'english', note: 'Til Start og Anbefalet. Indgår i Max.' },
  { key: 'buyout', note: 'Hvis I stopper driften og vil beholde siden.' },
]

/** /hjemmeside: hvad systemerne er, og hvad vi gør for Google og lokal SEO. */
export const systemExamples = [
  'Automatisk bekræftelse og overblik over catering- og selskabsforespørgsler.',
  'En intern oversigt over bestillinger.',
  'En simpel assistent, der svarer på åbningstider, menu og allergener ud fra jeres egne oplysninger.',
]

export const googleWork = [
  'Google-profilen opsættes og udfyldes: åbningstider, billeder, menu og kontaktoplysninger.',
  'Siden får det tekniske på plads: sidetitler, strukturerede data (LocalBusiness) og hurtig indlæsning på mobil.',
  'Med Anbefalet og Max arbejder vi også med lokale søgeord og opslag på Google-profilen.',
  'Vi lover ingen bestemte placeringer på Google. Vi beskriver, hvad vi gør, og gør det.',
]
