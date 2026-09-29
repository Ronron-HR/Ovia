import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { ydelser } from '../content.js'

/**
 * OMRÅDENAVIGATION — klistret række af knapper øverst i Ydelser, så man altid
 * kan hoppe mellem de tre områder og se, hvor man er.
 *
 * Gestaltlovene, konkret (og hver bevægelse har en opgave):
 *   Nærhed          knapperne sidder tæt i én række
 *   Fælles område   rækken ligger i én grå pille (paper-2)
 *   Lighed          alle knapper har samme form, størrelse og skrift
 *   Figur/grund     én koksgrå markør viser, hvor man er; resten er dæmpet.
 *                   Når baren klistrer, får den skygge og løfter sig fra indholdet.
 *   Fælles skæbne / kontinuitet
 *                   markøren er ÉT element, der glider fra område til område,
 *                   i stedet for at en fyldfarve blinker fra knap til knap.
 *                   Øjet følger bevægelsen og forstår, at de hører sammen.
 *                   På smal skærm ruller rækken sidelæns, og den aktive knap
 *                   glider ind i billedet.
 *
 * Scrollspy med IntersectionObserver (ingen scroll-listeners). Uden JavaScript
 * er knapperne almindelige ankerlinks. Bevægelse respekterer reduced-motion.
 */
export default function AreaNav() {
  const [active, setActive] = useState(null)
  const [stuck, setStuck] = useState(false)
  const row = useRef(null)
  const sentinel = useRef(null)

  useEffect(() => {
    const targets = ydelser.areaNav.items.map((i) => document.getElementById(i.id)).filter(Boolean)
    if (!targets.length) return
    const inBand = new Set()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inBand.add(e.target)
          else inBand.delete(e.target)
        }
        const current = targets.filter((t) => inBand.has(t)).pop()
        setActive(current ? current.id : null)
      },
      { rootMargin: '-35% 0px -55% 0px' },
    )
    targets.forEach((t) => observer.observe(t))
    return () => observer.disconnect()
  }, [])

  // Baren er "klistret", når vagten lige over den er rullet ud af billedet
  // (under den faste topbar).
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting && entry.boundingClientRect.top < navH),
      { rootMargin: `-${navH}px 0px 0px 0px` },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Markøren placeres under den aktive knap; rækken ruller den ind i billedet.
  const place = () => {
    const box = row.current
    if (!box) return
    const el = box.querySelector('[aria-current]')
    if (!el) {
      box.style.setProperty('--mw', '0px')
      return
    }
    box.style.setProperty('--mx', `${el.offsetLeft}px`)
    box.style.setProperty('--mw', `${el.offsetWidth}px`)
    if (!box.dataset.ready) requestAnimationFrame(() => (box.dataset.ready = 'true'))
    if (box.scrollWidth > box.clientWidth) {
      box.scrollTo({ left: el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2, behavior: 'smooth' })
    }
  }

  useLayoutEffect(place, [active])
  useEffect(() => {
    const box = row.current
    if (!box) return
    const ro = new ResizeObserver(place)
    ro.observe(box)
    document.fonts?.ready.then(place)
    return () => ro.disconnect()
  }, [])

  return (
    <>
      <span ref={sentinel} aria-hidden="true" className="pointer-events-none block h-px" />
      <nav
        aria-label={ydelser.areaNav.label}
        data-stuck={stuck}
        className="area-nav sticky top-[var(--nav-h)] z-30 -mx-5 mt-5 px-5 py-2 md:mx-0 md:mt-7 md:px-0"
      >
        <div
          ref={row}
          className="area-nav-row relative flex gap-1 overflow-x-auto rounded-full bg-paper-2 p-1 md:inline-flex"
        >
          <span aria-hidden="true" className="area-marker" />
          {ydelser.areaNav.items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={active === item.id ? 'true' : undefined}
              aria-label={item.long}
              className="area-chip relative z-10 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-3 text-[14px] font-medium whitespace-nowrap md:px-5 md:text-[15px]"
            >
              {item.n && <span className="area-chip-n hidden text-[12px] sm:inline">{item.n}</span>}
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </>
  )
}
