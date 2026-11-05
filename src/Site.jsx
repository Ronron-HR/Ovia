import NotFound from './components/layout/NotFound.jsx'
import Footer from './components/layout/Footer.jsx'
import Nav from './components/layout/Nav.jsx'
import { pageKeyFor } from './pageKeys.js'

/**
 * Hele siden for en adresse: navigation, indhold og fodfelt. `path` afgør,
 * hvilken side der vises. Det samme bruges af klienten (main.jsx) og af
 * forudrenderingen (entry-server.jsx), så HTML'en fra serveren og første
 * klient-render er ens.
 */
export default function Site({ path, Page: Current }) {
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
      <main id="main">
        <Page />
      </main>
      <Footer />
    </>
  )
}
