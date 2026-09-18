import { useEffect, useRef } from 'react'
import Case from './components/Case.jsx'
import Hero from './components/Hero.jsx'
import Kontakt from './components/Kontakt.jsx'
import Nav from './components/Nav.jsx'
import Om from './components/Om.jsx'
import Proces from './components/Proces.jsx'
import Ydelser from './components/Ydelser.jsx'
import { casePalmy } from './content.js'
import { useLayer } from './motion/useLayer.js'
import { useReveal } from './motion/useReveal.js'

export default function App() {
  const stage = useRef(null)

  useLayer(stage)
  useReveal()

  // Fortæller vagthunden i index.html, at motion-koden lever. Sker det
  // ikke inden 2,5s, fjernes .js-motion, og alt indhold bliver synligt.
  useEffect(() => {
    window.__oviaReady?.()
  }, [])

  return (
    <>
      <a href="#ydelser" className="skip-link">
        Spring til indhold
      </a>

      <Nav />

      <main className="layer-host">
        {/* Scenen fylder i flowet, så anchor- og deep-links lander korrekt.
            Heroen holdes fast indeni, mens laget nedenfor skubber ind over. */}
        <div ref={stage} className="layer-stage">
          <Hero />
        </div>

        {/* Ét lag. Sektioner kan tilføjes, fjernes og byttes rundt herinde
            uden at lagovergangen skal røres — den ligger mellem heroen og
            det, der tilfældigvis står først. */}
        <div className="layer-rest">
          <Ydelser />
          {casePalmy.enabled && <Case />}
          <Om />
          <Proces />
          <Kontakt />
        </div>
      </main>
    </>
  )
}
