/* =========================================================================
   AL TEKST PÅ SIDEN BOR HER
   Ret frit — komponenterne indeholder ingen tekst.

   Positionering: OviaSpecs er en digital handyman for lokale virksomheder.
   Én kontaktperson til hjemmesider, integrationer, praktisk automatisering
   og online markedsføring. Sproget er personligt (jeg/du) og konkret.

   Regler for teksten:
   - Skeln mellem det, jeg TILBYDER, og det, jeg HAR LAVET. Eksempler på
     mulige løsninger er ikke kundecases. Demoerne er demoer og skal stå som
     "Demo / koncept".
   - Ingen tal, kundenavne, ratings eller løfter, der ikke kan dokumenteres.
     Eneste anmeldelse: Copenhagen Ease (godkendt, se `review`).
   - Ingen løfter om placeringer, salgstal eller garanterede resultater.
   - Priser: der er ingen prislister på siden. Omfang og pris aftales, før
     noget går i gang. Skal der senere stå en pris, må den kun stå ved den
     hjemmesidepakke, den gælder for.
   - Ingen løfter om ejerskab, support, svartider eller leveringstider,
     før Ronny har afklaret dem.

   Billeder: siden bruger ingen fotos, logoer, menukort eller tekster fra
   virksomhederne i portfolioen. Projekterne vises som konceptillustrationer,
   tegnet til siden i src/concepts (HTML/CSS), og er mærket som sådan. Det
   eneste foto er Ronnys eget portræt.
   ========================================================================= */

export const site = {
  brand: 'OviaSpecs',
  url: 'https://oviaspecs.com/',
  owner: 'Ronny Hong',
  email: 'ronnyhong723@gmail.com',
  phone: '53 61 36 99',
  phoneHref: '+4553613699',
  place: 'Hjortshøj / Aarhus',
}

/* Navigation: fire punkter, i den rækkefølge sektionerne står på siden.
   Sektioner uden eget link (Samarbejdet, Anmeldelsen, Spørgsmål) regnes med
   under det link, man kom fra. */
export const nav = {
  brand: 'OviaSpecs',
  links: [
    { label: 'Ydelser', href: '#ydelser' },
    { label: 'Arbejde', href: '#arbejde' },
    { label: 'Om', href: '#om' },
  ],
  cta: { label: 'Kontakt', href: '#kontakt' },
  // Genveje i mobilmenuen: overblik over, hvad jeg hjælper med.
  areasLabel: 'Jeg hjælper med',
  areas: [
    { label: 'Hjemmesider og booking', href: '#hjemmesider' },
    { label: 'Systemer og automatisering', href: '#systemer' },
    { label: 'Synlighed og annoncering', href: '#synlighed' },
  ],
  menu: 'Menu',
  close: 'Luk',
}

/* -------------------------------------------------------------------------
   HERO
   To rækker i overskriften (koreografien er bygget på to maskerede rækker).
   Rækkerne må gerne brække til flere linjer.

   Motivet er tre konceptillustrationer af tre forskellige designretninger:
   frisør på computer, brasserie og café på telefon. De viser, hvad jeg kan
   bygge til en hjemmeside, og er mærket "Konceptillustration".
------------------------------------------------------------------------- */
export const hero = {
  eyebrow: 'Til lokale virksomheder · Hjortshøj og Aarhus',
  lines: ['Din virksomheds', 'digitale handyman.'],
  deck: 'Jeg hjælper lokale virksomheder med hjemmesider, bookingsystemer, integrationer og online markedsføring — og får de digitale løsninger til at spille sammen.',
  primary: { label: 'Fortæl om din opgave', href: '#kontakt' },
  secondary: { label: 'Se hvad jeg hjælper med', href: '#ydelser' },
  // Tre indgange til ydelserne, så bredden kan ses på første skærm.
  areasLabel: 'Jeg hjælper med',
  areas: [
    { label: 'Hjemmesider og booking', href: '#hjemmesider' },
    { label: 'Systemer og automatisering', href: '#systemer' },
    { label: 'Synlighed og annoncering', href: '#synlighed' },
  ],
  shots: { browser: 'salon', phones: ['belli', 'cafe'] },
  labels: {
    browser: 'Konceptillustration af en hjemmeside til en frisør, set på computer.',
    phones: [
      'Konceptillustration af en hjemmeside til en brasserie, set på telefon.',
      'Konceptillustration af en hjemmeside til en café, set på telefon.',
    ],
  },
  tag: 'Konceptillustration',
  caption: 'Eksempler på hjemmesider, jeg har designet',
  captionHref: '#arbejde',
}

/* -------------------------------------------------------------------------
   YDELSER — tre områder, organiseret efter kundens behov.

   Eksemplerne under hvert område er mulige løsninger, ikke færdige
   kundecases (det siger `examplesNote`). Hvert område har en kontaktknap, der
   forvælger emnet i kontaktformularen (topic = id i `topics` nedenfor).
------------------------------------------------------------------------- */
export const ydelser = {
  id: 'ydelser',
  eyebrow: 'Ydelser',
  title: 'Tre områder. Du vælger det, du har brug for.',
  intro:
    'Du behøver ikke vide, hvad løsningen hedder. Fortæl, hvad der driller, så finder vi ud af, hvad der giver mening. Du skal hverken have det hele eller være på alle platforme.',
  labels: {
    examples: 'Eksempler',
    price: 'Pris og forventninger',
  },
  examplesNote: 'Eksempler på mulige løsninger, ikke færdige kundecases.',

  // Områdenavigation: klistret række af knapper øverst i sektionen.
  areaNav: {
    label: 'Spring til område',
    next: 'Næste område',
    items: [
      { id: 'hjemmesider', n: '01', label: 'Hjemmesider', long: 'Hjemmesider og booking' },
      { id: 'systemer', n: '02', label: 'Systemer', long: 'Systemer og automatisering' },
      { id: 'synlighed', n: '03', label: 'Synlighed', long: 'Synlighed og annoncering' },
      { id: 'andet', n: '', label: 'Andet', long: 'Noget andet' },
    ],
  },

  hjemmesider: {
    id: 'hjemmesider',
    n: '01',
    eyebrow: 'Hjemmesider og booking',
    title: 'En hjemmeside, hvor kunden kan handle.',
    body: 'Jeg designer og bygger hjemmesider, landingssider og webshops. Og jeg kobler booking på, så kunden kan bestille bord eller tid uden at ringe først.',
    examples: [
      'Hjemmeside til en frisør, café, restaurant eller butik',
      'Landingsside til en kampagne eller en enkelt ydelse',
      'Webshop til en mindre butik',
      'Bordbooking til restauranten, tidsbestilling til salonen og en kontaktformular, der virker',
    ],
    price:
      'Omfang og pris aftales, før noget går i gang. Domæne, hosting og bookingsystemets abonnement betales til udbyderen. Jeg kobler eksisterende bookingsystemer på hjemmesiden og udvikler ikke selv bookingsoftware.',
    cta: { label: 'Spørg om hjemmeside og booking', topic: 'hjemmeside' },
  },

  systemer: {
    id: 'systemer',
    n: '02',
    eyebrow: 'Systemer og automatisering',
    title: 'Værktøjer, der arbejder sammen, og færre gentagne opgaver.',
    body: 'Jeg forbinder virksomhedens digitale værktøjer og gør de opgaver lettere, der ellers tager tid hver uge.',
    // Fire eksempler, hver med en kort forklaring af, hvad arbejdet er.
    items: [
      {
        title: 'Lageroverblik',
        text: 'Et samlet overblik over varer og beholdning, så I kan se, hvad der er på lager, uden at lede flere steder.',
      },
      {
        title: 'Registrering og optælling',
        text: 'Værktøjer, der gør det lettere at registrere og tælle produkter. Selve optællingen foregår stadig i hånden, medmindre vi konkret aftaler andet.',
      },
      {
        title: 'Dataoverførsel mellem systemer',
        text: 'Oplysninger flyttes fra det ene system til det andet, i stedet for at nogen skriver dem ind to gange.',
      },
      {
        title: 'Beskeder og påmindelser',
        text: 'Automatiske beskeder, fx en bekræftelse til kunden eller en påmindelse, der ellers skulle sendes i hånden.',
      },
    ],
    price:
      'Vurderes efter opgavens omfang, så der er ingen fast pris. Abonnementer og eksterne systemer betales til udbyderen.',
    cta: { label: 'Spørg om systemer og automatisering', topic: 'systemer' },
  },

  synlighed: {
    id: 'synlighed',
    n: '03',
    eyebrow: 'Synlighed og annoncering',
    title: 'Bliv fundet af dem, der leder efter jer.',
    body: 'En hjemmeside hjælper først, når kunderne kan finde den. Her er tre veje, og hvad arbejdet består i. Jeg anbefaler kun dem, der passer til jer.',
    rows: [
      {
        n: 1,
        label: 'Google-virksomhedsprofil',
        kind: 'Gratis at have',
        text: 'Jeg opretter eller rydder op i profilen: åbningstider, kategorier, billeder, beskrivelse og links, så oplysningerne er rigtige, når nogen søger på jer i Google og på kortet.',
      },
      {
        n: 2,
        label: 'SEO',
        kind: 'Søgemaskiner',
        text: 'Jeg gennemgår hjemmesidens tekster, titler, hastighed og opbygning og retter det, der gør den svær at finde og bruge. Det tager tid, og ingen kan love en bestemt placering.',
      },
      {
        n: 3,
        label: 'Annoncering',
        kind: 'Google, TikTok og Meta',
        text: 'Jeg opsætter og justerer annoncer til en kampagne eller et tilbud: målgruppe, tekst, billeder og budget. Annoncebudgettet betales til platformen og kommer oven i mit arbejde.',
      },
    ],
    price:
      'Jeg lover ingen bestemte placeringer, salgstal eller resultater. Omfang og pris vurderes efter opgaven. Jeg starter ikke annoncer, før vi har aftalt kanal og budget.',
    cta: { label: 'Spørg om synlighed og annoncering', topic: 'synlighed' },
    search: {
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
    },
  },

  // Åben indgang til opgaver, der ikke står ovenfor.
  open: {
    text: 'Har du en digital opgave, du ikke kan finde her? Fortæl mig, hvad der driller, så undersøger jeg, hvordan jeg kan hjælpe.',
    cta: { label: 'Beskriv din opgave', topic: 'andet' },
  },
}

/* Bookingeksemplet. Opdigtede tider og behandlinger uden priser. Intet
   sendes nogen steder, og der vises ingen bekræftelse. */
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

/* -------------------------------------------------------------------------
   UDVALGT ARBEJDE — kun tre demoer, ingen kunder.

   Hvert projekt vises som en scene med en konceptillustration af
   designretningen på computer og telefon. Illustrationen er tegnet til
   siden og bruger ingen fotos, logoer, menukort, priser, anmeldelser eller
   tekster fra virksomheden. Den er ikke et skærmbillede. Sidens ramme ruller
   med, mens man scroller forbi, og tre udsnit står altid stille under scenen.

   Alle tre er "Demo / koncept". Virksomhederne står ikke som kunder,
   samarbejdspartnere eller anbefalinger.

   showDemoLinks: sæt til true, når demoerne på GitHub Pages er ryddet for
   fotos, logoer, menukort og anmeldelser, som Ronny ikke har tilladelse til
   at vise. Indtil da linker siden ikke til dem.
------------------------------------------------------------------------- */
export const work = {
  id: 'arbejde',
  eyebrow: 'Arbejde',
  title: 'Tre hjemmesider, jeg har designet og kodet.',
  intro:
    'Det er mine egne demoer, ikke kundeopgaver. De viser, hvordan jeg griber en hjemmeside an, når en frisør, en restaurant og en café har hver sin stemning og hvert sit behov.',
  tag: 'Demo / koncept',
  note: 'Demo / koncept betyder, at siden er lavet som eksempel på mit arbejde. Den er ikke en kundeopgave, og virksomheden er ikke kunde eller samarbejdspartner. Illustrationerne er tegnet til denne side og bruger ingen fotos, logoer eller tekster fra virksomhederne.',
  showDemoLinks: false,
  open: 'Åbn demoen',
  more: 'Vil du se hele demoen, så skriv til mig.',
  labels: { task: 'Opgaven', made: 'Det har jeg lavet', views: 'Udsnit' },
  projects: [
    {
      id: 'salon',
      variant: 'feature',
      panel: '#241b14',
      name: 'Salonkoncept',
      kind: 'Frisør og barber, Aarhus C',
      href: 'https://ronron-hr.github.io/salonmatin-demo/',
      task: 'En frisør, hvor nogle kommer forbi og andre booker. Siden skulle få behandlinger og booking frem, før man begynder at lede.',
      made: [
        'Design og kode af hele siden, mørkt og redaktionelt',
        'Prisliste med en bookingknap ved hver behandling, koblet til salonens eksisterende onlinebooking',
      ],
      label:
        'Salonkoncept, konceptillustration: mørk forside, historie, tre værdier og en behandlingsliste med bookingknapper.',
      labelMobile: 'Salonkoncept, konceptillustration på telefon.',
      // y: hvor langt nede i illustrationen (designenheder) udsnittet står.
      excerpts: [
        { label: 'Forside', text: 'Tilbud og booking på første skærm', y: 0 },
        { label: 'Historien', text: 'Kort om salonen og håndværket', y: 1000 },
        { label: 'Behandlinger', text: 'Hver behandling har sin egen bookingknap', y: 2700 },
      ],
    },
    {
      id: 'belli',
      variant: 'wide',
      panel: '#6a1b22',
      name: 'Restaurantkoncept',
      kind: 'Restaurant, Aarhus C',
      href: 'https://ronron-hr.github.io/belli-demo/',
      task: 'Et hus med en lang historie og et menukort, der skifter. Siden skulle vise stemningen først og gøre det nemt at bestille bord.',
      made: [
        'Design og kode af hele siden, med store billedflader og en tidslinje for husets historie',
        'Bordbestilling koblet til restaurantens eksisterende system',
      ],
      label:
        'Restaurantkoncept, konceptillustration: mørk forside med lamper og ternet dug, præsentation af huset, en bordeauxrød historiesektion og menuen.',
      labelMobile: 'Restaurantkoncept, konceptillustration på telefon.',
      excerpts: [
        { label: 'Forside', text: 'Stemning først, bordbestilling lige ved siden af', y: 0 },
        { label: 'Huset', text: 'Kort præsentation og aktuelle beskeder', y: 850 },
        { label: 'Historien', text: 'Tidslinje i husets egne farver', y: 1550 },
      ],
    },
    {
      id: 'cafe',
      variant: 'tall',
      panel: '#f4c343',
      name: 'Cafékoncept',
      kind: 'Café, Aarhus C',
      href: 'https://ronron-hr.github.io/dengulecafe-demo/',
      task: 'En café uden bordbestilling, hvor gæsten bare skal vide, hvad der er på menuen, hvornår der er åbent, og hvordan man finder derhen.',
      made: [
        'Design og kode af hele siden, med kraftige farveflader',
        'Menu og åbningstider samlet på forsiden og en knap, der viser vej',
      ],
      label:
        'Cafékoncept, konceptillustration: gul forside med polaroids, lyserød stribe med åbningstider og en lilla menu.',
      labelMobile: 'Cafékoncept, konceptillustration på telefon.',
      excerpts: [
        { label: 'Forside', text: 'Hvad stedet er, og en knap til at finde vej', y: 0 },
        { label: 'Menu', text: 'Seks slags mad og drikke på ét blik', y: 718 },
        { label: 'Åbningstider', text: 'Dage og tider uden at lede', y: 1600 },
      ],
    },
  ],
}

/* -------------------------------------------------------------------------
   SAMARBEJDET — ingen leveringstider, ingen priser, ingen løfter om ejerskab
   eller support, før de er afklaret.
------------------------------------------------------------------------- */
export const samarbejde = {
  id: 'samarbejde',
  eyebrow: 'Sådan arbejder vi sammen',
  title: 'Fra første samtale til en løsning, der virker.',
  lead: 'Uanset om opgaven er en hjemmeside, en integration eller annoncering, foregår det på samme måde. Du har hele vejen den samme kontaktperson.',
  steps: [
    {
      title: 'Du fortæller om opgaven',
      body: 'Vi taler om, hvad virksomheden laver, og hvad der driller eller mangler. Du behøver ikke have et færdigt oplæg eller kende løsningens navn.',
    },
    {
      title: 'Aftalt omfang og pris',
      body: 'Du får skrevet ned, hvad der er med, hvad det koster, og hvad der ikke er med. Først når du siger ja, går jeg i gang.',
    },
    {
      title: 'Jeg løser opgaven, og du følger med',
      body: 'Du ser løsningen undervejs, for en hjemmeside i en browser og ikke som et billede. Du kommenterer, og jeg retter inden for det aftalte.',
    },
    {
      title: 'Aflevering og drift',
      body: 'Jeg sætter løsningen i drift og viser, hvordan den bruges. Om jeg også tager mig af opdateringer og vedligeholdelse, aftaler vi, før vi går i gang.',
    },
  ],
  ownership:
    'Hvem der ejer hvad, og hvad der er med i driften efter afleveringen, står i den skriftlige aftale.',
}

/* -------------------------------------------------------------------------
   ANMELDELSE — Copenhagen Ease har givet tilladelse til at bruge feedbacken
   som anmeldelse og virksomheden som reference. Citatet er ordret fra deres
   besked. Ingen stjerner, personnavne, tal eller flere udtalelser. Virksomheds-
   navnet står som tekst: der er intet godkendt logo i projektet.
------------------------------------------------------------------------- */
export const review = {
  id: 'anmeldelse',
  eyebrow: 'Feedback efter en samtale med OviaSpecs',
  quote:
    'Vi havde en god og ligetil samtale med Ronny om vores digitale behov. Han lyttede og forklarede mulighederne på en forståelig måde.',
  source: 'Copenhagen Ease',
}

/* -------------------------------------------------------------------------
   OM OVIASPECS — alder og skole er bevidst udeladt.
------------------------------------------------------------------------- */
const portrait = {
  base: '/ronny',
  width: 500,
  height: 625,
  alt: 'Ronny Hong, der står bag OviaSpecs',
}

export const om = {
  id: 'om',
  eyebrow: 'Om OviaSpecs',
  title: 'Du taler med den, der løser opgaven.',
  body: [
    'Jeg hedder Ronny Hong og står bag OviaSpecs. Tænk på mig som en digital handyman: du har én kontaktperson, uanset om opgaven er en hjemmeside, en integration, en lille automatisering eller annoncering. Det er mig, du skriver eller ringer til, og mig, der laver arbejdet.',
    'Jeg bor i Hjortshøj ved Aarhus og arbejder med virksomheder i Aarhus-området og andre steder i Danmark. Siderne bygger jeg selv i kode og ikke på en færdig skabelon. Den side, du læser nu, er et eksempel: den bruger ingen cookies og ingen sporing.',
    'Ligger en opgave uden for det, jeg selv kan, siger jeg det, før vi går i gang.',
  ],
  facts: [
    ['Kontaktperson', 'Ronny Hong'],
    ['Sted', 'Hjortshøj / Aarhus'],
    ['Arbejder med', 'Hjemmesider, booking, systemer og synlighed'],
  ],
  portrait,
}

/* -------------------------------------------------------------------------
   SPØRGSMÅL — kun det, der reelt afgør, om man skriver.
------------------------------------------------------------------------- */
export const faq = {
  id: 'sporgsmaal',
  eyebrow: 'Spørgsmål',
  title: 'Det, du sikkert vil vide først.',
  items: [
    {
      q: 'Kan du hjælpe med en hjemmeside, jeg allerede har?',
      a: 'Ja. Vi ser på, hvad der virker, og hvad der ikke gør. Nogle gange er få rettelser nok, andre gange giver en ny side mere mening. Du får at vide, hvilket, før noget aftales.',
    },
    {
      q: 'Kan du sætte booking op i det system, jeg bruger?',
      a: 'Det er det typiske. Jeg lægger bookingknappen eller flowet ind på hjemmesiden, så kunderne kommer direkte til dit eksisterende system. Hvad der kan lade sig gøre, afhænger af systemet, så skriv, hvilket du bruger. Jeg udvikler ikke nye bookingsystemer.',
    },
    {
      q: 'Kan jeg nøjes med én opgave?',
      a: 'Ja. Du bestiller kun det, du har brug for. Du skal hverken have det hele eller være på alle platforme.',
    },
    {
      q: 'Kan du hjælpe med noget, der ikke står her?',
      a: 'Måske. Beskriv, hvad der driller, så vurderer jeg, om og hvordan jeg kan hjælpe. Kan jeg ikke, siger jeg det ligeud.',
    },
    {
      q: 'Kan du love, at jeg kommer øverst på Google?',
      a: 'Nej, og det kan ingen ærligt love. Jeg fortæller, hvad jeg gør, og hvorfor, og du kan holde mig op på det.',
    },
    {
      q: 'Hvad koster det?',
      a: 'Det afhænger af opgavens omfang, så der er ingen prisliste. Vi aftaler omfang og pris, før noget går i gang. Annoncebudget, abonnementer og eksterne systemer betales separat til udbyderen.',
    },
  ],
}

/* -------------------------------------------------------------------------
   KONTAKT — mail og telefon virker altid. Formularen sender ikke selv noget:
   den samler det, du skriver, i en mail og åbner din mailapp. Derfor viser
   den aldrig en "sendt"-besked. Der er ingen formularbackend.
------------------------------------------------------------------------- */
export const kontakt = {
  id: 'kontakt',
  eyebrow: 'Kontakt',
  title: 'Fortæl om din opgave.',
  body: 'Skriv et par linjer om, hvad virksomheden laver, og hvad du gerne vil have hjælp til. Du får svar fra mig, og vi ser på, hvad der giver mening at starte med.',
  form: {
    topicLegend: 'Hvad drejer det sig om?',
    name: 'Dit navn',
    company: 'Virksomhed',
    message: 'Hvad vil du have hjælp til?',
    messagePlaceholder: 'Fx: Vi er en café med en gammel hjemmeside og vil gerne kunne tage imod bordbestillinger.',
    submit: 'Åbn mail med din besked',
    copy: 'Kopiér beskeden',
    copied: 'Beskeden er kopieret. Indsæt den i en mail til',
    copyFailed: 'Kunne ikke kopiere automatisk. Skriv i stedet direkte til',
    noMail: 'Har du ikke et mailprogram sat op?',
    note: 'Beskeden sendes i dit eget mailprogram, ikke fra denne side. Knappen åbner en færdig mail til mig, og først når du trykker send dér, når den mig.',
    opened:
      'Jeg har forsøgt at åbne dit mailprogram med beskeden. Husk at trykke send dér. Åbnede det sig ikke, kan du skrive direkte til',
  },
  phoneLabel: 'Foretrækker du at ringe?',
}

/** Emner i kontaktformularen. Ydelsesknapperne forvælger et af dem. */
export const topics = [
  { id: 'hjemmeside', label: 'Hjemmeside og booking' },
  { id: 'systemer', label: 'Systemer og automatisering' },
  { id: 'synlighed', label: 'Synlighed og annoncering' },
  { id: 'andet', label: 'Noget andet' },
]

/** Mailen, formularen samler: emne og brødtekst. */
export function composeParts({ topic, name, company, message }) {
  const label = topics.find((t) => t.id === topic)?.label ?? 'Henvendelse'
  const subject = `${label} – henvendelse fra oviaspecs.com`
  const body = [
    'Hej Ronny,',
    '',
    `Emne: ${label}`,
    `Navn: ${name || ''}`,
    `Virksomhed: ${company || ''}`,
    '',
    message || 'Jeg vil gerne have hjælp til:',
    '',
    'Mvh',
    name || '',
  ].join('\n')
  return { subject, body }
}

export function composeMail(fields) {
  const { subject, body } = composeParts(fields)
  return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/* -------------------------------------------------------------------------
   JURIDISKE OPLYSNINGER — bruges af footeren og privatlivspolitikken.
   Adressen står allerede i footeren på den tidligere side og er hentet
   derfra; den bruges ikke i metadata eller strukturerede data.
   Er der et CVR-nr., skriv det i `cvr`, så vises det af sig selv.
------------------------------------------------------------------------- */
export const legal = {
  owner: 'Ronny Hong',
  address: 'Hjortshøj Stationsvej 6, 8530 Hjortshøj',
  cvr: null,
  hosting: 'Cloudflare',
  mailProvider: 'Google (Gmail)',
  retentionMonths: 12,
  updated: '29. september 2026',
}

export const footer = {
  left: '© 2026 OviaSpecs',
  links: [{ label: 'Privatlivspolitik', href: '/privatlivspolitik/' }],
}
