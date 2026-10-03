# OviaSpecs — hjemmeside

Hjemmesiden for OviaSpecs (oviaspecs.com): hjemmeside, marketing og booking & Google til lokale virksomheder. React 19, Vite og Tailwind 4, forudrenderet til statiske filer og hostet på Cloudflare (Workers Static Assets). Én lille worker modtager formularen "Få tilbuddet sendt" under prisberegneren (se "Henvendelser"); resten er statiske filer. Ingen cookies. Besøg tælles med Cloudflare Web Analytics, som ifølge Cloudflare ikke bruger cookies eller lokal lagring ([cloudflare.com/web-analytics](https://www.cloudflare.com/web-analytics/), [dokumentation](https://developers.cloudflare.com/web-analytics/about/)).

## Her retter du

| Fil | Indhold |
| --- | --- |
| `src/data/pricing.js` | **Alle priser og pakker**, drift, tilvalg, beregnerens spørgsmål, pilotvilkår, gratis Google-tjek, momstekst (`priceNote`), `paidStartText`, `flags.hasMarketingCases`, telefon, mail og CVR (`company.cvr`, vises i footeren, når det er udfyldt). |
| `src/data/texts.js` | Forsiden, navigation, kontakt, footer, privatlivspolitikkens udbydere og metadata for forsiden. |
| `src/data/services.js` | Ydelsessiderne (/hjemmeside/, /marketing/, /booking-google/) og /priser/: problem, "det får du", FAQ og metadata. |
| `src/content.demos.js` | De fire koncepter under /demoer/. |

Regler for teksten: jeg-form (OviaSpecs er én person). Ingen udtalelser, kundetal, logoer eller resultater, der ikke kan dokumenteres. Koncepterne mærkes "Koncept – ikke en kundeopgave". Ingen rabatkoder, nedtællinger eller popularitetsmærker.

## Sider

`/` · `/hjemmeside/` · `/marketing/` · `/booking-google/` · `/priser/` · `/demoer/` (+ `/demoer/cafe|restaurant|salon|vinbar/`) · `/privatlivspolitik/`

Adresser og metadata: `src/routes.js`. Nøglerne skal passe med `src/pageKeys.js`, `src/pages.jsx` og `src/pageLoaders.js` (bygget fejler ellers). Gamle adresser (/hjemmesider/, /seo/, /google-ads/, /sociale-medier-annoncering/, /booking-integrationer/, /prisberegner/, /ai-automatisering/, /om/, /kontakt/) viderestilles med 301 i `public/_redirects`.

## Prisberegneren

`src/components/PriceCalculator.jsx` + `src/calculator.js`. Trin 1 er flervalg af ydelser, derefter ét trin pr. valgt ydelse og så resultatet (højst 5 trin). Hvert svar peger på en pakke, og den højeste vinder. Under hver ydelse i resultatet kan kunden skifte pakke (Start / Vækst / Fuld fart); skiftet sætter pakkens svar (`calculator.tierSwitch` i pricing.js), så svar, resultat og adresselinje altid passer sammen. Prisen er fast: pakkeprisen plus eventuelle tilvalg (fx egen konto). Alle ydelser har `buffer: 0`, og `npm test` fejler, hvis et interval sniger sig ind. Valgene står i adresselinjen. Under prisen står formularen "Få tilbuddet sendt" (`src/components/SendQuote.jsx`) med Ring og SMS som sekundære links.

## Kommandoer

| Kommando | Hvad den gør |
| --- | --- |
| `npm run dev` | Udviklingsserver |
| `npm run build` | Bygger til `dist/`, forudrenderer HTML, skriver sitemap og JSON-LD (fra pricing.js) |
| `npm run preview` | Serverer `dist/` på http://localhost:4173 |
| `npm test` | Pristest (alle kombinationer, pakkeskift, driftspriser) og henvendelsestest (workeren med falsk D1 og mail) |
| `npm run test:e2e` | Browsertests mod `npm run preview`: forvalg, pakkeskift og formularen (390 px, touch) og koncepternes indgang (390/1440 px, CLS, reduceret bevægelse, uden JS) |
| `npm run lint` | oxlint |
| `npm run demo-shots` | Skærmbilleder af koncepterne til `public/demoer/` (kræver kørende preview og puppeteer-core) |
| `npm run og` | Tegner delingsbilledet `public/og.jpg` |
| `npm run brand` | Tegner favicon og logo-filer ud fra farverne i `src/index.css` |

## Opbygning

```
src/data/            Konfiguration og tekster (se ovenfor)
src/pages/           Home, Service (de tre ydelsessider), Priser, Demoer
src/components/      Nav, Footer, MobileCallBar, ContactButtons, ContactSection,
                     HomeHero, ServiceCards, Steps, About, ServicePage, Packages,
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

Formularen sender mail/telefon, evt. navn og linket med valgene til `POST /api/henvendelse` (`worker/index.js`, regler i `src/inquiry.js`). Workeren tjekker felterne igen (gyldig mail eller dansk nummer), honeypot, rate limit pr. IP (Workers Rate Limiting-bindingen `RATE_LIMITER`) og Turnstile, når `TURNSTILE_SECRET` er sat (så afvises henvendelser uden gyldig token; uden hemmeligheden springes Turnstile over), regner opsummeringen ud fra linket, **gemmer henvendelsen i D1** og sender derefter mailen med Cloudflare Email Routing. Fejler mailen, er henvendelsen stadig gemt (`mail_status = 'failed'`), og en daglig cron (05:00 UTC, `runDaily`) sender den igen; efter 3 fejlede genforsøg bliver den `gave_up` og står øverst i en daglig opsummeringsmail. Cron kører kun på den udgivne version. Kunden ser kun "Tak", når serveren har svaret OK. Henvendelser slettes efter `privacy.retentionMonths` måneder (`src/data/texts.js`).

Opsætning i Cloudflare-dashboardet (én gang):

1. **D1**: `ovia-henvendelser` er oprettet i weur (3. okt. 2026), ID står i `wrangler.jsonc`, og `worker/schema.sql` er kørt (`npx wrangler d1 execute ovia-henvendelser --remote --file worker/schema.sql`).
2. **Email Routing**: oviaspecs.com → Email → Email Routing. Er den slået til, så tjek under *Destination addresses*, at modtageradressen i `wrangler.jsonc` (`MAIL_TO`) står som *Verified*; ellers tilføj den og klik på linket i bekræftelsesmailen. Afsenderen (`MAIL_FROM`) skal være en adresse på oviaspecs.com.
3. **Turnstile (valgfri, udskudt)**: Turnstile → Add widget → domæner `oviaspecs.com` (og preview-domænet) → *Widget Mode: Invisible*. Sæt *Site Key* som byggevariabel `VITE_TURNSTILE_SITE_KEY` (Workers & Pages → ovia → Settings → Build → Variables and secrets) og *Secret Key* som hemmelighed `TURNSTILE_SECRET` (Settings → Variables and Secrets → Add → type Secret). Uden dem kører formularen uden Turnstile; honeypot og rate limit er altid aktive. Sæt begge på én gang: er kun hemmeligheden sat, afvises alle henvendelser.

Henvendelserne kan ses i D1 → ovia-henvendelser → Console: `SELECT created_at, contact, name, mail_status FROM henvendelser ORDER BY created_at DESC;`

## Udgivelse

`git push origin main` udgiver (Cloudflare bygger med `npm run build`). Brug en anden gren til et preview først.
