import { useEffect } from 'react'
import Faq from './components/Faq.jsx'
import Hero from './components/Hero.jsx'
import Kontakt, { Footer } from './components/Kontakt.jsx'
import Nav from './components/Nav.jsx'
import Om from './components/Om.jsx'
import Rail from './components/Rail.jsx'
import Samarbejde from './components/Samarbejde.jsx'
import Work from './components/Work.jsx'
import Ydelser from './components/Ydelser.jsx'
import { useReveal } from './motion/useReveal.js'

export default function App() {
  useReveal()

  // Fortæller vagthunden i index.html, at motion-koden lever. Sker det
  // ikke inden 2,5s, fjernes .js-motion, og alt indhold bliver synligt.
  useEffect(() => {
    window.__oviaSpecsReady?.()
  }, [])

  return (
    <>
      <a href="#main" className="skip-link">
        Spring til indhold
      </a>

      <Nav />

      <main id="main" className="relative">
        {/* Vagt til nav'ens hårstreg — se useNavSpy. */}
        <span
          aria-hidden="true"
          data-nav-sentinel
          className="pointer-events-none absolute top-2 left-0 h-px w-px"
        />
        <Hero />
        <Rail />
        <Work />
        <Ydelser />
        <Samarbejde />
        <Om />
        <Faq />
        <Kontakt />
      </main>

      <Footer />
    </>
  )
}
