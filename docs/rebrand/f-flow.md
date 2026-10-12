# F: Funktioner og brugerflow (rapport)

Model-ID: claude-sonnet-5-5 (Sonnet 5.5).

## Arkitekturvalg: Lokal som egen ydelse i beregneren

Valgt: den foretrukne model. `lokal` er en egen ydelse i `ORDER` (`['lokal', 'hjemmeside', 'marketing', 'bookingGoogle']`), gensidigt udelukkende med `hjemmeside` ("Køb hjemmesiden"). Trin 0 viser først tre radioknapper (Løbende samarbejde / Køb hjemmesiden / Jeg skal ikke have en hjemmeside) og derefter tilvalg (Lokal synlighed, Marketing). Lokal ligger bevidst IKKE i `services` (JSON-LD i `entry-server.jsx` og ydelsessiderne itererer over `services`); den ligger i `lokalService` i pricing.js.

Modargumenter og hvordan de er håndteret (ingen var blokerende):

1. Adresselinje og gamle links: `ydelser=hjemmeside&sider=…&drift=…` er stadig "Køb hjemmesiden" (uændret, også `drift=drift`). Ny værdi `lokal`. Står begge i ét link, vinder den første i `ydelser` (`oneWebsite()` i `parse()`/`fit()`), så de aldrig opkræves begge. Testet.
2. Workeren: `canonicalLink()` bruger kun `parse()`/`serialize()`, så `CALC_PATHS` er uændret, og Lokal-resuméet regnes på serveren ud fra linket. Testet i `test-inquiry.mjs`.
3. Overlap Lokal ↔ Booking & Google: Booking & Google er nu bygget af komponenter (Google-profil, booking, QR). Lokals Google-profil trækkes fra; teksten er "Allerede med i Lokal" (ikke "din hjemmeside"). Samme fradrag for Vækst/Fuld fart som før.
4. Guide-tilstand: guiden bygger sin tilstand af `stateOf(selected, answers)`; Lokal har ingen pakke og ingen `tierSwitch`, så den bruger egne svar (`system`).
5. `tierSwitch`/pakkevælger: Lokal har ingen pakkevælger; skift mellem købsmåderne er et nyt valg af ydelse ("Hellere købe hjemmesiden én gang?" / "Hellere et løbende samarbejde?").
6. Rundvisningens mål: `data-tour="drift"` findes kun ved "Køb hjemmesiden" og springes ellers over (det gør koden allerede). `calc`, `guide`, `price` findes begge steder.
7. Tests: delmængdeloopet udelukker parret lokal+hjemmeside; "samme resultat, samme pris" har Lokal med i nøglen.
8. Alternativet (et `model`-spørgsmål inde i `hjemmeside` med `showIf`-grene) kræver, at `stepsFor`, `fit`, `resultStep`, guiden, `Tour` og alle tests kender svarene (trinene ville afhænge af svar). Det er den største risiko, så den foretrukne model er valgt.

## Ændrede filer

`src/data/pricing.js`, `src/calculator.js`, `src/guide.js`, `src/inquiry.js`, `src/components/{PriceCalculator,NeedsGuide,PriceDetails,Packages,SendQuote,TourLauncher}.jsx`, NY `src/components/WorkflowDemo.jsx`, `src/pages/Priser.jsx`, `src/data/tour.js`, `src/calc.css`, `worker/index.js`, `scripts/test-{pricing,guide,inquiry,guide-e2e,tierswitch-e2e,form-e2e,tour-e2e}.mjs`. (`useCalc.js`, `tour.css`, `Tour.jsx`, `ErrorText.jsx`, `test-calculator-e2e.mjs` er uændrede i indhold; mine filer er konverteret fra CRLF til LF.)

## Hvad der er gjort

- **pricing.js** (hovedagentens tal uændrede): `lokalService`, `calculator.modes` (trin 0), `calculator.lokalTerms` (vilkår før formularen), `calculator.systemNote`, `help.monthly.lokal`, `domainText` (samme tekst i Lokal og drift), `overlap.reasonsLokal/allIncludedLokal`, `services.bookingGoogle.addons.qrOpfoelgning` (QR-tilvalg på Start og Vækst), `driftPlans.*.limit` (minutterne vises), drift-tekster (jeg-form, "Ingen bindingsperiode", frikøb forklaret, domæneloft, hosting og versionsbackup), pilotvilkår og B&G/hjemmeside-tier-tekster efter C's ønsker (arbejde, ikke resultat). `paidStartText`/`startNow` ("fra februar 2027") og B&G `startNow` er uændrede efter hovedagentens besked.
- **Beregner**: Lokal-resultatet viser "0 kr. nu + 995 kr./md · mindst 6 mdr. = mindst 5.970 kr.", en vilkårsblok (opstart, pris/md, minimumsperiode, mindste betaling, opsigelse, eksterne udgifter, ikke med, filudlevering efter minimumsperioden) FØR formularen. Systemtilvalg ("Ja, jeg har en arbejdsgang") får ingen pris, mens `systemModule.ready` er false (note om særskilt fast tilbud); ved `ready: true` lægges 500 kr./md til (1.495 / 8.970). QR uden booking = Start + QR = 1.000 kr.; booking + QR = Fuld fart (1.500).
- **Guide**: højst 3 spørgsmål i alle grene (testet over alle kombinationer), "Spring over" på hvert spørgsmål og på resultatet. Regler: Google alene → B&G Start (engangsopgave); QR → Start + QR, aldrig booking; booking → kobles på eksisterende hjemmeside/system (aldrig ny kalender); hjemmeside → Lokal eller Køb efter betalingsmodel (Lokal rummer 1-3 sider; ellers foreslås den mindste købspakke med forklaring; køb = mindste pakke for sidebehovet og driftsplanen Basis med begrundelse); nyt behov "Styr på forespørgsler eller en arbejdsgang": få sager → Lokal med formular, mange sager og intet system → "særskilt fast tilbud" uden pris (kort snak), har kunden et system → sælges ikke et nyt; "Jeg ved det ikke" → mindste løsning (ved hjemmeside: engangskøb). Begrundelserne lover ikke placeringer (testet).
- **Rundvisning**: den automatiske invitation, forsinkelsen og al lagring (`localStorage`) er fjernet; kun knappen starter den. Tekster opdateret til ny beregner.
- **Formular/worker**: valgfrit beskedfelt (max 1.000 tegn, med hjælpetekst om formålet og tegntæller) sendes med og står i mailen (hver linje med `> `, så den ikke kan efterligne felter) og i D1 `summary` (intet nyt D1-felt). `MAX_BODY` hævet fra 8.000 til 10.000 (største gyldige henvendelse er under 8.000 byte). Teksten siger, at det er en forespørgsel, ikke en bestilling; fejlteksten siger, at valg og besked står uændret. Succes kun ved `{ ok: true }`. Honeypot, rate limit og Turnstile uændrede. Mailen siger "Løbende samarbejde: Lokal" og viser opstart, månedspris og minimum.
- **WorkflowDemo**: `<WorkflowDemo />` (ingen props), mærket "Demo, ikke et færdigt system", tre opdigtede eksempler markeret "eksempel", formular (dato, antal, type, ønsker) → overblik, status (Ny/Besvaret/Tilbud sendt/Afvist), én intern påmindelse når et tilbud er sendt, kun React-state, tastaturvenlig, forudrenderes (SSR afprøvet). D har allerede koblet den ind i `Systemer.jsx`.
- **Priser.jsx**: overskrift → beregner → `BuyModes` → alle pakker → `Terms` (`id="vilkaar"`) → kontakt. Begge komponenter fandtes og er importeret.

## Nye URL-parametre

- `ydelser=lokal` (Løbende samarbejde) og spørgsmålet `system=nej|ja`. Bruges kun sammen med Lokal. Gamle parametre er uændrede (`ydelser=hjemmeside`, `sider`, `drift`, `bestilling`, `booking`, `anmeldelser` …).
- Guiden: `g-model=lokal|koeb|ved-ikke`, `g-volumen=faa|mange|ved-ikke`, `g-eksisterende=nej|ja|ved-ikke`, `g-ogsaa-side=koeb|lokal|nej|ved-ikke` (ny værdi), `g-sider=1|2-3|4-5|6-8|ved-ikke` (nye værdier), `g-behov=arbejdsgang`. `g-aendringer` findes ikke længere (højst tre spørgsmål; driftsplan Basis som standard). Gamle `hjaelp=`-links med forældede værdier renses af `fitGuide`.

## Tests og resultat

`npm test`: bestået (pristest 7.994 kombinationer + nye Lokal-, QR-, overlap-, gensidig udelukkelse- og systemflag-tests; guidetest 31 forløb + alle forgreninger højst 3 spørgsmål, arbejdsgang uden pris, ready-flag midlertidigt true; henvendelsestest med besked, MAX_BODY og Lokal-mail).

E2E kørt mod `npx vite --port 5182` (`SITE=http://localhost:5182`), alle bestået: `test-calculator-e2e`, `test-tierswitch-e2e`, `test-form-e2e` (inkl. besked, felter bevaret ved fejl, Lokal-vilkår før formularen), `test-guide-e2e` (omskrevet til /priser/: trin 0, Lokal, overlap, QR uden booking, guide, spring over, formular, tastatur, 375 og 1440 px), `test-tour-e2e` (omskrevet: ingen invitation, ingen lagring; testharnessens launcher er nu `position: fixed`, fordi den før kunne dækkes af den faste navigation ved 1440 px). Ikke kørt af mig: `test:e2e`s `test-demos-e2e` (QA/D), `test-a11y-e2e` (QA). De kører mod `npm run preview` efter build.

## Integration (til hovedagenten)

- `BuyModes`/`Terms`: allerede importeret i `src/pages/Priser.jsx`. `BuyModes`-kortenes `cta.href` (`#beregner`) forvælger ikke købsmåden; ønskes det, kan hrefen pege på `/priser/?ydelser=lokal` / `?ydelser=hjemmeside`.
- `WorkflowDemo`: allerede brugt i `Systemer.jsx` (`id="demo"` sættes af D). Kontrakten: `import WorkflowDemo from '../components/WorkflowDemo.jsx'`.
- ServicePage (`defaults={[page.service]}`): `/hjemmeside/` forvælger "Køb hjemmesiden". Ønskes Lokal forvalgt der, giv `defaults={['lokal']}`.

## Ønsker til andre / åbne punkter

- `Privatlivspolitik.jsx` (C/H) nævner stadig, at rundvisningen husker valget i `localStorage`; det gør den ikke længere. Ret teksten (README-afsnittet om rundvisningen siger det samme og skal også rettes af H).
- `README.md` (H): beregneren, guiden (højst tre spørgsmål, "Spring over"), rundvisningen (kun på brugerens initiativ), `MAX_BODY` 10 kB, `LIMITS.message`, `ydelser=lokal`.
- Lokal-teksterne ("første måned betales før fuld produktion", "versionsbackup", "hjælp til én Google-profil, hvis virksomheden er berettiget", "support på hverdage" (ligger hos C/Terms)) følger briefets forslag; backup og kontrol af formularen skal verificeres som faktisk etableret, før siden udgives. Moms/CVR er stadig uverificeret.
- Startdato ("fra februar 2027") står uændret og gælder også Lokal; afklares af Ronny.
- Guiden spørger ikke længere om ændringer efter lancering (driftsplan Basis som standard med begrundelse); egen konto og Plus/Ekstra vælges i beregneren via "Se og ret i beregneren".
- Pakkevælgeren for Booking & Google kan ikke fjerne et QR-tilvalg uden booking; det gøres via "Ret svarene".
