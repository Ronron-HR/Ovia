import { useCallback, useEffect, useRef, useState } from 'react'
import { contact } from '../data/pricing.js'
import { calcHref, links, nav } from '../data/texts.js'
import { useScrolled } from '../motion/useScrolled.js'
import ContactButtons, { PhoneIcon } from './ContactButtons.jsx'
import Logo from './Logo.jsx'
import { Arrow } from './Shots.jsx'

/**
 * NAVIGATION
 *
 * Mærke til venstre, fire links, "Ring" og "Se din pris" (accent) til højre.
 * "Se din pris" hopper til prisberegneren på siden (#beregner) eller til /priser/.
 * Den side, man står på, markeres med aria-current="page" og en bronzestreg
 * under ordet.
 *
 * MOBIL (under lg): mærke, "Ring", "Se pris" og "Menu".
 * Overlayet er et SØSKENDE til baren, så et fixed overlay ikke måles mod
 * baren. Menuen lukker med Escape og "Luk"; fokus fanges, mens den er åben,
 * og går tilbage til knappen.
 */

const FOCUSABLE = 'a[href], button:not([disabled])'

const clean = (p) => (p || '/').replace(/\/+$/, '') || '/'
const isHere = (href, path) => clean(href) === clean(path)

const bigLink =
  't-display flex min-h-14 items-center justify-between gap-4 text-[26px] leading-tight aria-[current=page]:text-accent'

export default function Nav({ path }) {
  const scrolled = useScrolled()
  const price = calcHref(path)
  const [open, setOpen] = useState(false)

  const header = useRef(null)
  const overlay = useRef(null)
  const button = useRef(null)

  const close = useCallback(() => setOpen(false), [])

  /* --- Mobil-overlay ---------------------------------------------------- */
  useEffect(() => {
    if (!open) return

    const html = document.documentElement
    const main = document.querySelector('main')
    const trigger = button.current

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

      // Fokus fanges: første og sidste element danner en ring.
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
    const wide = window.matchMedia('(min-width: 1024px)')
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
      <header ref={header} data-scrolled={scrolled} className="nav fixed inset-x-0 top-0 z-50 bg-paper/[0.97]">
        <div className="nav-bar shell flex h-[var(--nav-h)] items-center justify-between gap-4">
          <a href="/" onClick={close} aria-label={`${nav.brand}, til forsiden`} className="inline-flex min-h-11 items-center text-ink">
            <Logo className="block h-[24px] md:h-[26px]" />
          </a>

          <div className="hidden items-center gap-8 lg:flex">
            <nav aria-label="Hovednavigation">
              <ul className="flex items-center gap-7">
                {nav.items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={isHere(item.href, path) ? 'page' : undefined}
                      className="nav-link flex min-h-11 items-center text-[14px] font-medium"
                    >
                      <span className="nav-label">{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-2.5">
              <a href={links.tel} className="btn btn-ghost min-h-11 px-4 text-[14px]" aria-label={`${nav.call} ${contact.phone}`}>
                <PhoneIcon />
                <span>
                  {nav.call}
                  <span className="hidden tabular-nums xl:inline"> {contact.phone}</span>
                </span>
              </a>
              <a href={price} className="btn btn-accent min-h-11 px-5 text-[14px]">
                {nav.price}
              </a>
            </div>
          </div>

          {/* Mobil: Ring og Se pris skjules, mens den faste bundbjælke (med de samme knapper) er synlig. */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <a href={links.tel} className="nav-call btn btn-ghost min-h-10 px-3 text-[14px]" aria-label={`${nav.call} ${contact.phone}`}>
              <PhoneIcon />
              {nav.call}
            </a>
            <a href={price} className="nav-call btn btn-accent min-h-10 px-3 text-[14px] whitespace-nowrap">
              {nav.priceShort}
            </a>
            <button
              ref={button}
              type="button"
              aria-expanded={open}
              aria-controls="menu"
              onClick={() => setOpen((v) => !v)}
              className="-mr-2 inline-flex min-h-11 min-w-14 cursor-pointer items-center justify-end px-2 text-[15px] font-medium text-ink"
            >
              {open ? nav.close : nav.menu}
            </button>
          </div>
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
        className="menu-overlay fixed inset-0 z-40 overflow-y-auto bg-paper lg:hidden"
      >
        <nav aria-label="Mobilmenu" className="shell flex min-h-full flex-col pt-[calc(var(--nav-h)+12px)] pb-8">
          <ul className="flex flex-col">
            {[{ label: 'Forside', href: '/' }, ...nav.items].map((item) => (
              <li key={item.href} className="border-b border-rule">
                <a
                  href={item.href}
                  onClick={close}
                  aria-current={isHere(item.href, path) ? 'page' : undefined}
                  className={bigLink}
                >
                  {item.label}
                  <Arrow className="text-accent" />
                </a>
              </li>
            ))}
          </ul>

          <a href={price} onClick={close} className="btn btn-accent mt-8 w-full">
            {nav.price}
          </a>
          <ContactButtons className="mt-3 flex-col [&>a]:w-full" />
        </nav>
      </div>
    </>
  )
}
