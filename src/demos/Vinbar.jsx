import { demoById } from '../content.demos.js'
import { VinbarArt, VinbarMark } from './art.jsx'
import DemoShell from './DemoShell.jsx'
import { DemoHero, errProps, Field, ItemList, Notice, Tabs, useDemoForm } from './kit.jsx'

/**
 * VINBARDEMO — fiktiv. Blommefarvet, elfenben og kobber, elegant serifskrift.
 * Fiktivt vinkort med kategorier og et eksempel på en gruppehenvendelse.
 * Henvendelsen sendes ikke.
 */

const links = [
  { label: 'Vinkortet', href: '#kortet' },
  { label: 'Grupper', href: '#grupper' },
  { label: 'Åbningstider', href: '#tider' },
]

const tabs = [
  { id: 'bobler', label: 'Bobler' },
  { id: 'hvid', label: 'Hvid' },
  { id: 'roed', label: 'Rød' },
  { id: 'cocktails', label: 'Cocktails' },
  { id: 'alkoholfrit', label: 'Alkoholfrit' },
]

const wines = {
  bobler: [
    { name: 'Blomme Brut', text: 'Tør og frisk med små, fine bobler.', price: '75 / 390 kr.' },
    { name: 'Elfenben Rosé', text: 'Bær, blomster og en lang afslutning.', price: '85 / 440 kr.' },
    { name: 'Kobberperle', text: 'Rund og cremet, med brioche.', price: '95 / 520 kr.' },
  ],
  hvid: [
    { name: 'Mosevang Hvid', text: 'Citrus, grønt æble og mineral.', price: '68 / 340 kr.' },
    { name: 'Lysning Blanc', text: 'Blød, med hvide blomster.', price: '74 / 380 kr.' },
    { name: 'Stenbrud', text: 'Fyldig og krydret, med lang eftersmag.', price: '88 / 450 kr.' },
  ],
  roed: [
    { name: 'Aftenrød', text: 'Bløde tanniner og mørke bær.', price: '72 / 360 kr.' },
    { name: 'Skovbund', text: 'Jordnær, med kirsebær og krydderurter.', price: '84 / 430 kr.' },
    { name: 'Kobbermark', text: 'Fyldig og varm, til den lange aften.', price: '98 / 540 kr.' },
  ],
  cocktails: [
    { name: 'Blommesour', text: 'Blomme, citron og skum.', price: '105 kr.' },
    { name: 'Kobberkop', text: 'Ingefær, lime og en krydret bund.', price: '110 kr.' },
    { name: 'Elfenbensfizz', text: 'Hyldeblomst, gin og brus.', price: '105 kr.' },
  ],
  alkoholfrit: [
    { name: 'Blommespritz', text: 'Alkoholfri, bittersød og frisk.', price: '65 kr.' },
    { name: 'Kobbertonic', text: 'Tonic, rosmarin og citrus.', price: '55 kr.' },
  ],
}

function Group() {
  const { form, errors, notice, submit } = useDemoForm({
    required: { name: 'Skriv et navn.', email: 'Skriv en e-mailadresse.' },
    summary: (v) => ({
      title: 'Demo: henvendelsen er ikke sendt.',
      text: `Eksemplet viser, hvordan det kunne se ud: en gruppe på ${v.guests || '?'} til ${v.occasion.toLowerCase()} i navnet ${v.name}. Der er ingen vinbar bag formularen, og der er sendt ingenting.`,
    }),
  })

  return (
    <div className="dm-card" data-reveal>
      <form ref={form} onSubmit={submit} noValidate className="dm-form" aria-label="Gruppehenvendelse (demo)">
        <div className="dm-row dm-row-2">
          <Field id="vin-guests" label="Antal gæster">
            <input id="vin-guests" name="guests" type="number" min="6" max="40" defaultValue="10" className="dm-input" />
          </Field>
          <Field id="vin-occasion" label="Anledning">
            <select id="vin-occasion" name="occasion" className="dm-input" defaultValue="Fødselsdag">
              {['Fødselsdag', 'Firmaarrangement', 'Venner og veninder', 'Andet'].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="dm-row dm-row-2">
          <Field id="vin-name" label="Navn" error={errors.name}>
            <input id="vin-name" name="name" type="text" autoComplete="off" className="dm-input" {...errProps('vin-name', errors.name)} />
          </Field>
          <Field id="vin-email" label="E-mail" error={errors.email}>
            <input id="vin-email" name="email" type="email" autoComplete="off" className="dm-input" {...errProps('vin-email', errors.email)} />
          </Field>
        </div>
        <Field id="vin-note" label="Ønsker (valgfrit)">
          <textarea id="vin-note" name="note" className="dm-input" />
        </Field>
        <button type="submit" className="dm-btn">
          Send gruppehenvendelse (demo)
        </button>
        <p className="dm-inline-note">Eksempel: der sendes ingenting, og ingen modtager henvendelsen.</p>
        <Notice notice={notice} />
      </form>
    </div>
  )
}

export default function Vinbar() {
  const project = demoById('vinbar')
  return (
    <DemoShell project={project} links={links} logo={<VinbarMark />} footer="Vinbardemo · Demogade 12 · Fiktiv by">
      <main id="main">
        <DemoHero>
          <div className="dm-wrap dm-hero-grid">
            <div>
              <p className="dm-eyebrow">Fiktiv vinbar · eksempelindhold</p>
              <h1 className="dm-h1 mt-4">Et glas og tid til en lang samtale.</h1>
              <p className="dm-lead">
                En stille vinbar med et kort, der er let at læse. Her kan gæsten bladre i vinene og se, hvordan en gruppehenvendelse kan tage form.
              </p>
              <div className="dm-actions">
                <a href="#kortet" className="dm-btn">
                  Se vinkortet
                </a>
                <a href="#grupper" className="dm-btn dm-btn-ghost">
                  Book til en gruppe
                </a>
              </div>
            </div>
            <div data-par="-34">
              <VinbarArt />
            </div>
          </div>
        </DemoHero>

        <section id="kortet" className="dm-section">
          <div className="dm-wrap">
            <div className="dm-section-head" data-reveal>
              <p className="dm-eyebrow">Vinkortet</p>
              <h2 className="dm-h2">Et udvalg til aftenen.</h2>
            </div>
            <Tabs tabs={tabs} label="Vinkortets kategorier">
              {(id) => <ItemList items={wines[id]} />}
            </Tabs>
            <p className="dm-note">Pris pr. glas / pr. flaske. Vinene og priserne er opdigtet.</p>
          </div>
        </section>

        <section id="grupper" className="dm-section dm-band">
          <div className="dm-wrap dm-hero-grid" style={{ alignItems: 'start' }}>
            <div>
              <p className="dm-eyebrow">Grupper</p>
              <h2 className="dm-h2 mt-3">Kommer I mange?</h2>
              <p className="dm-lead">
                Fortæl, hvor mange I er, og hvad I fejrer, og se beskeden til gæsten. Det er kun et eksempel: intet bliver sendt.
              </p>
            </div>
            <Group />
          </div>
        </section>

        <section id="tider" className="dm-section">
          <div className="dm-wrap">
            <div className="dm-section-head" data-reveal>
              <p className="dm-eyebrow">Åbningstider</p>
              <h2 className="dm-h2">Kom, når aftenen begynder.</h2>
            </div>
            <table className="dm-hours">
              <caption className="sr-only">Åbningstider (eksempel)</caption>
              <tbody>
                <tr>
                  <th scope="row">Onsdag–torsdag</th>
                  <td>16.00–23.00</td>
                </tr>
                <tr>
                  <th scope="row">Fredag–lørdag</th>
                  <td>15.00–01.00</td>
                </tr>
                <tr>
                  <th scope="row">Søndag–tirsdag</th>
                  <td>Lukket</td>
                </tr>
              </tbody>
            </table>
            <p className="dm-note">Eksempeltider. Demoen er ikke en rigtig vinbar.</p>
          </div>
        </section>
      </main>
    </DemoShell>
  )
}
