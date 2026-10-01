/* =========================================================================
   KONFIGURATION — ALLE PRISER, PAKKER OG INDSTILLINGER BOR HER
   Ret tal og tekst her, så følger forsiden, ydelsessiderne, /priser/ og
   prisberegneren med. Komponenterne indeholder ingen priser.

   Regler (må ikke brydes):
   - Pakkerne hedder Start, Vækst og Fuld fart. Vækst er "Anbefalet";
     ingen mærker om popularitet.
   - Ingen rabatkoder, nedtællinger eller kunstigt pres.
   - Ingen opdigtede udtalelser, kundetal eller resultater.
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
export const priceNote = 'Momsfri – OviaSpecs er ikke momsregistreret'

/** Mærke ved pakkerne og i beregneren. Tom = skjult. */
export const introText = 'Introduktionspriser'

/** Højeste pakkepris for en hjemmeside (tjekkes af scripts/test-pricing.mjs). */
export const maxWebsitePackage = 6000

/**
 * Svaret på "Hvornår kan vi starte?" på ydelsessiderne. Har ydelsen sin egen
 * `startNow`, bruges den i stedet. Er begge tomme, skjules spørgsmålet.
 */
export const paidStartText = 'Betalte opgaver fra februar 2027.'

/** Mærket på den anbefalede pakke. */
export const recommendedLabel = 'Anbefalet'
export const recommendedTier = 'vaekst'

/** Navnene på de tre pakker (bruges af alle ydelser). */
export const tierNames = { start: 'Start', vaekst: 'Vækst', 'fuld-fart': 'Fuld fart' }

/** Vises på /booking-google/, ved Hjemmeside Fuld fart og i beregneren, når booking er valgt. */
export const bookingSubscriptionNote =
  'Abonnementet på bookingsystemet (fx Planway eller Booksy) betaler du selv direkte til udbyderen.'

export const flags = {
  /** false: marketingsiden viser "Pilotforløb" i stedet for cases. */
  hasMarketingCases: false,
}

/* ---- Overlap mellem hjemmeside og Booking & Google ----------------------
   Booking & Google består af komponenter. Er en komponent allerede med i den
   valgte hjemmesidepakke (`includes`), trækkes dens pris fra Booking &
   Google-prisen i beregneren, og noten nævner præcis hvilke dele.
   Booking & Google-pakkernes pris = summen af deres komponenter.
------------------------------------------------------------------------- */
export const components = {
  googleProfile: { label: 'Google-profil', price: 500 },
  booking: { label: 'booking', price: 500 },
  qrOpfoelgning: { label: 'QR-skilt og opfølgning', price: 500 },
}

export const overlap = {
  /** Fx "Google-profil og booking er allerede med i Hjemmeside Fuld fart". */
  note: (parts, webTier) => `${parts} er allerede med i Hjemmeside ${webTier}`,
  /** Vises i stedet for en pris, når hele Booking & Google-pakken er dækket. */
  allIncluded: 'Alt i denne pakke er allerede med i din hjemmesidepakke',
}

/* ---- Ydelser og pakker -------------------------------------------------
   billing: 'once' (engangspris) eller 'monthly' (pris pr. måned).
   buffer:  0 = fast pris i beregneren (det er det, alle ydelser bruger).
            Over 0 ville give et interval ("ca. X–Y kr."); pristesten fejler da.
   monthly: løbende drift pr. måned (kun hjemmeside).
   includes: komponenter fra `components`, som pakken indeholder (se overlap).
------------------------------------------------------------------------- */
export const services = {
  hjemmeside: {
    id: 'hjemmeside',
    name: 'Hjemmeside',
    billing: 'once',
    buffer: 0,
    tiers: [
      {
        id: 'start',
        price: 2500,
        includes: [],
        monthly: 300,
        summary: 'Én side med det vigtigste.',
        features: ['Onepage: alt samlet på én side', '1 rettelserunde'],
      },
      {
        id: 'vaekst',
        price: 4000,
        includes: ['googleProfile'],
        monthly: 300,
        summary: 'Flere sider, og du bliver fundet på Google.',
        features: ['Op til 5 sider', 'Google-profil sat op', 'Grundlæggende SEO', '2 rettelserunder'],
      },
      {
        id: 'fuld-fart',
        price: 5500,
        includes: ['googleProfile', 'booking'],
        monthly: 400,
        monthlyNote: 'ændringer laves inden 2 hverdage',
        /** Lille note nederst på pakkekortet. */
        note: bookingSubscriptionNote,
        summary: 'Hele pakken, med booking eller bestilling.',
        features: [
          'Op til 8 sider',
          'Google-profil sat op',
          'Lokal SEO',
          'Booking eller bestilling koblet på',
          '3 rettelserunder',
        ],
      },
    ],
    addons: {
      /** Alternativ til månedlig drift. Lægges til hjemmesideprisen i beregneren. */
      ownAccount: { label: 'Engangskøb: siden lægges på din egen konto i stedet for drift', price: 1000 },
      extraPage: { label: 'Ekstra underside', price: 400 },
      /** Uden fast pris: `text` vises i stedet for et beløb. */
      over8: { label: 'Flere end 8 sider', text: 'Aftales' },
    },
    /** Hvad drift dækker. Prisen pr. måned står på pakkerne (monthly). */
    drift: {
      included: [
        'Hosting, domæne, SSL og backup',
        'Op til 2 små ændringer om måneden (tekst, billeder, mindre designjusteringer)',
      ],
      fast: 'På Fuld fart laves ændringerne inden 2 hverdage.',
      notIncluded: 'Ubrugte ændringer overføres ikke. Nyt design eller nye sider aftales separat.',
      domain: 'Domænet registreres i dit navn.',
      binding: 'Ingen binding. Opsigelse med 1 måneds varsel.',
      /** Pris for at købe siden fri, når drift opsiges. */
      buyoutPrice: 1000,
      /** Prisen indsættes fra buyoutPrice. */
      buyout: (price) => `Stopper du drift, kan du købe siden fri for ${price} og få den overført til din egen konto.`,
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
    buffer: 0,
    tiers: [
      {
        id: 'start',
        price: 1500,
        summary: 'Videoer, du selv lægger op.',
        features: ['4 korte videoer om måneden', 'Du poster selv'],
      },
      {
        id: 'vaekst',
        price: 2500,
        summary: 'Jeg laver indholdet og poster det.',
        features: ['8 korte videoer om måneden', '4 opslag om måneden', 'Jeg poster på 2 kanaler', 'Månedsrapport'],
      },
      {
        id: 'fuld-fart',
        price: 4000,
        summary: 'Mere indhold og annoncer på Meta.',
        features: [
          '12 korte videoer om måneden',
          '8 opslag om måneden',
          'Jeg poster på 3 kanaler',
          'Styring af Meta-annoncer (annoncebudgettet betaler du selv direkte til Meta)',
          'Månedsrapport',
        ],
        limit: 'Max 1 kunde ad gangen',
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
        'Er du tilfreds, giver du en ærlig udtalelse',
        'Uforpligtende. Efter piloten kan du fortsætte på Vækst',
      ],
      limitText: 'Max 2 piloter ad gangen',
      /** Link under marketing-prisen i beregnerens resultat (kun når flags.hasMarketingCases er false). */
      calcLink: { label: 'Vil du prøve først? Se pilotforløbet', href: '/marketing/#pilot' },
    },
    binding: 'Ingen binding. Opsigelse med 1 måneds varsel.',
    /** Tom = paidStartText bruges. Pilotforløbet står i PilotSection på /marketing/. */
    startNow: '',
  },

  bookingGoogle: {
    id: 'bookingGoogle',
    name: 'Booking & Google',
    billing: 'once',
    buffer: 0,
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
        price: 500,
        includes: ['googleProfile'],
        summary: 'Din Google-profil i orden.',
        features: ['Google-profil sat op eller rettet'],
      },
      {
        id: 'vaekst',
        price: 1000,
        includes: ['googleProfile', 'booking'],
        summary: 'Kunderne kan booke selv.',
        features: ['Google-profil sat op eller rettet', 'Booking koblet på din hjemmeside eller Instagram'],
      },
      {
        id: 'fuld-fart',
        price: 1500,
        includes: ['googleProfile', 'booking', 'qrOpfoelgning'],
        summary: 'Flere anmeldelser, og tal på det.',
        features: [
          'Google-profil sat op eller rettet',
          'Booking koblet på din hjemmeside eller Instagram',
          'QR-skilt, der beder alle kunder om en anmeldelse',
          'Opfølgning efter 30 dage med tal',
        ],
      },
    ],
  },
}

/* ---- Prisberegneren (/priser/) ------------------------------------------
   Trin 1: hvilke ydelser (flervalg). Derefter ét trin pr. valgt ydelse med
   dens spørgsmål og til sidst resultatet: højst 5 trin.

   Hvert svar peger på en pakke (`tier`); den højeste pakke blandt svarene
   vinder. `short` er spørgsmålet i opsummeringen (SMS/mail). `addon` lægger
   et tilvalg til (addons i ydelsen) i prisen, så resultatet viser det, kunden
   reelt betaler, og `noDrift` fjerner den månedlige drift. `custom` betyder, at
   prisen aftales (ingen pris i beregneren). `note` vises ved resultatet.
   Spørgsmålenes `id` skal være unikke, fordi de står i adresselinjen.
------------------------------------------------------------------------- */
export const calculator = {
  servicesQuestion: 'Hvad skal du bruge?',
  servicesHint: 'Vælg en eller flere.',
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
          { id: '9', label: 'Flere end 8 sider', tier: 'fuld-fart', custom: true },
        ],
      },
      {
        id: 'bestilling',
        short: 'Booking/bestilling',
        label: 'Skal kunderne kunne booke eller bestille via siden?',
        options: [
          { id: 'nej', label: 'Nej', tier: 'start' },
          { id: 'ja', label: 'Ja', tier: 'fuld-fart' },
        ],
      },
      {
        id: 'drift',
        short: 'Drift',
        label: 'Hvordan skal siden drives?',
        options: [
          { id: 'drift', label: 'Du passer siden for mig (drift pr. måned)', tier: 'start' },
          { id: 'egen', label: 'Den lægges på min egen konto (engangsbeløb)', tier: 'start', addon: 'ownAccount', noDrift: true },
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
    bookingGoogle: [
      {
        id: 'booking',
        short: 'Online booking',
        label: 'Skal kunderne kunne booke dig online?',
        options: [
          { id: 'nej', label: 'Nej, kun Google-profilen', tier: 'start' },
          { id: 'ja', label: 'Ja', tier: 'vaekst' },
        ],
      },
      {
        id: 'anmeldelser',
        short: 'QR-skilt',
        label: 'Vil du have et QR-skilt, der beder kunderne om en anmeldelse?',
        options: [
          { id: 'nej', label: 'Nej', tier: 'start' },
          { id: 'ja', label: 'Ja, og opfølgning efter 30 dage', tier: 'fuld-fart' },
        ],
      },
    ],
  },
  /** Under prisen. */
  finalNote: 'Endelig pris aftales efter en snak',
  /** Når prisen aftales (flere end 8 sider): vises i linjen og i totalen. */
  customPrice: 'Aftales',
  customTotal: 'hjemmesiden aftales',
  customNote: 'Flere end 8 sider aftales efter en snak.',
  /** Efter prisen, når siden lægges på kundens egen konto (ingen drift). */
  noDriftSuffix: 'i alt — ingen månedlig drift',
  /** Under totalen, når der også er en månedspris fra en anden ydelse. */
  noDriftWithMonthly: 'Ingen månedlig drift på hjemmesiden',
  /** Under totalen, når "egen konto" er valgt: hvad kunden selv står for. Tom = skjult. */
  ownAccountNote:
    'Du ejer selv kontoen og betaler domæne og hosting direkte til udbyderen. Rettelser efter levering aftaler vi pris på, før jeg går i gang.',
  /** Forudfyldt start på SMS og mail fra resultatet. */
  smsIntro: 'Hej Ronny. Jeg har brugt prisberegneren på oviaspecs.com:',
  mailSubject: 'Tilbud fra prisberegneren',
  /** Mailens linjer før og efter opsummeringen ('' = tom linje). */
  mailIntro: ['Hej Ronny,', '', 'Jeg har brugt prisberegneren på oviaspecs.com og vil gerne have et tilbud.'],
  mailOutro: ['Mit navn:', 'Min virksomhed:', 'Mit telefonnummer:'],
}

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
export function fromPrice(service) {
  return `fra ${formatPrice(service, Math.min(...service.tiers.map((t) => t.price)))}`
}

export const tierName = (tier) => tierNames[tier.id]
