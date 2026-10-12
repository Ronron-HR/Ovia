/* =========================================================================
   TILBUDDET — de to købsmåder, problemer, forløb, vilkår, systemer og lokal SEO.
   Priser og tal hentes fra src/data/pricing.js (formatKr + tallene). Skriv aldrig
   et beløb som tekst her: scripts/test-pricing.mjs fejler på hardkodede beløb.

   Læses af forsiden (BuyModes, Problems, Steps, Faq), /priser/ (BuyModes, Terms),
   /hjemmeside/, /booking-google/ (Lokal synlighed) og /systemer/.

   Regler: jeg-form. Ingen opdigtede kunder, tal eller resultater. Ingen garanti for
   placeringer eller flere kunder. Priserne er et nyt forslag; indgåede aftaler ændres ikke.
   ========================================================================= */

import {
  components,
  domainText,
  driftPlanList,
  driftPlans,
  formatKr,
  lokal,
  lokalMinimum,
  lokalMonthly,
  priceNote,
  services,
  systemModule,
  tierName,
} from './pricing.js'
import { home, paths } from './texts.js'

const web = services.hjemmeside

/* ---- Hjælpere (bygger tekst af tallene) --------------------------------- */

const perMonth = (n) => `${formatKr(n)}/md.`
const lastMonth = lokal.minMonths
/** Planerne med månedspris, fx "Basis ... og Ekstra ...". */
const planPrices = () => {
  const parts = driftPlanList.map((p) => `${p.name} ${perMonth(p.monthly)}`)
  return `${parts.slice(0, -1).join(', ')} og ${parts.at(-1)}`
}
/** Pakkerne med pris, fx "Start ..., Vækst ... og Fuld fart ...". */
const tierPrices = () => {
  const parts = web.tiers.map((t) => `${tierName(t)} ${formatKr(t.price)}`)
  return `${parts.slice(0, -1).join(', ')} og ${parts.at(-1)}`
}
const plan = (id) => driftPlans[id]
const minutesText = (id) => `op til ${plan(id).minutes} minutters`

/* ---- To måder at købe ---------------------------------------------------- */

export const buyModes = {
  eyebrow: 'To måder at købe',
  title: 'Vælg, hvordan du vil betale for hjemmesiden.',
  intro:
    'Det er den samme slags arbejde i begge. Forskellen er, om du betaler hjemmesiden som et løbende samarbejde eller som et engangsbeløb. Du vælger den ene eller den anden, så intet bliver betalt to gange.',

  lokal: {
    label: 'Løbende samarbejde',
    name: lokal.name,
    headline: 'Hjemmeside uden opstartspris og med et fast månedligt abonnement.',
    priceLine: `${formatKr(lokal.start)} i opstart · ${perMonth(lokal.monthly)}`,
    minimumLine: `Mindst ${lokal.minMonths} måneder fra lancering. I alt mindst ${formatKr(lokalMinimum())}.`,
    includes: [
      `${lokal.pages.min}–${lokal.pages.max} indholdssider til én virksomhed, ét sprog og én lokation. Nødvendige juridiske informationssider tæller ikke med.`,
      'Mobilvenligt design, tydelige handlinger og én kontakt- eller forespørgselsformular.',
      `Op til ${lokal.revisionRounds === 2 ? 'to' : lokal.revisionRounds} samlede korrekturrunder før lancering.`,
      'Let bearbejdning af den tekst og de billeder, du leverer.',
      'Hosting, SSL, teknisk vedligeholdelse, versionsbackup af hjemmesiden og kontrol af den aftalte formularfunktion.',
      `${domainText} Et domæne, du allerede har, forbliver i dit navn.`,
      'Indledende SEO på de leverede sider og hjælp til én Google Business Profile, hvis virksomheden er berettiget. Verifikation afhænger også af Google og af dig.',
      `Hver måned op til ${lokal.minutes.seo} minutters prioriteret lokal SEO, kontrol og en kort status.`,
      `Hver måned op til ${lokal.minutes.content} minutters mindre tekst- og billedrettelser. Ubrugte minutter overføres ikke.`,
      'En kort arbejdslog: hvilke oplysninger jeg har vedligeholdt, og hvad jeg har forbedret.',
      'Fejl i det aftalte retter jeg som fejl. De bliver ikke solgt som nye tilvalg.',
    ],
    excludes: [
      'Fotografering, omfattende tekstproduktion og ubegrænsede revisioner.',
      'Nye sider, nye integrationer og store tekstprojekter.',
      'Linkbuilding, annoncering og systemudvikling.',
      'Betalte eksterne tjenester er særskilte. Betaler du selv et abonnement eller et domæne direkte, bliver det ikke opkrævet to gange.',
      'Et system. Det beskrives på siden Systemer og får sin egen pris.',
    ],
    cta: { label: 'Beregn Lokal', href: '?ydelser=lokal#beregner' },
    note: `${priceNote} Opsigelse, overdragelse og ejerskab står under Vilkår.`,
  },

  koeb: {
    label: 'Køb hjemmesiden',
    name: 'Engangskøb',
    headline: 'Betal hjemmesiden én gang, og vælg drift ved siden af.',
    priceLine: `${tierPrices()}, én gang`,
    minimumLine: `Drift vælger du særskilt: ${planPrices()} Ingen bindingsperiode, opsigelse med ${lokal.noticeMonths} måneds varsel.`,
    includes: [
      'Start: én side og én rettelserunde.',
      'Vækst: op til fem sider, Google-grundopsætning og to rettelserunder.',
      'Fuld fart: op til otte sider, et lokalt SEO-fundament og tre rettelserunder.',
      `Tilvalg: bookingintegration for ${formatKr(components.booking.price)}. I Fuld fart koster en ekstra side efter otte ${formatKr(web.addons.extraPage.price)}. I Start og Vækst opgraderer du til næste pakke.`,
      `Egen konto eller hosting i stedet for en driftsplan: ${formatKr(web.addons.ownAccount.price)} én gang.`,
    ],
    excludes: [
      'Løbende SEO, systemer og marketing er ikke med i et engangskøb.',
      'Drift, som du vælger særskilt. Den er ikke med i pakkeprisen.',
      'Bookingudbyderens eget abonnement. Det betaler du direkte til udbyderen.',
    ],
    cta: { label: 'Beregn engangspris', href: '?ydelser=hjemmeside#beregner' },
    note: `${priceNote} Vilkår for drift og frikøb står under Vilkår.`,
  },

  compareNote:
    'Lokal passer, hvis du vil have hjælp hver måned og ikke vil betale en stor sum til start. Engangskøb passer, hvis du kun vil have selve hjemmesiden. Vælger du Lokal synlighed ved siden af, trækker jeg det fra, som allerede er med i din hjemmeside.',
}

/* ---- Tre problemer ------------------------------------------------------- */

export const problems = {
  eyebrow: 'Hvor det typisk går galt',
  title: 'Tre ting, der gør det svært at vælge dig.',
  items: [
    {
      id: 'hjemmeside',
      title: 'Hjemmesiden gør det svært at vælge dig',
      text: 'Den er forældet, langsom på telefonen eller skjuler åbningstider og kontakt. Så går kunden videre til den næste.',
      href: paths.hjemmeside,
      linkLabel: 'Se hjemmesider',
    },
    {
      id: 'synlighed',
      title: 'Din lokale synlighed på Google er svag',
      text: 'Forkerte åbningstider, få billeder eller en kategori, der ikke passer. Google viser lokale resultater ud fra relevans, afstand og kendthed. Jeg kan rette oplysningerne, men ikke afstanden.',
      href: paths.bookingGoogle,
      linkLabel: 'Se Lokal synlighed',
    },
    {
      id: 'henvendelser',
      title: 'Henvendelserne er besværlige at holde styr på',
      text: 'Forespørgsler ligger i mails og beskeder, og det er svært at se, hvem der mangler et svar. Nogle gange er en bedre formular nok. Andre gange kan et lille system hjælpe.',
      href: paths.systemer,
      linkLabel: 'Se Systemer',
    },
  ],
}

/* ---- Forløb: fem trin (samme trin som home.steps) ----------------------- */

export const process = {
  eyebrow: home.steps.eyebrow,
  title: home.steps.title,
  items: home.steps.items,
}

/* ---- Forsidens FAQ ------------------------------------------------------- */

export const homeFaq = {
  eyebrow: 'Spørgsmål',
  title: 'Det, du sikkert vil vide.',
  items: [
    {
      q: 'Hvad koster det?',
      a: `Lokal koster ${formatKr(lokal.start)} i opstart og ${perMonth(lokal.monthly)} i mindst ${lokal.minMonths} måneder, i alt mindst ${formatKr(lokalMinimum())}. Vil du hellere købe hjemmesiden som engangsbeløb, koster den ${tierPrices()}, og drift vælger du særskilt: ${planPrices()} ${priceNote}`,
    },
    {
      q: 'Hvorfor er der ingen opstartspris i Lokal?',
      a: `Hjemmesiden betales gennem den månedlige pris i stedet for med et beløb til start. Derfor er der en minimumsperiode på ${lokal.minMonths} måneder. Du ser det samlede minimum, ${formatKr(lokalMinimum())}, før du sender noget til mig.`,
    },
    {
      q: 'Hvad sker der efter minimumsperioden?',
      a: `Abonnementet fortsætter måned for måned, til du opsiger. Opsigelsen har ${lokal.noticeMonths} måneds varsel og kan tidligst træde i kraft ved udgangen af måned ${lastMonth}. Opsiger du senest ved udgangen af måned ${lastMonth - 1}, slutter abonnementet efter måned ${lastMonth}.`,
    },
    {
      q: 'Hvem ejer hjemmesiden?',
      a: `Du ejer dit domæne, dit indhold og dine data. Efter minimumsperioden kan du få hjemmesidens filer og nødvendig dokumentation udleveret uden særskilt frikøb, når forfaldne beløb er betalt. Filudlevering er ikke det samme som at flytte en kørende løsning med betalte licenser eller en administreret backend. Det står under Vilkår.`,
    },
    {
      q: 'Kan jeg bare købe hjemmesiden uden abonnement?',
      a: `Ja. Under Køb hjemmesiden betaler du pakken én gang og vælger drift for sig. Stopper du driften, kan du købe siden fri for ${formatKr(web.drift.buyoutPrice)} og få den overført til din egen konto.`,
    },
    {
      q: 'Kan du love, at jeg bliver fundet på Google?',
      a: 'Nej. Google viser lokale resultater ud fra relevans, afstand og kendthed. Jeg kan rette oplysninger, kategori og åbningstider og gøre det nemt at bede kunderne om ægte anmeldelser. Afstanden kan jeg ikke ændre, og placeringer kan ikke købes.',
    },
    {
      q: 'Hvad er et system, og har jeg brug for et?',
      a: 'Et system er en lille arbejdsgang, fx at samle forespørgsler om selskaber med status. De fleste har ikke brug for et. Jeg spørger først, hvordan du arbejder i dag, og anbefaler kun et system, hvis det sparer tid eller giver overblik. Status for systemer står på siden Systemer.',
    },
    {
      q: 'Hvem laver arbejdet?',
      a: 'Mig, Ronny Hong. Min base er Aarhusområdet. OviaSpecs er nyt, og du taler direkte med mig fra første samtale.',
    },
  ],
}

/* ---- Vilkår -------------------------------------------------------------- */

const gone = lokal.minMonths + 1

export const terms = {
  eyebrow: 'Vilkår',
  title: 'Vilkår, så du ved, hvad du siger ja til.',
  intro:
    'Vilkårene for Lokal er nye og gælder for nye aftaler. Vilkårene for engangskøb er de samme som før. Omfanget aftales skriftligt, før jeg går i gang.',

  lokal: {
    title: 'Løbende samarbejde: Lokal',
    items: [
      'Omfanget skrives ned og aftales, før jeg går i gang.',
      'Første måned betales, før jeg bygger færdigt. Beløbet fratrækkes første abonnementsmåned fra lancering og er ikke et ekstra startgebyr.',
      `Abonnementet løber i mindst ${lokal.minMonths} måneder fra lancering. Mindste samlede betaling er ${formatKr(lokalMinimum())}.`,
      `Du opsiger med ${lokal.noticeMonths} måneds varsel. Opsigelsen kan tidligst træde i kraft ved udgangen af måned ${lastMonth}, og du kan varsle allerede før måned ${lastMonth}. Opsiger du senest ved udgangen af måned ${lastMonth - 1}, slutter abonnementet efter måned ${lastMonth}. Der er ingen skjult måned ${gone}. Opsiger du senere, slutter abonnementet ved udgangen af måneden efter den måned, du opsiger i.`,
      'Efter minimumsperioden kan du få hjemmesidens filer og nødvendig dokumentation udleveret uden særskilt frikøb, når forfaldne beløb er betalt. Du får vedvarende brugsret til den leverede hjemmeside. Generelle moduler, jeg bruger flere steder, kan jeg stadig genbruge.',
      'Filudlevering er ikke det samme som en administreret backend, betalte licenser, eksterne tjenester eller flyttearbejde. Det aftaler vi særskilt, hvis du får brug for det. Data fra et system kan du få eksporteret i et brugbart format.',
      `${domainText} Betalte eksterne tjenester er særskilte. Et domæne, du har i forvejen, forbliver i dit navn og flyttes kun, hvis der er behov for det. Betaler du selv for domænet, opkræver jeg det ikke.`,
      'Et tilkøb senere, fx et system, starter ikke hjemmesidens minimumsperiode forfra. Vilkårene for tilkøbet aftaler vi særskilt.',
      'Backup betyder versionsbackup af hjemmesiden. Det er ikke en backup af data i eksterne tjenester.',
    ],
  },

  koeb: {
    title: 'Køb hjemmesiden: vilkår for engangskøb',
    items: [
      `Du betaler pakken én gang: ${tierPrices()}.`,
      `Drift vælger du særskilt: ${planPrices()} Alle tre holder siden online og sikker, med hosting og versionsbackup af hjemmesiden. Basis har ingen indholdsrettelser. Plus har ${minutesText('plus')} og Ekstra ${minutesText('ekstra')} små rettelser pr. måned med tekst og billeder, du leverer. Ubrugte minutter overføres ikke.`,
      web.drift.domain,
      `Drift: ${web.drift.binding}`,
      `Egen konto eller hosting i stedet for en driftsplan koster ${formatKr(web.addons.ownAccount.price)} én gang. Så betaler du ikke drift til mig, og du kan selv have udgifter til hosting og domæne.`,
      web.drift.buyout(formatKr(web.drift.buyoutPrice)),
      `Bookingintegration koster ${formatKr(components.booking.price)}. Selve bookingsystemets abonnement betaler du direkte til udbyderen.`,
      'Løbende SEO, systemer og marketing er ikke automatisk med i et engangskøb.',
    ],
  },

  both: {
    title: 'Gælder begge',
    items: [
      'Du ejer dit domæne, dit indhold og dine data. Du beholder ejerskabet til relevante konti hos tredjepart.',
      'Support foregår på hverdage. Jeg svarer inden for 24 timer på hverdage. Det er et svarmål og ikke en garanti for, hvor hurtigt en fejl er rettet. Der er ingen døgnvagt, og jeg kan ikke love nul nedetid.',
      'Jeg lover ingen placering på Google, ingen indeksering og ingen omtale i AI-søgning.',
      `${priceNote}`,
      'Når du sender en forespørgsel på siden, er det en forespørgsel og ikke en bestilling. Intet er aftalt, før vi har aftalt omfanget skriftligt.',
    ],
  },

  difference: `Lokal er et abonnement med ${lokal.minMonths} måneders minimum og lidt arbejde hver måned, mens engangskøb er en hjemmeside, du betaler én gang, med drift som særskilt valg og et frikøb på ${formatKr(web.drift.buyoutPrice)}, hvis du stopper driften.`,
}

/* ---- Systemer ------------------------------------------------------------ */

const moduleReady = systemModule.ready === true
const moduleStatusText = moduleReady
  ? `Et standardmodul til én arbejdsgang koster ${perMonth(systemModule.monthly)} oveni Lokal, samlet ${perMonth(lokalMonthly(true))}, mindst ${formatKr(lokalMinimum(true))} over ${lokal.minMonths} måneder.`
  : `Jeg har endnu ikke et færdigt og testet standardmodul. Et system får derfor en særskilt fast pris, efter vi har afgrænset arbejdsgangen. Når et testet standardmodul er klar, er den planlagte pris ${perMonth(systemModule.monthly)} oveni Lokal. Så bliver det samlet ${perMonth(lokalMonthly(true))}, mindst ${formatKr(lokalMinimum(true))} over ${lokal.minMonths} måneder. Den pris gælder først, når modulet findes.`

export const systems = {
  eyebrow: 'Systemer',
  title: 'Et lille system til én arbejdsgang.',
  lead: 'Nogle virksomheder har brug for mere end en hjemmeside, fx et sted at samle forespørgsler, se status eller huske næste opfølgning. Det laver jeg kun, hvis en bestemt arbejdsgang kræver det.',

  status: {
    label: moduleReady ? 'Status: standardmodul klar' : 'Status: ikke færdigt endnu',
    text: moduleStatusText,
  },

  questionsFirst: {
    title: 'Jeg spørger først',
    note: 'Et nyt dashboard hjælper ikke, hvis ingen vil bruge det. Derfor starter jeg med din arbejdsgang og ikke med et system.',
    items: [
      'Hvor mange sager har virksomheden?',
      'Hvilke oplysninger mangler, når en sag kommer ind?',
      'Hvor meget tid går der med det i dag?',
      'Hvilket system bruger du allerede?',
    ],
  },

  examplesTitle: 'Tre eksempler',
  examplesIntro: 'Jeg anbefaler kun et system, hvis du har den arbejdsgang. Her er tre eksempler på, hvordan det kan se ud.',
  examples: [
    {
      id: 'catering',
      title: 'Catering og selskaber',
      fits: 'Passer, hvis du får mange forespørgsler om selskaber, og oplysningerne kommer ind i mails og beskeder i forskellige former.',
      includes: [
        'Én formular, der samler dato, antal personer, arrangementstype og relevante ønsker.',
        'Et overblik for ejeren med en status på hver forespørgsel.',
        'Én intern påmindelse, så ingen forespørgsel bliver liggende.',
      ],
      notIncluded: [
        'En forespørgsel er ikke en bekræftet reservation.',
        'Kasse, betaling eller gavekort.',
        'SMS og andre betalte tjenester, medmindre vi aftaler det.',
      ],
      skipIf: 'Får du få forespørgsler, er en bedre formular og en almindelig indbakke måske nok.',
    },
    {
      id: 'tilbud',
      title: 'Tilbudsopfølgning',
      fits: 'Passer til en servicevirksomhed, der sender mange tilbud og har svært ved at huske, hvem der skal følges op på.',
      includes: [
        'Nye sager, sendt tilbud og næste opfølgning samlet på ét sted.',
        'Interne påmindelser om, hvem der skal kontaktes hvornår.',
      ],
      notIncluded: [
        'Udgående beskeder til dine kunder i starten. De kræver korrekt opsætning og en arbejdsgang, du har godkendt.',
        'Et fuldt kundesystem.',
      ],
      skipIf: 'Sender du få tilbud, er en liste eller et regneark ofte nok.',
    },
    {
      id: 'booking',
      title: 'Booking',
      fits: 'Passer, hvis kunderne skal kunne booke, og du ikke har et system til det endnu.',
      includes: [
        'Jeg finder og vurderer et eksisterende bookingsystem, der passer til dig.',
        'Jeg sætter det op og kobler det på hjemmesiden og Google-profilen.',
      ],
      notIncluded: [
        'En ny kalender. Virker dit nuværende system, bruger vi det.',
        'Bookingsystemets eget abonnement. Det betaler du direkte til udbyderen.',
      ],
      skipIf: 'Har du en booking, der virker, skal du ikke have et nyt system.',
    },
  ],

  pricing: {
    title: 'Pris',
    text: 'Et system får en fast pris, som jeg skriver ned, før jeg går i gang. Prisen afhænger af arbejdsgangen. En ekstra funktion eller bruger senere er et nyt tilbud. Eksterne abonnementer, SMS og AI-forbrug er ikke med, medmindre vi har aftalt det.',
  },

  safety: {
    title: 'Sikkerhed og drift',
    items: [
      'Sikkerheden står i forhold til, hvad systemet gør. Et overblik over forespørgsler kræver mindre end et system med betalinger.',
      'Jeg samler kun de oplysninger, arbejdsgangen har brug for.',
      'Data kan eksporteres i et brugbart format.',
      `Når et standardmodul er klar, er der op til ${systemModule.supportMinutes} minutters ekstra brugerstøtte om måneden. Fejl i det aftalte retter jeg som fejl, uden at det tæller med i de minutter.`,
    ],
  },

  demo: {
    eyebrow: 'Demo',
    title: 'Prøv en arbejdsgang.',
    intro: 'Udfyld formularen som en gæst, der spørger om et selskab, og se forespørgslen dukke op i overblikket med en status og en påmindelse.',
    label: 'Demo',
    disclaimer: 'Demo – ikke et færdigt system. Intet sendes eller gemmes.',
  },

  contact: {
    title: 'Har du en arbejdsgang, der kunne være nemmere?',
    body: 'Ring eller skriv, og fortæl om en besværlig sag. Så kan jeg sige, om et system giver mening, eller om en bedre formular er nok.',
  },
}

/* ---- Lokal synlighed (/booking-google/) ---------------------------------- */

export const localSeo = {
  eyebrow: 'Lokal SEO',
  title: 'Hvad jeg konkret gør for din lokale synlighed.',
  intro: `Det her er den løbende del af Lokal. Google-profil, booking og QR-skilt kan du også vælge som engangsopgaver.`,

  atStart: {
    title: 'Ved start',
    items: [
      'Jeg afklarer dine primære ydelser og dit område.',
      'Jeg gennemgår din eksisterende hjemmeside og Google-profil.',
      'Jeg retter relevante sidetitler, struktur og indhold.',
      'Jeg kontrollerer, at siderne kan indekseres, og at kontaktoplysningerne er rigtige.',
      'Jeg tilslutter Search Console, så du står som ejer.',
      'Jeg afklarer Google-kategori, åbningstider og relevante links til booking og menu.',
    ],
  },

  monthly: {
    title: 'Hver måned',
    items: [
      'Jeg vælger ét reelt problem eller én forbedring inden for månedens ramme.',
      'Jeg følger de relevante data.',
      'Du får en kort status og en arbejdslog.',
      'Jeg laver ikke rutineændringer uden formål.',
      `Rammen er op til ${lokal.minutes.seo} minutter. Nye lange tekster og nye landingssider prissættes særskilt.`,
    ],
  },

  measurement: {
    title: 'Måling',
    items: [
      'Jeg holder visninger, klik, relevante henvendelser og faktiske salg fra hinanden.',
      'Et klik på Googles ringeknap er ikke et gennemført opkald.',
      'Jeg viser før- og eftertal med forbehold for sæson, annoncering og andre ændringer.',
      'Jeg viser kun tal, jeg har adgang til.',
      'Jeg lover ingen placering, ingen indeksering og ingen omtale i AI-søgning. Google oplyser, at AI-funktionerne i søgning ikke kræver ekstra optimering.',
    ],
  },

  reviews: {
    title: 'Anmeldelser og QR-skilt',
    items: [
      'Du kan bede alle relevante kunder om en ægte anmeldelse med et link eller en QR-kode. Jeg køber ikke anmeldelser, belønner ikke og sorterer ikke i, hvem der bliver spurgt.',
      `QR-skiltet er en engangsopgave: layout og opfølgning efter 30 dage med tal koster ${formatKr(components.qrOpfoelgning.price)}. Du kan vælge det uden booking.`,
      'Print og forsendelse er ikke med.',
    ],
  },

  /** Hvad der hører til Lokal, og hvad der kan købes som engangsopgave. */
  oneOff: {
    title: 'Som engangsopgave',
    items: [
      `Google-profil: ${formatKr(components.googleProfile.price)}.`,
      `Booking koblet på: ${formatKr(components.booking.price)}. Bookingsystemets abonnement betaler du direkte til udbyderen.`,
      `QR-skilt og opfølgning: ${formatKr(components.qrOpfoelgning.price)}.`,
      `Google-profil og QR-skilt uden booking: ${formatKr(components.googleProfile.price + components.qrOpfoelgning.price)}.`,
    ],
  },

  /** Hvad der ikke er med, ud over dét der er ovenfor. */
  excluded: 'Linkbuilding, annoncering, nye sider og store tekstprojekter er ikke med og prissættes særskilt.',

  /** Skal nævnes, så "du bliver fundet på Google" aldrig står som et løfte. */
  goalNote: 'Målet er, at kunder kan finde dig og kontakte dig. Hvor du står i søgningen, bestemmer Google, ud fra relevans, afstand og kendthed.',
}


/* formatKr slutter på punktum. Står beløbet sidst i en sætning, rettes dobbelt punktum til ét. */
const tidy = (v) => {
  if (Array.isArray(v)) v.forEach((x, i) => (typeof x === 'string' ? (v[i] = x.replace(/\.\.(?!\.)/g, '.')) : tidy(x)))
  else if (v && typeof v === 'object')
    for (const k of Object.keys(v)) typeof v[k] === 'string' ? (v[k] = v[k].replace(/\.\.(?!\.)/g, '.')) : tidy(v[k])
}
;[buyModes, problems, process, homeFaq, terms, systems, localSeo].forEach(tidy)
