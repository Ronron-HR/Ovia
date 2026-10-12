/* =========================================================================
   RUNDVISNINGEN "Vis mig rundt" — tekster og trin.

   Hjælp kun på brugerens eget initiativ: knappen "Vis mig rundt" starter den.
   Der er ingen automatisk invitation og ingen lagring i browseren.

   Sprog: jeg-form, ingen nye løfter. Priser står ikke her; teksterne
   beskriver kun, hvad kunden ser, og hvad der allerede står på siden.
   Målene findes med [data-tour="<id>"]. Et mål, der ikke findes eller ikke er
   synligt, springes over (fx "drift", som kun vises ved "Køb hjemmesiden").
   ========================================================================= */

export const tour = {
  /** Mest nyttige først: ved start vælges de første `maxSteps`, der findes. */
  maxSteps: 4,
  steps: [
    {
      id: 'calc',
      title: 'Her regner du prisen ud',
      body: 'Vælg først, om du vil have et løbende samarbejde eller købe hjemmesiden, og tilføj evt. Lokal synlighed eller Marketing. Så ser du prisen med det samme.',
    },
    {
      id: 'guide',
      title: 'Er du i tvivl, så få hjælp',
      body: 'Ved du ikke, hvad du skal vælge, så tryk på "Hjælp mig med at vælge". Der er højst tre korte spørgsmål, og bagefter får du et forslag. Du kan springe over, når du vil, og du bestemmer selv, om du følger forslaget.',
    },
    {
      id: 'drift',
      title: 'Drift er et valg for sig',
      body: 'Når du køber hjemmesiden, vælger du, hvordan siden skal køre: Basis, Plus eller Ekstra hos mig, eller din egen konto.',
    },
    {
      id: 'price',
      title: 'Her står din pris',
      body: 'Du ser, hvad der betales nu, og hvad der betales hver måned, hver for sig. Ved et løbende samarbejde står også minimumsperioden og den mindste betaling. Alle priser er ekskl. moms, og der sendes ikke noget, før du selv trykker på send.',
    },
    {
      id: 'contact',
      title: 'Vil du hellere tale med mig?',
      body: 'Ring, skriv eller send en SMS. Jeg svarer inden for 24 timer.',
    },
    {
      id: 'examples',
      title: 'Se, hvordan det kan se ud',
      body: 'Her kan du åbne eksempler. De er fiktive og mærket som demoer, så du kan se stilen uden at forpligte dig til noget.',
    },
  ],

  text: {
    launcher: 'Vis mig rundt',
    dialog: 'Rundvisning',
    back: 'Tilbage',
    next: 'Næste',
    skip: 'Spring over',
    done: 'Færdig',
    progress: (n, total) => `${n} af ${total}`,
    announce: (n, total, title, body) => `Trin ${n} af ${total}: ${title}. ${body}`,
    nothing: 'Jeg har ikke noget at vise dig på denne side lige nu.',
    failed: 'Rundvisningen kunne ikke åbnes lige nu. Resten af siden virker som normalt.',
  },

  /** Hvor længe en kort besked ("Jeg har ikke noget at vise") står (ms). */
  noteTime: 6000,
}

/** Mål-elementet for et trin (kontrakten: data-tour). */
export const targetSelector = (id) => `[data-tour="${id}"]`
