import About from '../components/About.jsx'
import ContactSection from '../components/ContactSection.jsx'
import HomeExamples from '../components/HomeExamples.jsx'
import HomeHero from '../components/HomeHero.jsx'
import ServiceCards from '../components/ServiceCards.jsx'
import Steps from '../components/Steps.jsx'

/**
 * Forsiden: kort hero, beregneren i fuld bredde, eksempler, de tre ydelser,
 * sådan foregår det, om og kontakt. Fladerne skifter mellem lys og tonet
 * (hero lys, beregner tonet, eksempler lys, ydelser tonet, trin lys, om tonet,
 * kontakt mørk).
 */
export default function Home() {
  return (
    <>
      <HomeHero />
      <HomeExamples />
      <ServiceCards />
      <Steps tone="paper" />
      <About />
      <ContactSection />
    </>
  )
}
