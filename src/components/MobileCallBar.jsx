import { useEffect, useState } from 'react'
import { contact } from '../data/pricing.js'
import { cta, links } from '../data/texts.js'
import { MailIcon, PhoneIcon } from './ContactButtons.jsx'

/**
 * Fast bjælke i bunden på mobil med "Ring" og "Skriv", så kontakt altid er ét
 * tryk væk. Den skjules, mens elementer med [data-callbar-hide] er på skærmen
 * (heroens knapper, kontaktsektionen og footeren), så den aldrig står oven i
 * de samme knapper. Uden JavaScript vises den ikke; knapperne på siden virker
 * stadig. Kun under md.
 */
export default function MobileCallBar() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const targets = [...document.querySelectorAll('[data-callbar-hide]')]
    const visible = new Set()
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target)
        else visible.delete(e.target)
      }
      setShow(visible.size === 0)
    })
    // Footeren er altid et mål, så listen er aldrig tom.
    targets.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [])

  return (
    <div className="callbar md:hidden" data-show={show} aria-hidden={!show} inert={!show}>
      <div className="grid grid-cols-2 gap-2">
        <a href={links.tel} className="btn btn-primary" aria-label={`${cta.call} ${contact.phone}`}>
          <PhoneIcon />
          {cta.call}
        </a>
        <a href={links.mail} className="btn btn-surface">
          <MailIcon />
          {cta.write}
        </a>
      </div>
    </div>
  )
}
