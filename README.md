# OviaSpecs — hjemmeside

oviaspecs.com er ét tilbud: **hjemmeside, Google-profil, lokal SEO og systemer til restauranter og caféer**, i tre pakker til faste priser (Start, Anbefalet, Max). React 19, Vite 8 og Tailwind 4, forudrenderet til statiske filer og hostet på Cloudflare (Workers Static Assets). Én lille worker (`worker/index.js`) modtager formularen under prisberegneren. Ingen cookies; besøg tælles med Cloudflare Web Analytics.

## Her retter du

| Fil | Indhold |
| --- | --- |
| `src/data/prices.json` | **Eneste kilde til priser**: pakker (engang + pr. måned, sider, systemer med), standardsystemer, skræddersyet system, tilvalg, vilkår og introduktionsprisen. Beregneren, /priser/, /hjemmeside/, formularen og workeren læser herfra. Alle priser er faste og ekskl. moms. |
| `src/data/pages.js` | Tabellen på /priser/ og teksterne på /hjemmeside/ (systemeksempler, hvad vi gør for Google og lokal SEO). |
| `src/data/calculator.js` | Beregnerens tekster (trin, guidet hjælp, besked ved gammelt link). |
| `src/data/site.js` | Kontakt, adresser (`paths`), menu og flag. |
| `src/data/seo.js` | Titler, metabeskrivelser, `updated` (sitemap-lastmod) og JSON-LD. Priser i metatekster hentes fra prices.json. |
| `src/content.demos.js` | De fire koncepter under /demoer/ (mærket "Koncept – ikke en kundeopgave"). |

Regler for teksten: vi-form, ingen "bureau", ingen oplysninger om alder, antal ansatte eller "ny virksomhed", ingen løfter om placeringer, gæster eller resultater, ingen opdigtede udtalelser, kundetal eller logoer. Intet "fra"-pris og intet "pris efter en snak": alt er faste priser. `npm run test:content` leder det byggede site igennem efter gamle ord.

## Pakker og regler (prices.json)

- **Start** 5.000 kr. + 299 kr./md.: 1–3 sider, Google-profil, grundlæggende lokal SEO, link til kundens eget booking/bestilling. Ingen systemer med.
- **Anbefalet** 9.500 + 549/md.: op til 6 sider, 1 standardsystem, Google-profil + 1 opslag/md., lokal SEO med lokale søgeord, 1 times rettelser/md.
- **Max** 15.000 + 895/md.: sider efter behov og engelsk version, 2 systemer (højst 1 skræddersyet), 2 opslag/md. og svar på anmeldelser, kvartalsvis SEO-gennemgang, 2 timers rettelser/md., kort månedlig status.
- **Tilvalg:** ekstra standardsystem 2.000 + 99/md., skræddersyet system (ét flow) 5.000 + 199/md., engelsk version 1.500 (Start/Anbefalet), frikøb 2.000. Systemer, pakken har med, koster ikke ekstra; flere end det giver tilvalgsprisen automatisk. Skræddersyede systemer bruger de inkluderede pladser først.
- **Vilkår:** ingen binding, 1 måneds opsigelse, domænet står i kundens navn, hosting og domæne er med.

Beregningen står i `src/lib/calculate.js` (`calculate`), kvitteringen i `src/lib/receipt.js`. Valget i adresselinjen: `p` (pakke 0–2), `y` (systemkoder: b bordbooking, o bestilling, g gavekort, n nyhedsbrev, a anmeldelser), `c` (skræddersyede), `e` (engelsk), `i` (intropris), `t` (trin). Links fra før pakkerne (`w`, `m`, `b`, `d`, `bk`, `x`) kan ikke regnes om: beregneren viser en venlig besked, og workeren svarer 400 `old_selection`.

## Introduktionspris og pladser

30 % på pakkens **engangspris** (ikke måned, ikke tilvalg) til de første 3 kunder, der lader siden vise som case. Beregneren har det som et valgfrit felt ("Ja, I må vise siden som case"), slået fra som standard. Pladserne styres af ét tal: `introSlotsLeft` i `src/data/prices.json`. Er det 0, findes introprisen ikke på siden, i beregneren, i mailen eller i workeren (et gammelt link med `i=1` ignoreres).

```
npm run intro:status   viser kun antal pladser tilbage
npm run intro:brugt    trækker 1 fra (aldrig under 0), kører npm test, committer
                       "Intro-plads brugt – X tilbage" og pusher til main
```

`intro:brugt` nægter at køre, hvis arbejdsmappen ikke er ren, du ikke står på main, eller main ikke er ajour med origin. Fejler testene, sker der hverken commit eller push, og tallet rulles tilbage. Mailen til dig har nederst, når kunden har valgt intro: "Intropris valgt. Lander du kunden, så kør: npm run intro:brugt (X pladser tilbage nu)." Pusher du, bygger Cloudflare siden igen, og tallet på siden følger med. `scripts/test-intro.mjs` tester kommandoerne i en midlertidig git-kopi med lokal origin (3→2→1→0→0, afvisninger, testfejl).

## Sider

`/` · `/hjemmeside/` (hovedside med systemer og lokal SEO) · `/priser/` · `/demoer/` (+ `/demoer/cafe|restaurant|salon|vinbar/`) · `/privatlivspolitik/`

Adresser: `src/routes.js` (metadata fra `src/data/seo.js`). Nøglerne skal passe med `src/pageKeys.js`, `src/pages.jsx` og `src/pageLoaders.js` (bygget fejler ellers). Udgåede adresser (/marketing/, /booking-google/, /seo/, /lokal-synlighed/, /google-ads/ m.fl.) viderestilles med 301 i `public/_redirects`, altid direkte til den endelige adresse (ingen kæder). Tilføjer du en omdirigering, så peg på målet, ikke på en anden omdirigering; `npm run test:content` tjekker det.

## Kommandoer

| Kommando | Hvad den gør |
| --- | --- |
| `npm run dev` | Udviklingsserver |
| `npm run build` | Kører enhedstest og henvendelsestest, bygger til `dist/`, forudrenderer HTML, sitemap og JSON-LD |
| `npm run preview` | Serverer `dist/` på http://localhost:4173 |
| `npm test` | Enhedstest (priser, kvittering, beregnerens tilstand), henvendelsestest (worker med simuleret D1 og mail, genberegnede priser for hver pakke, tilvalg og intro 3/0) og intro-scriptets test |
| `npm run test:content` | Indholdstjek af det byggede site (kræver build): gamle ord, links til udgåede sider, omdirigeringer, sitemap, metatekster |
| `npm run test:e2e` | Browsertests mod `npm run preview` (beregner, formular med lokal worker, undersider, demoer) |
| `npm run intro:status` / `intro:brugt` | Se ovenfor |
| `npm run lint` | oxlint |
| `npm run fonts` / `brand` / `images` / `demo-shots` | Skrifter, mærkefiler, billeder og demoskærmbilleder |

## Opbygning

```
src/data/            Konfiguration og tekster (se ovenfor)
src/lib/             calculate.js (priser), receipt.js (kvittering, mail- og SMS-link)
src/pages/           Home, Hjemmeside, Priser, Demoer
src/components/      calculator/ (Mobile, Desktop, InquiryForm, useCalculator), home/, layout/, ui/
src/demos/           De fire koncepter
src/inquiry.js       Validering, mailtekst og canonicalLink: fælles for formularen og workeren
worker/index.js      /api/henvendelse: gemmer (D1) og sender mail; daglig cron
scripts/             prerender, tests, intro.mjs
public/_headers      Sikkerhedsheaders og cache
public/_redirects    301 fra gamle adresser
```

Design: tokens og bevægelse i `src/styles/`, resten i `src/index.css` (Tailwind v4). Skrifter: Archivo, Geist og Geist Mono (kun latin, woff2, selvhostede; `npm run fonts`). Billeder: `src/assets/billeder/README.md`. Palmy-casen er skjult (`flags.showPalmy`). Privatlivspolitikken (`src/components/Privatlivspolitik.jsx`) beskriver præcis, hvad siden gør; ændres noget, skal den ændres samtidig.

## Henvendelser

Formularen sender navn, mail og/eller telefon, valgfri virksomhed og besked (højst 1.000 tegn) og linket med valgene til `POST /api/henvendelse`. Workeren tjekker felterne igen, honeypot, rate limit pr. IP (`RATE_LIMITER`) og Turnstile, hvis `TURNSTILE_SECRET` er sat (valgfrit; sæt både `VITE_TURNSTILE_SITE_KEY` og hemmeligheden, og ret privatlivspolitikken). Priserne regnes **altid om på serveren** ud fra linket (aldrig browserens tal), inkl. om introprisen gælder. Så **gemmes forespørgslen i D1**, og mailen sendes i baggrunden (`ctx.waitUntil`, ét genforsøg efter 2 s), så kunden får svar med det samme. Fejler mailen, står rækken som `failed`, og en daglig cron (05:00 UTC) sender den igen; efter 3 genforsøg bliver den `gave_up` og står i en daglig opsummering. Cronen sender kun den lagrede tekst, så ældre rækker kan ikke fejle på nye priser; `CRON_FROM` i worker/index.js sætter, hvor langt tilbage cronen rører. Forespørgsler slettes efter 12 måneder.

Opsætning i Cloudflare (én gang): D1 `ovia-henvendelser` (ID i `wrangler.jsonc`, `worker/schema.sql`), Email Routing på oviaspecs.com (modtageren i `MAIL_TO` skal være verificeret; afsender `MAIL_FROM` på oviaspecs.com). Henvendelser kan ses i D1-konsollen: `SELECT created_at, contact, name, mail_status FROM henvendelser ORDER BY created_at DESC;`

## Udgivelse

`git push origin main` udgiver (Cloudflare bygger med `npm run build`). Brug en anden gren til preview først (`https://<gren>-ovia.ronnyhong723.workers.dev`; preview deler produktionens D1 og mail).
