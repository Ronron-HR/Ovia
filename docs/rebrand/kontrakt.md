# Kontrakt for rebrandet (okt. 2026)

Brief: `docs/rebrand/brief.md` (læs det hele). Gren: `rebrand-lokal`. Projektets regler: `README.md` og `CLAUDE.md`.

## Fælles regler for alle agenter

- Redigér KUN dine egne filer (se "Ejerskab"). Har du brug for en ændring i en andens fil, skriv den under "Ønsker til andre" i din rapport.
- Byg IKKE i projektmappen (`npm run build` skriver `dist/`, som deles). Hovedagenten bygger. Du må køre `npm test` (ren Node) og `npx vite --port <din port>` til udvikling (D: 5181, F: 5182, S: 5183, QA: 5184).
- Commit ikke, push ikke. Hovedagenten committer.
- Priser og vilkår har én kilde: `src/data/pricing.js`. Skriv aldrig et beløb som tekst ("995 kr."): brug `formatKr(...)` med tal fra pricing.js. `scripts/test-pricing.mjs` fejler på hardkodede beløb i `src/**`, `index.html` m.fl.
- Ingen opdigtede kunder, cases, anmeldelser, tal, placeringer, CVR, adresse. Ingen garanti om Google-placering, flere kunder eller AI-synlighed. Jeg-form (Ronny er én person). Dansk.
- Komponenter må ikke røre `window`/`document` under render (forudrendering i `scripts/prerender.mjs`).
- Indhold må aldrig være usynligt uden JavaScript eller ved scriptfejl. Respektér `prefers-reduced-motion`.

## Accepterede priser (låst; må ikke ændres)

Data i `src/data/pricing.js`:
- `lokal`: 0 kr. opstart, 1.990 kr./md, mindst 6 mdr. fra lancering (`lokalMinimum()` = 11.940 kr.), 1–3 indholdssider, 2 korrekturrunder, pr. md. op til 45 min. lokal SEO/status + 15 min. små rettelser, `includes: ['googleProfile']`, 1 måneds varsel.
- `systemModule`: +1.000 kr./md (samlet 2.990, minimum 17.940), **`ready: false`**: intet standardmodul findes endnu. Så længe `ready` er false, må INTET sted sælge modulet til den pris. Vis "særskilt fast tilbud efter afgrænsning" og evt. den planlagte pris tydeligt mærket som "ikke klar endnu".
- `domain.capPerYear`: 200 kr./år til almindelig fornyelse af ét standarddomæne. Gælder både Lokal og driftsplanerne (samme tekst begge steder).
- Engangskøb (priser fordoblet 4. nov. 2026): Start 5.000, Vækst 8.000, Fuld fart 10.000; drift Basis 198 / Plus 398 / Ekstra 798 kr./md (Plus op til 15 min., Ekstra op til 30 min. små rettelser med kundeleveret materiale; minutterne VISES nu: ny præcisering fra briefet); egen konto +2.000 én gang; frikøb/overførsel ved stop af drift 2.000 kr. (forklar hvad beløbet dækker; skriv aldrig "ingen udtrædelsesomkostninger"); booking +1.000; ekstra side efter 8 +800 (kun Fuld fart).
- Booking & Google (pakkepriser fordoblet 4. nov. 2026: 1.000 / 2.000 / 3.000 = summen af komponenterne Google-profil 1.000, booking 1.000, QR-skilt og opfølgning 1.000). NYT: QR-skiltet kan vælges uden booking (komponentpris 1.000 som tilvalg). Google + QR uden booking = 2.000 kr. QR-layout er en engangsleverance; print og forsendelse er ikke med.
- Marketing (fordoblet 4. nov. 2026): 3.000 / 5.000 / 8.000 kr./md; Fuld fart højst 1 kunde ad gangen; annoncebudget separat.
- Moms: `priceNote` ("Alle priser er ekskl. moms.") bevares. Momsregistrering/CVR er uverificeret og står som åbent punkt.

## Designretning (D ejer tokens; andre bruger kun tokens og klasser)

"Varm og præcis". Udgangspunkt i den eksisterende identitet (Instrument Sans, Instrument Serif på beløb, kobolt-accent, logo), men:
- Lys VARM baggrund (paper ca. #f8f5ef, bånd paper-2 ca. #efe9df, kort surface ca. #fffdf9), varm næsten-sort tekst (ink ca. #1c1a17), varm dæmpet tekst (muted ≥ 4,5:1 på alle flader). Hårstreger varme.
- ÉN accent: kobolt (`--color-cta`, nuværende #1c4fd8 eller en justeret variant med ≥ 4,5:1 mod paper og hvid tekst ≥ 4,5:1). Accent bærer alt aktivt: primær handling, valgt valg, fokus, links.
- Stærk typografi: tydelig skala, tæt sat display, korte linjer (≤ 65 tegn), luft mellem sektioner. Ingen versaler.
- Konsekvent ikonstil: inline SVG, 24×24 viewBox, 1,75 px streg, runde ender, `currentColor`, `aria-hidden`. Ingen ikonbibliotek-afhængighed. Én fil: `src/components/Icon.jsx` (D).
- Fjern visuelt rod og gentagelser: én primær handling pr. sektion.
- Bevægelse: diskret (opacity/transform, ≤ 250 ms ind, spring/ease-out), kun til feedback og orientering. Ingen scroll-låsning, ingen autoplay-video bag tekst. Tryk-feedback på knapper (`:active`). Reduced motion: ingen transform-animation.
- Kontrast ≥ 4,5:1 for tekst, ≥ 3:1 for kanter på felter. Fokusring altid synlig.
- Mobil først: 360 / 390 / 768 / 1440 px, ingen vandret overflow, tryk-mål ≥ 44 px.

## Sidestruktur og navigation

Navigation: **Løsninger** (Hjemmesider `/hjemmeside/`, Lokal synlighed `/booking-google/`, Systemer `/systemer/`, Marketing `/marketing/`) · **Eksempler** `/demoer/` · **Priser** `/priser/` · **Om/Kontakt** `/#om`. Desktop: "Løsninger" er en disclosure-knap (`aria-expanded`, lukker med Escape og klik udenfor; ikke kun hover). Mobil: menuen viser de fire løsninger som en liste under en overskrift. "Ring" og "Se din pris" bevares.

URL'er bevares (`/booking-google/` får navnet "Lokal synlighed" i menu og overskrift; adressen ændres ikke). Ny side: `/systemer/` (stub findes; routes, pageKeys, pages og pageLoaders er koblet).

Forsiden (`src/pages/Home.jsx`, D), i denne rækkefølge:
1. `HomeHero`: værdi, målgruppe, hovedtilbud ("0 kr. i opstart · 1.990 kr./md. · mindst 6 måneder", "I alt mindst 11.940 kr." fra `lokalMinimum()`), kontakt (Ring + "Se priser"). Ingen beregner i heroen.
2. `HomeExamples`: restaurant- og salondemo + et kort til arbejdsgangsdemoen (`/systemer/#demo`), tydeligt mærket "Demo".
3. `Problems` (ny): tre problemer → links til løsningssiderne.
4. `BuyModes` (ny, `id="koebsmaader"`): de to købsmåder med priser og minimumsbetaling, link til `/priser/#vilkaar`.
5. Beregneren med den valgfri behovsguide (`id="beregner"`, `PriceCalculator`), egen sektion.
6. `Steps`: fem trin (afklaring, aftalt omfang, udkast/godkendelse, lancering, løbende hjælp).
7. `About`, `Faq` (forsidens FAQ), `ContactSection`.

`/priser/` (`src/pages/Priser.jsx`, F): overskrift → beregneren → `BuyModes` → alle pakker (engangskøb + drift + tilvalg; Booking & Google; Marketing) → `Terms` (`id="vilkaar"`, synlig sektion, ikke i FAQ) → kontakt.

`/hjemmeside/` (ServicePage): begge købsmåder forklaret (Lokal først), pakker, drift, FAQ. `/booking-google/`: "Lokal synlighed": konkret SEO-leverance (ved start / hver måned / måling), Google-profil, booking-integration, QR-skilt som engangsopgave, gratis tjek. `/systemer/`: spørg-først, 2–3 eksempler, modulets status, arbejdsgangsdemo (`#demo`), sikkerhed i rimeligt omfang, pris = særskilt fast tilbud. `/marketing/`: som nu, afklaret omfang, pilot uden krav om positiv udtalelse.

## Ejerskab af filer

**Hovedagent (H):** `package.json`, `README.md`, `CLAUDE.md`, `docs/rebrand/*` (undtagen agenternes egne rapportfiler), `src/pageKeys.js`, `src/pages.jsx`, `src/pageLoaders.js`, integration og alle commits.

**C — Tekst og tilbud:** `src/data/texts.js`, `src/data/services.js`, NY `src/data/offer.js`, `src/content.demos.js` (kun tekst), `src/components/Privatlivspolitik.jsx` (kun hvis noget faktuelt ændres), rapport `docs/rebrand/c-tekst.md`. Rør ikke `meta`-objekterne i texts.js/services.js (S overtager metadata i `src/data/seo.js`).

**D — Design og komponenter:** `src/index.css`, `src/motion/*`, `src/stage.css`, `src/Site.jsx`, `src/pages/Home.jsx`, `src/pages/Demoer.jsx`, `src/pages/Systemer.jsx`, `src/components/{Nav,Footer,MobileCallBar,HomeHero,HomeExamples,ContactSection,ContactButtons,ServiceCards,Steps,About,Work,ConceptGrid,Logo,Shots,DemoVisual,Faq,PilotSection,FreeCheck,ServicePage,Amount}.jsx`, NYE `src/components/{Icon,Problems,BuyModes,Terms}.jsx`, `scripts/brand.mjs`, `scripts/og.mjs` + `scripts/og/*`, `public/` billeder/logo/favicon. Rapport `docs/rebrand/d-design.md`.

**F — Funktioner og brugerflow:** `src/data/pricing.js` (efter hovedagentens blok; tal må ikke ændres), `src/calculator.js`, `src/guide.js`, `src/inquiry.js`, `src/useCalc.js`, `src/calc.css`, `src/tour.css`, `src/data/tour.js`, `src/pages/Priser.jsx`, `src/components/{PriceCalculator,NeedsGuide,PriceDetails,Packages,SendQuote,Tour,TourLauncher,ErrorText}.jsx`, NY `src/components/WorkflowDemo.jsx` (+ evt. `src/workflow-demo.css`), `worker/*` (ingen ændring af D1-skemaet), `scripts/test-{pricing,guide,inquiry,calculator-e2e,tierswitch-e2e,form-e2e,guide-e2e,tour-e2e}.mjs`. Rapport `docs/rebrand/f-flow.md`.

**S — SEO og lokal synlighed:** `src/routes.js`, NY `src/data/seo.js`, `src/entry-server.jsx`, `scripts/prerender.mjs`, `index.html` (kun `<head>`), `public/robots.txt`, `public/_redirects`, `public/_headers` (kun hvis nødvendigt), `privatlivspolitik/index.html` (kun `<head>`). Rapport `docs/rebrand/s-seo.md` (anbefalinger til overskrifter og interne links til H, manglende adgange).

**QA — Uafhængig kvalitetssikring:** `docs/rebrand/qa-*.md`, `scripts/test-a11y-e2e.mjs`, `scripts/test-demos-e2e.mjs`, NYE `scripts/test-rebrand-e2e.mjs`, `scripts/ovia-shots*.mjs`. Retter ikke andres filer.

## Grænseflader

### `src/data/offer.js` (C skriver, D og F læser)

Alle beløb via `formatKr` og pricing.js. Formen (felter må tilføjes, ikke fjernes):

```js
export const buyModes = {
  eyebrow, title, intro,
  lokal: { label: 'Løbende samarbejde', name, headline, priceLine, minimumLine, includes: [..], excludes: [..], cta: { label, href }, note },
  koeb:  { label: 'Køb hjemmesiden',     name, headline, priceLine, minimumLine, includes: [..], excludes: [..], cta: { label, href }, note },
  compareNote,
}
export const problems = { eyebrow, title, items: [{ id, title, text, href, linkLabel }] }          // præcis 3
export const process  = { eyebrow, title, items: [{ title, text }] }                                 // præcis 5
export const homeFaq  = { eyebrow, title, items: [{ q, a }] }
export const terms = {
  eyebrow, title, intro,
  lokal: { title, items: [..] },   // abonnementsvilkår (afsnit D)
  koeb:  { title, items: [..] },   // bevarede engangsvilkår (drift, frikøb 1.000 forklaret, egen konto)
  both:  { title, items: [..] },   // ejerskab af domæne/indhold/data, support på hverdage, moms
  difference,                      // én sætning: forskellen på de to
}
export const systems = {
  eyebrow, title, lead,
  status: { label, text },                    // modulets status (ready=false → "særskilt fast tilbud")
  questionsFirst: { title, items: [..] },     // de fire spørgsmål
  examples: [{ id, title, fits, includes: [..], notIncluded: [..] }],   // catering, tilbudsopfølgning, booking
  pricing: { title, text },
  safety: { title, items: [..] },
  demo: { eyebrow, title, intro, label, disclaimer },
  contact: { title, body },
}
export const localSeo = {           // til /booking-google/ (Lokal synlighed)
  atStart: { title, items: [..] }, monthly: { title, items: [..] }, measurement: { title, items: [..] }, reviews: { title, items: [..] },
}
```

### `WorkflowDemo` (F bygger, D placerer)

`import WorkflowDemo from '../components/WorkflowDemo.jsx'` → `<WorkflowDemo />` (ingen props). Ren frontend-demo af en catering-/selskabsforespørgsel: formular (dato, antal personer, type, ønsker) → overblik med status (Ny / Besvaret / Tilbud sendt / Afvist) og én intern påmindelse. Intet sendes eller gemmes (kun React-state). Mærket tydeligt "Demo, ikke et færdigt system". Virker med tastatur. Forudrenderes som en statisk, læsbar tilstand.

### Beregneren (F)

Trin 0 skelner FØRST mellem "Løbende samarbejde" og "Køb hjemmesiden" (gensidigt udelukkende) og derefter tilvalg af Lokal synlighed (Booking & Google) og Marketing. Resultatet viser for Lokal: opstart, månedlig betaling, minimumsperiode, minimumsbetaling, eksterne udgifter og overdragelsesvilkår, FØR formularen beder om kontakt. Overlap: Google-profil i Lokal (og i Vækst/Fuld fart) trækkes fra Booking & Google. Gamle links (`ydelser=hjemmeside&sider=…&drift=…`) virker uændret som "Køb hjemmesiden". `data-tour`-målene bevares.

### Behovsguiden (F)

Højst tre spørgsmål i alt (behov, eksisterende løsning, ønsket betalingsmodel; forgrening). Synlig "Spring over"-mulighed. Mindste løsning: Google alene → Booking & Google Start (engangsopgave); QR → Start + QR, aldrig booking; booking → integration af eksisterende system; system → kun ved relevant arbejdsgang, ellers en bedre formular/Lokal; aldrig modul med pris, mens `ready` er false.

### Rundvisningen (F)

"Vis mig rundt" kun på brugerens initiativ: den automatiske invitation fjernes.

### Formularen (F)

Felter: kontakt (påkrævet), navn/virksomhed (valgfri), besked (valgfri, ny; højst 1.000 tegn; gemmes i mailteksten/`summary`, intet nyt D1-felt). Bevarer valg ved fejl; succes kun ved `{ ok: true }` fra serveren. Teksten siger, at det er en forespørgsel, ikke en bestilling.
