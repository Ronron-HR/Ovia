# Billedpladser

Læg billedet her og giv det pladsens navn (`.webp`, `.avif`, `.jpg` eller `.png`). Så bruges det automatisk
(`src/components/ui/ImageSlot.jsx`), uden at koden ændres. Findes filen ikke, viser siden en tom plads med filnavnet.

| Filnavn (uden endelse) | Hvor | Format | Bemærkning |
| --- | --- | --- | --- |
| `portraet-ronny` | Forsiden, Om mig | 4 / 5 | Vises sort/hvid (`filter: grayscale(1)`). Midlertidigt det eksisterende portræt (`public/ronny.jpg`) |
| `hjemmeside-telefon` | /hjemmeside/ | 9 / 19,5 | Skærmoptagelse af en demo på telefon |

Billederne er lazy-loadede og har faste billedformater, så siden ikke hopper, når de indlæses.
