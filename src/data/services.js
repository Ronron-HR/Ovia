/* =========================================================================
   TEKSTER TIL YDELSESSIDERNE (/hjemmeside/, /marketing/, /booking-google/)
   Priser, pakkeindhold og vilkår hentes fra pricing.js og offer.js og står ikke her.

   Regler: jeg-form. Ingen opdigtede tal, resultater eller statistikker og
   ingen løfter om flere kunder eller mere salg. Lov kun det, der leveres.
   ========================================================================= */

import {
  bookingSubscriptionNote,
  calculator,
  components,
  contact,
  driftFrom,
  driftPlanList,
  formatKr,
  fromPrice,
  lokal,
  lokalMinimum,
  paidStartText,
  priceNote,
  services,
  tierName,
} from './pricing.js'
import { localSeo, terms } from './offer.js'
import { paths } from './texts.js'

const web = services.hjemmeside
/** "Start koster X kr., Vækst Y kr. og Fuld fart Z kr." ud fra pricing.js (altid med punktum til sidst). */
const tierList = (service, unit = '') => {
  const parts = service.tiers.map((t) => `${tierName(t)} ${formatKr(t.price)}${unit}`)
  const s = `${parts.slice(0, -1).join(', ')} og ${parts.at(-1)}`.replace(/^(\S+)/, '$1 koster')
  return s.endsWith('.') ? s : `${s}.`
}

/** Gør "kr.." og "md.." til ét punktum, når et beløb står sidst i en sætning. */
const tidy = (s) => s.replace(/\.\.(?!\.)/g, '.')

/** "Hvornår kan vi starte?": ydelsens startNow, ellers paidStartText. Skjules, når begge er tomme. */
const startFaq = (service) => {
  const a = service.startNow || paidStartText
  return a ? [{ q: 'Hvornår kan vi starte?', a }] : []
}

const toCalculator = { label: 'Se din pris', href: paths.priser }

/* ---- Hjemmeside -------------------------------------------------------- */

/** Planerne med månedspris ("Basis ..., Plus ... og Ekstra ...") ud fra driftPlans i pricing.js. */
const planList = () => {
  const parts = driftPlanList.map((p) => `${p.name} ${formatKr(p.monthly)}/md`)
  return `${parts.slice(0, -1).join(', ')} og ${parts.at(-1)}`
}

/** "Basis: ingen indholdsrettelser. Plus: op til 15 minutters små rettelser pr. måned ..." ud fra planernes minutter. */
const planScopes = () =>
  driftPlanList
    .map((p) =>
      p.minutes
        ? `${p.name}: op til ${p.minutes} minutters små rettelser pr. måned med tekst og billeder, du leverer`
        : `${p.name}: ingen indholdsrettelser`,
    )
    .join('. ')

const lokalTotal = formatKr(lokalMinimum())
const lokalMonth = `${formatKr(lokal.monthly)}/md.`

export const hjemmeside = {
  service: 'hjemmeside',
  meta: {
    title: 'Hjemmeside til virksomheder | OviaSpecs',
    description: `En hjemmeside, der virker på mobilen. Tre faste pakker fra ${formatKr(web.tiers[0].price)} plus drift fra ${formatKr(driftFrom)}/md. Ring ${contact.phone}.`,
  },
  eyebrow: 'Hjemmeside',
  title: 'Dine kunder leder efter dig på mobilen.',
  problem: [
    'Når nogen hører om dig, slår de dig op på telefonen. Mangler hjemmesiden, eller er den forældet, går de videre til den næste.',
    'Jeg laver en side, der viser, hvad du laver, hvornår du har åbent, og hvordan man kontakter dig. Du kan få den som et løbende samarbejde eller købe den som engangsbeløb.',
  ],
  toPackages: 'Se pakker',
  get: {
    eyebrow: 'Det får du',
    title: 'En side, der gør det nemt at vælge dig.',
    items: [
      { title: 'Lavet til telefonen', text: 'Siden er bygget til mobilen først og virker også på computeren.' },
      { title: 'Det vigtigste øverst', text: 'Hvad du laver, dine åbningstider og en knap til at ringe eller skrive.' },
      { title: 'Klar til Google', text: 'I Lokal, Vækst og Fuld fart hjælper jeg med din Google-profil og sætter siden op, så Google kan læse den. Hvor du står i søgningen, bestemmer Google.' },
      { title: 'Én formular', text: 'Kunden kan sende dig en forespørgsel. Jeg tjekker, at formularen virker, og beder kun om det, du har brug for.' },
    ],
  },
  /** De to måder at få en hjemmeside på, Lokal først. Kortene (buyModes) og vilkårene (terms) står i offer.js. */
  modes: {
    eyebrow: 'To måder at få en hjemmeside',
    title: 'Løbende samarbejde eller engangskøb.',
    lead: tidy(
      `Lokal koster ${formatKr(lokal.start)} i opstart og ${lokalMonth} i mindst ${lokal.minMonths} måneder, i alt mindst ${lokalTotal}. Du får hjemmesiden og lidt lokal SEO hver måned. Køber du hjemmesiden som engangsbeløb, betaler du pakken én gang og vælger drift for sig.`,
    ),
  },
  /** Vilkårene (samme tekster som på /priser/#vilkaar). */
  terms,
  concepts: {
    eyebrow: 'Eksempler',
    title: 'Sådan kan det se ud.',
    intro:
      'Fire hjemmesider, jeg har lavet som eksempler. De er ikke lavet for rigtige kunder, men de virker, så du kan prøve dem på din telefon.',
    more: 'Se alle eksempler',
  },
  packages: {
    eyebrow: 'Køb hjemmesiden',
    title: 'Tre pakker. Klare priser.',
    intro: 'Køber du hjemmesiden som engangsbeløb, vælger du to ting: pakken, du betaler én gang, og driftsplanen, du betaler hver måned.',
  },
  toCalculator,
  faq: {
    eyebrow: 'Spørgsmål',
    title: 'Det, du sikkert vil vide.',
    items: [
      {
        q: 'Hvad koster det?',
        a: tidy(
          `Lokal koster ${formatKr(lokal.start)} i opstart og ${lokalMonth} i mindst ${lokal.minMonths} måneder, i alt mindst ${lokalTotal}. Køber du hjemmesiden som engangsbeløb, ${tierList(web).replace(/^(\S+) koster/, '$1 koster')} Dertil kommer drift hver måned: ${planList()}. Du kan vælge en hvilken som helst plan til en hvilken som helst pakke. ${web.upgradeNote} I Fuld fart koster en ekstra underside ud over 8 sider ${formatKr(web.addons.extraPage.price)}. ${priceNote && !priceNote.endsWith('.') ? `${priceNote}.` : priceNote}`,
        ),
      },
      {
        q: 'Hvad er forskellen på Lokal og at købe hjemmesiden?',
        a: tidy(`${terms.difference} De to kan ikke blandes, så hjemmesiden bliver ikke betalt to gange.`),
      },
      {
        q: 'Hvad er inkluderet i drift?',
        a: `${web.drift.included.join('. ')}, i alle tre planer. Forskellen er indholdsarbejde. ${planScopes()}. ${web.drift.contentWork} ${web.drift.notContentWork} ${web.drift.unusedTime} ${web.drift.extraWork} ${web.drift.morePagesFaq(formatKr(web.addons.extraPage.price))}`,
      },
      {
        q: 'Hvilken driftsplan skal jeg vælge?',
        a: `Den mindste, der dækker dit behov. Skal du ikke have ændret noget, er ${driftPlanList[0].name} nok. ${driftPlanList[1].name} passer til små ændringer nu og da, og ${driftPlanList[2].name} til dig, der jævnligt skal have ændret tekst og billeder inden for minutterne. Planen er uafhængig af, hvilken pakke du vælger.`,
      },
      {
        q: 'Hvem ejer domænet og siden?',
        a: `${web.drift.domain} Vil du have siden på din egen konto fra starten, koster det ${formatKr(web.addons.ownAccount.price)} ekstra én gang i stedet for en driftsplan (på alle pakker). ${web.addons.ownAccount.note} I Lokal kan du efter minimumsperioden få filerne udleveret uden særskilt frikøb, når forfaldne beløb er betalt.`,
      },
      {
        q: 'Hvad hvis jeg vil stoppe?',
        a: tidy(
          `Engangskøb med drift: ${web.drift.binding} ${web.drift.buyout(formatKr(web.drift.buyoutPrice))} Lokal: Abonnementet løber i mindst ${lokal.minMonths} måneder. Du opsiger med ${lokal.noticeMonths} måneds varsel, tidligst til udgangen af måned ${lokal.minMonths}. Opsiger du senest ved udgangen af måned ${lokal.minMonths - 1}, slutter abonnementet efter måned ${lokal.minMonths}.`,
        ),
      },
      { q: 'Hvor lang tid tager det?', a: web.leadTime },
      ...startFaq(web),
    ],
  },
  contact: {
    title: 'Skal jeg kigge på din hjemmeside?',
    body: 'Ring eller skriv, og fortæl mig, hvad din side skal kunne.',
  },
}

/* ---- Marketing --------------------------------------------------------- */

const mk = services.marketing
const pilot = mk.pilot
/** Opsigelsen ved marketing: præcis, ikke bare "ingen binding". */
const mkBinding = `Ingen bindingsperiode. Opsigelse med ${lokal.noticeMonths} måneds varsel.`

export const marketing = {
  service: 'marketing',
  meta: {
    title: 'Marketing: korte videoer og opslag | OviaSpecs',
    description: `Korte videoer og opslag til dine sociale medier hver måned. Tre faste pakker fra ${formatKr(mk.tiers[0].price)}/md. Ingen binding. Ring ${contact.phone}.`,
  },
  eyebrow: 'Marketing',
  title: 'Korte videoer er det, folk ser.',
  problem: [
    'Men det tager tid at filme, klippe og lægge dem op, når du også skal passe din forretning.',
    'Jeg laver videoerne og opslagene for dig hver måned. Marketing er et særskilt valg og er ikke med i hjemmesiden eller Lokal.',
  ],
  toPackages: 'Se pakker',
  get: {
    eyebrow: 'Det får du',
    title: 'Indhold hver måned. Uden at du skal lave det.',
    items: [
      { title: 'Korte videoer', text: 'Jeg laver korte videoer til dine sociale medier. Antallet står i pakken.' },
      { title: 'Opslag', text: 'I Vækst og Fuld fart får du også opslag hver måned.' },
      { title: 'Jeg poster for dig', text: 'I Vækst og Fuld fart lægger jeg indholdet op. I Start poster du selv.' },
      { title: 'Månedsrapport', text: 'I Vækst og Fuld fart får du en rapport hver måned.' },
      { title: 'Meta-annoncer', text: 'I Fuld fart styrer jeg dine annoncer på Meta. Annoncebudgettet betaler du selv.' },
      { title: 'Ingen bindingsperiode', text: mkBinding },
    ],
  },
  /** Hvad der aftales skriftligt, før jeg starter. Ingen tal er opfundet: de aftales pr. kunde. */
  scope: {
    eyebrow: 'Omfang',
    title: 'Det aftaler vi skriftligt, før jeg går i gang.',
    intro: 'Marketing er ikke ubegrænset filming og redigering. Derfor står de her ting i en skriftlig aftale, før jeg starter:',
    items: [
      { title: 'Råmateriale', text: 'Du leverer billeder og klip, som du har ret til at bruge. Hvad, hvor meget og hvornår står i aftalen.' },
      { title: 'Optagelse og transport', text: 'Skal jeg selv filme hos dig, aftaler vi sted, tidspunkt og eventuel transport, før jeg starter. Optagelse er ikke ubegrænset.' },
      { title: 'Videolængde', text: 'Videoerne er korte. Længde og format aftaler vi, før jeg starter.' },
      { title: 'Revisioner', text: 'Antallet af rettelsesrunder pr. video står i aftalen. Redigering er ikke ubegrænset.' },
      { title: 'Publicering', text: 'I Start poster du selv og har ansvaret for det, du lægger op. I Vækst og Fuld fart lægger jeg kun indhold op, som du har godkendt. Kanalerne og kontiene er dine.' },
    ],
  },
  pilot: {
    eyebrow: 'Pilotforløb',
    title: `Prøv det uden betaling i ${pilot.weeks} uger.`,
    intro: 'Jeg har ingen marketingcases at vise endnu. Derfor tilbyder jeg et pilotforløb i stedet for at fortælle om resultater, jeg ikke har.',
    termsTitle: 'Sådan fungerer piloten',
    mailSubject: 'Pilotforløb (marketing)',
    smsText: 'Hej Ronny. Jeg er interesseret i et pilotforløb med marketing.',
  },
  packages: {
    eyebrow: 'Pakker',
    title: 'Tre pakker. Fast pris hver måned.',
    intro: `${mkBinding} Fuld fart tager jeg kun for én kunde ad gangen.`,
  },
  toCalculator,
  faq: {
    eyebrow: 'Spørgsmål',
    title: 'Det, du sikkert vil vide.',
    items: [
      {
        q: 'Hvad er et pilotforløb?',
        a: `${pilot.weeks} uger uden betaling med ${pilot.scope}. Jeg må bruge resultaterne som case. Du er ikke forpligtet til at give en udtalelse, og en pilot giver ikke ret til en positiv anmeldelse. Det er uforpligtende, og bagefter kan du fortsætte på ${tierName({ id: pilot.continueOn })}. Jeg har højst ${pilot.maxAtOnce} piloter ad gangen.`,
      },
      {
        q: 'Hvad aftaler vi, før du starter?',
        a: 'Råmateriale, optagelse og transport, videolængde, antal rettelsesrunder og hvem der publicerer. Det skriver jeg ned, før jeg starter. Filming og redigering er ikke ubegrænset.',
      },
      {
        q: 'Skal jeg selv poste?',
        a: 'I Start poster du selv. I Vækst og Fuld fart lægger jeg indholdet op for dig, når du har godkendt det. Hvor mange kanaler, står i pakken.',
      },
      {
        q: 'Hvem betaler annoncerne?',
        a: 'Du betaler selv annoncebudgettet direkte til Meta. I Fuld fart styrer jeg annoncerne, og det er med i månedsprisen.',
      },
      { q: 'Er der binding?', a: mkBinding },
      {
        q: 'Kan jeg få Fuld fart?',
        a: 'Jeg tager kun én Fuld fart-kunde ad gangen, så der kan være ventetid. Spørg, så fortæller jeg, hvor det står.',
      },
      ...startFaq(mk),
    ],
  },
  contact: {
    title: 'Skal jeg lave dine videoer?',
    body: 'Ring eller skriv, så hjælper jeg dig med at vælge mellem en pilot og en pakke.',
  },
}

/* ---- Lokal synlighed (adressen er stadig /booking-google/) --------------- */

const bg = services.bookingGoogle
const googleQr = formatKr(components.googleProfile.price + components.qrOpfoelgning.price)

export const bookingGoogle = {
  service: 'bookingGoogle',
  meta: {
    title: 'Booking & Google-profil til virksomheder | OviaSpecs',
    description: `Google-profil i orden, online booking og et QR-skilt til anmeldelser. Klare priser fra ${formatKr(bg.tiers[0].price)} Start med et gratis tjek af din Google-profil.`,
  },
  eyebrow: 'Lokal synlighed',
  title: 'Gør det nemt at finde og kontakte dig lokalt.',
  problem: [
    'Forkerte åbningstider, få billeder eller ingen link til booking eller menu gør det sværere at vælge dig.',
    'Jeg retter din Google-profil og gør det nemt at booke dig og at give dig en ægte anmeldelse. Hvor du står på Google, bestemmer Google. Mit arbejde er at gøre oplysningerne rigtige og relevante.',
  ],
  toPackages: 'Se pakker',
  /** Ekstra link i toppen til det gratis tjek (#tjek). */
  heroLink: { label: 'Start med et gratis tjek af din Google-profil', href: '#tjek' },
  get: {
    eyebrow: 'Det laver jeg',
    title: 'Rigtige oplysninger og en nem vej ind.',
    items: [
      { title: 'Rigtige oplysninger', text: 'Åbningstider, kontakt, kategori og billeder på din Google-profil, så de passer til din virksomhed.' },
      { title: 'Booking koblet på', text: 'I Vækst og Fuld fart kobler jeg et eksisterende bookingsystem på din hjemmeside eller Instagram. Jeg bygger ikke en ny kalender, hvis din nuværende virker.' },
      { title: 'QR-skilt', text: `I Fuld fart får du et QR-skilt, der fører til din anmeldelsesside. Du kan også vælge det uden booking: Google-profil og QR-skilt koster ${googleQr} som engangsopgave. Print og forsendelse er ikke med.` },
      { title: 'Opfølgning', text: 'I Fuld fart ser jeg på tallene efter 30 dage og viser dem til dig. Jeg holder visninger, klik og henvendelser adskilt.' },
    ],
  },
  /** Den løbende lokale SEO i Lokal: ved start, hver måned, måling og anmeldelser (offer.js). */
  localSeo,
  check: {
    eyebrow: 'Start her',
    priceLabel: formatKr(bg.freeCheck.price),
    mailSubject: 'Gratis tjek af min Google-profil',
    smsText: 'Hej Ronny. Vil du tjekke min Google-profil?',
  },
  packages: {
    eyebrow: 'Engangsopgaver',
    title: 'Tre pakker. Du betaler én gang.',
    intro: 'Det er engangsopgaver og ikke et abonnement. Den løbende lokale SEO hører til Lokal.',
    notes: [calculator.bookingDriftNote, bookingSubscriptionNote],
  },
  toCalculator,
  faq: {
    eyebrow: 'Spørgsmål',
    title: 'Det, du sikkert vil vide.',
    items: [
      {
        q: 'Kan du love, at jeg bliver fundet på Google?',
        a: 'Nej. Google viser lokale resultater ud fra relevans, afstand og kendthed. Jeg kan rette oplysninger, kategori og åbningstider og gøre det nemt at bede om anmeldelser. Afstanden kan jeg ikke ændre, og placeringer kan ikke købes.',
      },
      {
        q: 'Skal jeg have booking for at få et QR-skilt?',
        a: `Nej. QR-skiltet er en engangsopgave, og det kan vælges uden booking. Google-profil og QR-skilt koster ${googleQr} sammen. Print og forsendelse er ikke med.`,
      },
      {
        q: 'Hvilke bookingsystemer kan du koble på?',
        a: `Fx Planway, Booksy eller det system, du allerede bruger. Bookingsystemerne er lavet af andre firmaer, så jeg kan ikke give garanti for dem. ${bookingSubscriptionNote}`,
      },
      {
        q: 'Kan du skaffe mig anmeldelser?',
        a: 'Nej. Jeg gør det nemt for alle dine kunder at give en anmeldelse, fx med QR-skiltet. Jeg køber ikke anmeldelser, jeg belønner ikke, og jeg sorterer ikke i, hvem der bliver spurgt.',
      },
      {
        q: 'Er Google-profilen med i Lokal?',
        a: 'Ja. Lokal omfatter hjælp til én Google Business Profile, hvis virksomheden er berettiget. Verifikation afhænger også af Google og af dig. Du betaler ikke for den to gange.',
      },
      ...startFaq(bg),
    ],
  },
  contact: {
    title: 'Skal jeg kigge på din Google-profil?',
    body: 'Ring eller skriv, så tjekker jeg den gratis og fortæller, hvad der mangler.',
  },
}

/* ---- Priser ------------------------------------------------------------ */

export const priser = {
  meta: {
    title: 'Priser og prisberegner | OviaSpecs',
    description: `Se din pris med det samme. Hjemmeside ${fromPrice(web)}, marketing ${fromPrice(mk)} og booking & Google ${fromPrice(bg)} Faste pakker, og du skal ikke oplyse noget.`,
  },
  eyebrow: 'Priser',
  title: 'Hvad koster det?',
  lead: 'Der er to måder at købe hjemmesiden på: et løbende samarbejde (Lokal) eller et engangskøb. Vælg først, hvilken du vil have, så ser du opstart, månedspris, minimumsperiode og minimumsbetaling med det samme. Du skal ikke oplyse navn eller mail.',
  all: {
    eyebrow: 'Alle pakker',
    title: 'Alle pakker side om side.',
    more: 'Læs mere',
  },
  /** Linket til vilkårene (en synlig sektion på siden, ikke i FAQ). */
  termsLink: { label: 'Se vilkårene', href: paths.vilkaar },
  contact: {
    title: 'Spørgsmål til priserne?',
    body: 'Ring eller skriv, så hjælper jeg dig med at finde den løsning, der passer.',
  },
}
