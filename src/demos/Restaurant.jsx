import { useState } from 'react'
import { demoById } from '../content.demos.js'
import { RestaurantArt, RestaurantMark } from './art.jsx'
import DemoShell from './DemoShell.jsx'
import { DemoHero, errProps, Field, ItemList, Notice, Tabs, useDemoForm } from './kit.jsx'

/**
 * RESTAURANTDEMO — fiktiv. Terracotta, creme og mørk brun.
 * Menukort med fungerende faner og et tydeligt eksempel på bordbestilling.
 * Bordbestillingen reserverer intet og sender intet.
 */

const links = [
  { label: 'Menukort', href: '#menukort' },
  { label: 'Bestil bord', href: '#bord' },
  { label: 'Om huset', href: '#huset' },
  { label: 'Åbningstider', href: '#tider' },
]

const tabs = [
  { id: 'frokost', label: 'Frokost' },
  { id: 'aften', label: 'Aften' },
  { id: 'drikke', label: 'Drikke' },
]

const menu = {
  frokost: [
    { name: 'Dagens fisk', text: 'Citronsmør, kartofler og friske urter.', price: '145 kr.' },
    { name: 'Grøntsagstærte', text: 'Grillede grøntsager, ost og bladsalat.', price: '119 kr.' },
    { name: 'Tyndskåret oksekød', text: 'Pickles og sennep på surdejsbrød.', price: '129 kr.' },
    { name: 'Sæsonsalat', text: 'Det bedste fra markedet, med nødder.', price: '99 kr.' },
  ],
  aften: [
    { name: 'Bagt rødbede', text: 'Gedeost, honning og valnødder. Forret.', price: '89 kr.' },
    { name: 'Langtidsstegt lammeskank', text: 'Rodfrugter og rødvinssauce. Hovedret.', price: '265 kr.' },
    { name: 'Gnocchi', text: 'Brunet smør, salvie og parmesan. Hovedret.', price: '195 kr.' },
    { name: 'Mørk chokoladecreme', text: 'Med havsalt og bær. Dessert.', price: '95 kr.' },
  ],
  drikke: [
    { name: 'Hvidvin, glas', text: 'Frisk og tør. Husets valg.', price: '65 kr.' },
    { name: 'Rødvin, glas', text: 'Rund og blød. Husets valg.', price: '65 kr.' },
    { name: 'Øl fra fad', text: 'Et lokalt bryg på fad.', price: '58 kr.' },
    { name: 'Hyldeblomst og lime', text: 'Alkoholfri, med brus.', price: '45 kr.' },
  ],
}

const times = ['17.00', '17.30', '18.00', '18.30', '19.00', '19.30', '20.00', '20.30']

function Booking() {
  const [guests, setGuests] = useState('2')
  const { form, errors, notice, submit } = useDemoForm({
    required: { date: 'Vælg en dato.', name: 'Skriv et navn.' },
    summary: (v) => ({
      title: 'Demo: der er ikke reserveret noget bord.',
      text: `Eksemplet viser, hvordan det kunne se ud: bord til ${v.guests} kl. ${v.time} den ${v.date} i navnet ${v.name}. Der er ingen restaurant bag formularen, og der er sendt ingenting.`,
    }),
  })

  return (
    <div className="dm-card">
      <form ref={form} onSubmit={submit} noValidate className="dm-form" aria-label="Bestil bord (demo)">
        <div className="dm-row dm-row-2">
          <Field id="bord-date" label="Dato" error={errors.date}>
            <input id="bord-date" name="date" type="date" className="dm-input" {...errProps('bord-date', errors.date)} />
          </Field>
          <Field id="bord-time" label="Tidspunkt">
            <select id="bord-time" name="time" className="dm-input" defaultValue="18.30">
              {times.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="dm-row dm-row-2">
          <Field id="bord-guests" label="Antal gæster">
            <select
              id="bord-guests"
              name="guests"
              className="dm-input"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'gæst' : 'gæster'}
                </option>
              ))}
            </select>
          </Field>
          <Field id="bord-name" label="Navn" error={errors.name}>
            <input id="bord-name" name="name" type="text" className="dm-input" autoComplete="off" {...errProps('bord-name', errors.name)} />
          </Field>
        </div>
        <button type="submit" className="dm-btn">
          Bestil bord (demo)
        </button>
        <p className="dm-inline-note">Eksempel: der bestilles og sendes ingenting.</p>
        <Notice notice={notice} />
      </form>
    </div>
  )
}

export default function Restaurant() {
  const project = demoById('restaurant')
  return (
    <DemoShell project={project} links={links} logo={<RestaurantMark />} footer="Restaurantdemo · Demogade 12 · Fiktiv by">
      <main id="main">
        <DemoHero>
          <div className="dm-wrap dm-hero-grid">
            <div>
              <p className="dm-eyebrow">Fiktiv restaurant · eksempelindhold</p>
              <h1 className="dm-h1 mt-4">Mad med tid til samtalen.</h1>
              <p className="dm-lead">
                En rolig restaurant med sæsonens råvarer. Her kan gæsten bladre i menukortet og se, hvordan en bordbestilling kan se ud.
              </p>
              <div className="dm-actions">
                <a href="#bord" className="dm-btn">
                  Bestil bord
                </a>
                <a href="#menukort" className="dm-btn dm-btn-ghost">
                  Se menukortet
                </a>
              </div>
            </div>
            <div data-par="-34">
              <RestaurantArt />
            </div>
          </div>
        </DemoHero>

        <section id="menukort" className="dm-section">
          <div className="dm-wrap">
            <div className="dm-section-head">
              <p className="dm-eyebrow">Menukort</p>
              <h2 className="dm-h2">Vælg et kort.</h2>
            </div>
            <Tabs tabs={tabs} label="Menukortets faner">
              {(id) => <ItemList items={menu[id]} columns={2} />}
            </Tabs>
            <p className="dm-note">Eksempelretter og -priser. Menukortet er opdigtet.</p>
          </div>
        </section>

        <section id="bord" className="dm-section dm-band">
          <div className="dm-wrap dm-hero-grid" style={{ alignItems: 'start' }}>
            <div>
              <p className="dm-eyebrow">Bestil bord</p>
              <h2 className="dm-h2 mt-3">Sådan kan en bordbestilling se ud.</h2>
              <p className="dm-lead">
                Vælg dag, tid og antal, og se beskeden til gæsten. Det er kun et eksempel: intet bliver reserveret, og der sendes ingenting.
              </p>
            </div>
            <Booking />
          </div>
        </section>

        <section id="huset" className="dm-section">
          <div className="dm-wrap dm-hero-grid">
            <div>
              <p className="dm-eyebrow">Om huset</p>
              <h2 className="dm-h2 mt-3">Et hus med ro i kroen.</h2>
            </div>
            <p className="dm-lead" style={{ marginTop: 0 }}>
              Restaurantdemoen er et fiktivt sted med varme farver, store flader og rolig typografi. Teksten er skrevet til demoen og handler ikke om en rigtig virksomhed.
            </p>
          </div>
        </section>

        <section id="tider" className="dm-section dm-band">
          <div className="dm-wrap">
            <div className="dm-section-head">
              <p className="dm-eyebrow">Åbningstider</p>
              <h2 className="dm-h2">Vi har åbent.</h2>
            </div>
            <table className="dm-hours">
              <caption className="sr-only">Åbningstider (eksempel)</caption>
              <tbody>
                <tr>
                  <th scope="row">Tirsdag–fredag</th>
                  <td>11.30–21.30</td>
                </tr>
                <tr>
                  <th scope="row">Lørdag</th>
                  <td>17.00–22.00</td>
                </tr>
                <tr>
                  <th scope="row">Søndag–mandag</th>
                  <td>Lukket</td>
                </tr>
              </tbody>
            </table>
            <p className="dm-note" style={{ color: 'inherit', opacity: 0.85 }}>
              Eksempeltider. Demoen er ikke en rigtig restaurant.
            </p>
          </div>
        </section>
      </main>
    </DemoShell>
  )
}
