import Calculator from '../components/calculator/Calculator.jsx'
import Examples from '../components/home/Examples.jsx'
import { About, Hero, Process } from '../components/home/Sections.jsx'
import Contact from '../components/layout/Contact.jsx'

/** Forsiden: hero, prisberegner, eksempler, proces, om mig og kontakt. */
export default function Home() {
  return (
    <>
      <Hero />
      <Calculator />
      <Examples />
      <Process />
      <About />
      <Contact />
    </>
  )
}
