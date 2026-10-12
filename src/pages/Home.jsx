import About from '../components/About.jsx'
import BuyModes from '../components/BuyModes.jsx'
import ContactSection from '../components/ContactSection.jsx'
import Faq from '../components/Faq.jsx'
import HomeExamples from '../components/HomeExamples.jsx'
import HomeHero from '../components/HomeHero.jsx'
import PriceCalculator from '../components/PriceCalculator.jsx'
import Problems from '../components/Problems.jsx'
import Steps from '../components/Steps.jsx'
import TourLauncher from '../components/TourLauncher.jsx'
import { homeFaq } from '../data/offer.js'
import { home } from '../data/texts.js'

/**
 * Forsiden, i den rækkefølge kontrakten (docs/rebrand/kontrakt.md) fastlægger:
 *   1. HomeHero      værdi, målgruppe, hovedtilbud, kontakt (ingen beregner)
 *   2. HomeExamples  restaurant, salon og arbejdsgangsdemoen (mærket Demo)
 *   3. Problems      tre problemer, hver med link til sin løsning
 *   4. BuyModes      de to købsmåder (id="koebsmaader")
 *   5. Beregneren    egen sektion; id="beregner" sidder inde i PriceCalculator
 *   6. Steps         fem trin
 *   7. About, Faq, ContactSection
 * Fladerne skifter mellem varm lys og tonet: hero lys, eksempler tonet, problemer
 * lys, købsmåder tonet, beregner lys, forløb tonet, om lys, FAQ tonet, kontakt mørk.
 * "Vis mig rundt" står diskret i beregnerens overskrift og åbner kun på klik.
 */
export default function Home() {
  return (
    <>
      <HomeHero />
      <HomeExamples tone="grey" />
      <Problems tone="paper" />
      <BuyModes tone="grey" />

      <section aria-labelledby="beregner-titel" className="section-y bg-paper">
        <div className="shell">
          <header className="flex flex-col gap-x-10 gap-y-4 md:flex-row md:items-end md:justify-between">
            <div data-reveal className="max-w-[48rem]">
              <h2 id="beregner-titel" className="t-display t-h2">
                {home.calc.title}
              </h2>
              <p className="t-body t-lead mt-3 max-w-[60ch]">{home.calc.intro}</p>
            </div>
            <TourLauncher className="btn-text self-start md:self-auto md:pb-1" />
          </header>
          <div className="mt-7 md:mt-9">
            <PriceCalculator />
          </div>
        </div>
      </section>

      <Steps tone="grey" />
      <About tone="paper" />
      <Faq id="faq" tone="grey" eyebrow={homeFaq.eyebrow} title={homeFaq.title} items={homeFaq.items} />
      <ContactSection />
    </>
  )
}
