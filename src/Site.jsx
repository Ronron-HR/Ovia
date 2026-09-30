import { useEffect } from 'react'
import Footer from './components/Footer.jsx'
import Nav from './components/Nav.jsx'
import { useReveal } from './motion/useReveal.js'
import { pageKeyFor } from './pageKeys.js'

/**
 * Hele siden for en adresse: navigation, indhold og fodfelt. `path` afgør,
 * hvilken side der vises. Det samme bruges af klienten (main.jsx) og af
 * forudrenderingen (entry-server.jsx), så HTML'en fra serveren og første
 * klient-render er ens.
 */
export default function Site({ path, Page: Current }) {
  useReveal()

  // Fortæller vagthunden i index.html, at motion-koden lever. Sker det
  // ikke inden 2,5s, fjernes .js-motion, og alt indhold bliver synligt.
  useEffect(() => {
    window.__oviaSpecsReady?.()
  }, [])

  // Retur fra en demo lander ved demoen (#demo-<id>). Beregnerens gemte valg
  // gør heroen højere, når siden hydreres, og det flytter demoen ned, efter at
  // browseren har scrollet til ankeret. Derfor scrolles der igen, når siden står.
  useEffect(() => {
    const id = window.location.hash.startsWith('#demo-') ? window.location.hash.slice(1) : null
    if (!id) return
    const frame = window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' })),
    )
    return () => window.cancelAnimationFrame(frame)
  }, [])

  // Siden (Page) gives udefra: forudrenderingen har alle sider (pages.jsx), og
  // klienten henter kun den ene (pageLoaders.js) før hydreringen. Uden en side: 404.
  const Page = Current ?? NotFound

  // Demoerne er små hjemmesider for sig selv, med eget hoved, egen bund og en
  // stribe fra OviaSpecs (src/demos). De får ikke OviaSpecs' navigation.
  if (pageKeyFor(path)?.startsWith('demo-')) {
    return (
      <>
        <a href="#main" className="skip-link">
          Spring til indhold
        </a>
        <Page />
      </>
    )
  }

  return (
    <>
      <a href="#main" className="skip-link">
        Spring til indhold
      </a>

      <Nav path={path} />

      <main id="main" className="relative">
        {/* Vagt til nav'ens hårstreg — se useScrolled. */}
        <span
          aria-hidden="true"
          data-nav-sentinel
          className="pointer-events-none absolute top-2 left-0 h-px w-px"
        />
        <Page />
      </main>

      <Footer />
    </>
  )
}

/** Vises kun i udvikling; i produktion svarer værten med 404.html. */
function NotFound() {
  return (
    <section className="bg-paper pt-[calc(var(--nav-h)+72px)] pb-24">
      <div className="shell">
        <p className="t-eyebrow t-eyebrow-accent">404</p>
        <h1 className="t-display t-hero mt-5">Den side findes ikke.</h1>
        <p className="t-body t-lead mt-6 max-w-[46ch]">
          Linket kan være ændret, eller adressen er skrevet forkert. Forsiden har det hele.
        </p>
        <a href="/" className="btn btn-primary mt-8">
          Til forsiden
        </a>
      </div>
    </section>
  )
}
