/* =========================================================================
   YDELSESSIDER: HJEMMESIDER OG BOOKING/INTEGRATIONER
   Regler (samme som i content.js):
   - Kun hjemmesiden har en pris (pricing i content.js). Alt andet aftales
     personligt og har ingen pris, bindingsperiode eller abonnement på siden.
   - Ingen løfter om resultater. Eksempler er mulige løsninger, ikke cases.
   ========================================================================= */

import { paths } from './content.js'

const contactCta = (topic, label = 'Beskriv din opgave') => ({ label, topic })

export const hjemmesider = {
  path: paths.hjemmesider,
  metaTitle: 'Hjemmesider til virksomheder | OviaSpecs',
  metaDescription:
    'Få en mobiltilpasset hjemmeside, bygget i kode og tilpasset din virksomhed. Se hvad der er med, se demoer og beregn prisen på selve hjemmesiden.',
  eyebrow: 'Hjemmesider',
  title: 'En hjemmeside, der gør det nemt at tage kontakt.',
  lead: 'Kunden leder efter åbningstider, menu eller en måde at skrive på. Jeg bygger hjemmesiden, så det står øverst, og så den er let at bruge på telefonen.',
  primary: { label: 'Beregn din hjemmesidepris', href: paths.beregner },
  secondary: { label: 'Se demoer', href: paths.demoer },
  visual: 'demos',
  need: {
    eyebrow: 'Behovet',
    title: 'Folk søger fra telefonen, og de vil hurtigt vide, om I er det rigtige sted.',
    body: [
      'En god hjemmeside svarer på de få ting, kunden faktisk leder efter: hvad I laver, hvornår der er åbent, hvad det kan koste, og hvordan man kommer i kontakt. Resten er pynt.',
      'Er siden gammel, svær at bruge på telefon eller svær at finde rundt i, går kunden videre til den næste.',
    ],
  },
  solution: {
    eyebrow: 'Løsningen',
    title: 'Jeg tegner og koder siden selv, uden en færdig skabelon.',
    intro:
      'Vi starter med, hvad siden skal hjælpe med. Derefter vælger vi sider og indhold, og jeg bygger det, så siden bliver hurtig og passer til jeres udtryk.',
    parts: [
      { title: 'Indhold først', text: 'Vi vælger de sider og oplysninger, der hjælper kunden. Ikke flere, end der er brug for.' },
      { title: 'Design efter virksomheden', text: 'Farver, skrift og stemning tilpasses, så siden ligner jer og ikke en standardskabelon.' },
      { title: 'Bygget til telefonen', text: 'Siden tegnes først til en lille skærm og udvides derefter til computeren.' },
    ],
  },
  deliver: {
    eyebrow: 'Det får du',
    title: 'Standardhjemmesiden',
    items: [
      'Mobiltilpasset design med ét fælles design til alle sider',
      'De aftalte almindelige indholdssider, op til seks med forsiden',
      'Sidetitler og metabeskrivelser til hver side',
      'Den aftalte kontaktmulighed på siden',
      'To samlede korrekturrunder inden for det aftalte omfang',
    ],
    limitsTitle: 'Afgrænsning',
    limits: [
      'Tekst og billeder leverer du. Skal jeg hjælpe med indholdet, aftaler vi det separat.',
      'Ekstra sider, nye funktioner og større ændringer uden for aftalen er ekstraarbejde med et særskilt tilbud. Vedligeholdelse omfatter ikke automatisk nye sider eller et nyt design.',
      'Booking, integrationer, marketing og vedligeholdelse er ikke med i prisen. Dem aftaler jeg personligt med dig.',
      'Mere end seks sider, webshop, betaling, login og specialudvikling får et særskilt tilbud.',
    ],
  },
  uses: {
    eyebrow: 'Eksempler',
    title: 'Hvad siden kan bruges til',
    intro: 'Mulige løsninger, ikke færdige kundecases. Demoerne er fiktive koncepter, ikke leverede opgaver.',
    items: [
      { title: 'Café, restaurant eller bar', text: 'Menu, åbningstider og vej hen til jer samlet på ét sted, så gæsten ikke skal lede.', demo: 'restaurant' },
      { title: 'Frisør eller salon', text: 'Behandlinger og priser, og et link til jeres eksisterende booking, hvis I har et.', demo: 'salon' },
      { title: 'Håndværker eller servicefirma', text: 'Hvad I laver, hvor I kører, og en nem måde at skrive eller ringe på.' },
      { title: 'Butik', text: 'Åbningstider, sortiment og adresse, så kunden ved, om det er turen værd.' },
    ],
  },
  steps: [
    { title: 'Du beregner din pris', body: 'To korte valg, og du ser prisen på selve hjemmesiden uden at oplyse noget.' },
    { title: 'Du får et skriftligt tilbud', body: 'Med sider, det der er med, og det der ikke er. Først når du siger ja, går jeg i gang.' },
    { title: 'Du leverer tekst og billeder', body: 'Jeg bygger siden, og du følger med i en rigtig browser undervejs.' },
    { title: 'Rettelser og aflevering', body: 'Vi retter inden for det aftalte, og jeg viser, hvordan siden hænger sammen.' },
  ],
  costs: {
    title: 'Andre udgifter',
    text: 'Domæne, hosting og eksterne systemer betales til udbyderne. Hvad du får brug for, og hvad der løber løbende, aftaler vi personligt, før noget går i gang.',
  },
  faq: [
    {
      q: 'Hvad hvis jeg ikke har tekster og billeder?',
      a: 'Så siger jeg det, før vi går i gang. Tekst og billeder leverer du som udgangspunkt selv. Skal jeg hjælpe med det, aftaler vi det som en separat opgave.',
    },
    {
      q: 'Kan jeg få booking på siden?',
      a: 'Ofte ja, ved at koble dit eksisterende bookingsystem på. Det er ikke med i hjemmesidens pris, og vi aftaler det sammen. Læs mere under Booking og integrationer.',
    },
    {
      q: 'Hvad med domæne og hosting?',
      a: 'Det betales til udbyderen og afhænger af, hvad du vælger. Jeg gennemgår, hvad du får brug for, og hvad der løber løbende, før noget aftales.',
    },
    {
      q: 'Er en demo det, min side kommer til at se ud som?',
      a: 'Nej. Demoerne er fiktive koncepter, der viser designretninger og funktioner. Din side tilpasses din virksomhed. Booking og andre ekstra funktioner, en demo viser, aftales separat og er ikke med i standardprisen.',
    },
  ],
  contact: contactCta('hjemmeside', 'Skriv til mig om din hjemmeside'),
}

export const booking = {
  path: paths.booking,
  metaTitle: 'Booking og integrationer | OviaSpecs',
  metaDescription:
    'Få dit eksisterende bookingsystem koblet på hjemmesiden, og få dine digitale værktøjer til at tale sammen. Aftales personligt ud fra dine behov.',
  eyebrow: 'Booking og integrationer',
  title: 'Booking, der virker fra din hjemmeside.',
  lead: 'Kunden vil bestille bord eller tid uden at ringe først. Jeg kobler jeres eksisterende bookingsystem på siden og får de digitale værktøjer til at spille sammen.',
  primary: { label: 'Tal med mig om booking', href: '#kontakt' },
  secondary: { label: 'Se et eksempel', href: '#eksempel' },
  visual: 'booking',
  need: {
    eyebrow: 'Behovet',
    title: 'Kunden booker, når det passer dem, ikke kun i åbningstiden.',
    body: [
      'Mange har allerede et bookingsystem, men kunden finder det aldrig, fordi knappen er gemt, eller flowet er besværligt.',
      'Andre bruger flere værktøjer, der ikke taler sammen, så de samme oplysninger skal skrives ind flere steder.',
    ],
  },
  solution: {
    eyebrow: 'Løsningen',
    title: 'Jeg lægger booking dér, hvor kunden leder, og forbinder det, der kan forbindes.',
    intro:
      'Jeg udvikler ikke bookingsoftware. Jeg kobler dit eksisterende system på hjemmesiden, så kunden kommer direkte det rigtige sted hen. Hvad der kan lade sig gøre, afhænger af systemet, så jeg undersøger det, før jeg lover noget.',
    parts: [
      { title: 'Bookingknap eller flow', text: 'Knappen eller det indlejrede flow placeres på de sider, hvor kunden er klar til at handle.' },
      { title: 'Værktøjer, der taler sammen', text: 'Fx at en henvendelse lander dér, hvor I ellers arbejder, i stedet for at blive skrevet ind to gange.' },
      { title: 'Test fra kundens side', text: 'Jeg prøver forløbet igennem på telefon og computer, før det går live.' },
    ],
  },
  deliver: {
    eyebrow: 'Det får du',
    title: 'Typiske leverancer',
    items: [
      'Booking koblet på de rigtige sider af hjemmesiden',
      'En test af, at kunden kommer hele vejen igennem',
      'En kort gennemgang af, hvordan det hænger sammen',
    ],
    limitsTitle: 'Afgrænsning',
    limits: [
      'Bookingsystemets eget abonnement betales til udbyderen.',
      'Jeg bygger ikke nye bookingsystemer og kan ikke love, hvad et bestemt system tillader, før jeg har set det.',
      'Der er ingen fast pris på siden. Vi aftaler omfanget ud fra dit system og dine behov.',
    ],
  },
  uses: {
    eyebrow: 'Eksempler',
    title: 'Hvordan det kan se ud',
    intro:
      'Mulige løsninger, ikke færdige kundecases. Demoerne viser, hvordan link og bookinghenvendelser kan sidde på siden i mine egne eksempler.',
    items: [
      { title: 'Bordbooking til restauranten', text: 'Knappen fører til jeres eksisterende bordbookingsystem, uden at gæsten skal lede.', demo: 'restaurant' },
      { title: 'Tidsbestilling til salonen', text: 'En bookingknap ved hver behandling, koblet til salonens eksisterende system.', demo: 'salon' },
      { title: 'Bookinghenvendelse på mail', text: 'Har I ikke et system, kan en færdig mail være en enkel start.', demo: 'vinbar' },
    ],
  },
  maintenance: {
    eyebrow: 'Vedligeholdelse',
    title: 'Hvad sker der bagefter?',
    body: 'Systemer ændrer sig, og links skal holdes i live. Om jeg også tager mig af opdateringer og vedligeholdelse, og hvad det i så fald indebærer, taler vi om personligt. Der er ingen automatisk aftale, og siden viser ingen priser for det.',
    cta: contactCta('vedligeholdelse', 'Spørg om vedligeholdelse'),
  },
  steps: [
    { title: 'Du fortæller, hvad I bruger', body: 'Hvilket bookingsystem eller hvilke værktøjer, og hvad der driller i dag.' },
    { title: 'Jeg undersøger mulighederne', body: 'Jeg ser på, hvad systemet tillader, og siger ærligt, hvad der kan lade sig gøre.' },
    { title: 'Vi aftaler omfang og pris', body: 'Skriftligt, før jeg går i gang.' },
    { title: 'Jeg kobler det på og tester', body: 'Og viser dig, hvordan det hænger sammen.' },
  ],
  costs: {
    title: 'Udgifter til andre udbydere',
    text: 'Bookingsystemets abonnement og andre eksterne værktøjer betales til udbyderne. Jeg fortæller, hvad du får brug for, før noget aftales.',
  },
  faq: [
    {
      q: 'Kan du sætte booking op i det system, jeg bruger?',
      a: 'Det er det typiske. Jeg lægger bookingknappen eller flowet ind på hjemmesiden, så kunderne kommer direkte til dit eksisterende system. Hvad der kan lade sig gøre, afhænger af systemet, så skriv, hvilket du bruger.',
    },
    {
      q: 'Kan du lave et helt nyt bookingsystem til mig?',
      a: 'Nej. Jeg udvikler ikke bookingsoftware. Jeg kobler eksisterende systemer på din hjemmeside.',
    },
    {
      q: 'Hvad koster det?',
      a: 'Det afhænger af systemet og omfanget, så der er ingen fast pris. Vi taler om det personligt, og du får det skriftligt, før noget går i gang.',
    },
    {
      q: 'Er booking med i hjemmesidens pris?',
      a: 'Nej. Prisen i beregneren gælder selve hjemmesiden. Booking, integrationer og vedligeholdelse aftaler vi sammen.',
    },
  ],
  contact: contactCta('booking', 'Beskriv din booking-opgave'),
}
