# QA-rapport, fase 2 (12. okt. 2026)

Testet mod `vite preview` på http://localhost:4173 (commit 8ff0fd5 på `rebrand-lokal`). Scriptet: `scripts/test-rebrand-e2e.mjs` (kriterier i `qa-kriterier.md`, AC-1 til AC-69). Lab-test i Chrome headless; ingen skærmlæser, ingen feltdata. QA er stoppet efter brugerens ønske, så sidste justeringer af scriptet er ikke kørt i en samlet kørsel.

## Status

Seneste samlede kørsel af `test-rebrand-e2e.mjs` (alle grupper, efter første justering af konstanter): 56 PASS, 7 PASS med advarsel, 3 FAIL, 1 SKIP, 2 MANUEL (af 69). Derefter rettede jeg testfejl i scriptet (AC-6, AC-44 datofelt, AC-62, AC-31, AC-24). Disse rettelser er kun delvist genkørt (se "Ikke kørt").

`scripts/test-a11y-e2e.mjs` er opdateret til den tilsigtede adfærd og bestod i sidste kørsel for grupperne priser, tilstand, rundvisning, henvendelse, visuelt, bevaegelse og regression. Gruppen tastatur fejler stadig på fund F1 (reelt).

## Reelle produktfejl

| ID | AC | Alvor | Fund | Reproduktion | Forventet / faktisk | Ansvarlig |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | AC-44 | høj | Fokuseret element skjules bag den faste "Ring"-bundbjælke på mobil (WCAG 2.4.11 Focus Not Obscured). | 390x812, åbn `/`, tab gennem siden: linket "Se Lokal synlighed" (y 768-812) og FAQ-spørgsmålet "Kan du love, at jeg bliver fundet på Google?" (y 731-812) ligger helt under bjælken. Samme på `/systemer/` (textarea "wishes", knappen "Marker som gjort"). | Forventet: fokuseret element synligt, fx `scroll-padding-bottom` svarende til bjælkens højde. Faktisk: `scroll-padding-bottom: auto`. | D (`src/index.css`, `.callbar`) |
| F2 | AC-50 | middel | Vandret overflow på `/demoer/salon/` ved 768 px (773 > 768). Skyldes `li.dm-item` og `span.dm-price`. Findes også i den gamle version, så ikke en regression. | Åbn `/demoer/salon/` ved 768 px bredde. | Forventet: ingen vandret scroll. Faktisk: 5 px overflow. | `src/demos/*` (koncept-demoen), D/H |
| F3 | AC-48 | lav | Linket "Mail" er 43x50 px (mål 44 px) ved 360-1440 px. | Mål "Mail"-linket i kontaktsektionen. | Forventet ≥ 44 px bredde. Faktisk 43 px. | D (ContactButtons) |
| F4 | AC-42 | lav | Navnet "Lokal synlighed" står som eyebrow over h1 og i menuen, men ikke i selve h1 ("Gør det nemt at finde og kontakte dig lokalt."). Kontrakten siger "i menu og overskrift". | Se `/booking-google/`. | Afhænger af tolkning; advarsel, ikke FAIL. | C/D |
| F5 | AC-49 | lav | `/privatlivspolitik/` har header og footer, men ingen `<nav>`. Fandtes før rebrandet. | Se siden. | Kun advarsel (siden er en lille egen indgang). | S/D |

Observationer uden fejl (ingen handling krævet): 13 px-tekst på "1000 tegn tilbage" og noter (AC-52, over 12 px); "vi/vores" bruges som "Ronny og kunden" (AC-62); "gratis demo" og "gratis Google-tjek" findes på `/hjemmeside/` og `/booking-google/` (forskellige fra "gratis hjemmeside").

## Testfejl (rettet i scripts, ikke produktfejl)

- AC-6, AC-9, AC-13: tekstudtræk uden mellemrum mellem elementer ("videoer.4.000 kr."); frikøbsforklaringen hedder "købe siden fri for 1.000 kr." Rettet.
- AC-37: problemsektionens id er `problemer-titel`. Rettet.
- AC-34: advarsel om "skjulte fokuserbare links" var forkert; erstattet af Tab-test fra den lukkede knap (bestået).
- AC-44 datofelt: Chromes indbyggede kalenderknap giver falsk "uden fokusring". Rettet.
- AC-57: kommentartegn i `_redirects` blev læst forkert (`/#om`). Rettet.
- AC-67: indgangsanimationer var ikke færdige ved måling med blokerede scripts. Rettet (venter 2,5 s); indholdet er synligt.
- AC-20/21/22/23: guidens resultat med "Tilpas"-valg blev regnet som spørgsmål 4; spørgsmål genkendes nu på "Spørgsmål n af m". Alle grene gennemgået (44 resultater): højst 3 spørgsmål, "Spring over" synlig, Google alene = 500 kr., Google + QR = 1.000 kr., ingen modulpris.
- `test-a11y-e2e.mjs`: ny købsmåde i trin 0 ("Køb hjemmesiden"); guidens nye spørgsmål 3 og drift Basis; rundvisningen tester nu, at ingen invitation dukker op af sig selv, at Vis mig rundt virker ved klik og ikke bruger browserlager; rettet gammel `/b99b/`-regex; stabiliseret klik, scroll og felttømning efter fejl.

## AC-resultater (seneste kørsel, uden de senere testrettelser)

PASS: AC-1, 2, 3, 4, 5, 7, 8, 10, 12, 13 (efter rettelse af testen for 9 og 13), 14, 15, 16, 17, 18, 19, 21 (efter rettelse), 25, 26, 27, 28, 29, 30, 32, 33, 34, 35, 36, 37, 39, 40, 41, 43, 45, 46, 47, 48, 51, 52, 53, 54, 55, 56, 57, 58, 59, 61, 63 (`npm test`), 65, 66, 67 (efter rettelse), 68, 69.
PASS med advarsel: AC-11, 20, 22, 24, 31, 38, 42, 49, 60, 62.
FAIL (reelt): AC-44 (F1), AC-50 (F2).
Ikke afgjort: AC-64 (build/lint kører hovedagenten), AC-60 og AC-62 kræver menneskelig ordlydsvurdering.

## Ikke kørt

- En samlet, afsluttende kørsel af `test-rebrand-e2e.mjs` efter de sidste testrettelser (AC-6, 24, 31, 44, 62 er rettet, men ikke bekræftet samlet). Kør: `SITE=http://localhost:4173 RUN_NPM_TEST=1 node scripts/test-rebrand-e2e.mjs`.
- Gruppen `tastatur` i `test-a11y-e2e.mjs` efter ændringerne (fejler forventeligt på F1).
- `npm run build` og `npm run lint` (hovedagenten).
- Manuel/visuel kontrol: design, kantkontrast, skærmlæser, rigtig mobil, Cloudflares 404/301 og headers efter udgivelse, moms/CVR.
