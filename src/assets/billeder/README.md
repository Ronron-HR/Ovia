# Billedpladser

Læg billedet her og giv det pladsens navn (`.webp`, `.avif`, `.jpg` eller `.png`). Så bruges det automatisk
(`src/components/ui/ImageSlot.jsx`), uden at koden ændres. Findes filen ikke, viser siden en tom plads med filnavnet.

| Filnavn (uden endelse) | Hvor | Format | Bemærkning |
| --- | --- | --- | --- |
| `palmy-desktop` | Forsiden, Eksempler (desktop) | 16 / 10 | Palmy-casen er skjult (`flags.showPalmy`) |
| `palmy-mobil` | Forsiden, Eksempler (desktop) | 9 / 19,5 | Skjult |
| `palmy-mobil-karrusel` | Forsiden, Eksempler (telefon) | 9 / 19,5 | Skjult |
| `koncept-restaurant-desktop` | Forsiden, Eksempler (desktop) | 16 / 10 | |
| `koncept-restaurant-mobil` | Forsiden, Eksempler (desktop) | 9 / 19,5 | |
| `koncept-restaurant-telefon` | Forsiden, Eksempler (telefon) | 9 / 19,5 | |
| `koncept-salon-desktop` | Forsiden, Eksempler (desktop) | 16 / 10 | |
| `koncept-salon-mobil` | Forsiden, Eksempler (desktop) | 9 / 19,5 | |
| `koncept-salon-telefon` | Forsiden, Eksempler (telefon) | 9 / 19,5 | |
| `portraet-ronny` | Forsiden, Om mig | 4 / 5 | Vises sort/hvid (`filter: grayscale(1)`). Midlertidigt det eksisterende portræt (`public/ronny.jpg`) |
| `hjemmeside-telefon` | /hjemmeside/ | 9 / 19,5 | Skærmoptagelse af en demo på telefon |

Billederne er lazy-loadede og har faste billedformater, så siden ikke hopper, når de indlæses.
