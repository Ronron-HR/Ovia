import { useEffect, useId, useState, useSyncExternalStore } from 'react'
import { demos } from '../content.demos.js'
import { paths } from '../data/texts.js'
import { useEntrance } from './useEntrance.js'

/**
 * RAMMEN OM EN DEMO
 *
 * Øverst en stribe fra OviaSpecs, der mærker siden "Koncept – ikke en
 * kundeopgave" og fører tilbage til koncepterne og videre til priserne. Under den
 * hedder demoens egen hjemmeside: hoved med mobilmenu, indhold og bund.
 *
 * Mobilmenuen er en knap med aria-expanded. Den lukker med Escape og ved klik
 * på et link. Uden JavaScript er menuen altid åben (noscript), så intet er
 * skjult. Alt i demoerne er lokalt: intet sendes, bestilles eller bookes.
 */

/** Sider, hvor demoen vises med et anker (id="demo-<id>") at lande ved. */
const WITH_ANCHOR = ['/demoer/']

/** Sider med prisberegneren: valgene i adresselinjen følger med tilbage. */
const CALC_PAGES = [paths.home, paths.hjemmeside, paths.marketing, paths.bookingGoogle, paths.priser]

/** Priserne på en hjemmeside i beregneren. */
const PRICES = `${paths.priser}?ydelser=hjemmeside#beregner`
const FROM = 'oviaspecs-demo-from'

/** En af selve demoerne (/demoer/cafe/ …), ikke oversigten /demoer/. */
const isDemoPath = (p) => p.startsWith('/demoer/') && p.replace(/\/+$/, '') !== '/demoer'

/**
 * Hvor "Tilbage til OviaSpecs" fører hen. Som udgangspunkt til demoens plads på
 * /demoer/, så det virker, også hvis demoen åbnes direkte (og uden JavaScript).
 * Kom kunden fra en anden side hos OviaSpecs (forsiden, en ydelsesside eller
 * /priser/), går knappen dertil, og på /demoer/ helt hen til det koncept,
 * kunden kom fra. Hvilken side kunden kom fra, huskes i sessionStorage i den
 * enkelte fane (forlader aldrig browseren).
 */
/** Hvor "Tilbage til OviaSpecs" fører hen, udregnet i browseren (se useBackHref). */
function backHref(id) {
  let from = null
  try {
    const ref = document.referrer ? new URL(document.referrer) : null
    if (ref && ref.origin === window.location.origin && !isDemoPath(ref.pathname)) {
      from = { path: ref.pathname, search: CALC_PAGES.includes(ref.pathname) ? ref.search : '' }
      window.sessionStorage.setItem(FROM, JSON.stringify(from))
    } else {
      from = JSON.parse(window.sessionStorage.getItem(FROM) ?? 'null')
    }
  } catch {
    /* lager ikke tilgængeligt: brug standarden */
  }
  const fallback = `${paths.demoer}#demo-${id}`
  if (!from || typeof from.path !== 'string' || !from.path.startsWith('/') || from.path.startsWith('//')) return fallback
  const anchor = WITH_ANCHOR.includes(from.path) ? `#demo-${id}` : from.path === paths.home ? '#eksempler' : ''
  return `${from.path}${from.search ?? ''}${anchor}`
}

const noop = () => () => {}

function useBackHref(id) {
  // Serveren og første klient-render får standarden (forudrenderingen og hydreringen er ens);
  // derefter læser React den rigtige adresse.
  return useSyncExternalStore(noop, () => backHref(id), () => `${paths.demoer}#demo-${id}`)
}

function Menu({ links, label }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        type="button"
        className="dm-menu-btn"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? 'Luk' : 'Menu'}
      </button>
      <nav id={id} className="dm-nav" data-open={open} aria-label={label}>
        <ul>
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}

export default function DemoShell({ project, links, logo, footer, children }) {
  const back = useBackHref(project.id)
  useEntrance()
  return (
    <div className={`dm dm-${project.id}`}>
      <noscript>
        <style>{'.dm-menu-btn{display:none!important}.dm-nav{display:block!important;position:static!important}'}</style>
      </noscript>

      <div className="dm-strip">
        <div className="dm-wrap dm-strip-in">
          <p>
            <strong>{demos.banner}</strong> Intet sendes, bestilles eller bookes.
          </p>
          <div className="dm-strip-links">
            <a href={back} className="dm-strip-back">
              <span aria-hidden="true">←</span> {demos.backToSite}
            </a>
            <a href={PRICES}>{demos.calcCta}</a>
            <a href={paths.demoer}>{demos.allDemos}</a>
          </div>
        </div>
      </div>

      <header className="dm-header">
        <div className="dm-wrap dm-header-in">
          <a href="#main" className="dm-brand" aria-label={`${project.name}, til toppen`}>
            {logo}
            <span>{project.name}</span>
          </a>
          <Menu links={links} label={`${project.name}, menu`} />
        </div>
      </header>

      {children}

      <footer className="dm-footer">
        <div className="dm-wrap dm-footer-in">
          <div>
            <p>{footer}</p>
            <p>Eksemplet er fiktivt: navne, adresser, tider og priser er opdigtede.</p>
          </div>
          <p>
            <a href={back} className="underline underline-offset-4">
              {demos.backToSite}
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
