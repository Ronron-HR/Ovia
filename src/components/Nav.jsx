import { useCallback, useEffect, useRef, useState } from 'react'
import { nav } from '../content.js'
import Logo from './Logo.jsx'
import { useNavSpy } from '../motion/useNavSpy.js'

/**
 * Nav: mærke til venstre, tre ankerlinks og ét CTA til højre.
 *
 * Tre tilstande:
 *   1. Øverst, i heroen: baren står der fra start og fader ind med heroen.
 *      Papir med gennemsigtighed, ingen streg — der er intet under den at
 *      adskille fra — og intet aktivt link, for man står ikke i et afsnit.
 *   2. Når indholdet glider op under: hårstregen tegnes i bunden. Baggrunden
 *      er papir med gennemsigtighed og blur, så den aldrig er en hård kasse.
 *   3. Aktivt afsnit: scrollspy (useNavSpy) markerer ét link, og en enkelt
 *      streg i accentfarven glider derhen. Stregen er ét element, ikke ét pr. link —
 *      derfor kan den glide i stedet for at blinke.
 *
 * MOBIL: ordet "Menu" i stedet for et ikon. Overlayet er et SØSKENDE til
 * baren, ikke et barn af den: baren har transform og backdrop-filter, og
 * begge gør den til containing block for position:fixed. Et fixed overlay
 * indeni ville være 64px højt. Baren ligger i z-50 over overlayet, så
 * mærket og "Luk" står det samme sted, uanset om menuen er åben.
 */

const LINK_IDS = nav.links.map((l) => l.href.slice(1))
const FOCUSABLE = 'a[href], button:not([disabled])'

export default function Nav() {
  const { active, scrolled } = useNavSpy(LINK_IDS)
  const [open, setOpen] = useState(false)

  const header = useRef(null)
  const overlay = useRef(null)
  const button = useRef(null)
  const track = useRef(null)
  const indicator = useRef(null)
  const links = useRef({})

  const close = useCallback(() => setOpen(false), [])

  /* --- Glidende understregning ------------------------------------------ */
  const place = useCallback(() => {
    const link = active && links.current[active]
    const line = indicator.current
    if (!line) return

    // Ingen aktiv sektion (heroen): stregen trækkes ind, hvor den står.
    if (!link) {
      line.style.setProperty('--iw', '0')
      return
    }
    if (!link.offsetWidth) return

    // Bogstavafstand lægges også efter sidste tegn. Den trækkes fra, så
    // stregen slutter under bogstavet og ikke i luften efter det.
    const trailing = parseFloat(getComputedStyle(link).letterSpacing) || 0
    line.style.setProperty('--ix', `${link.offsetLeft}px`)
    line.style.setProperty('--iw', String(link.offsetWidth - trailing))

    // Første placering sker uden overgang, så stregen ikke vokser ind fra
    // nul. Overgangen tændes først, når den står på plads.
    if (!line.dataset.ready) {
      requestAnimationFrame(() => {
        line.dataset.ready = 'true'
      })
    }
  }, [active])

  useEffect(() => {
    place()
    const observer = new ResizeObserver(place)
    if (track.current) observer.observe(track.current)
    // Skrifterne ændrer linkbredderne, når de lander.
    document.fonts?.ready.then(place)
    return () => observer.disconnect()
  }, [place])

  /* --- Mobil-overlay ---------------------------------------------------- */
  useEffect(() => {
    if (!open) return

    const html = document.documentElement
    const main = document.querySelector('main')
    const trigger = button.current

    // Body-scroll låses. Ankerspring virker stadig på et overflow:hidden-
    // dokument, så et valgt link scroller, mens overlayet lukker.
    html.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    main?.setAttribute('inert', '')

    const frame = requestAnimationFrame(() => {
      overlay.current?.querySelector(FOCUSABLE)?.focus({ preventScroll: true })
    })

    const focusables = () =>
      [...header.current.querySelectorAll(FOCUSABLE), ...overlay.current.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.getClientRects().length > 0,
      )

    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        return
      }
      if (event.key !== 'Tab') return

      // Fokus fanges: første og sidste element danner en ring. Skip-linket
      // og alt andet uden for baren og overlayet er ikke en del af den.
      const list = focusables()
      const first = list[0]
      const last = list[list.length - 1]
      const current = document.activeElement
      if (!list.includes(current)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && current === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && current === last) {
        event.preventDefault()
        first.focus()
      }
    }

    // Overlayet findes kun på mobil. Bliver vinduet bredt, lukker det.
    const wide = window.matchMedia('(min-width: 768px)')
    const onWide = () => wide.matches && setOpen(false)

    document.addEventListener('keydown', onKey)
    wide.addEventListener('change', onWide)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKey)
      wide.removeEventListener('change', onWide)
      html.style.overflow = ''
      document.body.style.overflow = ''
      main?.removeAttribute('inert')
      trigger?.focus({ preventScroll: true })
    }
  }, [open])

  return (
    <>
      <header
        ref={header}
        data-scrolled={scrolled}
        className="nav fixed inset-x-0 top-0 z-50 bg-paper/80 backdrop-blur-md"
      >
        <div className="shell flex h-[var(--nav-h)] items-center justify-between gap-6">
          <a href="#hero" onClick={close} aria-label={nav.brand} className="text-ink">
            <Logo className="block h-[22px]" />
          </a>

          <div className="hidden items-center gap-10 md:flex">
            <nav aria-label="Hovednavigation">
              <div ref={track} className="relative">
                <ul className="flex items-center gap-8">
                  {nav.links.map((link) => {
                    const id = link.href.slice(1)
                    return (
                      <li key={id}>
                        <a
                          ref={(el) => {
                            links.current[id] = el
                          }}
                          href={link.href}
                          aria-current={active === id ? 'location' : undefined}
                          className="nav-link block py-2 text-[12px] font-medium uppercase tracking-[0.08em]"
                        >
                          {link.label}
                        </a>
                      </li>
                    )
                  })}
                </ul>
                <span ref={indicator} aria-hidden="true" className="nav-indicator" />
              </div>
            </nav>

            <a
              href={nav.cta.href}
              className="btn border border-ink px-4 py-2 text-[13px] font-medium text-ink hover:bg-ink hover:text-paper"
            >
              {nav.cta.label}
            </a>
          </div>

          <button
            ref={button}
            type="button"
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen((v) => !v)}
            className="-mr-2 px-2 py-3 text-[12px] font-medium uppercase tracking-[0.08em] text-ink md:hidden"
          >
            {open ? nav.close : nav.menu}
          </button>
        </div>

        <span aria-hidden="true" className="nav-line" />
      </header>

      <div
        id="menu"
        ref={overlay}
        role="dialog"
        aria-modal="true"
        aria-label={nav.menu}
        data-open={open}
        className="menu-overlay fixed inset-0 z-40 bg-paper md:hidden"
      >
        <nav aria-label="Mobilmenu" className="shell flex h-full flex-col justify-center pt-[var(--nav-h)] pb-16">
          <ul className="flex flex-col gap-3">
            {nav.links.map((link, i) => (
              <li key={link.href} className="mask">
                <a
                  href={link.href}
                  onClick={close}
                  style={{ '--d': `${80 + i * 70}ms` }}
                  className="menu-rise t-display text-[clamp(44px,13vw,64px)] text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  )
}
