/* =========================================================================
   YDELSESSIDER: MARKETING (SEO, Google Ads, sociale medier)
   Ingen priser, ingen løfter om placeringer, klik, salg eller resultater.
   Annoncebudgetter betales til platformen og aftales, før noget starter.
   ========================================================================= */

import { paths } from './content.js'

const contactCta = (topic, label = 'Beskriv din opgave') => ({ label, topic })

export const seo = {
  path: paths.seo,
  metaTitle: 'SEO: bliv lettere at finde i Google | OviaSpecs',
  metaDescription:
    'Få gennemgået og rettet det, der gør din hjemmeside svær at finde i Google: tekster, titler, hastighed og din Google-virksomhedsprofil. Ingen løfter om placeringer.',
  eyebrow: 'SEO',
  title: 'Bliv lettere at finde, når nogen søger efter jer.',
  lead: 'SEO handler om, at Google forstår, hvad I laver, og hvor I er. Jeg retter det, der gør din hjemmeside svær at finde, og siger ærligt, hvad det kan og ikke kan.',
  primary: { label: 'Spørg om SEO', href: '#kontakt' },
  secondary: { label: 'Se, hvordan det hænger sammen', href: '#eksempel' },
  visual: 'search',
  need: {
    eyebrow: 'Behovet',
    title: 'Kunderne søger på ”frisør Aarhus” eller ”brunch nær mig”, og finder andre end jer.',
    body: [
      'Det kan skyldes, at siden ikke fortæller Google, hvad I laver, at titlerne er tomme, at siden er langsom på telefon, eller at oplysningerne i jeres Google-profil er forkerte.',
      'Det er ting, der kan rettes.',
    ],
  },
  solution: {
    eyebrow: 'Løsningen',
    title: 'Jeg gennemgår siden og profilen og retter det, der hjælper mest.',
    intro: 'Jeg begynder med at se, hvor I står i dag, og hvad der konkret står i vejen. Derefter aftaler vi, hvad der rettes.',
    parts: [
      { title: 'Google-virksomhedsprofil', text: 'Åbningstider, kategorier, billeder, beskrivelse og links, så oplysningerne er rigtige, når nogen søger på jer i Google og på kortet. Profilen er gratis at have.' },
      { title: 'Hjemmesidens indhold', text: 'Titler, overskrifter og tekster, så både kunder og søgemaskiner kan se, hvad hver side handler om.' },
      { title: 'Teknik og hastighed', text: 'Hvor hurtigt siden åbner på telefon, og om den er opbygget, så søgemaskiner kan læse den.' },
    ],
  },
  deliver: {
    eyebrow: 'Det får du',
    title: 'Typiske leverancer',
    items: [
      'En gennemgang med konkrete rettelser i prioriteret rækkefølge',
      'Rettede sidetitler, metabeskrivelser og overskrifter',
      'Opryddet Google-virksomhedsprofil',
      'En kort skriftlig oversigt over, hvad der er ændret',
    ],
    limitsTitle: 'Afgrænsning',
    limits: [
      'Jeg lover ingen bestemte placeringer og intet bestemt antal besøgende. Det kan ingen ærligt love.',
      'SEO tager tid. Resultater afhænger af konkurrencen, af hvad folk søger på, og af jeres side.',
      'Omfang og pris vurderes efter opgaven. Der er ingen fast pris på siden.',
    ],
  },
  uses: {
    eyebrow: 'Eksempler',
    title: 'Hvad det kan betyde i praksis',
    intro: 'Mulige løsninger, ikke færdige kundecases.',
    items: [
      { title: 'Rigtige åbningstider på kortet', text: 'Kunden finder jer i Google og ser tider og vej, som passer med virkeligheden.' },
      { title: 'En side pr. ydelse', text: 'Tilbyder I flere ting, kan hver af dem få sin egen side med en klar titel.' },
      { title: 'En hurtigere side', text: 'Store billeder og gammel kode kan gøre en side langsom. Det retter jeg, hvor jeg kan.' },
    ],
  },
  steps: [
    { title: 'Du fortæller, hvad I gerne vil findes på', body: 'Fx bestemte ydelser eller et bestemt område.' },
    { title: 'Jeg gennemgår siden og profilen', body: 'Og fortæller, hvad der står i vejen.' },
    { title: 'Vi aftaler, hvad der rettes', body: 'Skriftligt, med omfang og pris, før jeg går i gang.' },
    { title: 'Jeg retter og giver en oversigt', body: 'Så du kan se, hvad der er ændret.' },
  ],
  costs: {
    title: 'Pris',
    text: 'Vurderes efter opgavens omfang, så der er ingen fast pris. Du får den skriftligt, før noget går i gang.',
  },
  faq: [
    {
      q: 'Kan du love, at jeg kommer øverst på Google?',
      a: 'Nej, og det kan ingen ærligt love. Jeg fortæller, hvad jeg gør, og hvorfor, og du kan holde mig op på det.',
    },
    {
      q: 'Hvor hurtigt kan jeg se en effekt?',
      a: 'Det varierer, og jeg kan ikke give en tid. Ændringer skal først opdages af søgemaskinerne, og konkurrenterne arbejder også på deres.',
    },
    {
      q: 'Skal jeg have en ny hjemmeside først?',
      a: 'Ikke nødvendigvis. Ofte kan den nuværende side rettes. Nogle gange giver en ny mere mening, og det siger jeg, før noget aftales.',
    },
    {
      q: 'Hvad er forskellen på SEO og Google Ads?',
      a: 'Med annoncer betaler du for hvert klik og står på en søgning, så længe kampagnen kører. SEO tager længere tid, men er ikke betaling pr. klik. Læs mere under Google Ads.',
    },
  ],
  contact: contactCta('seo', 'Beskriv, hvad I vil findes på'),
}

export const googleAds = {
  path: paths.googleAds,
  metaTitle: 'Google Ads til lokale virksomheder | OviaSpecs',
  metaDescription:
    'Få sat søgeannoncer op i Google, så din virksomhed vises, når nogen søger efter det, du tilbyder. Budgettet betales til Google og aftales, før noget starter.',
  eyebrow: 'Google Ads',
  title: 'Annoncer, der vises, når nogen søger efter det, du tilbyder.',
  lead: 'Med Google Ads betaler du for at blive vist på en søgning. Jeg sætter kampagnen op, så budgettet går til de søgninger, der passer til din virksomhed.',
  primary: { label: 'Spørg om Google Ads', href: '#kontakt' },
  secondary: { label: 'Se, hvordan det virker', href: '#eksempel' },
  visual: 'flow-ads',
  need: {
    eyebrow: 'Behovet',
    title: 'Nyt tilbud, ny åbning eller en sæson, og du vil ikke vente på, at Google opdager siden.',
    body: [
      'SEO tager tid. Annoncer kan vises meget hurtigere, men kun så længe kampagnen kører og budgettet er der.',
      'Uden en plan bruges pengene let på søgninger, der ikke passer til jer.',
    ],
  },
  solution: {
    eyebrow: 'Løsningen',
    title: 'Jeg starter med mål og budget og bygger kampagnen derefter.',
    intro:
      'Vi aftaler, hvad kampagnen skal opnå, og hvad du vil bruge. Derefter opsætter jeg annoncerne og følger op, når de er startet.',
    parts: [
      { title: 'Søgeord og område', text: 'Hvilke søgninger annoncerne skal vises på, og hvor i landet eller byen.' },
      { title: 'Annoncetekster', text: 'Korte tekster, der siger, hvad I tilbyder, og hvad kunden skal gøre.' },
      { title: 'Den rigtige side', text: 'Annoncen peger på en side, der svarer på det, kunden søgte efter.' },
    ],
  },
  deliver: {
    eyebrow: 'Det får du',
    title: 'Typiske leverancer',
    items: [
      'Opsætning af en kampagne med søgeord, annoncetekster og område',
      'Aftalt dagligt eller månedligt budget',
      'Gennemgang af tallene og justering af kampagnen',
    ],
    limitsTitle: 'Afgrænsning',
    limits: [
      'Annoncebudgettet betales direkte til Google og kommer oven i mit arbejde.',
      'Jeg starter ikke annoncer, før vi har aftalt budget og mål.',
      'Jeg lover ikke et bestemt antal klik, henvendelser eller salg.',
      'Aftaler om løbetid og opsigelse står i det skriftlige tilbud. Der er ingen fast pris på siden.',
    ],
  },
  uses: {
    eyebrow: 'Eksempler',
    title: 'Hvornår det kan give mening',
    intro: 'Mulige løsninger, ikke færdige kundecases.',
    items: [
      { title: 'En ny åbning eller et nyt tilbud', text: 'Når nyheden skal frem nu og ikke om et halvt år.' },
      { title: 'En sæson', text: 'Fx julefrokoster eller sommerens arrangementer, hvor søgningen topper i en periode.' },
      { title: 'En bestemt ydelse', text: 'Vil I have flere til netop den ene ting, kan annoncen pege direkte på den.' },
    ],
  },
  steps: [
    { title: 'Du fortæller, hvad annoncerne skal opnå', body: 'Og hvad du kan afsætte i budget.' },
    { title: 'Jeg laver et forslag', body: 'Med søgeord, tekster og område.' },
    { title: 'Du godkender, og vi aftaler vilkår', body: 'Skriftligt, før annoncerne starter.' },
    { title: 'Jeg følger op', body: 'Vi ser på tallene og justerer, hvor det giver mening.' },
  ],
  costs: {
    title: 'Annoncebudget og pris',
    text: 'Annoncebudgettet betales til Google. Mit arbejde vurderes efter opgaven og aftales skriftligt, før noget starter.',
  },
  faq: [
    {
      q: 'Hvor meget skal jeg bruge i budget?',
      a: 'Det afhænger af branche og område. Vi aftaler et budget, du er tryg ved, før noget starter, og jeg starter ikke annoncer uden din aftale.',
    },
    {
      q: 'Kan jeg stoppe, når jeg vil?',
      a: 'Annoncer kan sættes på pause. Hvordan opsigelsen af min hjælp foregår, står i det skriftlige tilbud.',
    },
    {
      q: 'Kan du garantere flere kunder?',
      a: 'Nej. Jeg kan sætte kampagnen op og justere den, men ingen kan love et bestemt antal klik eller kunder.',
    },
    {
      q: 'Hvad er forskellen på Google Ads og SEO?',
      a: 'Annoncer betaler du for pr. klik, og de vises kun, mens kampagnen kører. SEO tager længere tid, men er ikke betaling pr. klik. Læs mere under SEO.',
    },
  ],
  contact: contactCta('google-ads', 'Beskriv, hvad annoncerne skal opnå'),
}

export const sociale = {
  path: paths.sociale,
  metaTitle: 'Annoncering på sociale medier: Meta og TikTok | OviaSpecs',
  metaDescription:
    'Få opsat annoncer på Meta (Facebook og Instagram) og TikTok. Jeg forklarer forskellen og anbefaler kun det, der passer. Annoncebudgettet betales til platformen.',
  eyebrow: 'Annoncering på sociale medier',
  title: 'Annoncer på Meta og TikTok, der viser jer for dem, der ikke leder endnu.',
  lead: 'På sociale medier søger folk ikke efter jer. De ser jer, mens de gør noget andet. Jeg forklarer, hvad Meta og TikTok er, og anbefaler kun det, der passer til jer.',
  primary: { label: 'Spørg om annoncer på sociale medier', href: '#kontakt' },
  secondary: { label: 'Se forskellen', href: '#eksempel' },
  visual: 'social',
  need: {
    eyebrow: 'Behovet',
    title: 'Nogle tilbud søger folk ikke efter. De skal bare se dem på det rigtige tidspunkt.',
    body: [
      'Et arrangement, en åbning eller et tilbud: det er ikke noget, mange skriver i Google. Men de kan godt blive interesserede, når de ser det.',
      'Her er annoncer på sociale medier en anden vej end Google Ads, hvor folk aktivt leder.',
    ],
  },
  solution: {
    eyebrow: 'Løsningen',
    title: 'Meta eller TikTok, eller begge, alt efter hvem I vil nå.',
    intro:
      'Jeg opsætter og justerer annoncer til en kampagne eller et tilbud: målgruppe, tekst, billeder og budget. Hvilken kanal der giver mening, afhænger af jeres målgruppe og det materiale, I har.',
    parts: [
      {
        title: 'Meta',
        kind: 'Facebook og Instagram',
        text: 'Annoncer i nyhedsstrømmen og i Stories, med billeder eller korte videoer. Kan målrettes efter område og interesser. Passer ofte til lokale tilbud, arrangementer og åbninger.',
      },
      {
        title: 'TikTok',
        kind: 'Korte videoer',
        text: 'Annoncer, der vises som video mellem andre videoer. Kræver video, der ligner det, folk selv ser der. Passer, hvis I kan vise noget levende: hverdagen, maden, håndværket.',
      },
    ],
  },
  deliver: {
    eyebrow: 'Det får du',
    title: 'Typiske leverancer',
    items: [
      'Kampagneopsætning på den valgte platform: målgruppe, tekst, billeder eller video og budget',
      'Aftalt budget og periode',
      'Gennemgang af tallene og justering af kampagnen',
    ],
    limitsTitle: 'Afgrænsning',
    limits: [
      'Annoncebudgettet betales til platformen og kommer oven i mit arbejde.',
      'Billeder og video leverer du som udgangspunkt selv.',
      'Jeg starter ikke annoncer, før vi har aftalt kanal og budget, og jeg lover ikke bestemte resultater.',
      'Omfang og pris vurderes efter opgaven. Der er ingen fast pris på siden.',
    ],
  },
  uses: {
    eyebrow: 'Eksempler',
    title: 'Hvornår det kan give mening',
    intro: 'Mulige løsninger, ikke færdige kundecases.',
    items: [
      { title: 'Et arrangement eller en åbning', text: 'Annoncen vises for folk i nærheden, mens der stadig er tid til at komme.' },
      { title: 'Et tilbud i en periode', text: 'Fx en sæsonmenu eller en kampagne, der løber i få uger.' },
      { title: 'At gøre stedet kendt', text: 'Når I gerne vil ses af flere, der endnu ikke kender jer.' },
    ],
  },
  steps: [
    { title: 'Du fortæller, hvem I vil nå', body: 'Og hvad I har af billeder eller video.' },
    { title: 'Jeg anbefaler kanal og budget', body: 'Kun det, der passer. Ikke begge, hvis én er nok.' },
    { title: 'Du godkender, og vi aftaler vilkår', body: 'Skriftligt, før noget starter.' },
    { title: 'Jeg opsætter og følger op', body: 'Vi ser på tallene og justerer.' },
  ],
  costs: {
    title: 'Annoncebudget og pris',
    text: 'Annoncebudgettet betales til Meta eller TikTok. Mit arbejde vurderes efter opgaven og aftales skriftligt, før noget starter.',
  },
  faq: [
    {
      q: 'Hvad er Meta?',
      a: 'Meta er virksomheden bag Facebook og Instagram. Annoncer på Meta vises på begge steder.',
    },
    {
      q: 'Skal jeg have både Meta og TikTok?',
      a: 'Nej. Jeg anbefaler kun det, der passer til jeres målgruppe og materiale. Ofte er én kanal nok til at starte med.',
    },
    {
      q: 'Skal jeg have video?',
      a: 'På TikTok ja, og det skal ligne det, folk selv ser der. På Meta kan et godt billede være nok.',
    },
    {
      q: 'Hvad koster annoncerne?',
      a: 'Budgettet vælger vi sammen og betales til platformen. Mit arbejde aftales skriftligt, før noget starter.',
    },
  ],
  contact: contactCta('sociale', 'Beskriv, hvem I vil nå'),
}
