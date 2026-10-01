import About from '../components/About.jsx'
import ContactSection from '../components/ContactSection.jsx'
import HomeHero from '../components/HomeHero.jsx'
import ServiceCards from '../components/ServiceCards.jsx'
import Steps from '../components/Steps.jsx'

/** Forsiden: hero med Ring/Skriv, tre kort, sådan foregår det, om og kontakt. */
export default function Home() {
  return (
    <>
      <HomeHero />
      <ServiceCards />
      <Steps />
      <About />
      <ContactSection />
    </>
  )
}
