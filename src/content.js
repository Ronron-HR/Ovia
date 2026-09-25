/* =========================================================================
   AL TEKST PÅ SIDEN BOR HER
   Ret frit — komponenterne indeholder ingen tekst.

   Regler for teksten:
   - Ingen tal, anmeldelser, kundenavne eller løfter, der ikke kan
     dokumenteres. Demoerne er demoer og skal stå som "Demo / koncept".
   - Ingen prispakker. Omfang og pris aftales, før noget går i gang.
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

/** Forudfyldt mail: hjælper afsenderen med at fortælle det, der er brug for. */
export const mail = {
  subject: 'Henvendelse fra oviaspecs.com',
  body: [
    'Hej Ronny,',
    '',
    'Virksomhed:',
    'Hvad vi laver:',
    'Jeg vil gerne have hjælp til:',
    'Min nuværende hjemmeside (hvis der er en):',
    '',
    'Mvh',
  ].join('\n'),
}

export function mailHref() {
  const q = `subject=${encodeURIComponent(mail.subject)}&body=${encodeURIComponent(mail.body)}`
  return `mailto:${site.email}?${q}`
}

/* Navigation: tre sider og én kontaktknap. Links peger på sektions-id'er.
   Sektioner uden eget link (Sammenhængen, Samarbejdet, Spørgsmål) regnes med
   under det link, man kom fra. */
export const nav = {
  brand: 'OviaSpecs',
  links: [
    { label: 'Arbejde', href: '#arbejde' },
    { label: 'Ydelser', href: '#ydelser' },
    { label: 'Om OviaSpecs', href: '#om' },
  ],
  cta: { label: 'Kontakt', href: '#kontakt' },
  menu: 'Menu',
  close: 'Luk',
}

/* -------------------------------------------------------------------------
   HERO
   To rækker i overskriften (koreografien er bygget på to maskerede rækker).
   Rækkerne må gerne brække til flere linjer.

   Motivet er tre konceptillustrationer af tre forskellige designretninger:
   frisør på computer, brasserie og café på telefon. De viser spændvidden,
   og motivet er mærket "Konceptillustration".
------------------------------------------------------------------------- */
export const hero = {
  eyebrow: 'Til saloner, caféer, restauranter og butikker',
  lines: ['Hjemmesider, booking og markedsføring', 'til din virksomhed.'],
  deck: 'Jeg bygger din hjemmeside og hjælper med booking, Google og sociale medier. Vi starter med det, din virksomhed faktisk har brug for.',
  primary: { label: 'Fortæl om din opgave', href: '#kontakt' },
  secondary: { label: 'Se mit arbejde', href: '#arbejde' },
  shots: { browser: 'salon', phones: ['belli', 'cafe'] },
  labels: {
    browser: 'Konceptillustration af en hjemmeside til en frisør, set på computer.',
    phones: [
      'Konceptillustration af en hjemmeside til en brasserie, set på telefon.',
      'Konceptillustration af en hjemmeside til en café, set på telefon.',
    ],
  },
  tag: 'Konceptillustration',
  caption: 'Tre designretninger: frisør, brasserie og café',
  captionHref: '#arbejde',
}

/* -------------------------------------------------------------------------
   SAMMENHÆNGEN — kunden finder jer, forstår tilbuddet og kan kontakte/booke.
------------------------------------------------------------------------- */
export const rail = {
  id: 'sammenhaeng',
  label: 'Sådan hænger det sammen',
  steps: [
    {
      n: '01',
      title: 'Kunden finder jer',
      body: 'Google, kortet og sociale profiler viser jer frem for dem, der leder efter det, I tilbyder.',
      link: { label: 'Synlighed og markedsføring', href: '#synlighed' },
    },
    {
      n: '02',
      title: 'Forstår tilbuddet',
      body: 'Hjemmesiden svarer på det, kunden spørger om først: hvad I tilbyder, hvor I er, og hvornår I har åbent.',
      link: { label: 'Hjemmesider', href: '#hjemmesider' },
    },
    {
      n: '03',
      title: 'Kontakter eller booker',
      body: 'Én tydelig knap fører videre til en tid i kalenderen, et opkald eller en mail.',
      link: { label: 'Booking og integrationer', href: '#booking' },
    },
  ],
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
  eyebrow: 'Udvalgt arbejde',
  title: 'Tre hjemmesider til tre slags virksomheder.',
  intro:
    'Tre demoer, jeg har designet og kodet. Illustrationerne herunder viser designretningen på computer og telefon.',
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
   YDELSER — tre områder. Hjemmesider er indgangen og fylder mest; booking og
   synlighed kan købes hver for sig.
------------------------------------------------------------------------- */
export const ydelser = {
  id: 'ydelser',
  eyebrow: 'Ydelser',
  title: 'Tre områder. Du vælger det, du har brug for.',
  intro:
    'De fleste starter med hjemmesiden. Booking og markedsføring kan kobles til den, men kan også bestilles alene. Ingen skal købe det hele eller være på alle platforme.',
  labels: { get: 'Det får du', limit: 'Afgrænsning' },

  hjemmesider: {
    id: 'hjemmesider',
    eyebrow: 'Hjemmesider',
    title: 'En hjemmeside, der svarer på det, kunderne spørger om først.',
    body: 'Jeg designer og bygger siden ud fra jeres tekster og billeder. Den skal være let at bruge på en telefon og have én tydelig vej til kontakt eller booking.',
    get: [
      'Design og udvikling af hele siden',
      'Mobilvisning, der er lavet fra start',
      'Tydeligt indhold: tilbud, åbningstider og adresse',
      'Landingssider til en kampagne eller en enkelt ydelse',
    ],
    limit:
      'Domæne, hosting og andre abonnementer betales til udbyderen. Løbende opdateringer aftales for sig.',
    annotated: {
      label: 'Det vigtigste på en lokal side',
      caption: 'Konceptillustration: café',
      ariaLabel:
        'Konceptillustration af en cafés hjemmeside med tre markeringer: overskriften, de to knapper og åbningstiderne.',
      // Placering i procent af udsnittet (1440 × 900 designenheder).
      pins: [
        { n: 1, x: 15.2, y: 19.6, text: 'Overskriften siger, hvad stedet er' },
        { n: 2, x: 45.2, y: 68.4, text: 'To knapper med hver sit formål: se menuen og find vej' },
        { n: 3, x: 15.2, y: 76.6, text: 'Åbningstiderne står, hvor man leder efter dem' },
      ],
    },
  },

  booking: {
    id: 'booking',
    eyebrow: 'Booking og integrationer',
    title: 'Booking, der hænger sammen med hjemmesiden.',
    body: 'Kunden går direkte fra tilbuddet til at vælge en tid. Jeg kobler jeres eksisterende bookingsystem på hjemmesiden, og har I ikke et, taler vi om, hvad der passer.',
    get: [
      'Tilkobling af jeres eksisterende bookingsystem',
      'Bookingknapper, der fører til den rigtige behandling eller ydelse',
      'Kontaktflow med opkald, mail eller formular, hvor det passer',
      'Forbindelser til kalender og andre værktøjer, hvor det er muligt',
    ],
    limit:
      'Jeg tilkobler systemer, der findes i forvejen, og udvikler ikke selv bookingsoftware, betalingsløsninger eller CRM. Mere komplekse behov vurderer vi først.',
  },

  synlighed: {
    id: 'synlighed',
    eyebrow: 'Synlighed og markedsføring',
    title: 'Bliv fundet af dem, der leder efter jer.',
    body: 'En hjemmeside hjælper først, når kunderne kan finde den. Der er tre veje, og de virker forskelligt. Jeg anbefaler kun dem, der passer til jer.',
    rows: [
      {
        n: 1,
        label: 'Profiler',
        kind: 'Organisk',
        text: 'Google Business Profile, Instagram, Facebook og TikTok, sat op eller forbedret, så de er til at finde og til at stole på. Det koster ingen annoncekroner, men kræver, at nogen holder dem i gang.',
      },
      {
        n: 2,
        label: 'Søgning',
        kind: 'SEO',
        text: 'Forbedringer på hjemmesiden og i Google-profilen, så I lettere kan dukke op, når nogen søger efter det, I tilbyder, i nærheden. Det tager tid, og ingen kan love en bestemt placering.',
      },
      {
        n: 3,
        label: 'Annoncer',
        kind: 'Betalt',
        text: 'Google Ads og Meta-annoncer, og TikTok når det passer, til en kampagne eller et tilbud. Annoncebudgettet betales til platformen og kommer oven i mit arbejde.',
      },
    ],
    limit:
      'Fuld løbende indholdsproduktion og drift indgår ikke automatisk i et tilbud, men aftales særskilt. Jeg starter ikke annoncer, før vi har aftalt kanal og budget.',
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
   SAMARBEJDET — ingen leveringstider, ingen priser, ingen løfter om ejerskab
   eller support, før de er afklaret.
------------------------------------------------------------------------- */
export const samarbejde = {
  id: 'samarbejde',
  eyebrow: 'Samarbejdet',
  title: 'Fra første samtale til en side, der er live.',
  steps: [
    {
      title: 'Afklaring',
      body: 'Vi taler om, hvad virksomheden laver, hvem kunderne er, og hvad siden eller opsætningen skal kunne. Du behøver ikke have et færdigt oplæg.',
    },
    {
      title: 'Aftalt omfang og pris',
      body: 'Du får skrevet ned, hvad der er med, hvad det koster, og hvad der ikke er med. Først når du siger ja, går jeg i gang.',
    },
    {
      title: 'Gennemgang',
      body: 'Du ser løsningen undervejs i en browser, ikke som et billede. Du kommenterer, og jeg retter inden for det aftalte.',
    },
    {
      title: 'Lancering og drift',
      body: 'Jeg sætter siden live. Om jeg også tager mig af tekstrettelser, opdateringer og vedligeholdelse, aftaler vi, før vi går i gang.',
    },
  ],
  ownership:
    'Hvem der ejer hvad, og hvad der er med i driften efter lanceringen, står i den skriftlige aftale.',
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
  title: 'Du taler med den, der bygger.',
  body: [
    'Jeg hedder Ronny Hong og står bag OviaSpecs. Det er mig, du skriver eller ringer til, og mig, der laver arbejdet.',
    'Jeg bor i Hjortshøj ved Aarhus og arbejder med virksomheder i Aarhus-området og andre steder i Danmark. Siderne bygger jeg selv i kode og ikke på en færdig skabelon. Den side, du læser nu, er et eksempel: den bruger ingen cookies og ingen sporing.',
  ],
  facts: [
    ['Kontaktperson', 'Ronny Hong'],
    ['Sted', 'Hjortshøj / Aarhus'],
    ['Arbejder med', 'Hjemmesider, booking, synlighed'],
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
      q: 'Kan jeg nøjes med én ydelse?',
      a: 'Ja. Hjemmeside, booking og synlighed kan bestilles hver for sig. Du skal hverken have det hele eller være på alle platforme.',
    },
    {
      q: 'Hvad koster det?',
      a: 'Det afhænger af omfanget, så der er ingen prisliste. Vi aftaler omfang og pris, før noget går i gang.',
    },
  ],
}

/* -------------------------------------------------------------------------
   KONTAKT — mail og telefon. Der er ingen formularbackend, så der er heller
   ingen formular, der kan foregive at have sendt noget.
------------------------------------------------------------------------- */
export const kontakt = {
  id: 'kontakt',
  eyebrow: 'Kontakt',
  title: 'Fortæl om din opgave.',
  body: 'Skriv eller ring, og fortæl kort, hvad virksomheden laver, og hvad du gerne vil have hjælp til. Du får svar fra mig, og vi ser på, hvad der giver mening at starte med.',
  mailLabel: 'Skriv en mail',
  mailNote: 'Åbner din mailapp med en kort skabelon, du kan udfylde.',
  phoneLabel: 'Ring',
  helps: {
    title: 'Det hjælper, hvis du nævner',
    items: [
      'Hvad virksomheden laver, og hvem kunderne er',
      'Om du har en hjemmeside eller et bookingsystem i dag',
      'Hvad der ikke fungerer, eller hvad du savner',
    ],
  },
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
  updated: '25. september 2026',
}

export const footer = {
  left: '© 2026 OviaSpecs',
  links: [{ label: 'Privatlivspolitik', href: '/privatlivspolitik/' }],
}
