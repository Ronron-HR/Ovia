/* =========================================================================
   DEMOER — fire fiktive koncepter udviklet af OviaSpecs.

   De er ikke kundearbejde og bygger ikke på rigtige virksomheder: ingen
   virksomhedsnavne, adresser, telefonnumre, logoer, anmeldelser, menukort
   eller fotografier. Tekster, layout og illustrationer (SVG/CSS) er skrevet
   og tegnet til demoerne (src/demos).

   Hver demo er en lille, fungerende hjemmeside på sin egen adresse. Funktionerne
   er lokale demonstrationer: en booking reserverer intet, en formular sender
   intet, og ingen knap fører til en virkelig virksomhed. Det står ved hver
   handling.

   Præsentationen bruger skærmbilleder af netop de nye demoer
   (public/demoer/<id>-desktop.webp og -mobile.webp, taget med
   `npm run demo-shots`).

   Kun adresser og stier, der ikke afhænger af content.js, står her (filen
   importeres af content.js).
   ========================================================================= */

/** Målene på skærmbillederne (se scripts/demo-shots.mjs). */
const DESKTOP = { width: 880, height: 1540 }
const MOBILE = { width: 340, height: 1308 }

export const demos = {
  id: 'demoer',
  eyebrow: 'Demoer',
  title: 'Fire fiktive demoer, du kan prøve.',
  intro:
    'Fire små hjemmesider, jeg har bygget som koncepter: en café, en restaurant, en salon og en vinbar. De er fiktive og ikke kundearbejde, men de virker, så du kan prøve menuer, faner og bookingeksempler på en telefon eller en computer.',
  homeTitle: 'Fire demoer, du kan prøve.',
  homeIntro:
    'Fire fiktive koncepter med hver sin stemning og hver sine funktioner. Åbn en demo og prøv den, som kunden ville.',
  banner: 'Fiktiv demo – koncept udviklet af OviaSpecs, ikke kundearbejde.',
  tag: 'Fiktiv demo – koncept udviklet af OviaSpecs, ikke kundearbejde.',
  tagShort: 'Fiktiv demo · koncept',
  note: 'Demoerne viser eksempler på design og funktioner. Din hjemmeside tilpasses din virksomhed. Standardprisen indeholder ikke automatisk de funktioner, en demo viser: booking og andre ekstra funktioner aftales separat. Skærmbillederne er taget af demoerne selv.',
  localNote:
    'Alt i demoen er lokalt: intet bliver sendt, bestilt eller booket, og ingen knap fører til en rigtig virksomhed.',
  open: 'Åbn demo',
  calcCta: 'Beregn en lignende hjemmeside',
  backToSite: 'Tilbage til OviaSpecs',
  allDemos: 'Alle demoer',
  labels: { task: 'Formål', features: 'Funktioner i demoen', design: 'Design' },
  seeAll: { label: 'Se alle demoer', href: '/demoer/' },
  projects: [
    {
      id: 'cafe',
      path: '/demoer/cafe/',
      name: 'Cafédemo',
      kind: 'Café',
      panel: '#f2d16b',
      calcType: 'mad',
      calcPurpose: 'menu',
      design: 'Smørgul, varm hvid og mørkeblå med venlig typografi og egne illustrationer.',
      task: 'En café, hvor gæsten hurtigt vil se, hvad der er på menuen, hvornår der er åbent, og hvordan man skriver.',
      features: [
        'Eksempelmenu med kategorier, der kan skiftes',
        'Åbningstider',
        'Kontaktsektion med en lokal beskedformular',
      ],
      label: 'Skærmbillede af den fiktive Cafédemo på computer.',
      labelMobile: 'Skærmbillede af den fiktive Cafédemo på telefon.',
      desktop: { src: '/demoer/cafe-desktop.webp', ...DESKTOP },
      mobile: { src: '/demoer/cafe-mobile.webp', ...MOBILE },
      metaTitle: 'Cafédemo | Fiktiv demo fra OviaSpecs',
      metaDescription:
        'Fiktiv demo: en café-hjemmeside med menu i kategorier, åbningstider og kontakt. Koncept udviklet af OviaSpecs, ikke kundearbejde.',
    },
    {
      id: 'restaurant',
      path: '/demoer/restaurant/',
      name: 'Restaurantdemo',
      kind: 'Restaurant',
      panel: '#b5573a',
      calcType: 'mad',
      calcPurpose: 'booking',
      design: 'Terracotta, creme og mørk brun med store flader og rolig typografi.',
      task: 'En restaurant, hvor stemningen kommer først, og hvor gæsten nemt kan se menukortet og bestille bord.',
      features: [
        'Menukort med fungerende faner',
        'Tydeligt eksempel på bordbestilling (intet bliver reserveret)',
        'Historie og åbningstider',
      ],
      label: 'Skærmbillede af den fiktive Restaurantdemo på computer.',
      labelMobile: 'Skærmbillede af den fiktive Restaurantdemo på telefon.',
      desktop: { src: '/demoer/restaurant-desktop.webp', ...DESKTOP },
      mobile: { src: '/demoer/restaurant-mobile.webp', ...MOBILE },
      metaTitle: 'Restaurantdemo | Fiktiv demo fra OviaSpecs',
      metaDescription:
        'Fiktiv demo: en restaurant-hjemmeside med menukort i faner og et eksempel på bordbestilling. Koncept udviklet af OviaSpecs, ikke kundearbejde.',
    },
    {
      id: 'salon',
      path: '/demoer/salon/',
      name: 'Salondemo',
      kind: 'Frisør og salon',
      panel: '#8b9096',
      calcType: 'salon',
      calcPurpose: 'booking',
      design: 'Grå, knækket hvid og en diskret grøn accent. Stramt og enkelt.',
      task: 'En salon, hvor kunden hurtigt finder sin behandling, ser en eksempelpris og får et indtryk af, hvordan booking kan se ud.',
      features: [
        'Behandlinger med eksempelpriser og varighed',
        'Lokalt bookingeksempel (intet bliver booket)',
        'Åbningstider og kontakt',
      ],
      label: 'Skærmbillede af den fiktive Salondemo på computer.',
      labelMobile: 'Skærmbillede af den fiktive Salondemo på telefon.',
      desktop: { src: '/demoer/salon-desktop.webp', ...DESKTOP },
      mobile: { src: '/demoer/salon-mobile.webp', ...MOBILE },
      metaTitle: 'Salondemo | Fiktiv demo fra OviaSpecs',
      metaDescription:
        'Fiktiv demo: en salon-hjemmeside med behandlinger, eksempelpriser og et lokalt bookingeksempel. Koncept udviklet af OviaSpecs, ikke kundearbejde.',
    },
    {
      id: 'vinbar',
      path: '/demoer/vinbar/',
      name: 'Vinbardemo',
      kind: 'Vinbar',
      panel: '#5a2a4e',
      calcType: 'mad',
      calcPurpose: 'menu',
      design: 'Blommefarvet, elfenben og kobber med elegant serifskrift og luft.',
      task: 'En vinbar, hvor gæsten kan bladre i vinkortet og se, hvordan en henvendelse fra en gruppe kan tage form.',
      features: [
        'Fiktivt vinkort med kategorier',
        'Eksempel på gruppehenvendelse (intet bliver sendt)',
        'Åbningstider og kontakt',
      ],
      label: 'Skærmbillede af den fiktive Vinbardemo på computer.',
      labelMobile: 'Skærmbillede af den fiktive Vinbardemo på telefon.',
      desktop: { src: '/demoer/vinbar-desktop.webp', ...DESKTOP },
      mobile: { src: '/demoer/vinbar-mobile.webp', ...MOBILE },
      metaTitle: 'Vinbardemo | Fiktiv demo fra OviaSpecs',
      metaDescription:
        'Fiktiv demo: en vinbar-hjemmeside med vinkort i kategorier og et eksempel på en gruppehenvendelse. Koncept udviklet af OviaSpecs, ikke kundearbejde.',
    },
  ],
}

/** Finder en demo. Ukendte og udgåede id'er giver null (neutral beregning). */
export function demoById(id) {
  return demos.projects.find((p) => p.id === id) ?? null
}
