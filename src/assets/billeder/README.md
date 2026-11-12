# Billedpladser

Læg billedet her og giv det pladsens navn (`.webp`, `.avif`, `.jpg` eller `.png`). Så bruges det automatisk
(`src/components/ui/ImageSlot.jsx`), uden at koden ændres. Findes filen ikke, viser siden en tom plads med filnavnet.

| Filnavn (uden endelse) | Hvor | Format | Bemærkning |
| --- | --- | --- | --- |
| `portraet-ronny` | Forsiden, Om mig | 4 / 5 | Vises sort/hvid (`filter: grayscale(1)`). Midlertidigt det eksisterende portræt (`public/ronny.jpg`) |
| `hjemmeside-telefon` | /hjemmeside/ | 9 / 19,5 | Skærmoptagelse af en demo på telefon |
| `palmy-facade` | Palmy-casen (øverst) | 16 / 9 | Palmys eget foto (facaden), kopieret fra Palmy-repoet (AVIF + WebP) |
| `palmy-spisesal`, `palmy-karry`, `palmy-wok` | Palmy-casen | 4 / 5 | Palmys egne fotos (spisesal, karry, wok), 800 × 1000 fra Palmy-repoet |
| `palmy-case` | Forsiden og Palmy-casen | 16 / 10 | Skærmbillede af forsiden på palmyspisested.com (computer), 12. nov. 2026 |
| `palmy-mobil`, `palmy-menu` | Palmy-casen | 780 / 1688 og 16 / 10 | Skærmbilleder af det live site (telefon og menukort), 12. nov. 2026 |

Flere Palmy-billeder mangler: skærmbillede af Google Business-profilen og af Search Console. De vises som grå pladsholdere ("BILLEDE MANGLER: ...") i `src/pages/cases/PalmySpisested.jsx`.

Billederne er lazy-loadede og har faste billedformater, så siden ikke hopper, når de indlæses.
