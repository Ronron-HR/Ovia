import { useCallback, useEffect, useRef, useState } from 'react'
import { nav, site } from '../content.js'
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
        <div className="nav-bar shell flex h-[var(--nav-h)] items-center justify-between gap-6">
          <a href="#hero" onClick={close} aria-label={nav.brand} className="text-ink">
            <Logo className="block h-[26px]" />
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
            className="-mr-2 inline-flex min-h-11 min-w-11 items-center justify-end px-2 text-[12px] font-medium uppercase tracking-[0.08em] text-ink md:hidden"
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
        <nav aria-label="Mobilmenu" className="shell flex h-full flex-col pt-[var(--nav-h)] pb-10">
          {/* Graden sidder på .mask og ikke på linket indeni. Masken giver
              plads til underlængder med padding-bottom: 0.08em — og em
              regnes mod ELEMENTETS EGEN grad. Lå graden på <a>, blev
              afstanden målt mod arvede 16px, altså 1,3px i stedet for 4,
              og j'et i "Hvad jeg laver" fik halen klippet af. Heroen
              gør det samme; det er derfor den ikke klipper. */}
          <ul className="flex flex-1 flex-col justify-center gap-3">
            {nav.links.map((link, i) => (
              <li key={link.href} className="mask t-display text-[clamp(38px,11vw,58px)]">
                <a
                  href={link.href}
                  onClick={close}
                  style={{ '--d': `${80 + i * 70}ms` }}
                  className="menu-rise text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Menuen er hele skærmen på telefon, og indtil nu stod der kun
              tre links i den. Handlingen og de to måder at fange mig på
              hører til her: på mobil findes bar-CTA'en ikke, så uden det
              her er der ingen vej videre fra en åben menu. */}
          <div className="mt-10 border-t border-rule pt-6">
            <a
              href={nav.cta.href}
              onClick={close}
              className="btn block bg-ink px-6 py-4 text-center text-[15px] font-medium text-paper"
            >
              {nav.cta.label}
            </a>

            <ul className="mt-5 flex flex-col gap-1 text-[15px]">
              <li>
                <a
                  href={`mailto:${site.email}`}
                  onClick={close}
                  className="link-underline inline-block py-1 text-ink"
                >
                  {site.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.phoneHref}`}
                  onClick={close}
                  className="link-underline inline-block py-1 text-ink"
                >
                  {site.phone}
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </>
  )
}
