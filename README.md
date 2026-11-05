# OviaSpecs — hjemmeside

> **Redesign (nov. 2026, grenen `redesign-handoff`).** Siden følger Claude Design-pakken. **Priser og pakker bor nu i `src/data/prices.json`**, regnet af `src/lib/calculate.js` og `src/lib/receipt.js` (tests: `npm test`). Tokens og bevægelse: `src/styles/`. Skrifter (Archivo med bredde-aksen, Geist, Geist Mono) selvhostes via `@fontsource-variable`. Billedpladser: `src/assets/billeder/README.md`. Palmy-casen er skjult (`flags.showPalmy` i `src/data/site.js`). Browsertest: `npm run preview` og så `node scripts/test-redesign-e2e.mjs`. **Resten af denne README beskriver den gamle side (Lokal, guide, rundvisning, formular) og er ikke opdateret.** `src/data/pricing.js`, `texts.js`, `calculator.js`, `inquiry.js` og `worker/` bruges ikke længere af siden, kun af den uforbundne henvendelsesworker.

Hjemmesiden for OviaSpecs (oviaspecs.com): hjemmesider, lokal synlighed, små systemer og marketing til mindre virksomheder. Hovedtilbuddet (rebrand okt. 2026, `docs/rebrand/`) er Lokal: hjemmeside uden opstartspris med fast månedspris og minimumsperiode; hjemmesiden kan også købes som engangsprojekt. React 19, Vite og Tailwind 4, forudrenderet til statiske filer og hostet på Cloudflare (Workers Static Assets). Én lille worker modtager formularen "Send din forespørgsel" under prisberegneren (se "Henvendelser"); resten er statiske filer. Ingen cookies. Besøg tælles med Cloudflare Web Analytics, som ifølge Cloudflare ikke bruger cookies eller lokal lagring ([cloudflare.com/web-analytics](https://www.cloudflare.com/web-analytics/), [dokumentation](https://developers.cloudflare.com/web-analytics/about/)).

## Her retter du

| Fil | Indhold |
| --- | --- |
| `src/data/pricing.js` | **Alle priser og pakker**, Lokal (`lokal`, `lokalMinimum`), systemtilvalget (`systemModule`, `ready: false` = sælges ikke med pris), domæneloftet (`domain`), drift, tilvalg, beregnerens spørgsmål, pilotvilkår, gratis Google-tjek, momstekst (`priceNote`), `paidStartText`, `flags.hasMarketingCases`, telefon, mail og CVR (`company.cvr`, vises i footeren, når det er udfyldt). |
| `src/data/texts.js` | Forsiden, navigation, kontakt, footer, privatlivspolitikkens udbydere og metadata for forsiden. |
| `src/data/services.js` | Ydelsessiderne (/hjemmeside/, /marketing/, /booking-google/ = "Lokal synlighed") og /priser/: problem, "det får du" og FAQ. |
| `src/data/offer.js` | De to købsmåder, tre problemer, forløbet, forsidens FAQ, vilkår (Lokal vs. engangskøb), /systemer/ og lokal SEO-leverancen. |
| `src/data/seo.js` | Titler, metabeskrivelser, `updated` (sitemap-lastmod; ret ved væsentlige ændringer) og JSON-LD (`organisationLd`). |
| `src/content.demos.js` | De fire koncepter under /demoer/. |

Regler for teksten: jeg-form (OviaSpecs er én person). Ingen udtalelser, kundetal, logoer eller resultater, der ikke kan dokumenteres. Koncepterne mærkes "Koncept – ikke en kundeopgave". Ingen rabatkoder, nedtællinger eller popularitetsmærker.

## Sider

`/` · `/hjemmeside/` · `/booking-google/` (Lokal synlighed) · `/systemer/` · `/marketing/` · `/priser/` · `/demoer/` (+ `/demoer/cafe|restaurant|salon|vinbar/`) · `/privatlivspolitik/`

Adresser: `src/routes.js` (metadata fra `src/data/seo.js`). Nøglerne skal passe med `src/pageKeys.js`, `src/pages.jsx` og `src/pageLoaders.js` (bygget fejler ellers). Gamle adresser (/hjemmesider/, /seo/ og /lokal-synlighed/ → /booking-google/, /ai-automatisering/ → /systemer/, /google-ads/, /sociale-medier-annoncering/, /booking-integrationer/, /prisberegner/, /ai-automatisering/, /om/, /kontakt/) viderestilles med 301 i `public/_redirects`.

## Prisberegneren

`src/components/PriceCalculator.jsx` + `src/calculator.js`. Trin 1 skelner først mellem Løbende samarbejde (`ydelser=lokal`), Køb hjemmesiden (`ydelser=hjemmeside`) og ingen hjemmeside, derefter tilvalg (Lokal synlighed, Marketing). Lokal-resultatet viser opstart, månedspris, minimumsperiode, minimumsbetaling, eksterne udgifter og overdragelse før formularen. Google-profilen trækkes fra Booking & Google, når den er med i Lokal eller Vækst/Fuld fart; QR-skiltet kan vælges uden booking. Engangskøb: derefter ét trin pr. valgt ydelse og så resultatet (højst 5 trin). Hvert svar peger på en pakke, og den højeste vinder. Under hver ydelse i resultatet kan kunden skifte pakke (Start / Vækst / Fuld fart); skiftet sætter pakkens svar (`calculator.tierSwitch` i pricing.js), så svar, resultat og adresselinje altid passer sammen. Prisen er fast: pakkeprisen plus eventuelle tilvalg (fx egen konto). Alle ydelser har `buffer: 0`, og `npm test` fejler, hvis et interval sniger sig ind. Valgene står i adresselinjen. Under prisen står formularen "Send din forespørgsel" (`src/components/SendQuote.jsx`) med Ring og SMS som sekundære links.

## Kommandoer

| Kommando | Hvad den gør |
| --- | --- |
| `npm run dev` | Udviklingsserver |
| `npm run build` | Bygger til `dist/`, forudrenderer HTML, skriver sitemap og JSON-LD (fra pricing.js) |
| `npm run preview` | Serverer `dist/` på http://localhost:4173 |
| `npm test` | Pristest (håndregnede priser for alle pakker × driftsplaner, egen hosting, pakkeskift, gamle links) og henvendelsestest (workeren med falsk D1 og mail) |
| `npm run test:e2e` | Browsertests mod `npm run preview`: forvalg, pakkeskift og formularen (390 px, touch) og koncepternes indgang (390/1440 px, CLS, reduceret bevægelse, uden JS) |
| `npm run lint` | oxlint |
| `npm run demo-shots` | Skærmbilleder af koncepterne til `public/demoer/` (kræver kørende preview og puppeteer-core) |
| `npm run og` | Tegner delingsbilledet `public/og.jpg` |
| `npm run brand` | Tegner favicon og logo-filer ud fra farverne i `src/index.css` |

## Opbygning

```
src/data/            Konfiguration og tekster (se ovenfor)
src/pages/           Home, Service (de tre ydelsessider), Priser, Demoer
src/components/      Nav (Løsninger-menu), Footer, MobileCallBar, ContactButtons, ContactSection,
                     HomeHero, Problems, BuyModes, Terms, Icon, WorkflowDemo, Steps, About, ServicePage, Packages,
                     ConceptGrid, PilotSection, FreeCheck, Faq, PriceCalculator, …
src/demos/           De fire koncepter (egne små sider); indgang ved scroll i useEntrance.js
worker/index.js      /api/henvendelse: gemmer henvendelser (D1) og sender mail
src/index.css        Farver, skrifter, knapper og komponenter (Tailwind @theme)
scripts/prerender.mjs  Forudrendering, sitemap, JSON-LD og CSP-hash
public/_headers      Sikkerhedsheaders og cache
public/_redirects    Viderestillinger fra gamle adresser
privatlivspolitik/   Egen indgang, så politikken kan deles som link
```

Skrifterne (Instrument Sans og JetBrains Mono, SIL OFL) er selvhostede i `public/fonts`. Ingen eksterne stylesheets; det eneste eksterne script er Cloudflare Web Analytics (tilladt i CSP i `public/_headers`). Privatlivspolitikken (`src/components/Privatlivspolitik.jsx`) beskriver præcis dette; ændres noget, skal den ændres samtidig.

## Henvendelser

Formularen sender mail/telefon, evt. navn, en valgfri besked (højst 1.000 tegn; står i mailen/`summary`, intet eget D1-felt) og linket med valgene til `POST /api/henvendelse` (`worker/index.js`, regler i `src/inquiry.js`). Workeren tjekker felterne igen (gyldig mail eller dansk nummer), honeypot, rate limit pr. IP (Workers Rate Limiting-bindingen `RATE_LIMITER`) og Turnstile, når `TURNSTILE_SECRET` er sat (så afvises henvendelser uden gyldig token; uden hemmeligheden springes Turnstile over), regner opsummeringen ud fra linket, **gemmer henvendelsen i D1** og sender derefter mailen med Cloudflare Email Routing. Fejler mailen, er henvendelsen stadig gemt (`mail_status = 'failed'`), og en daglig cron (05:00 UTC, `runDaily`) sender den igen; efter 3 fejlede genforsøg bliver den `gave_up` og står øverst i en daglig opsummeringsmail. Cron kører kun på den udgivne version. Kunden ser kun "Tak", når serveren har svaret OK. Henvendelser slettes efter `privacy.retentionMonths` måneder (`src/data/texts.js`).

Opsætning i Cloudflare-dashboardet (én gang):

1. **D1**: `ovia-henvendelser` er oprettet i weur (3. okt. 2026), ID står i `wrangler.jsonc`, og `worker/schema.sql` er kørt (`npx wrangler d1 execute ovia-henvendelser --remote --file worker/schema.sql`).
2. **Email Routing**: oviaspecs.com → Email → Email Routing. Er den slået til, så tjek under *Destination addresses*, at modtageradressen i `wrangler.jsonc` (`MAIL_TO`) står som *Verified*; ellers tilføj den og klik på linket i bekræftelsesmailen. Afsenderen (`MAIL_FROM`) skal være en adresse på oviaspecs.com.
3. **Turnstile (valgfri, udskudt)**: Turnstile → Add widget → domæner `oviaspecs.com` (og preview-domænet) → *Widget Mode: Invisible*. Sæt *Site Key* som byggevariabel `VITE_TURNSTILE_SITE_KEY` (Workers & Pages → ovia → Settings → Build → Variables and secrets) og *Secret Key* som hemmelighed `TURNSTILE_SECRET` (Settings → Variables and Secrets → Add → type Secret). Uden dem kører formularen uden Turnstile; honeypot og rate limit er altid aktive. Sæt begge på én gang: er kun hemmeligheden sat, afvises alle henvendelser.

Henvendelserne kan ses i D1 → ovia-henvendelser → Console: `SELECT created_at, contact, name, mail_status FROM henvendelser ORDER BY created_at DESC;`

## Udgivelse

`git push origin main` udgiver (Cloudflare bygger med `npm run build`). Brug en anden gren til et preview først.

## Drift, guide og rundvisning

- **Drift er et eget valg** (ikke en del af hjemmesidepakken): `driftPlans` i `src/data/pricing.js` (Basis 198, Plus 398, Ekstra 798 kr./md; minutter indholdsarbejde pr. måned: 0/15/30) eller egen konto/hosting (tillæg `ownAccount`, ingen månedlig betaling til OviaSpecs). Adresselinjen: `drift=basis|plus|ekstra|egen`. Gamle links med `drift=drift` bliver til den plan, der havde samme indhold (Start/Vækst → Plus, Fuld fart → Ekstra); mangler `drift`, vælger kunden selv.
- **Behovsguiden** ("Hjælp mig med at vælge"): højst tre spørgsmål (behov, eksisterende løsning, betalingsmodel) og "Spring over". Mindste dækkende løsning; Google + QR giver aldrig booking; system kun ved en relevant arbejdsgang og aldrig med pris, mens `systemModule.ready` er false. `src/guide.js` (regler), tekster i `calculator.guide`, UI i `NeedsGuide.jsx`. Tilstand: `hjaelp=<trin>&g-<spørgsmål>=<svar>`.
- **Rundvisningen** ("Vis mig rundt"): starter kun ved klik (ingen automatisk invitation, intet gemt i browseren). `TourLauncher.jsx`, `Tour.jsx` (indlæses først ved brug), `src/data/tour.js`, mål via `data-tour="calc|guide|drift|price|examples|contact"`.
- Tests: `scripts/test-guide.mjs`, `test-guide-e2e.mjs`, `test-tour-e2e.mjs` (kræver dev-server: `SITE=http://localhost:5176`), `test-rebrand-e2e.mjs` (acceptkriterierne i `docs/rebrand/qa-kriterier.md`), `test-a11y-e2e.mjs` (kræver kørende preview; `ONLY=tastatur,priser,… ` for dele). Skærmbilleder: `node scripts/ovia-shots.mjs <mappe>` og `ovia-shots-flow.mjs <mappe>`.
