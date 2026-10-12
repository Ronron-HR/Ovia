# QA-acceptkriterier for rebrandet (okt. 2026)

Udledt af `docs/rebrand/brief.md` (især afsnit C, D, G, H, I, J, K) og `docs/rebrand/kontrakt.md`. Hvert kriterium er testbart og har et AC-id. Id'erne er de samme i `scripts/test-rebrand-e2e.mjs`, som udskriver PASS/FAIL pr. id.

Kolonnen **Kontrol**: **A** = automatisk i `scripts/test-rebrand-e2e.mjs`, **D** = delvist automatisk (resten manuelt), **M** = manuel/visuel (eller kørt af hovedagenten). Kommandoen i bunden viser, hvordan scriptet køres.

Faser: fase 1 (dette dokument og scriptet) er forberedelse. Fase 2 er test af den integrerede, byggede version (`npm run preview`).

## 1. Priser og vilkår

Alle beløb er ekskl. moms. Beløbene står kun i `src/data/pricing.js`; siderne må ikke afvige fra dem.

| ID | Kriterium | Kontrol |
| --- | --- | --- |
| AC-1 | Tilbudslinjen "0 kr. i opstart · 995 kr./md. · mindst 6 måneder" og minimumsbetalingen 5.970 kr. står i forsidens hero (sektionen med h1, ved 1440 og 390 px) og på `/priser/` (og 995/5.970 på `/hjemmeside/`). | A |
| AC-2 | Lokal-omfanget er beskrevet på `/priser/`: 1-3 indholdssider, to korrekturrunder, op til 45 min. SEO/status og 15 min. små rettelser pr. md., domæneloft 200 kr./år, opsigelse med varsel, support på hverdage. | A (tekst) / M (ordlyd) |
| AC-3 | Så længe `systemModule.ready` er `false`, sælges systemmodulet ikke til en pris nogen steder (sider, JSON-LD, beregner, guide, formularens resumé). 1.495 kr./md. og 8.970 kr. må kun stå tydeligt mærket "ikke klar endnu"; `/systemer/` viser "særskilt fast tilbud efter afgrænsning". | A |
| AC-4 | Engangspriser: Start 2.500, Vækst 4.000, Fuld fart 5.000 kr. på `/priser/` og `/hjemmeside/`, med antal sider og rettelsesrunder (1 side/1 runde, op til 5/2, op til 8/3). | A (beløb) / M (omfang) |
| AC-5 | Drift: Basis 99 (ingen indholdsrettelser), Plus 199 (op til 15 min.), Ekstra 399 (op til 30 min.) pr. md., smårettelser med kundeleveret materiale; egen konto/hosting +1.000 kr. én gang i stedet for driftsplan. | A (beløb, minutter) / M (afgrænsning) |
| AC-6 | Frikøb/overførsel ved stop af drift = 1.000 kr. står synligt ved ordet frikøb/overførsel og er forklaret (hvad beløbet dækker). Aldrig "ingen udtrædelsesomkostninger". | D |
| AC-7 | Bookingintegration +500 kr.; ekstra side efter otte +400 kr. (kun Fuld fart); bookingudbyderens abonnement betales direkte til udbyderen. | A (beløb, tekst) / M (Fuld fart-begrænsning) |
| AC-8 | Booking & Google: 500 / 1.000 / 1.500 kr. (sum af komponenter: Google-profil 500, booking 500, QR-skilt 500). QR kan vælges uden booking; Google + QR uden booking = 1.000 kr.; QR-layout er en engangsleverance, print og forsendelse er ikke med. | D |
| AC-9 | Marketing: 1.500 / 2.500 / 4.000 kr./md.; annoncebudget er separat; Fuld fart højst én kunde ad gangen; Google Ads ikke inkluderet i Lokal. | D |
| AC-10 | "Alle priser er ekskl. moms." står ved priserne. Ingen opdigtet CVR, momsregistrering eller adresse (CVR/adresse vises kun, hvis `company.cvr`/`company.address` er udfyldt). | A |
| AC-11 | `/priser/` har en synlig vilkårssektion (`id="vilkaar"`, ikke i en `<details>`/FAQ) med abonnementsvilkår (Lokal), bevarede engangsvilkår, fælles vilkår (domæne, ejerskab, support, moms) og én sætning om forskellen. | A |
| AC-12 | Ingen skjult binding: seks måneders minimum, opsigelse med én måneds varsel tidligst til udgangen af måned seks (ingen skjult syvende måned), udlevering af filer og dokumentation efter minimum når forfaldne beløb er betalt, vedvarende brugsret, forskel på filudlevering og administreret backend/licenser/flytning, eksport af systemdata, kundens ejerskab af domæne/indhold/data. | D (ordsøgning, advarsler) / M |
| AC-13 | Ingen gamle eller modstridende beløb: ingen 2.700-kr.-model; købsmåderne (`#koebsmaader`) viser de samme beløb på forsiden og `/priser/`; samme pakkepriser på `/hjemmeside/` og `/priser/`; beløb uden for den godkendte liste giver en advarsel. | A |

## 2. Beregner

| ID | Kriterium | Kontrol |
| --- | --- | --- |
| AC-14 | Beregnerens første valg er de to købsmåder "Løbende samarbejde" og "Køb hjemmesiden" som gensidigt udelukkende radioknapper; tilvalg (Lokal synlighed, Marketing) kommer bagefter. | A |
| AC-15 | Ingen dobbeltbetaling: Lokal-resultatet viser hverken engangspris eller drift; "Køb hjemmesiden" viser ikke Lokal-abonnementet; Google-profil, som Lokal/Vækst/Fuld fart allerede indeholder, trækkes fra Booking & Google. | D (Lokal/Køb-adskillelse automatisk; fradraget dækkes af `npm test` og manuel prøve) |
| AC-16 | Gamle links (`ydelser=hjemmeside&sider=…&bestilling=…&drift=…`, også `drift=drift`) virker uændret som "Køb hjemmesiden": 2.500/99, 4.000/199, 5.500/399, 5.000/0 m.fl. på forsiden og `/priser/`. | A |
| AC-17 | Samme valg giver samme pris på skærmen, i det afsendte link (`payload.link`) og i en uafhængig genberegning (`src/calculator.js`), og købsmåderne viser samme beløb på forside og prisside. | A |
| AC-18 | Lokal-resultatet viser opstart (0 kr.), månedlig betaling (995), minimumsperiode (6 mdr.), minimumsbetaling (5.970), eksterne udgifter og overdragelsesvilkår FØR formularen beder om kontaktoplysninger. | A |
| AC-19 | Valg og resultat bevares ved genindlæsning og i delte links; kontaktoplysninger ligger aldrig i adresselinjen eller det afsendte link. | A |

## 3. Behovsguide

| ID | Kriterium | Kontrol |
| --- | --- | --- |
| AC-20 | Højst tre spørgsmål i alle grene (scriptet gennemløber alle grene automatisk). | A |
| AC-21 | Hvert spørgsmål har en synlig "Spring over" (eller tilsvarende), som fører til beregneren uden at miste adgang og uden `hjaelp=` i adressen. | A |
| AC-22 | Google-profil alene fører til en engangsopgave (Booking & Google Start, 500 kr.), ikke til booking-pakken. | M (ordlyden er ikke kendt på forhånd; scriptet viser alle grene og advarer om 1.000/1.500 ved "Google alene") |
| AC-23 | QR-skilt uden booking tvinger ikke booking med: resultatet er ikke Booking & Google Fuld fart/1.500 kr., men Google + QR (1.000 kr.). | A (heuristik på valgenes tekst) |
| AC-24 | Booking anbefales som integration af kundens eksisterende system; ingen ny kalender bygges, hvis det eksisterende virker. | M |
| AC-25 | Et system anbefales kun ved en relevant arbejdsgang, ellers en bedre formular eller Lokal; aldrig med modulpris, mens `ready=false`. | D |
| AC-26 | Guiden åbner kun på brugerens initiativ (ikke ved indlæsning); hvert resultat viser en pris eller en kontaktvej; forslaget og beregneren viser samme pris. | D |

## 4. Formular

| ID | Kriterium | Kontrol |
| --- | --- | --- |
| AC-27 | Felter: kontakt (påkrævet; mail eller telefon), navn/virksomhed (valgfri), besked (valgfri). Højst tre synlige felter, ingen nyhedsbrev/samtykkefælder, honeypot skjult og uden for tab-rækkefølgen. | A |
| AC-28 | Tom eller ugyldig kontakt (`""`, `abc`, `1234`, `a@b`) sender intet; fejltekst står ved feltet (`aria-invalid`, `role=alert`), og fokus flyttes til feltet. | A |
| AC-29 | Serverfejl (500, 503, `{ok:false}`): ingen "Tak", fejltekst der siger, at det ikke blev sendt, og hvordan man ringer; kontakt, navn, besked og alle valg i beregneren bevares (felter, markerede valg, adresse). | A |
| AC-30 | "Tak" vises først, når serveren har svaret `{ ok: true }`; ikke mens svaret afventes ("Sender …"); ikke ved ugyldigt input. | A |
| AC-31 | Teksten siger, at indsendelsen er en forespørgsel, ikke en bestilling; payload har kontakt, navn, besked og link med valgene; ingen honeypot-værdi; intet når en rigtig server (alle POST besvares af efterligning, andre POST afvises). | A / M (ordlyd) |
| AC-32 | Besked højst 1.000 tegn (maxlength eller valideringsfejl uden afsendelse). | A |

## 5. Navigation og sider

| ID | Kriterium | Kontrol |
| --- | --- | --- |
| AC-33 | Navigation: Løsninger (Hjemmesider `/hjemmeside/`, Lokal synlighed `/booking-google/`, Systemer `/systemer/`, Marketing `/marketing/`), Eksempler `/demoer/`, Priser `/priser/`, Om/Kontakt `/#om`. De gamle top-punkter "Hjemmeside" og "Booking & Google" er væk. | A |
| AC-34 | Desktop: "Løsninger" er en disclosure-knap med `aria-expanded`; Enter og Mellemrum åbner; Escape lukker og returnerer fokus til knappen; klik udenfor lukker; klik åbner/lukker (ikke kun hover); lukkede punkter kan ikke nås med Tab. | A |
| AC-35 | Mobil (360/390): Menu åbner/lukker (knap, Luk, Escape); de fire løsninger står som liste under overskriften "Løsninger"; ingen vandret overflow med åben menu. | A |
| AC-36 | "Ring" (`tel:+4553613699`) og "Se din pris" er bevaret i header og på forsiden. | A |
| AC-37 | Forsiden har sektionerne i rækkefølgen: 1 hero, 2 eksempler, 3 tre problemer, 4 to købsmåder (`#koebsmaader`), 5 beregner med guide (`#beregner`, egen sektion, ikke i heroen), 6 forløb, 7 Ronny (`#om`) + FAQ + kontakt (`#kontakt`). | A |
| AC-38 | Alle sider svarer 200 (`/`, `/hjemmeside/`, `/marketing/`, `/booking-google/`, `/systemer/`, `/priser/`, `/demoer/`, de fire demoer, `/privatlivspolitik/`). `/systemer/` har indhold: spørg først, 2-3 eksempler, modulets status, "særskilt" tilbud, sikkerhed, `#demo`. En ukendt adresse giver 404 (advarsel i preview). | A |
| AC-39 | `/priser/`: overskrift, beregner, købsmåder, alle pakker, vilkår (`#vilkaar`), kontakt, i den rækkefølge. | A |
| AC-40 | Demoer er mærket "Demo"/"Koncept" med tydelige begrænsninger; arbejdsgangsdemoen (`#demo` på `/systemer/`) er mærket "Demo, ikke et færdigt system", virker (formular giver status Ny og en intern påmindelse) og sender intet. | A / M (visuel kvalitet) |
| AC-41 | Alle interne links svarer 200; alle `#`-mål findes; ingen links til de omdirigerede gamle adresser. | A |
| AC-42 | `/booking-google/` hedder "Lokal synlighed" i menu og overskrift (adressen er uændret). | A |
| AC-43 | Kontakt: kun Ronny Hong, kontakt@oviaspecs.com, 53 61 36 99 (`tel:+4553613699`, `mailto:`); ingen opdigtet CVR, adresse eller medarbejdere. | A |

## 6. Tilgængelighed

| ID | Kriterium | Kontrol |
| --- | --- | --- |
| AC-44 | Tastatur: alle tab-stop på `/`, `/priser/` og `/systemer/` (390 og 1440 px) har synlig fokusring (outline ≥ 2 px eller skygge) og ligger ikke bag faste elementer eller uden for skærmen. | A |
| AC-45 | Kontrast ≥ 4,5:1 for tekst (3:1 for stor tekst) på alle OviaSpecs-sider og beregnerens resultat ved 1440/390/360 px (computed style; tekst over billede/gradient måles ikke). Kantkontrast ≥ 3:1 og fokusring vurderes visuelt. | D |
| AC-46 | `prefers-reduced-motion: reduce`: ingen transform/position-animationer eller -overgange, ingen `scroll-behavior: smooth`, al tekst fuldt synlig. | A |
| AC-47 | Ingen hjælp, rundvisningsinvitation eller dialog åbner af sig selv: ved første besøg (frisk localStorage) efter 8,5 s på `/` og `/priser/` (1440/390), og mens guiden bruges. "Vis mig rundt" kun på brugerens initiativ. | A |
| AC-48 | Trykflader ≥ 44 px (under 40 px er fejl, 40-43 px noteres). | A |
| AC-49 | Landemærker (header, nav, ét main, footer), præcis én h1 pr. side, ingen springende overskriftsniveauer (advarsel), alle billeder har `alt`, `lang="da"`, alle valg og felter har label/legend. | A |

## 7. Responsivitet

| ID | Kriterium | Kontrol |
| --- | --- | --- |
| AC-50 | Ingen vandret overflow (`documentElement.scrollWidth <= innerWidth`) på nogen side ved 360, 390, 768 og 1440 px. | A |
| AC-51 | Beregnerens Lokal-resultat og formularen giver ikke vandret overflow ved 360 px; knapper og felter kan bruges (visuelt). | D |
| AC-52 | Ingen tekst under 12 px (14 px anbefalet, 12-13 px noteres). | A |

## 8. SEO

| ID | Kriterium | Kontrol |
| --- | --- | --- |
| AC-53 | Unik, beskrivende titel og metabeskrivelse pr. side (også `/systemer/` og demoerne), præcis én h1 i den forudrendrede HTML; titel ≤ 65 og beskrivelse 70-170 tegn (advarsel). | A |
| AC-54 | Canonical pr. side = `https://oviaspecs.com<sti>`; ingen `noindex`. | A |
| AC-55 | `/sitemap.xml` indeholder alle sider inkl. `/systemer/`, uden dubletter og uden ukendte adresser; `robots.txt` peger på sitemap og blokerer ikke sitet. | A |
| AC-56 | JSON-LD kan parses, er ikke tomt, indeholder ikke `aggregateRating`/`review`/rating, ikke `address` (medmindre `company.address` er udfyldt), ikke systemmodulets pris; telefon og mail stemmer med kontaktoplysningerne. | A |
| AC-57 | Redirects i `public/_redirects`: de gamle adresser (hjemmesider, seo, google-ads, sociale-medier-annoncering, booking-integrationer, prisberegner, ai-automatisering, om, kontakt) er 301 til eksisterende sider; ingen kæder, ingen live side som kilde. | A (filen; Cloudflares udførelse kun efter udgivelse) |
| AC-58 | Forsidens titel/beskrivelse følger briefets retning ("Hjemmesider og lokal SEO i Aarhus | OviaSpecs"); `og:title`, `og:description`, `og:image` findes. Ingen masseproducerede bysider. | A (advarsler) |

## 9. Ærlighed

| ID | Kriterium | Kontrol |
| --- | --- | --- |
| AC-59 | Ingen af: "gratis hjemmeside", "ingen udtrædelsesomkostninger", "2.700", "webmaster", "ekspert", "revolutionerende", "digital transformation" i den synlige tekst (heller ikke i lukkede FAQ-svar). Bemærk: driftsplanen Ekstra bruger i dag ordet "webmaster" og skal rettes. | A |
| AC-60 | "garanti" kun i afvisende sammenhæng ("ingen garanti"); ingen løfter om Google-placering, "bliver fundet", flere kunder, procenttal, rating/stjerner eller AI-citering (advarsler med kontekst; mennesket afgør). | A (kontekst rapporteres) |
| AC-61 | Ingen opdigtede cases, anmeldelser, kundetal eller udtalelser; marketingsiden siger åbent, at der ikke er cases endnu; gratis pilot giver ikke krav på en positiv udtalelse. | D |
| AC-62 | Jeg-form (Ronny er én person; "vi/vores" giver advarsel), naturligt dansk; koncepterne udgives ikke som kundeopgaver; billeder er ikke AI-fremstillede kundelokaler. | D / M |

## 10. Teknik

| ID | Kriterium | Kontrol |
| --- | --- | --- |
| AC-63 | `npm test` består (pristest, guidetest, henvendelsestest; fejler på hardkodede beløb). | A (`RUN_NPM_TEST=1`) / M |
| AC-64 | `npm run build` og `npm run lint` består; rapportér hvad der faktisk blev kørt. | M (hovedagenten) |
| AC-65 | Ingen konsolfejl, sidefejl eller 4xx/5xx fra egne ressourcer på nogen side (den efterlignede 500 på formularen undtaget). | A |
| AC-66 | CLS ≤ 0,1 (advarsel ved > 0,05) på alle sider ved 1440 og 390 px (lab). | A |
| AC-67 | Indhold er synligt og læseligt uden JavaScript og når scripts afvises: h1, ≥ 400 tegn, tilbudslinjen og priserne på `/` og `/priser/`, ingen usynlig tekst. | A |
| AC-68 | Ingen eksterne ressourcer udover Cloudflare Web Analytics (CSP); alle andre værter er fejl. | A |
| AC-69 | Mobil-LCP (lab, 390 px) ≤ 2,5 s som vejledende måling; INP og feltdata findes ikke og må ikke lyde som et salgsresultat; ingen "100/100"-løfter. | A (kun advarsel) / M |

Tal: Priser og vilkår 13 (AC-1 til AC-13), Beregner 6 (AC-14 til AC-19), Guide 7 (AC-20 til AC-26), Formular 6 (AC-27 til AC-32), Navigation og sider 11 (AC-33 til AC-43), Tilgængelighed 6 (AC-44 til AC-49), Responsivitet 3 (AC-50 til AC-52), SEO 6 (AC-53 til AC-58), Ærlighed 4 (AC-59 til AC-62), Teknik 7 (AC-63 til AC-69). I alt 69.

## Manuel/visuel kontrol (kan ikke automatiseres)

- Design: varm, lys baggrund, én accentfarve, stærk typografi, konsekvent ikonstil, ingen visuelt rod, én primær handling pr. sektion (skærmbilleder ved 360/390/768/1440: `node scripts/ovia-shots.mjs <mappe>`).
- Ordlyd i vilkår, guidens anbefalinger (AC-22, AC-24) og demoernes begrænsninger; naturligt dansk uden buzzwords.
- Kantkontrast på felter (≥ 3:1) og tekst over billeder.
- Rigtig skærmlæser og rigtig mobil (touch, tastatur på mobil).
- Cloudflares 404-svar, 301-redirects og headers (`public/_headers`) efter udgivelse til et preview; momsregistrering og CVR (åbent punkt, skal verificeres før udgivelse).
- Feltdata for LCP/INP/CLS (findes først efter trafik).

## Sådan køres scriptet

```
npm run build              (hovedagenten; QA bygger ikke)
npm run preview            (i en anden terminal, http://localhost:4173)
SITE=http://localhost:4173 node scripts/test-rebrand-e2e.mjs
```

Valgfri miljøvariabler: `ONLY=sider,nav,beregner,guide,formular,a11y,seo,teknik` (grupper), `RUN_NPM_TEST=1`, `VERBOSE=1` (noter), `CHROME=<sti>`. Selektorer, forventede tekster og sidelisten står som konstanter øverst i scriptet (afsnittet KONFIGURATION). Scriptet sender aldrig en rigtig henvendelse: `POST /api/henvendelse` besvares af en efterligning; andre POST og forespørgsler til andre værter afbrydes; det afviser at køre mod oviaspecs.com uden `ALLOW_PROD=1`. Exit-kode 1 ved mindst ét FAIL.

Resultater: PASS, PASS* (bestået med advarsler eller en manuel rest), FAIL, SKIP (kun manuel kontrol), MANUEL (ingen automatisk kontrol kørt).
