import { demoById } from '../content.js'
import { CafeArt, CafeMark } from './art.jsx'
import DemoShell from './DemoShell.jsx'
import { DemoHero, errProps, Field, ItemList, Notice, Tabs, useDemoForm } from './kit.jsx'

/**
 * CAFÉDEMO — fiktiv. Smørgul, varm hvid og mørkeblå.
 * Eksempelmenu med kategorier, åbningstider og en kontaktsektion. Alt er
 * opdigtet; beskedformularen og "ring"-knappen sender og ringer ikke.
 */

const links = [
  { label: 'Menu', href: '#menu' },
  { label: 'Åbningstider', href: '#tider' },
  { label: 'Kontakt', href: '#kontakt' },
]

const menu = {
  kaffe: [
    { name: 'Filterkaffe', text: 'Mild og rund, bryggerens valg for ugen.', price: '32 kr.' },
    { name: 'Flat white', text: 'To shots og fløjlsblød mælk.', price: '42 kr.' },
    { name: 'Cappuccino', text: 'Klassikeren med fast skum.', price: '40 kr.' },
    { name: 'Chai latte', text: 'Krydret te med varm mælk.', price: '44 kr.' },
    { name: 'Varm chokolade', text: 'Mørk chokolade og en skefuld fløde.', price: '40 kr.' },
  ],
  morgen: [
    { name: 'Havregrød med bær', text: 'Langsomt kogt, med honning og friske bær.', price: '52 kr.' },
    { name: 'Rundstykke med ost', text: 'Nybagt, med smør og ost.', price: '38 kr.' },
    { name: 'Yoghurt med granola', text: 'Hjemmerørt granola og frugt.', price: '55 kr.' },
    { name: 'Æggemad', text: 'Blødt æg på ristet surdejsbrød.', price: '62 kr.' },
  ],
  frokost: [
    { name: 'Dagens suppe', text: 'Med brød. Skifter hver dag.', price: '68 kr.' },
    { name: 'Ristet sandwich', text: 'Ost, pesto og tomat.', price: '79 kr.' },
    { name: 'Salat med rødbeder', text: 'Bagte rødbeder, linser og urter.', price: '85 kr.' },
    { name: 'Toast med avocado', text: 'Surdej, citron og chili.', price: '79 kr.' },
  ],
  kager: [
    { name: 'Kanelsnegl', text: 'Bagt om morgenen.', price: '38 kr.' },
    { name: 'Citronkage', text: 'Med sukkerglasur.', price: '42 kr.' },
    { name: 'Brownie', text: 'Mørk og sej.', price: '40 kr.' },
    { name: 'Scone', text: 'Med smør og syltetøj.', price: '35 kr.' },
  ],
}

const tabs = [
  { id: 'kaffe', label: 'Kaffe og te' },
  { id: 'morgen', label: 'Morgenmad' },
  { id: 'frokost', label: 'Frokost' },
  { id: 'kager', label: 'Kager' },
]

const hours = [
  ['Mandag–fredag', '08.00–16.00'],
  ['Lørdag', '09.00–16.00'],
  ['Søndag', '09.00–14.00'],
]

function Contact() {
  const { form, errors, notice, submit, setNotice } = useDemoForm({
    required: { name: 'Skriv et navn.', message: 'Skriv en besked.' },
    summary: () => ({
      title: 'Demo: beskeden er ikke sendt.',
      text: 'Der er ingen café bag formularen. På en rigtig hjemmeside ville beskeden nu gå til caféen.',
    }),
  })

  return (
    <div className="dm-card" data-reveal>
      <form ref={form} onSubmit={submit} noValidate className="dm-form" aria-label="Skriv til caféen (demo)">
        <Field id="cafe-name" label="Dit navn" error={errors.name}>
          <input id="cafe-name" name="name" type="text" className="dm-input" autoComplete="off" {...errProps('cafe-name', errors.name)} />
        </Field>
        <Field id="cafe-message" label="Din besked" error={errors.message}>
          <textarea id="cafe-message" name="message" className="dm-input" {...errProps('cafe-message', errors.message)} />
        </Field>
        <div className="dm-actions" style={{ marginTop: 0 }}>
          <button type="submit" className="dm-btn">
            Send besked (demo)
          </button>
          <button
            type="button"
            className="dm-btn dm-btn-ghost"
            onClick={() =>
              setNotice({
                title: 'Demo: knappen ringer ikke.',
                text: 'Telefonnummeret er fiktivt, og der er ingen rigtig virksomhed bag.',
              })
            }
          >
            Ring til caféen (demo)
          </button>
        </div>
        <p className="dm-inline-note">Intet bliver sendt fra denne formular.</p>
        <Notice notice={notice} />
      </form>
    </div>
  )
}

export default function Cafe() {
  const project = demoById('cafe')
  return (
    <DemoShell project={project} links={links} logo={<CafeMark />} footer="Cafédemo · Demogade 12 · Fiktiv by">
      <main id="main">
        <DemoHero>
          <div className="dm-wrap dm-hero-grid">
            <div>
              <p className="dm-eyebrow">Fiktiv café · eksempelindhold</p>
              <h1 className="dm-h1 mt-4">Kaffe, brød og tid til en pause.</h1>
              <p className="dm-lead">
                Her kan en gæst se menuen, finde åbningstiderne og skrive til caféen. Alt på siden er opdigtet til demoen.
              </p>
              <div className="dm-actions">
                <a href="#menu" className="dm-btn">
                  Se menuen
                </a>
                <a href="#tider" className="dm-btn dm-btn-ghost">
                  Åbningstider
                </a>
              </div>
            </div>
            <div data-par="-34">
              <CafeArt />
            </div>
          </div>
        </DemoHero>

        <section id="menu" className="dm-section">
          <div className="dm-wrap">
            <div className="dm-section-head" data-reveal>
              <p className="dm-eyebrow">Menu</p>
              <h2 className="dm-h2">Noget at spise og drikke.</h2>
            </div>
            <Tabs tabs={tabs} label="Menuens kategorier">
              {(id) => <ItemList items={menu[id]} columns={2} />}
            </Tabs>
            <p className="dm-note">Eksempelpriser i kroner. Menuen er opdigtet.</p>
          </div>
        </section>

        <section id="tider" className="dm-section dm-band">
          <div className="dm-wrap">
            <div className="dm-section-head" data-reveal>
              <p className="dm-eyebrow">Åbningstider</p>
              <h2 className="dm-h2">Kom forbi, når det passer.</h2>
            </div>
            <table className="dm-hours">
              <caption className="sr-only">Åbningstider (eksempel)</caption>
              <tbody>
                {hours.map(([day, time]) => (
                  <tr key={day}>
                    <th scope="row">{day}</th>
                    <td>{time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="dm-note" style={{ color: 'inherit', opacity: 0.85 }}>
              Eksempeltider. Demoen er ikke en rigtig café.
            </p>
          </div>
        </section>

        <section id="kontakt" className="dm-section">
          <div className="dm-wrap dm-hero-grid" style={{ alignItems: 'start' }}>
            <div>
              <p className="dm-eyebrow">Kontakt</p>
              <h2 className="dm-h2 mt-3">Skriv til os.</h2>
              <p className="dm-lead">Demogade 12, 0000 Fiktiv by. Adressen og nummeret er opdigtet.</p>
            </div>
            <Contact />
          </div>
        </section>
      </main>
    </DemoShell>
  )
}
