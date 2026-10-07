/* =========================================================================
   RUNDVISNINGEN "Vis mig rundt" — tekster, trin og husk-valg.

   Sprog: jeg-form, ingen nye løfter. Priser står ikke her; teksterne
   beskriver kun, hvad kunden ser, og hvad der allerede står på siden.
   Målene findes med [data-tour="<id>"] (docs/ovia-kontrakt.md). Et mål, der
   ikke findes eller ikke er synligt, springes over.
   ========================================================================= */

export const tour = {
  /** Mest nyttige først: ved start vælges de første `maxSteps`, der findes. */
  maxSteps: 4,
  steps: [
    {
      id: 'calc',
      title: 'Her regner du prisen ud',
      body: 'Vælg, hvad du har brug for, og svar på et par korte spørgsmål. Så ser du prisen med det samme.',
    },
    {
      id: 'guide',
      title: 'Er du i tvivl, så få hjælp',
      body: 'Ved du ikke, hvad du skal vælge, så tryk på "Hjælp mig med at vælge". Der er få korte spørgsmål, og bagefter får du et forslag. Du bestemmer selv, om du følger det.',
    },
    {
      id: 'drift',
      title: 'Drift er et valg for sig',
      body: 'Når du har valgt hjemmesidepakken, vælger du, hvordan siden skal køre: Basis, Plus eller Ekstra hos mig, eller din egen konto.',
    },
    {
      id: 'price',
      title: 'Her står din pris',
      body: 'Du ser engangsprisen og den månedlige pris hver for sig. Alle priser er ekskl. moms, og der sendes ikke noget, før du selv trykker på send.',
    },
    {
      id: 'contact',
      title: 'Vil du hellere tale med mig?',
      body: 'Ring, skriv eller send en SMS. Jeg svarer inden for 24 timer.',
    },
    {
      id: 'examples',
      title: 'Se, hvordan det kan se ud',
      body: 'Her kan du åbne eksempler på hjemmesider. De er fiktive, så du kan se stilen uden at forpligte dig til noget.',
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
    inviteTitle: 'Vil du have en kort rundvisning?',
    inviteBody: 'Jeg viser dig de vigtigste steder på siden. Du kan stoppe, når du vil.',
    inviteYes: 'Ja, vis mig rundt',
    inviteNo: 'Nej tak',
    inviteLabel: 'Invitation til rundvisning',
    nothing: 'Jeg har ikke noget at vise dig på denne side lige nu.',
    failed: 'Rundvisningen kunne ikke åbnes lige nu. Resten af siden virker som normalt.',
  },

  /** Kort ventetid før invitationen ved første besøg (ms). */
  inviteDelay: 4500,
  /** Hvor længe en kort besked ("Jeg har ikke noget at vise") står (ms). */
  noteTime: 6000,
}

/** Mål-elementet for et trin (kontrakten: data-tour). */
export const targetSelector = (id) => `[data-tour="${id}"]`

/* ---- Husk valget i denne browser ------------------------------------------
   Kun et lille mærke i localStorage: 'done' (afsluttet), 'skipped' (sprang over
   eller lukkede) eller 'declined' (sagde nej tak til invitationen). Intet sendes.
   Alt er i try/catch: uden lagring (privat vindue, blokeret) virker siden som
   normalt, og invitationen vises så slet ikke (den kunne ikke huskes). */

const KEY = 'oviaspecs-tour'

/** Det gemte valg eller null. */
export function readChoice() {
  try {
    return window.localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function writeChoice(value) {
  try {
    window.localStorage.setItem(KEY, value)
  } catch {
    /* uden lagring huskes valget bare ikke */
  }
}

/** Kan vi både skrive og læse? Ellers nøjes vi med knappen og viser ingen invitation. */
export function canRemember() {
  try {
    const probe = `${KEY}-probe`
    window.localStorage.setItem(probe, '1')
    const ok = window.localStorage.getItem(probe) === '1'
    window.localStorage.removeItem(probe)
    return ok
  } catch {
    return false
  }
}
