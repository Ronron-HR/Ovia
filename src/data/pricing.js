/* =========================================================================
   KONFIGURATION — ALLE PRISER, PAKKER OG INDSTILLINGER BOR HER
   Ret tal og tekst her, så følger forsiden, ydelsessiderne, /priser/ og
   prisberegneren med. Komponenterne indeholder ingen priser.

   Regler (må ikke brydes):
   - Pakkerne hedder Start, Vækst og Fuld fart. Vækst på hjemmeside er "Anbefalet, hvis du vil have Google-profilen sat op"
     (begrundet: pakken indeholder den); ingen mærker om popularitet og ingen løfter om placeringer.
   - Ingen rabatkoder, nedtællinger eller kunstigt pres.
   - Ingen opdigtede udtalelser, kundetal eller resultater.
   - Hjemmesidepakken (engangspris) og driftsplanen (Basis, Plus eller Ekstra,
     pr. måned) er to uafhængige valg. Alle planer kan kombineres med alle
     pakker, og ingen plan får et popularitetsmærke. Planerne har samme tekniske drift
     (services.hjemmeside.drift.included) og adskiller sig kun i, hvor meget
     indholdsarbejde der er med. Der lovers intet ud over det, der står i drift.included og planens minutter.
   ========================================================================= */

/* ---- Kontakt ----------------------------------------------------------- */
export const contact = {
  name: 'Ronny Hong',
  phone: '53 61 36 99', // sådan vises nummeret
  phoneHref: '+4553613699', // sådan ringes der (tel: og sms:)
  email: 'kontakt@oviaspecs.com',
  /** Forudfyldt tekst, når man trykker "SMS". */
  smsText: 'Hej Ronny. Jeg har set oviaspecs.com og vil gerne høre mere.',
}

/* ---- Virksomhed -------------------------------------------------------- */
export const company = {
  /** Skriv CVR-nummeret her (fx '12345678'), så vises det i footeren. null = skjult. */
  cvr: null,
  /** Adresse (fx 'Gade 1, 8000 Aarhus C'), vises i footeren. Tom = skjult. */
  address: '',
}

/* ---- Fælles tekster og flag -------------------------------------------- */

/** Momsstatus: én diskret linje ved priserne (beregnerens resultat, /priser/ og ydelsessiderne). Tom = skjult. */
export const priceNote = 'Alle priser er ekskl. moms.'

/** Mærke ved pakkerne og i beregneren. Tom = skjult. */
export const introText = 'Introduktionspriser'

/** Forklaringen ved mærket. Tom = skjult. */
export const introNote = 'Priserne er introduktionspriser, mens OviaSpecs er nyt.'

/**
 * Højeste pris for en hjemmeside på Start eller Vækst uden integrationer (uden
 * booking, evt. med egen konto). Gælder ikke Fuld fart, der med egen konto
 * koster pakke + egen konto (+ ekstra sider). Tjekkes af scripts/test-pricing.mjs.
 */
export const maxWebsiteNoIntegrations = 10000

/**
 * Svaret på "Hvornår kan vi starte?" på ydelsessiderne. Har ydelsen sin egen
 * `startNow`, bruges den i stedet. Er begge tomme, skjules spørgsmålet.
 */
export const paidStartText = 'Betalte opgaver fra februar 2027.'

/** Mærket på den anbefalede pakke. */
/** Anbefalingen står kun, hvor den kan begrundes ud fra kundens behov (pakken indeholder Google-profilen). */
export const recommendedFor = { hjemmeside: { tier: 'vaekst', label: 'Anbefalet, hvis du vil have Google-profilen sat op' } }

/** Navnene på de tre pakker (bruges af alle ydelser). */
export const tierNames = { start: 'Start', vaekst: 'Vækst', 'fuld-fart': 'Fuld fart' }

/**
 * Vises på /booking-google/, ved booking på hjemmesiden og i beregneren, når booking er valgt.
 * Abonnementet er ikke en del af OviaSpecs' priser (hverken engangs eller pr. måned).
 */
export const bookingSubscriptionNote =
  'Ikke med i priserne fra OviaSpecs: Abonnementet på bookingsystemet (fx Planway eller Booksy) betaler du selv direkte til udbyderen.'

export const flags = {
  /** false: marketingsiden viser "Pilotforløb" i stedet for cases. */
  hasMarketingCases: false,
}

/* ---- Drift af hjemmesiden (planer pr. måned) ----------------------------
   Tre planer, uafhængigt af hjemmesidepakken. Teknisk drift er den samme i
   alle tre (services.hjemmeside.drift.included); planerne adskiller sig kun i
   den inkluderede tid til indholdsarbejde (`minutes`; 0 = ingen). Rækkefølgen
   her er rækkefølgen i beregneren, på pakkesiderne og på /priser/.
------------------------------------------------------------------------- */
const makePlan = (id, name, monthly, minutes, content, summary) => ({
  id,
  name,
  monthly,
  minutes,
  summary,
  /** Hvad indholdsarbejdet dækker, som en kort sætning med stort begyndelsesbogstav. */
  content,
  /** Minutterne som tekst (vises sammen med planen): små rettelser med materiale, kunden leverer. */
  limit: minutes ? `Op til ${minutes} min. små rettelser pr. måned med materiale, du leverer` : 'Ingen indholdsrettelser',
})

export const driftPlans = {
  basis: makePlan('basis', 'Basis', 198, 0, 'Ingen inkluderede indholdsændringer', 'Hosting, sikkerhed og versionsbackup af hjemmesiden. Ingen indholdsrettelser. Til dig, der ikke regner med at skulle have ændret noget.'),
  plus: makePlan('plus', 'Plus', 398, 15, 'Hjælp til billeder, tekst og nyheder', 'Op til 15 minutters små rettelser pr. måned med tekst og billeder, du leverer, oveni driften. Ubrugte minutter overføres ikke.'),
  ekstra: makePlan('ekstra', 'Ekstra', 798, 30, 'Flere rettelser og nyt indhold hver måned', 'Op til 30 minutters små rettelser pr. måned med tekst og billeder, du leverer, oveni driften. Ubrugte minutter overføres ikke.'),
}

/**
 * Gamle links (før driftsplanerne) har drift=drift. De skifter til planen med
 * samme indhold, som linket viste dengang: Start og Vækst hed 299 kr./md
 * (nu Plus, 199 kr./md), Fuld fart 399 kr./md (nu Ekstra). Se parse() i src/calculator.js.
 */
export const legacyDriftPlan = { start: 'plus', vaekst: 'plus', 'fuld-fart': 'ekstra' }

/** Planerne som liste i visningsrækkefølge. */
export const driftPlanList = Object.values(driftPlans)

/** Laveste månedspris for drift (bruges, hvor pakken nævner drift: "fra 99 kr./md"). */
export const driftFrom = Math.min(...driftPlanList.map((p) => p.monthly))

/** Plan med måned og indhold som tekst, fx "Plus, 199 kr./md, hjælp til billeder, tekst og nyheder". */
export const driftSummary = (p) => `${p.name}, ${formatKr(p.monthly)}/md, ${p.content.charAt(0).toLowerCase()}${p.content.slice(1)}`

/* ---- Domæne (fælles afgrænsning) ----------------------------------------
   Samme regel i Lokal og i driftsplanerne, så domænet aldrig står forskelligt
   forskellige steder (docs/rebrand/brief.md, afsnit C). Loftet er en aftalt
   kontraktgrænse, ikke en oplyst registrarpris.
------------------------------------------------------------------------- */
export const domain = {
  /** Kr. pr. år til almindelig fornyelse af ét standarddomæne. */
  capPerYear: 200,
}

/** Domænet: samme tekst i Lokal og i driftsplanerne (loftet er `domain.capPerYear`). */
export const domainText = `Almindelig fornyelse af ét standarddomæne er med, op til ${formatKr(domain.capPerYear)}/år. Premiumdomæner og ekstra domæner er ikke med. Domænet står i dit navn.`

/* ---- Løbende samarbejde: Lokal (rebrand okt. 2026) ----------------------
   Hjemmeside uden opstartspris: 0 kr. i opstart, fast månedspris og en
   minimumsperiode fra lancering. Godkendt i docs/rebrand/brief.md (afsnit C og D).
   Tallene her er den ENESTE kilde; minimum regnes ud, aldrig skrevet i tekst.
------------------------------------------------------------------------- */
export const lokal = {
  id: 'lokal',
  name: 'Lokal',
  /** Opstartspris. */
  start: 0,
  monthly: 1990,
  /** Mindst så mange abonnementsmåneder fra lancering. */
  minMonths: 6,
  /** Indholdssider i alt (nødvendige juridiske informationssider tæller ikke med). */
  pages: { min: 1, max: 3 },
  /** Samlede korrekturrunder før lancering. */
  revisionRounds: 2,
  /** Hvert måned: minutter til prioriteret lokal SEO, kontrol og kort status / mindre tekst- og billedrettelser. */
  minutes: { seo: 45, content: 15 },
  /** Komponenter, der er med (bruges af overlap mod Booking & Google). */
  includes: ['googleProfile'],
  /** Opsigelse: så mange måneders varsel. */
  noticeMonths: 1,
}

/**
 * Systemtilvalg til Lokal: ét færdigt standardmodul (én arbejdsgang).
 * `ready: false` = der findes endnu IKKE et udviklet og testet standardmodul.
 * Så længe det er false, må siden ikke sælge modulet til denne pris
 * (brief afsnit C): beregneren tilbyder det ikke med pris, og tekster viser
 * "særskilt fast tilbud efter afgrænsning". Prisen nedenfor er den planlagte.
 */
export const systemModule = {
  id: 'system',
  name: 'Systemtilvalg',
  monthly: 1000,
  ready: false,
  /** Ekstra brugerstøtte pr. måned (nyudvikling er separat). */
  supportMinutes: 30,
  /** Kommercielle grænser, der først må loves, når kapacitet og omkostninger er kontrolleret (ready). */
  limits: { users: 2, casesPerMonth: 100 },
}

/** Lokal i alt pr. måned med eller uden systemtilvalg. */
export const lokalMonthly = (withSystem = false) => lokal.monthly + (withSystem ? systemModule.monthly : 0)
/** Mindste samlede betaling over minimumsperioden (5.970 kr. / 8.970 kr.). */
export const lokalMinimum = (withSystem = false) => lokalMonthly(withSystem) * lokal.minMonths

/* ---- Overlap mellem hjemmeside og Booking & Google ----------------------
   Booking & Google består af komponenter. Er en komponent allerede med i den
   valgte hjemmesidepakke (`includes`), trækkes dens pris fra Booking &
   Google-prisen i beregneren, og noten nævner præcis hvilke dele.
   Booking & Google-pakkernes pris = summen af deres komponenter.
------------------------------------------------------------------------- */
export const components = {
  googleProfile: { label: 'Google-profil', price: 1000 },
  booking: { label: 'booking', price: 1000 },
  qrOpfoelgning: { label: 'QR-skilt og opfølgning', price: 1000 },
}

export const overlap = {
  /** Én note pr. del, fx "Trukket fra: Booking (500 kr.), fordi du allerede har valgt booking på din hjemmeside." */
  note: (part, amount, reason) => `Trukket fra: ${part} (${amount}), ${reason}.`,
  /** Hvorfor delen er trukket fra (pr. komponent). */
  reasons: {
    googleProfile: (webTier) => `fordi Google-profilen allerede er med i din hjemmesidepakke (${webTier})`,
    booking: () => 'fordi du allerede har valgt booking på din hjemmeside',
  },
  /** Samme, når hjemmesiden er Lokal (løbende samarbejde). */
  reasonsLokal: {
    googleProfile: () => 'fordi Google-profilen allerede er med i Lokal',
  },
  /** Vises i stedet for en pris, når hele Booking & Google-pakken er dækket (0 kr.). */
  allIncluded: 'Allerede med i din hjemmeside',
  allIncludedLokal: 'Allerede med i Lokal',
}

/* ---- Lokal i beregneren --------------------------------------------------
   Lokal er en egen ydelse i beregneren (`lokal` i ORDER), gensidigt udelukkende
   med hjemmeside (engangskøb). Den ligger IKKE i `services`, så JSON-LD og
   ydelsessiderne ikke får en pakke, der ikke er en engangspakke. Tallene kommer
   fra `lokal` og `systemModule` ovenfor.
------------------------------------------------------------------------- */
export const lokalService = {
  id: 'lokal',
  name: 'Lokal',
  /** Etiket foran navnet i resultatet: "Løbende samarbejde: Lokal". */
  label: 'Løbende samarbejde',
  billing: 'subscription',
  tiers: [
    {
      id: 'lokal',
      price: lokal.monthly,
      summary: 'En hjemmeside uden opstartspris, og lidt løbende hjælp med Google hver måned.',
      features: [
        `${lokal.pages.min}-${lokal.pages.max} indholdssider (nødvendige juridiske informationssider tæller ikke med)`,
        `Mobilvenligt design og én kontakt-/forespørgselsformular, op til ${lokal.revisionRounds} samlede korrekturrunder før lancering`,
        'Hosting, SSL, teknisk vedligeholdelse og versionsbackup af hjemmesiden',
        'Indledende SEO på de leverede sider og hjælp til én Google-profil, hvis virksomheden er berettiget',
        `Hver måned: op til ${lokal.minutes.seo} min. prioriteret lokal SEO, kontrol og kort status, og op til ${lokal.minutes.content} min. mindre tekst- og billedrettelser`,
      ],
    },
  ],
}

/* ---- Ydelser og pakker -------------------------------------------------
   billing: 'once' (engangspris) eller 'monthly' (pris pr. måned).
            Alle priser er faste: beregneren viser aldrig et interval.
   Hjemmesidens drift pr. måned står i `driftPlans` (ikke på pakkerne).
   addons:  tilvalg; `tiers` = de pakker, tilvalget kan vælges til.
   includes: komponenter fra `components`, som pakken indeholder (se overlap).
------------------------------------------------------------------------- */
export const services = {
  hjemmeside: {
    id: 'hjemmeside',
    name: 'Hjemmeside',
    billing: 'once',
    tiers: [
      {
        id: 'start',
        price: 5000,
        includes: [],
        summary: 'Én side med det vigtigste.',
        features: ['Alt samlet på én side', '1 rettelserunde'],
        /** Tilvalg, der vises på pakkekortet (addons). */
        optional: ['bookingOnSite'],
      },
      {
        id: 'vaekst',
        price: 8000,
        includes: ['googleProfile'],
        summary: 'Flere sider og din Google-profil sat op.',
        features: ['Op til 5 sider', 'Google-profil sat op', 'Siden sat op, så Google kan læse den', '2 rettelserunder'],
        optional: ['bookingOnSite'],
      },
      {
        id: 'fuld-fart',
        price: 10000,
        includes: ['googleProfile'],
        summary: 'Flest sider og et lokalt SEO-fundament.',
        features: ['Op til 8 sider', 'Google-profil sat op', 'Lokalt SEO-fundament: titler, struktur og indhold til dit område', '3 rettelserunder'],
        optional: ['bookingOnSite'],
      },
    ],
    addons: {
      /**
       * Alternativ til en driftsplan på alle pakker: siden lægges på kundens egen
       * konto, og der er ingen månedlig betaling til OviaSpecs for drift.
       * ANTAGELSE (ikke afklaret med forretningen): kan kombineres med booking.
       */
      ownAccount: {
        label: 'Egen konto/hosting i stedet for en driftsplan',
        short: 'Egen konto/hosting',
        price: 2000,
        unit: 'én gang',
        note: 'Ingen månedlig betaling til OviaSpecs for drift. Du kan selv have udgifter til hosting og domæne.',
        tiers: ['start', 'vaekst', 'fuld-fart'],
      },
      /**
       * Booking koblet på siden: tilvalg til alle tre pakker, uafhængigt af driftsplan.
       * Prisen er booking-komponentens (samme beløb, der trækkes fra Booking & Google).
       * Ingen pakke har booking gratis.
       */
      bookingOnSite: {
        label: 'Booking koblet på (alle pakker)',
        short: 'Booking koblet på',
        price: components.booking.price,
        tiers: ['start', 'vaekst', 'fuld-fart'],
        note: bookingSubscriptionNote,
      },
      /** Kun Fuld fart: sider ud over de 8, der er med i pakken. */
      extraPage: {
        label: 'Ekstra underside ud over 8 (kun Fuld fart)',
        price: 800,
        unit: 'pr. side',
        tiers: ['fuld-fart'],
      },
    },
    /** Står under pakkerne: Start og Vækst har ingen ekstra undersider. */
    upgradeNote: 'Brug for flere sider i Start eller Vækst? Så opgraderer du til næste pakke.',
    /** Flest sider i alt, beregneren tilbyder i Fuld fart (8 + ekstra undersider). */
    maxPages: 20,
    /**
     * Hvad drift dækker. Prisen pr. måned står i `driftPlans`. `included` er den
     * tekniske drift, der er ens i ALLE planer, og det eneste, drift lover ud over
     * planens indholdsarbejde.
     */
    drift: {
      included: [`Siden holdes online og sikker, med hosting, versionsbackup af hjemmesiden og almindelig fornyelse af ét standarddomæne op til ${formatKr(domain.capPerYear)} om året`],
      /** Teksten på pakkekortet: drift er et særskilt valg (prisen indsættes: laveste plan). */
      fromLine: (price) => `Drift vælger du særskilt, fra ${price}/md`,
      /** Blokken "Drift" på pakkesiderne og /priser/ (valg 2 efter pakken). */
      block: {
        eyebrow: 'Valg 2 efter pakken',
        title: 'Drift',
        intro: 'Drift betaler du hver måned. Du vælger frit mellem planerne, uanset hvilken pakke du har valgt.',
        sharedLead: 'Det samme i alle tre planer:',
        perMonth: '/md',
      },
      /** Hvad indholdsarbejde er (planernes omfang). */
      contentWork: 'Indholdsarbejde er små ændringer med den tekst og de billeder, du leverer.',
      /** Hvad der ikke er indholdsarbejde. */
      notContentWork: 'Nye sider, nye funktioner og større designændringer aftales særskilt.',
      unusedTime: 'Ubrugt indholdsarbejde overføres ikke.',
      extraWork: 'Ekstra arbejde ud over det, der er inkluderet i planen, aftaler vi pris på, før jeg går i gang.',
      /** FAQ'en "Hvad er inkluderet i drift?". Prisen indsættes fra addons.extraPage. */
      morePagesFaq: (price) =>
        `Flere sider: På Start og Vækst opgraderer du til næste pakke. På Fuld fart koster hver side ud over 8 ${price}, når du bestiller siden. Nye sider efter lanceringen aftales særskilt.`,
      domain: domainText,
      binding: 'Ingen bindingsperiode. Opsigelse med 1 måneds varsel.',
      /** Pris for at købe siden fri, når drift opsiges. */
      buyoutPrice: 2000,
      /** Prisen indsættes fra buyoutPrice. Forklarer, hvad beløbet dækker. */
      buyout: (price) =>
        `Stopper du drift, kan du købe siden fri for ${price}. Beløbet dækker, at jeg overfører filerne og sætter siden op på din egen konto. Hosting og domæne på din egen konto betaler du selv til udbyderen.`,
    },
    /** Erstatter paidStartText i "Hvornår kan vi starte?" for denne ydelse. Tom = paidStartText bruges. */
    startNow: 'Du kan få en gratis demo nu. Opstart og betaling fra februar 2027.',
    /** Svaret på "Hvor lang tid tager det?" */
    leadTime: 'Typisk 1-2 uger efter vi har mødtes.',
  },

  marketing: {
    id: 'marketing',
    name: 'Marketing',
    billing: 'monthly',
    tiers: [
      {
        id: 'start',
        price: 3000,
        summary: 'Videoer, du selv lægger op.',
        features: ['4 korte videoer om måneden', 'Du poster selv'],
      },
      {
        id: 'vaekst',
        price: 5000,
        summary: 'Jeg laver indholdet og poster det.',
        features: ['8 korte videoer om måneden', '4 opslag om måneden', 'Jeg poster på 2 kanaler', 'Månedsrapport'],
      },
      {
        id: 'fuld-fart',
        price: 8000,
        summary: 'Mere indhold og annoncer på Meta.',
        features: [
          '12 korte videoer om måneden',
          '8 opslag om måneden',
          'Jeg poster på 3 kanaler',
          'Styring af Meta-annoncer (annoncebudgettet betaler du selv direkte til Meta)',
          'Månedsrapport',
        ],
        limit: 'Højst 1 kunde ad gangen',
      },
    ],
    /** Vises på marketingsiden, så længe flags.hasMarketingCases er false. */
    pilot: {
      weeks: 2,
      price: 0,
      scope: '4 korte videoer',
      /** Den pakke, man kan fortsætte på efter piloten. */
      continueOn: 'vaekst',
      maxAtOnce: 2,
      terms: [
        'Gratis i 2 uger',
        '4 korte videoer',
        'Til gengæld må jeg bruge resultaterne som case',
        'Du er ikke forpligtet til at give en udtalelse',
        'En pilot giver ikke ret til en positiv anmeldelse',
        'Uforpligtende. Efter piloten kan du fortsætte på Vækst',
      ],
      limitText: 'Højst 2 piloter ad gangen',
      /** Link under marketing-prisen i beregnerens resultat (kun når flags.hasMarketingCases er false). */
      calcLink: { label: 'Vil du prøve først? Se pilotforløbet', href: '/marketing/#pilot' },
    },
    binding: 'Ingen bindingsperiode. Opsigelse med 1 måneds varsel.',
    /** Tom = paidStartText bruges. Pilotforløbet står i PilotSection på /marketing/. */
    startNow: '',
  },

  bookingGoogle: {
    id: 'bookingGoogle',
    name: 'Booking & Google',
    billing: 'once',
    /** Erstatter paidStartText i "Hvornår kan vi starte?" for denne ydelse. Tom = paidStartText bruges. */
    startNow:
      'Det gratis Google-tjek kan du få nu. Jeg laver også op til 3 gratis opsætninger mod at bruge resultatet som case.',
    /** Uforpligtende indgang, der fremhæves på siden. */
    freeCheck: {
      price: 0,
      title: 'Gratis tjek af din Google-profil',
      text: 'Jeg kigger din Google-profil igennem og fortæller, hvad der mangler eller er forkert. Det er uforpligtende.',
    },
    tiers: [
      {
        id: 'start',
        price: 1000,
        includes: ['googleProfile'],
        summary: 'Din Google-profil i orden. En engangsopgave.',
        features: ['Google-profil sat op eller rettet'],
        /** Tilvalg på kortet (addons): QR-skiltet kan vælges uden booking. */
        optional: ['qrOpfoelgning'],
      },
      {
        id: 'vaekst',
        price: 2000,
        includes: ['googleProfile', 'booking'],
        summary: 'Booking koblet på det system, du har, eller et jeg finder sammen med dig.',
        features: ['Google-profil sat op eller rettet', 'Booking koblet på din hjemmeside eller Instagram'],
        optional: ['qrOpfoelgning'],
      },
      {
        id: 'fuld-fart',
        price: 3000,
        includes: ['googleProfile', 'booking', 'qrOpfoelgning'],
        summary: 'Booking, QR-skilt til anmeldelser og opfølgning efter 30 dage.',
        features: [
          'Google-profil sat op eller rettet',
          'Booking koblet på din hjemmeside eller Instagram',
          'QR-skilt, der fører til din anmeldelsesside (layout; print og forsendelse er ikke med)',
          'Opfølgning efter 30 dage med tal fra Google-profilen',
        ],
      },
    ],
    addons: {
      /**
       * QR-skiltet kan vælges uden booking (Start: Google-profil + QR = samme pris som
       * komponenterne tilsammen). Med booking er det Fuld fart. Layoutet er en
       * engangsleverance; print og forsendelse er ikke med.
       */
      qrOpfoelgning: {
        label: 'QR-skilt og opfølgning (kan vælges uden booking)',
        short: 'QR-skilt og opfølgning',
        price: components.qrOpfoelgning.price,
        tiers: ['start', 'vaekst'],
        note: 'Layout af QR-skiltet og opfølgning efter 30 dage med tal. Print og forsendelse er ikke med. Med booking og QR-skilt er det Fuld fart, til samme pris.',
      },
    },
  },
}

/* ---- Prisberegneren (/priser/) ------------------------------------------
   Trin 1: hvilke ydelser (flervalg). Derefter ét trin pr. valgt ydelse (for
   hjemmesiden to: siderne og så driften, se `page`) og til sidst resultatet.

   Hvert svar peger på en pakke (`tier`); den højeste pakke blandt svarene
   vinder. `short` er spørgsmålet i opsummeringen (SMS/mail). `addon` lægger
   et tilvalg til (addons i ydelsen) i prisen, så resultatet viser det, kunden
   reelt betaler. `plan` er en driftsplan (driftPlans), som lægger sin
   månedspris til; `noDrift` (egen konto) giver ingen månedlig drift. `note`
   vises ved resultatet. `page` samler spørgsmål i samme trin (standard 1).
   Spørgsmålenes `id` skal være unikke, fordi de står i adresselinjen.
------------------------------------------------------------------------- */
export const calculator = {
  servicesQuestion: 'Hvad skal du bruge?',
  servicesHint: 'Vælg en eller flere.',
  /**
   * Trin 0: først hjemmesiden (to købsmåder, gensidigt udelukkende, kan også fravælges),
   * derefter tilvalg. `value` er den ydelse, valget sætter ('' = ingen hjemmeside).
   */
  modes: {
    legend: 'Hvordan vil du have hjemmesiden?',
    hint: 'Vælg én måde. Du kan også springe hjemmesiden over.',
    options: [
      {
        id: 'lokal',
        value: 'lokal',
        title: 'Løbende samarbejde',
        text: `${formatKr(lokal.start)} i opstart · ${formatKr(lokal.monthly)}/md · mindst ${lokal.minMonths} måneder`,
      },
      {
        id: 'hjemmeside',
        value: 'hjemmeside',
        title: 'Køb hjemmesiden',
        text: `fra ${formatKr(Math.min(...services.hjemmeside.tiers.map((t) => t.price)))} én gang + drift fra ${formatKr(driftFrom)}/md`,
      },
      { id: 'ingen', value: '', title: 'Jeg skal ikke have en hjemmeside', text: 'Spring over og vælg tilvalg nedenfor.' },
    ],
    addonsLegend: 'Vil du også have hjælp til',
    addonsHint: 'Tilvalg. Vælg ingen, en eller flere.',
    /** Tilvalgenes navne i trin 0 (resultatet bruger ydelsens eget navn). */
    addons: {
      bookingGoogle: { title: 'Lokal synlighed (Booking & Google)', text: () => fromPrice(services.bookingGoogle) },
      marketing: { title: 'Marketing', text: () => fromPriceWithDrift(services.marketing) },
    },
    /** Under Booking & Google, når Lokal eller en hjemmesidepakke allerede har Google-profilen. */
    addonOverlapLokal: `Google-profilen er allerede med i Lokal og trækkes fra (${formatKr(components.googleProfile.price)}).`,
    switchToKoeb: 'Hellere købe hjemmesiden én gang?',
    switchToLokal: 'Hellere et løbende samarbejde?',
  },
  questions: {
    hjemmeside: [
      {
        id: 'sider',
        short: 'Sider',
        label: 'Hvor mange sider skal hjemmesiden have?',
        options: [
          { id: '1', label: 'Én side med det hele', tier: 'start' },
          { id: '2-5', label: '2-5 sider', tier: 'vaekst' },
          { id: '6-8', label: '6-8 sider', tier: 'fuld-fart' },
          { id: '9+', label: 'Flere end 8 sider', tier: 'fuld-fart' },
        ],
      },
      {
        // Vises kun ved "Flere end 8 sider". Svarene er antal sider i alt (9 til maxPages).
        id: 'ekstra',
        short: 'Sider i alt',
        label: 'Hvor mange sider i alt?',
        kind: 'select',
        placeholder: 'Vælg antal sider',
        showIf: { sider: '9+' },
        options: [],
      },
      {
        id: 'bestilling',
        short: 'Booking/bestilling',
        label: 'Skal kunderne kunne booke eller bestille via siden?',
        options: [
          // Bestemmer hverken pakke eller driftsplan: "Ja" lægger booking til (+ prisen for booking).
          { id: 'nej', label: 'Nej' },
          { id: 'ja', label: 'Ja', addon: 'bookingOnSite', addsBooking: true },
        ],
      },
      {
        // Eget trin efter siderne. Ingen standardværdi: kunden vælger selv.
        id: 'drift',
        page: 2,
        heading: 'Drift af din hjemmeside',
        short: 'Drift',
        label: 'Hvilken drift skal hjemmesiden have?',
        /** Vises, hvis kunden går videre uden at vælge. */
        missing: 'Vælg en driftsplan eller egen konto/hosting for at gå videre.',
        options: [
          ...driftPlanList.map((p) => ({ id: p.id, label: p.name, summary: driftSummary(p), plan: p.id })),
          {
            id: 'egen',
            label: 'Egen konto/hosting',
            summary: 'Egen konto/hosting (ingen månedlig betaling til OviaSpecs for drift)',
            addon: 'ownAccount',
            noDrift: true,
          },
        ],
      },
    ],
    marketing: [
      {
        id: 'videoer',
        short: 'Videoer',
        label: 'Hvor mange korte videoer om måneden?',
        options: [
          { id: '4', label: '4 videoer', tier: 'start' },
          { id: '8', label: '8 videoer', tier: 'vaekst' },
          { id: '12', label: '12 videoer', tier: 'fuld-fart' },
        ],
      },
      {
        id: 'poste',
        short: 'Jeg poster',
        label: 'Skal jeg lægge indholdet op for dig?',
        options: [
          { id: 'nej', label: 'Nej, jeg poster selv', tier: 'start' },
          { id: 'ja', label: 'Ja, gerne', tier: 'vaekst' },
        ],
      },
      {
        id: 'annoncer',
        short: 'Meta-annoncer',
        label: 'Skal jeg styre annoncer på Meta (Facebook og Instagram)?',
        options: [
          { id: 'nej', label: 'Nej', tier: 'start' },
          { id: 'ja', label: 'Ja', tier: 'fuld-fart', note: 'Annoncebudgettet betaler du selv direkte til Meta.' },
        ],
      },
    ],
    /**
     * Booking & Google bygges af komponenter (`component` = nøgle i `components`).
     * Google-profilen er altid med. Pakken er den højeste, hvis komponenter alle er valgt
     * (booking → Vækst, booking + QR → Fuld fart); en valgt komponent uden for pakken
     * lægges til som tilvalg til komponentens pris (QR uden booking = Start + QR).
     */
    bookingGoogle: [
      {
        id: 'booking',
        short: 'Online booking',
        label: 'Skal kunderne kunne booke dig online?',
        options: [
          { id: 'nej', label: 'Nej, kun Google-profilen' },
          { id: 'ja', label: 'Ja', component: 'booking' },
        ],
      },
      {
        id: 'anmeldelser',
        short: 'QR-skilt',
        label: 'Vil du have et QR-skilt, der beder kunderne om en anmeldelse?',
        help: 'QR-skiltet kan vælges uden booking.',
        options: [
          { id: 'nej', label: 'Nej' },
          { id: 'ja', label: 'Ja, og opfølgning efter 30 dage', component: 'qrOpfoelgning' },
        ],
      },
    ],
    /**
     * Lokal (løbende samarbejde): ingen sidevalg, kun spørgsmålet om et system.
     * Så længe systemModule.ready er false, giver "Ja" ingen pris (se line() i calculator.js).
     */
    lokal: [
      {
        id: 'system',
        short: 'Systemtilvalg',
        label: 'Har du en arbejdsgang, du gerne vil have hjælp til, fx at samle forespørgsler og følge op på dem?',
        options: [
          { id: 'nej', label: 'Nej, jeg har brug for hjemmesiden', summary: 'nej' },
          { id: 'ja', label: 'Ja, jeg har en arbejdsgang, jeg vil have hjælp til', system: true },
        ],
      },
    ],
  },
  /** Linje under prisen. Tom = skjult. Må ikke indeholde "aftales" (prisen er fast; pristesten tjekker). */
  finalNote: '',
  /**
   * Løbende samarbejde (Lokal): vilkårene vises i resultatet FØR formularen, så kunden ser
   * opstart, månedspris, minimumsperiode, minimumsbetaling, eksterne udgifter og
   * overdragelse, før der bliver bedt om kontaktoplysninger.
   */
  lokalTerms: {
    title: 'Det forpligter du dig til',
    rows: (withSystem = false) => [
      { id: 'start', label: 'Opstart', value: formatKr(lokal.start) },
      { id: 'monthly', label: 'Pr. måned', value: `${formatKr(lokalMonthly(withSystem))}/md` },
      { id: 'period', label: 'Minimumsperiode', value: `${lokal.minMonths} måneder fra lancering` },
      { id: 'minimum', label: 'Mindste betaling i alt', value: formatKr(lokalMinimum(withSystem)) },
      {
        id: 'notice',
        label: 'Opsigelse',
        value: `${lokal.noticeMonths} måneds varsel, tidligst til udgangen af måned ${lokal.minMonths}`,
      },
    ],
    payment:
      'Første måned betales, før jeg går i gang med den fulde produktion, og beløbet trækkes fra første abonnementsmåned. Det er ikke et ekstra startgebyr.',
    externalTitle: 'Eksterne udgifter, du betaler direkte til udbyderen',
    external: [
      'Abonnementet hos en bookingudbyder, hvis du vælger booking.',
      'Premiumdomæner, ekstra domæner og andre betalte eksterne tjenester, fx SMS og annoncebudget.',
    ],
    domain: domainText,
    notIncludedTitle: 'Ikke med i prisen',
    notIncluded: 'Nye sider, nye integrationer, store tekstprojekter, linkbuilding, annoncering og systemudvikling. Det aftaler vi pris på, før jeg går i gang.',
    handoverTitle: 'Når minimumsperioden er slut',
    handover: [
      'Du kan få hjemmesidens filer og nødvendig dokumentation udleveret uden særskilt frikøb, når forfaldne beløb er betalt.',
      'Du får vedvarende brugsret til den leverede hjemmeside. Generelle moduler kan jeg bruge igen.',
      'Filudlevering er ikke det samme som flytning: en administreret backend, betalte licenser, eksterne tjenester og flyttearbejde kan koste særskilt.',
      'Domæne, indhold og data er dine, og du beholder ejerskabet til dine egne konti hos tredjepart.',
    ],
    /** Totalen på én linje: "mindst 6 mdr. = mindst 5.970 kr." */
    minimum: (months, amount) => `mindst ${months} mdr. = mindst ${amount}`,
    /** Når totalen også har engangsbeløb eller månedsbeløb uden minimumsperiode (fx marketing): minimum gælder kun Lokal. */
    minimumScoped: (monthly, months, minimum) => `Lokal: ${monthly}/md i mindst ${months} mdr. = mindst ${minimum}`,
    /** Mailen og SMS'en. */
    summaryLine: (monthly, months, minimum) => `0 kr. i opstart + ${monthly}/md, mindst ${months} måneder (mindst ${minimum} i alt)`,
  },
  /** Systemtilvalg til Lokal: hvad kunden ser, afhængigt af om et færdigt standardmodul findes (systemModule.ready). */
  systemNote: {
    /** ready = false: ingen pris. */
    pending:
      'Systemtilvalg: Der findes endnu ikke et færdigt standardmodul, så jeg giver ikke en pris her. Du får et særskilt fast tilbud, når jeg har hørt, hvad arbejdsgangen går ud på.',
    summaryPending: 'ønsker et system, særskilt fast tilbud (ingen pris endnu)',
    /** ready = true: modulet lægges til månedsprisen. */
    ready: () =>
      `Systemtilvalg: ét færdigt standardmodul til én arbejdsgang, op til ${systemModule.limits.users} brugere og ${systemModule.limits.casesPerMonth} nye sager om måneden, og op til ${systemModule.supportMinutes} min. ekstra brugerstøtte om måneden. SMS, betalte integrationer og AI-forbrug er ikke med. Nyudvikling er særskilt.`,
    summaryReady: 'ja, standardmodul',
  },
  /** Efter engangsbeløbet i totalen: "5.000 kr. nu". */
  nowLabel: 'nu',
  /**
   * Under Booking & Google-pakkerne (/priser/ og /booking-google/): booking
   * på hjemmesiden er et tilvalg uden krav om en bestemt driftsplan.
   */
  bookingDriftNote: 'Kobles booking på din hjemmeside, ændrer det ikke din driftsplan.',
  /** Note ved ekstra undersider i Fuld fart. */
  extraPagesNote: (n, price) => `${n} ekstra ${n === 1 ? 'underside' : 'undersider'} à ${price}`,
  /** Efter prisen, når siden lægges på kundens egen konto (ingen månedlig drift hos OviaSpecs). */
  noDriftSuffix: 'i alt, ingen månedlig drift',
  /** Under totalen ved egen konto: uden og med en månedspris fra en anden ydelse. */
  noDriftTotal: 'Ingen månedlig betaling til OviaSpecs for drift',
  noDriftWithMonthly: 'Ingen månedlig betaling til OviaSpecs for hjemmesidens drift',
  /** Under totalen, når "egen konto" er valgt: hvad kunden selv står for. Tom = skjult. */
  ownAccountNote:
    'Du ejer selv kontoen og kan have udgifter til hosting og domæne direkte til udbyderen. Rettelser efter levering aftaler vi pris på, før jeg går i gang.',
  /**
   * Driftvalget (trin 2 for hjemmesiden og skiftet i resultatet). Planerne og
   * deres priser står i driftPlans; vilkårene i services.hjemmeside.drift.
   */
  driftStep: {
    eyebrow: 'Valg 2: Drift',
    intro: 'Vælg, hvordan siden passes efter lanceringen. Du kan vælge frit, uanset hvilken pakke du har valgt.',
    /** Teknisk drift: ens i alle tre planer. */
    sharedLead: 'Det samme i alle tre planer:',
    /** Under planerne: indholdsarbejdets grænser, kort. Detaljerne står i "Hvad er drift?". */
    limits: () => {
      const d = services.hjemmeside.drift
      return `${d.contentWork} ${d.notContentWork} ${d.unusedTime}`
    },
    /** Kort tekst på kortet "Egen konto/hosting". */
    ownText: `Siden lægges på din egen konto. Ingen månedlig betaling til OviaSpecs for drift.`,
    ownExtra: 'Du kan selv have udgifter til hosting og domæne.',
    /** Pris på kortet: planen pr. måned, egen konto som tillæg én gang. */
    ownPrice: (price) => `+${price} én gang`,
    helpTitle: 'Hvad er drift?',
    /** Pakken, der er valgt (over driftvalget): "Pakke: Vækst, 4.000 kr. én gang". */
    packageLine: (tier, price) => `Pakke: ${tier}, ${price} én gang`,
    /** I resultatet: vælger til at skifte drift. */
    legend: 'Skift drift for hjemmesiden',
    now: (text) => `Nu: ${text}`,
    picked: 'Valgt',
  },
  /**
   * Pakkevælgeren under hver ydelse i resultatet. Et skift sætter pakkens svar
   * (spørgsmålets id → svar), så svarene og resultatet aldrig modsiger hinanden.
   * Alle andre svar (booking via siden og driftsvalget) beholdes uændret.
   * `now` vises efter skiftet.
   */
  tierSwitch: {
    legend: (service) => `Skift pakke for ${service}`,
    hjemmeside: {
      start: { answers: { sider: '1' }, now: 'Nu: én side med det hele' },
      vaekst: { answers: { sider: '2-5' }, now: 'Nu: op til 5 sider' },
      'fuld-fart': { answers: { sider: '6-8' }, now: 'Nu: op til 8 sider' },
    },
    marketing: {
      start: { answers: { videoer: '4', poste: 'nej', annoncer: 'nej' }, now: 'Nu: 4 videoer om måneden, du poster selv' },
      vaekst: { answers: { videoer: '8', poste: 'ja', annoncer: 'nej' }, now: 'Nu: 8 videoer om måneden, jeg poster' },
      'fuld-fart': { answers: { videoer: '12', poste: 'ja', annoncer: 'ja' }, now: 'Nu: 12 videoer om måneden, jeg poster og styrer annoncer' },
    },
    bookingGoogle: {
      start: { answers: { booking: 'nej', anmeldelser: 'nej' }, now: 'Nu: kun Google-profilen' },
      vaekst: { answers: { booking: 'ja', anmeldelser: 'nej' }, now: 'Nu: Google-profil og online booking' },
      'fuld-fart': { answers: { booking: 'ja', anmeldelser: 'ja' }, now: 'Nu: Google-profil, booking og QR-skilt' },
    },
  },
  /**
   * Hjælpetekster i beregneren. `sider` står under spørgsmålet om sider. `monthly`
   * og `ownAccount` står i resultatet og forklarer, hvad månedsprisen dækker, og hvad
   * kunden selv overtager. `driftWhat` er "Hvad er drift?" i driftvalget. Kun
   * dokumenterede vilkår (services.hjemmeside.drift).
   */
  help: {
    sider:
      'En side er fx forsiden, menukortet, "Om os" eller kontakt. Er du i tvivl, så vælg det, der ligner mest. Du kan skifte pakke bagefter.',
    driftWhat: () => {
      const d = services.hjemmeside.drift
      const [basis, plus, ekstra] = driftPlanList
      return [
        `Drift er det løbende, efter siden er lavet. ${d.included[0]}. Det er det samme i ${basis.name}, ${plus.name} og ${ekstra.name}.`,
        `Forskellen er indholdsarbejde. ${d.contentWork} ${[basis, plus, ekstra].map((p) => `${p.name}: ${p.content.toLowerCase()} (${p.limit.toLowerCase()})`).join('. ')}.`,
        `${d.notContentWork} ${d.unusedTime} ${d.extraWork}`,
        `${d.domain} ${d.binding}`,
        `Vil du hellere passe siden selv, vælger du egen konto/hosting: ${formatKr(services.hjemmeside.addons.ownAccount.price)} én gang i tillæg til pakken. ${services.hjemmeside.addons.ownAccount.note}`,
      ]
    },
    monthly: {
      title: 'Hvad dækker månedsprisen?',
      /** `line.driftPlan` er planens id. */
      hjemmeside: (line) => {
        const d = services.hjemmeside.drift
        const plan = line.driftPlan ? driftPlans[line.driftPlan] : null
        return [
          ...d.included,
          ...(plan ? [`${plan.content}.`] : []),
          d.contentWork,
          d.notContentWork,
          ...(plan?.minutes ? [d.unusedTime] : []),
          d.extraWork,
          d.domain,
          d.binding,
          d.buyout(formatKr(d.buyoutPrice)),
        ]
      },
      marketing: () => [services.marketing.binding],
      /** Lokal: hvad månedsprisen dækker (brief afsnit C). `line.system` er true, når et system er med i prisen. */
      lokal: (line) => [
        'Hosting, SSL, teknisk vedligeholdelse og versionsbackup af hjemmesiden, og kontrol af formularen.',
        `Op til ${lokal.minutes.seo} min. om måneden til prioriteret lokal SEO, kontrol og en kort status med arbejdslog.`,
        `Op til ${lokal.minutes.content} min. om måneden til mindre tekst- og billedrettelser med materiale, du leverer.`,
        'Ubrugte minutter overføres ikke.',
        domainText,
        ...(line?.system ? [calculator.systemNote.ready()] : []),
        'Faktiske fejl i det aftalte håndterer jeg som fejl, ikke som nye tilvalg.',
      ],
    },
    ownAccount: {
      title: 'Det overtager du selv',
      items: [
        'Ingen månedlig betaling til OviaSpecs for drift.',
        'Du ejer selv kontoen og kan have udgifter til hosting og domæne direkte til udbyderen.',
        'Rettelser efter levering aftaler vi pris på, før jeg går i gang.',
      ],
    },
  },
  /**
   * Behovsguiden ("Hjælp mig med at vælge"): frivillig, i beregnerens område, med en synlig
   * "Spring over". Højst tre spørgsmål i alt: behov, så (forgrenet) eksisterende løsning,
   * omfang og ønsket betalingsmodel. Reglerne står i src/guide.js, teksterne her.
   * "Jeg ved det ikke" giver den mindste løsning. Begrundelserne lover aldrig placeringer.
   */
  guide: {
    entryTitle: 'Hjælp mig med at vælge',
    entryText: 'Er du usikker? Svar på højst tre korte spørgsmål.',
    pickAnswer: 'Vælg et svar for at gå videre.',
    resultTitle: 'Mit forslag til dig',
    whyTitle: 'Derfor foreslår jeg det',
    includesTitle: 'Det er med',
    oncePrice: 'Engangspris',
    monthPrice: 'Pr. måned',
    noMonthly: 'Ingen månedspris',
    noOnce: 'Ingen engangspris',
    open: 'Se og ret i beregneren',
    change: 'Ret svarene',
    /** Den synlige vej direkte til beregneren (på hvert spørgsmål og på resultatet). */
    skip: 'Spring over',
    skipHint: 'og vælg selv i beregneren',
    unclearTitle: 'Lad os tage en kort snak',
    unclearText:
      'Ud fra svarene kan jeg ikke give dig en pris endnu, og jeg vil ikke gætte. Ring eller send en SMS, så finder vi sammen ud af, hvad der giver mening for din virksomhed.',
    unclearSms: 'Hej Ronny. Jeg har prøvet hjælp til at vælge på oviaspecs.com, men er stadig i tvivl. Kan vi tage en kort snak?',
    /** Arbejdsgang, hvor et system kan være relevant, men intet færdigt modul findes (systemModule.ready = false): ingen pris. */
    offerTitle: 'Særskilt fast tilbud efter en kort snak',
    offerText:
      'Det kan give mening at samle forespørgslerne et sted og følge op på dem. Der findes endnu ikke et færdigt standardmodul, så jeg giver ikke en pris her. Jeg hører først, hvad arbejdsgangen går ud på, og giver dig derefter et særskilt fast tilbud.',
    offerSms: 'Hej Ronny. Jeg har brugt hjælp til at vælge på oviaspecs.com. Jeg har en arbejdsgang, jeg gerne vil have hjælp til. Kan vi tage en kort snak?',
    /** Har kunden allerede et system, der virker: jeg sælger ikke et nyt. */
    haveTitle: 'Behold dit system, og lad os se på, om det kan kobles på',
    haveText: 'Du har allerede et system, der virker. Så foreslår jeg ikke et nyt. Lad os tage en kort snak om, om det kan kobles på din hjemmeside.',
    haveSms: 'Hej Ronny. Jeg har brugt hjælp til at vælge på oviaspecs.com. Jeg har allerede et system, der virker. Kan vi tage en kort snak om at koble det på?',
    need: {
      id: 'behov',
      label: 'Hvad vil du gerne have hjælp til?',
      options: [
        { id: 'hjemmeside', label: 'En ny eller bedre hjemmeside' },
        { id: 'google', label: 'Min Google-profil eller flere anmeldelser' },
        { id: 'booking', label: 'At gøre booking eller bestilling nemmere' },
        { id: 'arbejdsgang', label: 'Styr på forespørgsler eller en arbejdsgang' },
        { id: 'sociale', label: 'Hjælp til sociale medier' },
        { id: 'usikker', label: 'Jeg er ikke sikker' },
      ],
    },
    /** Opfølgende spørgsmål. Hvilke der stilles, afgør src/guide.js ud fra de tidligere svar. */
    questions: {
      fokus: {
        id: 'fokus',
        label: 'Hvad er vigtigst for dig lige nu?',
        options: [
          { id: 'google', label: 'Min Google-profil' },
          { id: 'booking', label: 'At kunderne kan booke eller bestille' },
          { id: 'sociale', label: 'At jeg er synlig på sociale medier' },
          { id: 'hjemmeside', label: 'At jeg har en (bedre) hjemmeside' },
          { id: 'ved-ikke', label: 'Jeg ved det ikke' },
        ],
      },
      sider: {
        id: 'sider',
        label: 'Hvor stor skal hjemmesiden være?',
        help: 'En side er fx forsiden, menukortet, "Om os" eller kontakt.',
        options: [
          { id: '1', label: 'Én side med det vigtigste' },
          { id: '2-3', label: '2-3 sider' },
          { id: '4-5', label: '4-5 sider' },
          { id: '6-8', label: '6-8 sider' },
          { id: 'ved-ikke', label: 'Jeg ved det ikke' },
        ],
      },
      model: {
        id: 'model',
        label: 'Hvordan vil du helst betale for hjemmesiden?',
        help: 'Begge dele kan lade sig gøre. Det er et spørgsmål om, hvad der passer dig.',
        options: [
          {
            id: 'lokal',
            label: `Løbende: ${formatKr(lokal.start)} i opstart og ${formatKr(lokal.monthly)} om måneden, mindst ${lokal.minMonths} måneder`,
          },
          { id: 'koeb', label: 'Én gang: jeg køber hjemmesiden og vælger drift for sig' },
          { id: 'ved-ikke', label: 'Jeg ved det ikke' },
        ],
      },
      harSide: {
        id: 'har-side',
        label: 'Har du en hjemmeside, der virker i dag?',
        options: [
          { id: 'ja', label: 'Ja' },
          { id: 'nej', label: 'Nej' },
          { id: 'ved-ikke', label: 'Jeg ved det ikke' },
        ],
      },
      ogsaaSide: {
        id: 'ogsaa-side',
        label: 'Vil du også have en hjemmeside?',
        options: [
          { id: 'koeb', label: 'Ja, og jeg vil købe den én gang' },
          { id: 'lokal', label: `Ja, og jeg vil hellere betale løbende (${formatKr(lokal.start)} i opstart)` },
          { id: 'nej', label: 'Nej, booking via Instagram og Google er nok' },
          { id: 'ved-ikke', label: 'Jeg ved det ikke' },
        ],
      },
      anmeldelser: {
        id: 'anmeldelser',
        label: 'Vil du have et QR-skilt, der beder kunderne om en anmeldelse?',
        options: [
          { id: 'ja', label: 'Ja' },
          { id: 'nej', label: 'Nej, kun Google-profilen' },
          { id: 'ved-ikke', label: 'Jeg ved det ikke' },
        ],
      },
      volumen: {
        id: 'volumen',
        label: 'Hvor mange forespørgsler eller sager får du cirka?',
        help: 'Fx forespørgsler på selskaber, tilbud eller bestillinger.',
        options: [
          { id: 'faa', label: 'Få. Jeg kan holde styr på dem i min indbakke' },
          { id: 'mange', label: 'Mange, og jeg mister overblikket' },
          { id: 'ved-ikke', label: 'Jeg ved det ikke' },
        ],
      },
      eksisterende: {
        id: 'eksisterende',
        label: 'Bruger du allerede et system til det?',
        options: [
          { id: 'nej', label: 'Nej, indbakke, papir eller regneark' },
          { id: 'ja', label: 'Ja, og det virker' },
          { id: 'ved-ikke', label: 'Jeg ved det ikke' },
        ],
      },
      opslag: {
        id: 'opslag',
        label: 'Skal jeg lægge indholdet op for dig?',
        options: [
          { id: 'ja', label: 'Ja, gerne' },
          { id: 'nej', label: 'Nej, jeg poster selv' },
          { id: 'ved-ikke', label: 'Jeg ved det ikke' },
        ],
      },
      annoncer: {
        id: 'annoncer',
        label: 'Skal jeg også styre annoncer på Meta (Facebook og Instagram)?',
        options: [
          { id: 'ja', label: 'Ja' },
          { id: 'nej', label: 'Nej' },
          { id: 'ved-ikke', label: 'Jeg ved det ikke' },
        ],
      },
    },
    /** Begrundelserne i resultatet. Ingen løfter om placeringer eller resultater. */
    reasons: {
      websiteSmall: 'Jeg starter småt: én side med det vigtigste. Skal der flere sider til, skifter du pakke i beregneren.',
      websitePages: 'Antallet af sider passer til pakken.',
      websiteNoBooking: `Booking er ikke med. Den kan lægges til i beregneren (+${formatKr(components.booking.price)}).`,
      websiteBooking: 'Booking kobles på siden som tilvalg. Det ændrer ikke din driftsplan.',
      /** Driftsplan: der stilles ikke et spørgsmål om ændringer (højst tre spørgsmål), så den mindste vælges. */
      driftDefault: `Jeg har valgt den mindste driftsplan, ${driftPlans.basis.name}. Skal du have ændret tekst og billeder, kan du skifte til ${driftPlans.plus.name} eller ${driftPlans.ekstra.name} i beregneren.`,
      /** Betalingsmodel. */
      payLokal: `Du vil helst betale løbende. Lokal koster ${formatKr(lokal.start)} i opstart og ${formatKr(lokal.monthly)} om måneden i mindst ${lokal.minMonths} måneder, i alt mindst ${formatKr(lokalMinimum())}.`,
      payKoeb: 'Du vil hellere købe hjemmesiden én gang. Så betaler du pakken nu og vælger drift for sig.',
      payDefault: 'Du var i tvivl om betalingen, så jeg har valgt det mindste køb: en hjemmeside, du betaler én gang. Et løbende samarbejde uden opstartspris kan du vælge i beregneren.',
      lokalFits: `Lokal rummer ${lokal.pages.min}-${lokal.pages.max} indholdssider, og det passer til det, du beskriver.`,
      lokalTooSmall: `Lokal rummer ${lokal.pages.min}-${lokal.pages.max} indholdssider. Du har brug for flere, så jeg foreslår den mindste købspakke, der kan rumme dem.`,
      googleStart: 'Du har brug for hjælp til Google-profilen. En Google-profil, der er sat op eller rettet, er den mindste løsning, og det er en engangsopgave, ikke et abonnement.',
      googleQr: `QR-skiltet vælges uden booking: Google-profilen og QR-skiltet med opfølgning koster tilsammen ${formatKr(components.googleProfile.price + components.qrOpfoelgning.price)}. Booking er ikke med, for du har ikke bedt om det.`,
      bookingHasSite: 'Du har allerede en hjemmeside, så jeg kobler bookingen på den. Jeg bygger ikke en ny kalender: bookingen kører i et eksisterende system.',
      bookingUnsureSite: 'Du er ikke sikker på, om du har en hjemmeside, så jeg foreslår ikke en ny. Bookingen kobles på den, du har, eller på Instagram.',
      bookingNoSite: 'Du kan få booking via Instagram og Google uden at bestille en ny hjemmeside.',
      bookingNewSite: 'Du vil have bookingen på en hjemmeside. Jeg foreslår den mindste: én side med booking koblet på.',
      bookingLokal: 'Du vil have bookingen på en hjemmeside og helst betale løbende. Lokal indeholder Google-profilen, så den trækkes fra. Bookingen kobles på som engangsopgave.',
      bookingSubscription: 'Abonnementet hos bookingudbyderen betaler du direkte til udbyderen.',
      arbejdsgangLidt: 'Når der kommer få forespørgsler, er en god formular og din almindelige indbakke ofte nok. Lokal har en forespørgselsformular, og et system ville være mere, end du har brug for.',
      arbejdsgangSystem: 'Du får mange sager og har ikke et system i dag. Lokal med systemtilvalg samler dem i én arbejdsgang.',
      socialStart: 'Du lægger selv indholdet op. Det er den mindste løsning.',
      socialPost: 'Jeg laver indholdet og lægger det op for dig.',
      socialAds: 'Annoncer på Meta er kun med i Fuld fart, hvor jeg også laver og lægger indholdet op.',
      unsureDefault: 'Du var i tvivl, så jeg har valgt den mindste løsning. Du kan ændre den i beregneren.',
    },
  },
  /** Forudfyldt start på SMS fra resultatet (mailen fra formularen står i src/inquiry.js). */
  smsIntro: 'Hej Ronny. Jeg har brugt prisberegneren på oviaspecs.com:',
}

/* Svarene på "Hvor mange sider i alt?": 9 sider op til maxPages, hver med antal ekstra undersider. */
calculator.questions.hjemmeside.find((q) => q.id === 'ekstra').options = Array.from(
  { length: services.hjemmeside.maxPages - 8 },
  (_, i) => ({ id: String(9 + i), label: `${9 + i} sider`, tier: 'fuld-fart', extraPages: i + 1 }),
)

/* =========================================================================
   HJÆLPERE — behøver normalt ikke ændres.
   ========================================================================= */

/** 4000 -> "4.000 kr." (manuelt, så server og browser altid giver samme tekst). */
export function formatKr(n) {
  return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} kr.`
}

/** "4.000 kr." eller "2.500 kr./md" alt efter ydelsens betaling. */
export function formatPrice(service, n) {
  return service.billing === 'monthly' ? `${formatKr(n)}/md` : formatKr(n)
}

/** Laveste pakkepris for en ydelse, fx "fra 2.500 kr." */
/** "fra 2.500 kr. + drift fra 99 kr./md" for hjemmeside (drift er et særskilt valg), ellers som fromPrice. */
export function fromPriceWithDrift(service) {
  const base = fromPrice(service)
  return service.id === 'hjemmeside' ? `${base} + drift fra ${formatKr(driftFrom)}/md` : base
}

export function fromPrice(service) {
  return `fra ${formatPrice(service, Math.min(...service.tiers.map((t) => t.price)))}`
}

export const tierName = (tier) => tierNames[tier.id]
