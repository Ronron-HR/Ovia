import Calculator from './components/Calculator.jsx'
import DemoTeasers from './components/DemoTeasers.jsx'
import Faq from './components/Faq.jsx'
import Hero from './components/Hero.jsx'
import Kontakt, { ContactCta } from './components/Kontakt.jsx'
import Om, { Principles } from './components/Om.jsx'
import Overview from './components/Overview.jsx'
import PageHead from './components/PageHead.jsx'
import Review from './components/Review.jsx'
import Samarbejde from './components/Samarbejde.jsx'
import ServicePage from './components/ServicePage.jsx'
import Work from './components/Work.jsx'
import { calc, demos, faq, kontakt } from './content.js'

/**
 * SIDERNE
 *
 * Hver adresse har sin egen side (se routes.js). Forsiden er en fokuseret
 * indgang: hero med beregnerens første spørgsmål, overblik over ydelserne,
 * udvalgte demoer, den enkle proces, feedbacken og kontakt. Uddybningerne
 * ligger på undersiderne og gentages ikke her.
 */

export function Home() {
  return (
    <>
      <Hero />
      <Overview />
      <DemoTeasers />
      <Samarbejde />
      <Review under />
      <ContactCta />
    </>
  )
}

export function Demoer() {
  return (
    <>
      <PageHead
        under
        eyebrow={demos.eyebrow}
        title={demos.title}
        lead={demos.intro}
        aside={
          <div className="rounded-[var(--radius-panel)] border border-rule bg-surface p-5 md:p-6">
            <p className="t-eyebrow">Sådan skal du læse demoerne</p>
            <p className="t-body mt-3 text-[15px]">{demos.note}</p>
          </div>
        }
      />
      <Work />
      <ContactCta />
    </>
  )
}

export function OmPage() {
  return (
    <>
      <Om page />
      <Principles under />
      <ContactCta />
    </>
  )
}

export function KontaktPage() {
  return (
    <>
      <PageHead
        under
        eyebrow="Kontakt"
        title="Fortæl om din opgave."
        lead="Du behøver ikke have et færdigt oplæg. Skriv, hvad virksomheden laver, og hvad der driller, så finder vi ud af, hvad der giver mening."
      />
      <Kontakt
        selectable
        eyebrow="Skriv til mig"
        title="Vælg emne, og skriv et par linjer."
        body={kontakt.body}
      />
      <Faq items={faq.items} />
    </>
  )
}

export function PrisberegnerPage() {
  return (
    <>
      <PageHead eyebrow="Prisberegner" title={calc.title} lead={calc.intro} />
      <section className="bg-paper pb-[var(--space-block)]">
        <div className="shell">
          <Calculator />
        </div>
      </section>
      <Faq
        items={calc.faq}
        title="Om prisen."
        eyebrow="Spørgsmål"
        id="om-prisen"
        under
      />
      <ContactCta />
    </>
  )
}

export const pages = {
  home: Home,
  hjemmesider: () => <ServicePage id="hjemmesider" />,
  booking: () => <ServicePage id="booking" />,
  seo: () => <ServicePage id="seo" />,
  googleAds: () => <ServicePage id="googleAds" />,
  sociale: () => <ServicePage id="sociale" />,
  ai: () => <ServicePage id="ai" />,
  demoer: Demoer,
  om: OmPage,
  kontakt: KontaktPage,
  prisberegner: PrisberegnerPage,
}
