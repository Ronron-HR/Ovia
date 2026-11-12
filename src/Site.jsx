import NotFound from './components/layout/NotFound.jsx'
import Footer from './components/layout/Footer.jsx'
import Nav from './components/layout/Nav.jsx'

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
