/* =========================================================================
   TEKST TIL ILLUSTRATIONERNE PÅ YDELSESSIDERNE
   Alt her er opdigtet eksempelindhold, mærket som eksempel på siden. Ingen
   rigtige virksomheder, placeringer eller resultater.
   ========================================================================= */

/* Bookingeksemplet (BookingDemo.jsx). Opdigtede tider og behandlinger uden
   priser. Intet sendes nogen steder, og der vises ingen bekræftelse. */
export const bookingDemo = {
  label: 'Eksempel på bookingflow',
  site: 'Eksempelsalon',
  step1: 'Vælg behandling',
  step2: 'Vælg dag og tidspunkt',
  services: [
    { id: 'klip', name: 'Herreklip', minutes: 30 },
    { id: 'skaeg', name: 'Skægtrim', minutes: 15 },
    { id: 'begge', name: 'Klip og skæg', minutes: 45 },
  ],
  days: [
    { id: 'man', short: 'Man', long: 'mandag', busy: ['09:00', '10:30', '13:00'] },
    { id: 'tir', short: 'Tir', long: 'tirsdag', busy: ['09:30', '11:00', '14:00', '14:30'] },
    { id: 'ons', short: 'Ons', long: 'onsdag', busy: ['10:00', '10:30', '15:00'] },
    { id: 'tor', short: 'Tor', long: 'torsdag', busy: ['09:00', '09:30', '12:30'] },
    { id: 'fre', short: 'Fre', long: 'fredag', busy: ['11:30', '12:00', '13:30'] },
  ],
  times: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30'],
  summary: {
    title: 'Dit valg',
    treatment: 'Behandling',
    when: 'Tid',
    empty: 'Vælg et tidspunkt',
    busy: 'Optaget',
    minutes: 'min.',
    note: 'Kun et eksempel. Der er ikke reserveret noget, og der sendes ingenting. I et rigtigt flow går valget videre til jeres eget bookingsystem.',
    hint: 'Nogle tider er optaget. Længere behandlinger kan ikke ligge oven i en optaget tid.',
  },
}

/* Søgeskitsen (SearchSketch.jsx): opdigtede navne, ikke et rigtigt resultat. */
export const searchSketch = {
  label: 'Eksempel: sådan kan en søgning se ud',
  note: 'Illustration med opdigtede navne. Den viser forskellen på de tre veje og er ikke et rigtigt søgeresultat eller en placering.',
  query: 'brunch nær mig',
  brand: 'Eksempelcafé',
  ad: {
    tag: 'Annonce',
    title: 'Eksempelcafé | Brunch i centrum',
    url: 'eksempelcafe.dk',
    text: 'Se menuen og find vej.',
  },
  profile: {
    kind: 'Café',
    hours: 'Åbningstider',
    actions: ['Rute', 'Ring', 'Hjemmeside'],
  },
  organic: {
    title: 'Menu og åbningstider | Eksempelcafé',
    url: 'eksempelcafe.dk › menu',
    text: 'Morgenmad, brunch og kaffe. Adresse og åbningstider.',
  },
  keys: [
    { n: 1, title: 'Google-virksomhedsprofil', text: 'Profilen med åbningstider, rute og opkald.' },
    { n: 2, title: 'SEO', text: 'Hjemmesidens eget resultat i søgningen.' },
    { n: 3, title: 'Annonce', text: 'Betalt placering øverst, markeret som annonce.' },
  ],
}

/* Diagrammer (FlowDiagram.jsx): en kæde af trin, der forklarer et forløb. */
export const flows = {
  ads: {
    label: 'Sådan hænger en søgeannonce sammen',
    note: 'Illustration af forløbet. Ingen tal og ingen forventning til, hvor mange der klikker.',
    steps: [
      { title: 'Nogen søger', text: 'Fx ”frisør Aarhus” eller ”brunch nær mig”.' },
      { title: 'Din annonce vises', text: 'Hvis søgningen passer til din kampagne og dit budget.' },
      { title: 'De klikker', text: 'Du betaler til Google for klikket, ikke for visningen.' },
      { title: 'De lander på din side', text: 'En side, der svarer på det, de søgte efter.' },
    ],
  },
  ai: {
    label: 'Eksempel: en henvendelse, der sorteres automatisk',
    note: 'Illustration af én mulig opsætning. Hvad der giver mening at automatisere, afhænger helt af din hverdag.',
    steps: [
      { title: 'Besked fra en kunde', text: 'Kommer ind via mail eller en formular.' },
      { title: 'Værktøjet sorterer', text: 'Fx booking, spørgsmål eller reklamation.' },
      { title: 'Du kigger på den', text: 'Et menneske godkender, før noget sendes til kunden.' },
      { title: 'Kunden får svar', text: 'Og oplysningerne står de rigtige steder.' },
    ],
  },
}

/* Illustration af annoncer på Meta og TikTok (SocialSketch.jsx). */
export const socialSketch = {
  label: 'Eksempel: to slags annoncer',
  note: 'Illustration med opdigtede navne og tekster. Den viser formatet, ikke et rigtigt resultat.',
  meta: {
    name: 'Meta',
    where: 'Facebook og Instagram',
    brand: 'Eksempelcafé',
    tag: 'Sponsoreret',
    text: 'Ny brunch i weekenden. Kom forbi.',
    button: 'Se menu',
  },
  tiktok: {
    name: 'TikTok',
    where: 'Korte videoer',
    brand: '@eksempelcafe',
    tag: 'Annonce',
    text: 'Sådan laver vi weekendens brunch.',
    button: 'Læs mere',
  },
}
