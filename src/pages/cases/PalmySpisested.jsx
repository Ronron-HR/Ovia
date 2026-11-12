import Breadcrumb from '../../components/cases/Breadcrumb.jsx'
import CaseCta from '../../components/cases/CaseCta.jsx'
import Contact from '../../components/layout/Contact.jsx'
import { caseBySlug, cases } from '../../data/cases.js'
import { paths } from '../../data/site.js'

const c = caseBySlug('palmy-spisested')

const heading = 'font-[family-name:var(--font-display)] font-bold [font-stretch:125%]'
const body = 'm-0 max-w-[60ch] text-[17px] leading-[1.55] text-pretty'
const label = 'text-[15px] font-semibold'

/** Fakta i faktaboksen. */
const facts = [
  ['Branche', 'Restaurant, vietnamesisk mad'],
  ['By', c.city],
  ['Leveret', 'Hjemmeside og SEO'],
  ['Platform', 'Mobile-first'],
]

/** Hjemmesidens dele. */
const parts = [
  {
    title: 'Menu',
    text: 'Menukortet er delt op i kategorier med pris fra. Numrene følger menukortet, så man kan bestille efter nummer, når man ringer.',
  },
  {
    title: 'Åbningstider og kontakt',
    text: 'Åbningstider, adresse og telefonnummer står samlet. Nummeret er et link, så man kan ringe med ét tryk, og adressen åbner Google Maps.',
  },
  {
    title: 'Historien',
    text: 'Et kort afsnit om restauranten og stedet, så siden ikke kun er en menu og et telefonnummer.',
  },
]

/** SEO: hvad der er gjort, og hvad det betyder for restauranten. */
const seoItems = [
  {
    title: 'Lokal SEO',
    text: 'Siden siger tydeligt, hvad stedet er, og hvor det ligger: vietnamesisk restaurant i Hjortshøj. Det hjælper Google med at koble siden til dem, der søger efter mad i området.',
  },
  {
    title: 'Google Business-profil',
    text: 'Restaurantens profil på Google og Google Maps er sat op og kobles til hjemmesiden. Finder en gæst stedet dér, er der ét tryk til menu og telefon.',
  },
  {
    title: 'Search Console',
    text: 'Sitet er koblet til Googles eget værktøj, Search Console. Det viser, om Google kan læse siden, og om der er fejl, der skal rettes.',
  },
  {
    title: 'Structured data',
    text: 'Bag siden ligger data, som Google kan læse: at stedet er en restaurant, med adresse, åbningstider, telefon, køkken og menu. Så kan Google vise de rigtige oplysninger.',
  },
  {
    title: 'Teknisk SEO',
    text: 'Siden har sin egen titel og beskrivelse, rene adresser og et sitemap, så Google kan finde og forstå den.',
  },
  {
    title: 'Hastighed',
    text: 'Gæsten står ofte med telefonen i hånden og vil bare bestille. Derfor er siden bygget til at åbne hurtigt på mobil.',
  },
]

/** Det tekniske, der er set på det live site. */
const tech = [
  'Mobile-first: designet til telefonen først og skaleret op til computer.',
  'Telefonnummeret er et opkaldslink, og adressen åbner Google Maps.',
  'Google Maps indlæses først, når man trykker på kortet, så kortet ikke bremser siden.',
  'Skrifterne ligger på sitet selv og hentes ikke fra Google.',
  'Structured data af typen Restaurant med adresse, åbningstider, telefon, køkken og menu.',
]

/** Forrige/næste: vises først, når der er mere end én case. */
function CaseNav() {
  if (cases.length < 2) return null
  const i = cases.findIndex((x) => x.slug === c.slug)
  const prev = cases[(i - 1 + cases.length) % cases.length]
  const next = cases[(i + 1) % cases.length]
  return (
    <nav aria-label="Flere cases" className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-4 px-5 py-8 md:px-14">
      <a href={prev.path} className="flex min-h-12 items-center">
        ← {prev.name}
      </a>
      <a href={next.path} className="flex min-h-12 items-center">
        {next.name} →
      </a>
    </nav>
  )
}

/** /cases/palmy-spisested/: den lange case. Kun fakta; ingen tal, resultater, udtalelser eller anmeldelser. */
export default function PalmySpisested() {
  return (
    <>
      {/* a. Hero */}
      <section aria-labelledby="case-titel" className="mx-auto max-w-[1440px] px-5 pt-2 pb-12 md:px-14 md:pt-16 md:pb-24">
        <Breadcrumb
          items={[
            ['Forside', paths.home],
            ['Cases', paths.cases],
            [c.name, c.path],
          ]}
        />
        <h1 id="case-titel" className="display display-hero mt-5 text-[clamp(40px,12vw,56px)] md:mt-10 md:text-[clamp(64px,8vw,128px)]">
          {c.name}
        </h1>
        <div className="mt-5 flex flex-col gap-6 md:mt-14 md:ml-[33%] md:gap-8">
          <p className="m-0 max-w-[30ch] text-[19px] leading-[1.4] text-pretty md:text-[clamp(19px,1.8vw,26px)]">Vietnamesisk restaurant i {c.city}</p>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {c.tags.map((t) => (
              <li key={t} className="bg-surface px-3 py-2 text-[15px] leading-[1.2]">
                {t}
              </li>
            ))}
          </ul>
          <a href={c.siteUrl} target="_blank" rel="noopener" className="btn btn-ink hov-ink-soft w-full text-[17px] md:w-fit md:min-w-64">
            <span>Besøg sitet</span>
            <span aria-hidden="true">↗</span>
            <span className="sr-only">(åbner i ny fane)</span>
          </a>
        </div>
      </section>

      {/* b. Faktaboks */}
      <section aria-label="Fakta om casen" className="bg-surface">
        <dl className="m-0 mx-auto grid max-w-[1440px] gap-2 px-5 py-10 md:grid-cols-5 md:px-14 md:py-16">
          {facts.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 bg-paper p-5">
              <dt className={label}>{k}</dt>
              <dd className="m-0 text-[17px] leading-[1.35]">{v}</dd>
            </div>
          ))}
          <div className="flex flex-col gap-1 bg-paper p-5">
            <dt className={label}>Live-site</dt>
            <dd className="m-0 text-[17px] leading-[1.35]">
              <a href={c.siteUrl} target="_blank" rel="noopener" className="flex min-h-12 items-center">
                {c.siteLabel} ↗<span className="sr-only"> (åbner i ny fane)</span>
              </a>
            </dd>
          </div>
        </dl>
      </section>

      {/* c. Udgangspunktet */}
      <section aria-labelledby="udgangspunkt-titel" className="mx-auto grid max-w-[1440px] gap-7 section-pad px-5 md:grid-cols-[5fr_7fr] md:gap-14 md:px-14">
        <h2 id="udgangspunkt-titel" className="display t-h2s">
          Udgangspunktet
        </h2>
        <div className="flex flex-col gap-5">
          <p className={body}>Palmy Spisested sælger takeaway, og maden bestilles på telefon.</p>
          <p className={body}>Gæsterne finder restauranten på Google og på mobilen. De skal hurtigt kunne finde menu, åbningstider, telefonnummer og adresse.</p>
          <p className={body}>Så siden skulle være let at bruge med én hånd og føre direkte til opkaldet.</p>
        </div>
      </section>

      {/* d1. Hjemmesiden */}
      <section aria-labelledby="hjemmeside-titel" className="bg-surface">
        <div className="mx-auto max-w-[1440px] section-pad px-5 md:px-14">
          <h2 id="hjemmeside-titel" className="display t-h2">
            Hjemmesiden
          </h2>
          <p className={`${body} mt-4`}>Bygget til telefonen først. Her er delene.</p>
          <ul className="m-0 mt-8 grid list-none gap-2 p-0 md:mt-14 md:grid-cols-3">
            {parts.map((p) => (
              <li key={p.title} className="flex flex-col gap-3 bg-paper p-5 md:p-6">
                <h3 className={`${heading} text-[clamp(22px,6vw,28px)] leading-none tracking-[-0.03em]`}>{p.title}</h3>
                <p className="m-0 text-base leading-[1.5]">{p.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* d2. SEO */}
      <section aria-labelledby="seo-titel" className="mx-auto grid max-w-[1440px] gap-7 section-pad px-5 md:grid-cols-[5fr_7fr] md:gap-14 md:px-14">
        <div className="flex flex-col gap-4">
          <h2 id="seo-titel" className="display t-h2s">
            SEO
          </h2>
          <p className={body}>Det, der gør restauranten lettere at finde, når nogen søger. Kort og i almindeligt sprog.</p>
        </div>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {seoItems.map((s) => (
            <li key={s.title} className="flex flex-col gap-2 bg-surface px-5 py-5 md:p-6">
              <h3 className="text-xl tracking-[-0.02em]">{s.title}</h3>
              <p className="m-0 max-w-[60ch] text-base leading-[1.5]">{s.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* f. Teknisk */}
      <section aria-labelledby="teknisk-titel" className="bg-surface">
        <div className="mx-auto grid max-w-[1440px] gap-7 section-pad px-5 md:grid-cols-[5fr_7fr] md:gap-14 md:px-14">
          <h2 id="teknisk-titel" className="display t-h2s">
            Hurtig og bygget til mobil
          </h2>
          <div className="flex flex-col gap-6">
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {tech.map((t) => (
                <li key={t} className="bg-paper px-5 py-4 text-base leading-[1.4]">
                  {t}
                </li>
              ))}
            </ul>
            <div>
              <h3 className={label}>Lighthouse på det live site</h3>
              <ul className="m-0 mt-3 grid list-none grid-cols-2 gap-2 p-0 md:grid-cols-4">
                {c.lighthouse.scores.map(([name, score]) => (
                  <li key={name} className="flex flex-col gap-1 bg-paper p-4">
                    <span className="price text-[clamp(32px,9vw,44px)] leading-none">{score}</span>
                    <span className="text-[15px] leading-[1.3]">{name}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 mb-0 max-w-[60ch] text-[15px] leading-normal">
                Målt af os med Lighthouse på mobil, {c.lighthouse.dateLabel} (median af tre målinger). Tallene kan ændre sig, når sitet ændres.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* g. CTA */}
      <CaseCta />
      <CaseNav />
      <Contact />
    </>
  )
}
