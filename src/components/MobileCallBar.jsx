import { useEffect, useState } from 'react'
import { contact } from '../data/pricing.js'
import { calcHref, cta, links } from '../data/texts.js'
import { MailIcon, PhoneIcon } from './ContactButtons.jsx'

/**
 * Fast bjælke i bunden på mobil med "Ring", "Mail" og "Se din pris", så kontakt altid er ét
 * tryk væk. Den skjules, mens elementer med [data-callbar-hide] er på skærmen
 * (heroens knapper, kontaktsektionen og footeren), så den aldrig står oven i
 * de samme knapper. Uden JavaScript vises den ikke; knapperne på siden virker
 * stadig. Kun under md.
 *
 * Mens bjælken er synlig, står <html data-callbar="on">, så "Ring" i toppen
 * (Nav, .nav-call) skjules, og knappen ikke står to gange (index.css).
 */
export default function MobileCallBar({ path }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const targets = [...document.querySelectorAll('[data-callbar-hide]')]
    const visible = new Set()
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target)
        else visible.delete(e.target)
      }
      const on = visible.size === 0
      setShow(on)
      document.documentElement.dataset.callbar = on ? 'on' : 'off'
    })
    // Footeren er altid et mål, så listen er aldrig tom.
    targets.forEach((t) => io.observe(t))
    return () => {
      io.disconnect()
      delete document.documentElement.dataset.callbar
    }
  }, [])

  return (
    <div className="callbar md:hidden" data-show={show} aria-hidden={!show} inert={!show}>
      <div className="grid grid-cols-3 gap-2">
        <a href={links.tel} className="btn btn-ghost gap-1.5 px-2" aria-label={`${cta.call} ${contact.phone}`}>
          <PhoneIcon />
          {cta.call}
        </a>
        <a href={links.mail} className="btn btn-ghost gap-1.5 px-2">
          <MailIcon />
          {cta.write}
        </a>
        <a href={calcHref(path)} className="btn btn-cta px-2 whitespace-nowrap">
          {cta.price}
        </a>
      </div>
    </div>
  )
}
