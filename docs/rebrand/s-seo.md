# S: SEO og lokal synlighed (rapport)

Model: claude-sonnet-5-5 (Sonnet 5.5). Dato: 12. okt. 2026. Ingen commit, ingen build i projektmappen.

## 1. Ændrede filer

| Fil | Ændring |
| --- | --- |
| `src/data/seo.js` (NY) | Titler, beskrivelser og `updated` (sitemap) pr. side; `organisationLd()` (JSON-LD); `privacySeo`. Ren JS, beløb kun via `formatKr` og pricing.js. |
| `src/routes.js` | Læser metadata fra seo.js. Rækkefølge nu: /, /hjemmeside/, /booking-google/, /systemer/, /marketing/, /priser/, /demoer/, demoerne. |
| `src/entry-server.jsx` | `organisationLd` flyttet til seo.js (kan nu testes i Node) og re-eksporteres; eksporterer også `privacySeo`. |
| `scripts/prerender.mjs` | Se afsnit 4. Canonical, CSP-hash-logik og JSON-LD-pladsholder er bevaret. |
| `index.html` (kun `<head>`) | Titel, beskrivelse, og:/twitter:-tekster og billed-alt sat til den nye forside. |
| `privatlivspolitik/index.html` (kun `<head>`) | Tilføjet twitter:title/description/image og og:image-mål. |
| `public/_redirects`, `public/robots.txt` | Se afsnit 5 og 6. `public/_headers` er uændret (se afsnit 4). |

## 2. Titler og beskrivelser (tegn)

Søgetemaer er forslag, ikke validerede volumener. Én hensigt pr. side. Ingen løfter om placering.

| Side | Titel (tegn) | Beskrivelse (tegn) | Hensigt / tema |
| --- | --- | --- | --- |
| `/` | Hjemmesider og lokal SEO i Aarhus \| OviaSpecs (45) | Få hjælp til hjemmeside, lokal Google-synlighed og enklere henvendelser. Se priser og løsninger hos OviaSpecs. Direkte kontakt med Ronny. (137) | Samlet tilbud; hjemmeside Aarhus, lokal SEO Aarhus (ordret fra briefet) |
| `/hjemmeside/` | Hjemmeside til små virksomheder \| OviaSpecs (43) | Hjemmeside uden opstartspris på abonnement (995 kr./md., mindst 6 mdr.) eller som engangskøb fra 2.500 kr. Du taler med Ronny. (126) | hjemmeside til små virksomheder, hjemmeside på abonnement |
| `/booking-google/` | Lokal SEO og Google-profil i Aarhus \| OviaSpecs (47) | Hjælp til din Google-profil, lokal SEO, booking og et QR-skilt til anmeldelser. Konkret arbejde uden løfter om placering. Start med et gratis tjek. (147) | lokal SEO Aarhus, hjælp til booking (H1 er stadig "Lokal synlighed") |
| `/systemer/` | Små systemer til henvendelser og opfølgning \| OviaSpecs (55) | Små digitale arbejdsgange til fx catering, tilbudsopfølgning og booking, kun hvis du har et konkret behov. Se en demo. Pris som særskilt fast tilbud. (149) | små systemer, kun ved behov |
| `/marketing/` | Korte videoer og opslag til sociale medier \| OviaSpecs (54) | Korte videoer og opslag til dine sociale medier hver måned, fra 1.500 kr./md. Annoncebudget er særskilt. Kontakt Ronny direkte. (127) | marketing som særskilt ydelse |
| `/priser/` | Priser på hjemmeside og lokal synlighed \| OviaSpecs (51) | 0 kr. i opstart og 995 kr./md. i mindst 6 mdr., eller køb hjemmesiden fra 2.500 kr. Beregn din pris. Alle priser er ekskl. moms. (129) | priser, prisberegner |
| `/demoer/` | Eksempler på hjemmesider til café og salon \| OviaSpecs (54) | Fire demoer af hjemmesider til café, restaurant, salon og vinbar. De er koncepter, ikke kundeopgaver, men de virker på din telefon. Prøv dem selv. (146) | eksempler/demoer |
| `/demoer/cafe/` m.fl. | Cafédemo \| Koncept fra OviaSpecs (32), Restaurantdemo (38), Salondemo (33), Vinbardemo (34) | 97 / 110 / 113 / 116 tegn (fra content.demos.js, C ejer teksten) | konceptdemo |

Beløbene i beskrivelserne er `formatKr(...)` af tal fra pricing.js (`lokal`, `services`). De ændrer sig automatisk med priserne, men længden skal gentjekkes, hvis priserne ændres. Build-tjekket (afsnit 4) advarer.

## 3. JSON-LD-beslutninger (kun forsiden, `organisationLd()` i seo.js)

- Struktur: `@graph` med `Organization` og `WebSite` (navn, url, `inLanguage: 'da'`, publisher).
- Type `Organization` i stedet for den tidligere `ProfessionalService`: den er en `LocalBusiness`-undertype, som forventer adresse. Der er ingen verificeret adresse (`company.address` er tom) og tilbuddet gælder hele Danmark.
- Med: navn, url, logo (`/logo.svg`), billede (`/og.jpg`), mail, telefon (+4553613699), beskrivelse ("Base i Aarhusområdet", fra briefet), grundlægger Ronny Hong, `knowsLanguage: da`, `contactPoint` (mail og telefon, dansk), `areaServed: Country Danmark`.
- `areaServed`: Danmark (tilbuddet leveres på afstand). Aarhusområdet står kun som tekst i beskrivelsen, ikke som `address`/`geo`/`City`, så der ikke påstås en lokation ud over det, briefet siger. Hvis Ronny vil ændre det til Aarhus-området, skal han bekræfte, at han faktisk tager imod kunder dér.
- Tilbud (`makesOffer`): NYT Lokal (to prisspecifikationer: opstart 0 kr. og 995 kr. pr. måned; mindsteperiode og minimum 5.970 kr. i beskrivelsen, regnet af `lokalMinimum()`), uændret engangspakker, Marketing, Booking & Google og driftsplaner. Alle priser har `valueAddedTaxIncluded: false` (priceNote: "ekskl. moms").
- `systemModule` er kun med, hvis `systemModule.ready` er true. Nu er det false, så der er intet tilbud med modulpris. Kontrolleret i test-build: ingen offer med 1.495 kr.
- Bevidst udeladt: `LocalBusiness`/adresse/`geo`/åbningstider, `aggregateRating`/`review`, `FAQPage` (Google viser ikke længere FAQ-rich results, og markup skal ordret matche synlig FAQ), `BreadcrumbList` (der er ingen synlig brødkrumme, og strukturen er flad: 1 niveau + demoer), `Service` pr. ydelsesside (ingen rich result at hente; vedligeholdelsesbyrde og risiko for at afvige fra synlig tekst).
- Forbehold: JSON-LD'en på forsiden lister også priser, der står på /priser/ og /hjemmeside/ (drift, Marketing, Booking & Google). QA/H bør bekræfte, at de står synligt på forsiden (beregner/BuyModes/ServiceCards). Ellers fjern dem fra `packageOffers()`/`driftOffers()` eller flyt dem til /priser/.
- Validering: JSON-parse af det byggede output og gennemgang af felter mod schema.org (Organization.makesOffer/areaServed/knowsLanguage/contactPoint, Offer.priceSpecification, UnitPriceSpecification.unitCode/valueAddedTaxIncluded, WebSite.inLanguage/publisher). Google Rich Results Test og validator.schema.org er IKKE kørt (kræver netadgang/URL). Der er ikke noget rich result at teste: Organization/Offer giver ikke et rich result.

## 4. Prerender, sitemap, head

Ændringer i `scripts/prerender.mjs` (alle fejler højt):
- Skabelonen skal have `<html lang="da">`, viewport-meta og canonical-link.
- Titel/beskrivelse skal findes og være unikke pr. side. Hård grænse: titel ≤ 70, beskrivelse ≤ 180 tegn (bygget fejler). Blød grænse: titel > 60 eller beskrivelse uden for 110-165 giver en advarsel. Nuværende advarsel: `/demoer/cafe/` beskrivelse 97 tegn (C kan forlænge).
- Canonical sættes pr. side og kontrolleres efter udskiftning.
- Sitemap: alle routes inkl. `/systemer/` og `/privatlivspolitik/` (12 adresser). `<lastmod>` er sidens `updated` i seo.js (hånddrevet, ikke byggedato: en dato, der skifter ved hvert build, lærer Google at ignorere feltet). Alle sider står nu på 2026-10-12 (rebranddatoen), privatlivspolitikken på 2026-10-07 (= `privacy.updated` i texts.js). Opdatér `updated`, når en side ændres væsentligt; mangler feltet, udelades `<lastmod>`.
- CSP-hash-logik uændret. JSON-LD-scriptet er udelukket fra hash-udregningen (som før), og mine head-ændringer tilføjer intet indlejret script. `public/_headers` er derfor uændret.
- Test-build i en kopi uden for projektmappen (src, scripts, public, index.html; node_modules som junction; ingen berøring af `dist/` eller `dist-ssr/`): `vite build`, SSR-build og `prerender.mjs` kørte rent. Verificeret i output: unik `<title>` og canonical pr. side, `<html lang="da">`, JSON-LD kun på forsiden, og:url pr. side, sitemap med 12 adresser og lastmod, CSP med 1 script-hash (som før).

## 5. Redirectplan (`public/_redirects`, alle 301, ét hop)

| Fra (med og uden `/`) | Til | Status |
| --- | --- | --- |
| `/hjemmesider` | `/hjemmeside/` | uændret |
| `/seo` | `/booking-google/` | ÆNDRET (var `/marketing/`; SEO-hjælp er nu Lokal synlighed) |
| `/lokal-synlighed` | `/booking-google/` | NY (menunavnet kan blive skrevet/delt som adresse) |
| `/google-ads` | `/marketing/` | uændret |
| `/sociale-medier-annoncering` | `/marketing/` | uændret |
| `/booking-integrationer` | `/booking-google/` | uændret |
| `/prisberegner` | `/priser/` | uændret |
| `/ai-automatisering` | `/systemer/` | ÆNDRET (var `/`) |
| `/om`, `/kontakt` | `/#om`, `/#kontakt` | uændret |

- `/systemer` uden skråstreg: ingen regel. Static Assets' standardhåndtering (auto-trailing-slash) sender til `/systemer/`; en eksplicit regel risikerer en løkke. Afprøv efter deploy: `curl -I https://oviaspecs.com/systemer`.
- Ingen kæder: ingen mål er selv en kilde. `/seo/` var tidligere indekseret mod `/marketing/`; Google genvurderer på tværs af nogle uger. Det er forventet.
- Interne links må ikke længere pege på de gamle adresser (de er allerede nye i `paths`). H: tjek `grep -rn '"/seo\|/ai-automatisering\|/hjemmesider' src` før merge.
- Ikke kontrolleret mod produktion: det kræver en deploy. Efter deploy: `curl -sI` på hver "fra"-adresse og kontrollér `301` og `location`.

## 6. robots.txt

`User-agent: *`, `Allow: /`, sitemap-linje. Intet er blokeret, hverken CSS, JS (`/assets/`), skrifter eller billeder. Kun kommentarer er tilføjet. `/api/henvendelse` er POST-endpoint uden indhold; `Disallow: /api/` er ikke nødvendig. `<meta name="robots" content="index, follow, max-image-preview:large">` står i alle sider (404.html har `noindex`, korrekt).

## 7. Anbefalinger til H1/H2 og interne links (til C og D)

Brug beskrivende ankertekst (sidens navn eller hensigt), ikke "læs mere". En H1 pr. side. Overskrifter bør indeholde søgetemaet i naturligt dansk, uden stuffing og uden løfter ("bliv fundet", "flere kunder").

| Side | H1 (forslag) | H2-forslag | Interne links ud |
| --- | --- | --- | --- |
| `/` | Fra briefet: "En hjemmeside, der gør det nemt at vælge din virksomhed." Aarhus og målgruppe i underteksten: "Hjemmesider og lokal Google-synlighed til mindre virksomheder i Aarhus og resten af Danmark." (kun hvis det er sandt) | Eksempler på hjemmesider; Tre problemer, jeg løser; To måder at købe på; Sådan foregår det; Om Ronny; Spørgsmål | `/hjemmeside/` (hjemmeside på abonnement), `/booking-google/` (Lokal synlighed), `/systemer/`, `/marketing/`, `/demoer/`, `/priser/#vilkaar`, `#beregner` |
| `/hjemmeside/` | Hjemmeside til små virksomheder (eller samme formulering som title) | Hjemmeside på abonnement: Lokal; Køb hjemmesiden som engangsprojekt; Drift; Spørgsmål om hjemmesiden | `/priser/`, `/priser/#vilkaar`, `/booking-google/` ("Google-profil og lokal SEO"), `/demoer/` |
| `/booking-google/` | Lokal synlighed (menunavnet). Nævn Aarhus i leadet: "Lokal SEO og Google-profil for virksomheder i Aarhus-området" | Det gør jeg ved start; Det gør jeg hver måned; Sådan måler jeg (visninger, klik, henvendelser); Google-profil; Hjælp til booking; QR-skilt til anmeldelser; Gratis tjek | `/hjemmeside/`, `/priser/`, `/priser/#vilkaar`, `/systemer/` (hvis behov er opfølgning) |
| `/systemer/` | Små systemer til henvendelser og opfølgning | Spørg først; Eksempler (catering, tilbudsopfølgning, booking); Status for standardmodulet; Demo; Sikkerhed; Pris | `/booking-google/` (hjælp til booking), `/hjemmeside/`, `/priser/`, kontakt |
| `/marketing/` | Korte videoer og opslag til sociale medier | Hvad er med; Pilotforløb (ingen cases endnu, bevar åbenheden); Priser; Spørgsmål | `/priser/`, `/hjemmeside/`, `/booking-google/` |
| `/priser/` | Priser på hjemmeside og lokal synlighed | Beregn din pris; To måder at købe på; Alle pakker; Vilkår (`id="vilkaar"`) | `/hjemmeside/`, `/booking-google/`, `/marketing/`, `/systemer/` |
| `/demoer/` | Eksempler på hjemmesider til café og salon | De fire demoer (hver med H3); Hvad de viser; Næste skridt | De fire demoer, `/hjemmeside/`, `/priser/` |
| Demoer | Demoens eget navn + "Koncept" | n/a | Tilbage til `/demoer/`, `/hjemmeside/`, `/priser/` |

Øvrige råd: forsiden skal indeholde ordene "Aarhus" og "lokal SEO" synligt (ellers passer titlen ikke til indholdet); samme gælder "abonnement" på `/hjemmeside/`. Alt i navigationen skal være rigtige `<a href>`-links (ikke kun knapper), også under "Løsninger". Footer: links til alle fire løsninger, /priser/ og /privatlivspolitik/. Ingen masseproducerede bysider (briefet). Demoer: behold dem som indekserbare koncepter med tydeligt mærke "Koncept".

## 8. Lokal SEO-tjekliste for OviaSpecs selv

Alt under er FORSLAG til Ronny at tage stilling til og udføre i kontoen, ikke fakta og ikke udført.

Google Business Profile (GBP):
1. Berettigelse: Google kræver, at virksomheden har personlig kontakt med kunder i åbningstiden (besøg hos kunden eller møde). Ren fjernlevering (kun telefon/mail/online) giver normalt ikke ret til en profil. Ronny skal afgøre, om han reelt mødes med kunder i Aarhusområdet. Det kan ikke afgøres herfra.
2. Servicevirksomhed uden fysisk butik: vælg "serviceområde", skjul adressen fra offentligheden. Brug den rigtige adresse til verificering; aldrig et virtuelt kontor, postboks eller en adresse, der ikke er Ronnys. Opdigt ingen adresse på siden.
3. Serviceområde: realistisk og snævert (fx Aarhus og nabokommuner), ikke "hele Danmark".
4. Kategori: vælg i GBP's egen kategoriliste (den danske oversættelse er ikke kontrolleret her). Mulige primære/sekundære kandidater at sammenligne: webdesigner/udvikler af hjemmesider, marketingbureau/internetmarkedsføring. Vælg den, der bedst beskriver hovedydelsen (hjemmeside), og tilføj kun sekundære, der er sande.
5. Navn = det rigtige navn "OviaSpecs" uden søgeord ("OviaSpecs Hjemmeside Aarhus" er navnestuffing og kan give suspendering).
6. Telefon 53 61 36 99 (samme som på siden), web = `https://oviaspecs.com/`. Åbningstider kun, hvis de er faste og sande.
7. Beskrivelse og ydelser skrevet ud fra siden (hjemmeside, lokal synlighed, systemer, marketing). Ingen løfter, ingen "bedst".
8. Billeder: ægte (Ronny, arbejdsbilleder). Ingen AI-billeder af lokaler.
9. Anmeldelser: bed neutralt alle relevante kunder, med profilens link/QR. Ingen belønning, ingen udvælgelse af kun tilfredse, ingen købte. Svar på alle.

NAP og konsistens:
- Navn, telefon og mail skal være identiske overalt (siden, JSON-LD, GBP, Facebook/LinkedIn, Virk). Én skrivemåde for telefon (fx 53 61 36 99 på siden, +45 53 61 36 99 i profiler).
- Uden offentlig adresse er "A" bevidst tom. Hvis CVR/adresse senere offentliggøres (verificeres først), skal den være ens alle steder.
- Kandidater til ægte opslag (ikke kontrolleret, kun hvis de findes/er relevante): Virk/CVR-registrering, Bing Places, Apple Business Connect, Facebook-side, LinkedIn. Ingen betalte katalogtjenester uden særskilt valg.

På siden:
- Aarhus og ydelser skal stå synligt i indholdet (ikke kun i titlen); ingen adresse- eller ratings-markup.
- En enkel kontaktblok (navn, telefon, mail) i footer og på forsiden, tekst ikke billede.
- Tilslut Search Console med domæneverifikation (DNS i Cloudflare) og indsend `https://oviaspecs.com/sitemap.xml`.

Måling (adskil begreberne): visninger, klik, relevante henvendelser, salg. Et "opkald" i profildata er et klik på ringeknappen. Før/efter-tal er ikke bevis for årsag.

## 9. Kontrolleret og ikke kontrolleret

Kontrolleret:
- `npm test`: kører, men fejler på andre agenters filer i gang (se nedenfor). Ingen fejl peger på mine filer; seo.js har ingen hardkodede beløb (scanneren fandt intet).
- Titler/beskrivelser: længder målt med et script; unikke pr. side.
- Test-build uden for projektmappen (afsnit 4) og JSON-LD parset og gennemgået.
- Redirectfilens syntaks (`kilde mål status`), ingen kæder, ingen løkker.
- Statuskoder for kendte sider: ikke kørt mod live; 404 håndteres af `404.html` (`noindex`).

`npm test` ved min afslutning (ikke mine filer): pristesten fejler på `src/data/offer.js` (hardkodede beløb i kommentarer, C) og på beregner-/pakkeskift-kombinationer (F, arbejde i gang). Mine ændringer påvirker ikke pristesten.

IKKE kontrolleret (ingen adgang eller kræver deploy):
- Faktisk indeksering, dækning, placeringer, søgeforespørgsler, klik, visninger, Core Web Vitals-feltdata: ingen Search Console.
- GBP: findes en profil? Verificeret? Kategori, anmeldelser, visninger/handlinger: ingen GBP-adgang.
- Trafik, konverteringer, henvisningskilder: ingen analytics-data (kun Cloudflare Web Analytics findes i CSP; ingen adgang hertil).
- Backlinks, citations, konkurrenter, søgevolumen for de foreslåede søgetemaer: ingen Ahrefs/Semrush/BrightLocal/Local Falcon/DataForSEO. Temaerne er forslag.
- Rich Results Test / validator.schema.org (kræver URL).
- Live-redirects og svarheaders på oviaspecs.com.
- Om `/priser/`, drift og Marketing står synligt på forsiden (se afsnit 3).
- Sideindhold på de nye sider (H1, H2, interne links): tilhører C/D og er ikke endeligt endnu.

## 10. Manglende adgange (for Ronny/H)

1. Google Search Console (domæneejerskab for oviaspecs.com).
2. Google Business Profile (ejerskab, verificeringsstatus, berettigelse).
3. Analytics (Cloudflare Web Analytics-data eller andet), også for Core Web Vitals-feltdata.
4. Eventuelt værktøj til konkurrent-/rangeringsdata (ikke oprettet; intet abonnement).
5. Bekræftelse af CVR, moms og eventuelt offentlig adresse (afgør NAP og hvad der må stå i JSON-LD).
6. Svar på: tager Ronny imod kunder personligt i Aarhusområdet (påvirker GBP-berettigelse og `areaServed`)?

## 11. Ønsker til andre

- H: efter build, kør `grep -o '<title>[^<]*</title>' dist/index.html dist/*/index.html dist/demoer/*/index.html`, `grep -c 'application/ld+json' dist/index.html dist/priser/index.html` (1 og 0), åbn `dist/sitemap.xml` (12 adresser) og tjek, at CSP har script-hash i `dist/_headers`. Beskriv seo.js i README ("Hvor SEO bor"). Husk at bumpe `updated` i seo.js, når en sides indhold ændres væsentligt.
- C: `meta`-objekterne i texts.js og services.js er nu ubrugte (kan slettes; ingen anden fil importerer dem via routes.js). Forlæng cafédemoens `metaDescription` (97 tegn) til ca. 120-150. Tier-teksterne i pricing.js (fx "Sat op til at blive fundet på Google") bør præciseres som arbejde og ikke som resultat; de gengives i JSON-LD.
- D: `public/og.jpg` bør regenereres med den nye budskabslinje (og:image:alt i index.html er nu "OviaSpecs. Hjemmesider og lokal Google-synlighed til mindre virksomheder."; ret alt-teksten, hvis billedet viser noget andet). `theme-color` i `index.html` er stadig `#ffffff`; sæt den til den nye paper-farve, når tokens er låst (head er min fil: sig til).
