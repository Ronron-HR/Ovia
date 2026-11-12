import Calculator from '../components/calculator/Calculator.jsx'
import CaseFeature from '../components/home/CaseFeature.jsx'
import { About, Hero, Process } from '../components/home/Sections.jsx'
import Contact from '../components/layout/Contact.jsx'

/** Forsiden: hero, prisberegner, case, proces, om os og kontakt. */
export default function Home() {
  return (
    <>
      <Hero />
      <Calculator />
      <CaseFeature />
      <Process />
      <About />
      <Contact />
    </>
  )
}
