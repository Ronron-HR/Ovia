import Breadcrumb from '../../components/cases/Breadcrumb.jsx'
import CaseCta from '../../components/cases/CaseCta.jsx'
import ImagePlaceholder from '../../components/cases/ImagePlaceholder.jsx'
import Contact from '../../components/layout/Contact.jsx'
import ImageSlot from '../../components/ui/ImageSlot.jsx'
import { caseBySlug, cases } from '../../data/cases.js'
import { paths } from '../../data/site.js'

const c = caseBySlug('palmy-spisested')

const heading = 'font-[family-name:var(--font-display)] font-bold [font-stretch:125%]'
const body = 'm-0 max-w-[60ch] text-[17px] leading-[1.55] text-pretty'
const label = 'text-[15px] font-semibold'

/** Dato for skærmbillederne af det live site (taget fra palmyspisested.com). */
const SHOT_DATE = '12. november 2026'

/** Fakta i faktaboksen. */
const facts = [
  ['Branche', 'Restaurant, vietnamesisk mad'],
  ['By', c.city],
  ['Leveret', 'Hjemmeside og lokal SEO'],
  ['Platform', 'Mobile-first'],
]

/** Hjemmesidens sider. Kun det, der faktisk findes på palmyspisested.com. */
const parts = [
  {
    title: 'Menu',
    text: 'Menukortet er delt i forretter, hovedretter, ekstra retter, børnemenu, drikkevarer og ekstra tilbehør. Numrene følger det trykte menukort, så man kan ringe og bestille efter nummer. Der er også en udgave til udskrift.',
  },
  {
    title: 'Find os',
    text: 'Adresse, åbningstider og telefonnummer samlet ét sted. Nummeret er et link, så man kan ringe med ét tryk, og adressen åbner Google Maps. Her står også to spørgsmål og svar som almindelig tekst.',
  },
  {
    title: 'Historien',
    text: 'En side om restauranten og stedet, så siden ikke kun er en menu og et telefonnummer.',
  },
  {
    title: 'Billeder',
    text: 'Et galleri med Palmys egne billeder og korte, lydløse loops fra køkkenet.',
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
    text: 'Bag siden ligger data, som Google kan læse: at stedet er en restaurant, med adresse, åbningstider, telefon, køkken, prisinterval og menu. Find os har også sine spørgsmål og svar som data.',
  },
  {
    title: 'Teknisk SEO',
    text: 'Hver side har sin egen titel og beskrivelse, rene adresser, en canonical-adresse og et sitemap. www er den ene adresse; uden www sendes videre.',
  },
  {
    title: 'Hastighed',
    text: 'Gæsten står ofte med telefonen i hånden og vil bare bestille. Derfor er siden bygget til at åbne hurtigt på mobil.',
  },
]

/** Det tekniske, der er set på det live site og i Palmys kode. */
const tech = [
  'Mobile-first: designet til telefonen først og skaleret op til computer.',
  'Telefonnummeret er et opkaldslink, og adressen er et link til Google Maps. Der er intet indlejret kort, der skal hentes.',
  'Skrifterne (Libre Caslon Text og Source Sans 3) ligger på sitet selv og hentes ikke fra Google.',
  'Alle sider bygges som færdig HTML på forhånd, så de kan åbne hurtigt.',
  'Structured data af typen Restaurant med adresse, åbningstider, telefon, køkken, prisinterval og menu.',
]

/** Palmys egne billeder (fra Palmys eget materiale). Billedteksterne er Palmys egne. */
const photos = [
  { name: 'palmy-spisesal', alt: 'Spisesalen hos Palmy Spisested med borde og stole' },
  { name: 'palmy-karry', alt: 'Karry med forårsløg, der simrer i gryden i Palmys køkken' },
  { name: 'palmy-wok', alt: 'Rejer og grøntsager i wokken over blå gasflamme' },
]

/** Billede med billedtekst. */
function Figure({ caption, className = '', children }) {
  return (
    <figure className={`m-0 flex flex-col gap-2 ${className}`}>
      {children}
      <figcaption className="text-[15px] leading-[1.4] text-muted-2">{caption}</figcaption>
    </figure>
  )
}

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

/**
 * /cases/palmy-spisested/: den ene case. Kun fakta fra palmyspisested.com og Palmys egen kode; ingen tal, resultater, udtalelser eller
 * anmeldelser. Billeder: Palmys egne (src/assets/billeder/palmy-*) og skærmbilleder af det live site. Mangler vi et billede, står
 * der en grå pladsholder med teksten "BILLEDE MANGLER: ...".
 */
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
        <div className="mt-10 md:mt-16">
          <ImageSlot name="palmy-facade" ratio="16 / 9" width={1280} height={720} eager alt="Facaden på Palmy Spisested med skiltet over vinduerne" fill="bg-surface" />
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

      {/* d0. Sådan ser det ud */}
      <section aria-labelledby="udseende-titel" className="mx-auto max-w-[1440px] px-5 pb-12 md:px-14 md:pb-24">
        <h2 id="udseende-titel" className="display t-h2s">
          Sådan ser det ud
        </h2>
        <div className="mt-7 grid gap-6 md:mt-12 md:grid-cols-3 md:gap-8">
          <Figure className="md:col-span-2" caption={`Forsiden på computer. Skærmbillede af palmyspisested.com, ${SHOT_DATE}.`}>
            <ImageSlot name="palmy-case" ratio="16 / 10" width={2240} height={1400} alt="Forsiden på palmyspisested.com på computer: logo, telefonnummer til forudbestilling og menu" className="border border-hairline" />
          </Figure>
          <Figure caption={`Forsiden på telefon. Skærmbillede, ${SHOT_DATE}.`}>
            <ImageSlot name="palmy-mobil" ratio="780 / 1688" width={780} height={1688} alt="Forsiden på palmyspisested.com på telefon: telefonnummer til forudbestilling og begyndelsen af menuen" className="mx-auto w-full max-w-[300px] border border-hairline md:max-w-none" />
          </Figure>
          <Figure className="md:col-span-3" caption={`Menukortet på computer. Skærmbillede af palmyspisested.com/menu, ${SHOT_DATE}.`}>
            <ImageSlot name="palmy-menu" ratio="16 / 10" width={2240} height={1400} alt="Menukortet på palmyspisested.com med forretter og hovedretter, nummereret efter det trykte menukort" className="border border-hairline md:max-w-[66%]" />
          </Figure>
        </div>
      </section>

      {/* d1. Hjemmesiden */}
      <section aria-labelledby="hjemmeside-titel" className="bg-surface">
        <div className="mx-auto max-w-[1440px] section-pad px-5 md:px-14">
          <h2 id="hjemmeside-titel" className="display t-h2">
            Hjemmesiden
          </h2>
          <p className={`${body} mt-4`}>Bygget til telefonen først og tegnet som restaurantens trykte menukort og skilt. Her er siderne.</p>
          <ul className="m-0 mt-8 grid list-none gap-2 p-0 md:mt-14 md:grid-cols-2 lg:grid-cols-4">
            {parts.map((p) => (
              <li key={p.title} className="flex flex-col gap-3 bg-paper p-5 md:p-6">
                <h3 className={`${heading} text-[clamp(22px,6vw,28px)] leading-none tracking-[-0.03em]`}>{p.title}</h3>
                <p className="m-0 text-base leading-[1.5]">{p.text}</p>
              </li>
            ))}
          </ul>
          <ul className="m-0 mt-2 grid list-none gap-2 p-0 md:grid-cols-3">
            {photos.map((p) => (
              <li key={p.name}>
                <ImageSlot name={p.name} ratio="4 / 5" width={800} height={1000} alt={p.alt} fill="bg-paper" />
              </li>
            ))}
          </ul>
          <p className="mt-3 mb-0 max-w-[60ch] text-[15px] leading-normal">Billederne er Palmys egne og ligger på sitet.</p>
        </div>
      </section>

      {/* d2. SEO */}
      <section aria-labelledby="seo-titel" className="mx-auto grid max-w-[1440px] gap-7 section-pad px-5 md:grid-cols-[5fr_7fr] md:gap-14 md:px-14">
        <div className="flex flex-col gap-4">
          <h2 id="seo-titel" className="display t-h2s">
            Lokal SEO
          </h2>
          <p className={body}>Det, der gør restauranten lettere at finde, når nogen søger. Kort og i almindeligt sprog.</p>
        </div>
        <div className="flex flex-col gap-2">
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {seoItems.map((s) => (
              <li key={s.title} className="flex flex-col gap-2 bg-surface px-5 py-5 md:p-6">
                <h3 className="text-xl tracking-[-0.02em]">{s.title}</h3>
                <p className="m-0 max-w-[60ch] text-base leading-[1.5]">{s.text}</p>
              </li>
            ))}
          </ul>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            <ImagePlaceholder what="skærmbillede af Palmys Google Business-profil" />
            <ImagePlaceholder what="skærmbillede fra Search Console" />
          </div>
        </div>
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
