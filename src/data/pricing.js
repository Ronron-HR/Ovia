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
  /** Skriv CVR-nummeret her (fx '12345678'). null = skjult. */
  cvr: null,
  /** Adresse (fx 'Gade 1, 8000 Aarhus C'). Tom = skjult. Vises først i footeren, når både CVR og adresse er udfyldt. */
  address: '',
}

/* ---- Fælles tekster og flag -------------------------------------------- */

/** Står under alle priser. */
export const priceNote = 'Priserne er endelige. OviaSpecs er ikke momsregistreret.'

/** Vises i FAQ'en "Hvornår kan vi starte?" på alle ydelsessider. Tom streng = spørgsmålet skjules. */
export const paidStartText = 'Betalte opgaver fra februar 2027. Indtil da tilbyder jeg pilotforløb.'

/** Mærket på den anbefalede pakke. */
export const recommendedLabel = 'Anbefalet'
export const recommendedTier = 'vaekst'

/** Navnene på de tre pakker (bruges af alle ydelser). */
export const tierNames = { start: 'Start', vaekst: 'Vækst', 'fuld-fart': 'Fuld fart' }

export const flags = {
  /** false: marketingsiden viser "Pilotforløb" i stedet for cases. */
  hasMarketingCases: false,
}

/* ---- Ydelser og pakker -------------------------------------------------
   billing: 'once' (engangspris) eller 'monthly' (pris pr. måned).
   buffer:  hvor meget prisberegnerens interval går over pakkeprisen
            (fx 5.500 kr. + 1.000 = "ca. 5.500–6.500 kr."). 0 = fast pris.
   monthly: løbende drift pr. måned (kun hjemmeside).
------------------------------------------------------------------------- */
export const services = {
  hjemmeside: {
    id: 'hjemmeside',
    name: 'Hjemmeside',
    billing: 'once',
    buffer: 1000,
    tiers: [
      {
        id: 'start',
        price: 3000,
        monthly: 400,
        summary: 'Én side med det vigtigste.',
        features: ['Onepage: alt samlet på én side', '1 rettelserunde'],
      },
      {
        id: 'vaekst',
        price: 5500,
        monthly: 400,
        summary: 'Flere sider, og du bliver fundet på Google.',
        features: ['Op til 5 sider', 'Google-profil sat op', 'Grundlæggende SEO', '2 rettelserunder'],
      },
      {
        id: 'fuld-fart',
        price: 8500,
        monthly: 600,
        monthlyNote: 'ændringer laves inden 2 hverdage',
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
      /** Alternativ til månedlig drift. Samme beløb, hvis man stopper drift og vil købe siden fri. */
      ownAccount: { label: 'Engangskøb: siden lægges på din egen konto i stedet for drift', price: 1500 },
      extraPage: { label: 'Ekstra underside', price: 500 },
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
      /** Prisen indsættes fra addons.ownAccount.price. */
      buyout: (price) => `Stopper du drift, kan du købe siden fri for ${price} og få den overført til din egen konto.`,
    },
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
        price: 2000,
        summary: 'Indhold, du selv lægger op.',
        features: ['2 korte videoer om måneden', '2 opslag om måneden', 'Du poster selv'],
      },
      {
        id: 'vaekst',
        price: 3500,
        summary: 'Jeg laver indholdet og poster det.',
        features: ['4 korte videoer om måneden', '4 opslag om måneden', 'Jeg poster på 2 kanaler', 'Månedsrapport'],
      },
      {
        id: 'fuld-fart',
        price: 6000,
        summary: 'Mere indhold og annoncer på Meta.',
        features: [
          '8 korte videoer om måneden',
          '8 opslag om måneden',
          'Jeg poster på 3 kanaler',
          'Styring af Meta-annoncer (annoncebudgettet betaler du selv)',
          'Månedsrapport',
        ],
        limit: 'Max 1 kunde ad gangen',
      },
    ],
    /** Vises på marketingsiden, så længe flags.hasMarketingCases er false. */
    pilot: {
      weeks: 4,
      price: 0,
      sameAs: 'vaekst',
      scope: '4 korte videoer + 4 opslag',
      maxAtOnce: 2,
      terms: [
        'Gratis i 4 uger',
        'Samme omfang som Vækst: 4 korte videoer + 4 opslag',
        'Til gengæld må jeg bruge resultaterne som case',
        'Er du tilfreds, giver du en ærlig udtalelse',
        'Uforpligtende. Efter piloten kan du fortsætte på Vækst',
      ],
      limitText: 'Max 2 piloter ad gangen',
    },
    binding: 'Ingen binding. Opsigelse med 1 måneds varsel.',
  },

  bookingGoogle: {
    id: 'bookingGoogle',
    name: 'Booking & Google',
    billing: 'once',
    buffer: 500,
    /**
     * Booking må ikke tælles to gange: vælger kunden Hjemmeside Fuld fart (booking
     * er med) sammen med Booking & Google i en af `tiers`, trækkes `amount` fra
     * Booking & Google-prisen i beregneren, og `note` vises.
     */
    bookingOverlap: {
      whenHjemmeside: 'fuld-fart',
      tiers: ['vaekst', 'fuld-fart'],
      amount: 1000,
      note: 'Booking er allerede med i Hjemmeside Fuld fart',
    },
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
        summary: 'Din Google-profil i orden.',
        features: ['Google-profil sat op eller rettet'],
      },
      {
        id: 'vaekst',
        price: 2000,
        summary: 'Kunderne kan booke selv.',
        features: ['Google-profil sat op eller rettet', 'Booking koblet på din hjemmeside eller Instagram'],
      },
      {
        id: 'fuld-fart',
        price: 3500,
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
   vinder. `short` er spørgsmålet i opsummeringen (SMS/mail). `addon` lægger et tilvalg til (addons i ydelsen), og `noDrift`
   fjerner den månedlige drift. `note` vises ved resultatet.
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
          { id: '9', label: 'Flere end 8 sider', tier: 'fuld-fart', note: 'Ekstra undersider ud over 8 koster 500 kr. stykket.' },
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
          { id: '2', label: '2 videoer', tier: 'start' },
          { id: '4', label: '4 videoer', tier: 'vaekst' },
          { id: '8', label: '8 videoer', tier: 'fuld-fart' },
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

/** 5500 -> "5.500 kr." (manuelt, så server og browser altid giver samme tekst). */
export function formatKr(n) {
  return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')} kr.`
}

/** "5.500 kr." eller "3.500 kr./md" alt efter ydelsens betaling. */
export function formatPrice(service, n) {
  return service.billing === 'monthly' ? `${formatKr(n)}/md` : formatKr(n)
}

/** Laveste pakkepris for en ydelse, fx "fra 3.000 kr." */
export function fromPrice(service) {
  return `fra ${formatPrice(service, Math.min(...service.tiers.map((t) => t.price)))}`
}

export const tierName = (tier) => tierNames[tier.id]
