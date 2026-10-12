import { useCallback, useEffect, useRef, useState } from 'react'
import { contact } from '../data/pricing.js'
import { calcHref, links, nav, paths } from '../data/texts.js'
import { useScrolled } from '../motion/useScrolled.js'
import ContactButtons from './ContactButtons.jsx'
import Icon from './Icon.jsx'
import Logo from './Logo.jsx'
import { Arrow } from './Shots.jsx'

/**
 * NAVIGATION
 *
 * Mærke til venstre, derefter Løsninger (en disclosure-knap med de fire
 * løsninger), Eksempler, Priser og Om/Kontakt, og til højre "Ring"
 * (sekundær) og "Se din pris" (kobolt, sidens eneste farvede knap).
 * "Se din pris" hopper til prisberegneren på siden (#beregner) eller til /priser/.
 * Den side, man står på, markeres med aria-current="page" og en streg under
 * ordet (i mobilmenuen: understreget).
 *
 * LØSNINGER (desktop): <button aria-expanded aria-controls>. Åbner og lukker
 * ved klik/tryk (ikke hover, så det virker på touch), lukker med Escape
 * (fokus tilbage på knappen), klik udenfor og når fokus forlader menuen.
 * Pil ned fra knappen åbner og går til det første link; pil op/ned flytter
 * mellem linkene. Panelet ligger altid i HTML'en (visibility), så linkene kan
 * læses af søgemaskiner.
 *
 * MOBIL (under lg): mærke, "Ring", "Se din pris" og "Menu".
 * Overlayet er et SØSKENDE til baren, så et fixed overlay ikke måles mod
 * baren. Det viser de fire løsninger som en liste under en overskrift og så
 * de øvrige links. Menuen lukker med Escape og "Luk"; fokus fanges, mens den er
 * åben, og går tilbage til knappen.
 *
 * Teksterne kommer fra nav i texts.js (nav.solutions, nav.items).
 */

const FOCUSABLE = 'a[href], button:not([disabled])'

const clean = (p) => (p || '/').replace(/\/+$/, '') || '/'
const isHere = (href, path) => !href.includes('#') && clean(href) === clean(path)

const SOLUTION_ICON = {
  [paths.hjemmeside]: 'browser',
  [paths.bookingGoogle]: 'pin',
  [paths.systemer]: 'workflow',
  [paths.marketing]: 'video',
}

const solutions = nav.solutions
const plainLinks = nav.items

const bigLink =
  't-display flex min-h-14 items-center justify-between gap-4 text-[26px] leading-tight aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8'

/** Løsninger som disclosure (desktop). */
function SolutionsMenu({ path }) {
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  const button = useRef(null)
  const panel = useRef(null)
  const here = solutions.items.some((item) => isHere(item.href, path))

  const close = useCallback((focusButton = false) => {
    setOpen(false)
    if (focusButton) button.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event) => {
      if (event.key === 'Escape') close(true)
    }
    const onPointer = (event) => {
      if (!root.current?.contains(event.target)) close()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open, close])

  const items = () => [...(panel.current?.querySelectorAll('a[href]') ?? [])]

  const onButtonKey = (event) => {
    if (event.key !== 'ArrowDown') return
    event.preventDefault()
    setOpen(true)
    requestAnimationFrame(() => items()[0]?.focus({ preventScroll: true }))
  }

  const onPanelKey = (event) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const list = items()
    const i = list.indexOf(document.activeElement)
    const next = event.key === 'ArrowDown' ? (i + 1) % list.length : (i - 1 + list.length) % list.length
    list[next]?.focus({ preventScroll: true })
  }

  const onBlur = (event) => {
    if (!root.current?.contains(event.relatedTarget)) setOpen(false)
  }

  return (
    <div ref={root} className="relative" onBlur={onBlur}>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="losninger-menu"
        data-here={here || undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onButtonKey}
        className="nav-link nav-trigger flex min-h-11 cursor-pointer items-center gap-1.5 text-[15px] font-medium"
      >
        <span className="nav-label">{solutions.label}</span>
        <Icon name="chevron-down" size={16} className="nav-chevron" />
      </button>

      <div id="losninger-menu" ref={panel} data-open={open} onKeyDown={onPanelKey} className="solutions-panel">
        <ul>
          {solutions.items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={isHere(item.href, path) ? 'page' : undefined}
                onClick={() => setOpen(false)}
                className="solutions-link"
              >
                <span className="icon-tile">
                  <Icon name={SOLUTION_ICON[item.href] ?? 'arrow'} size={20} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[16px] font-semibold text-ink">{item.label}</span>
                  {item.text && <span className="mt-0.5 block text-[14px] leading-snug text-muted">{item.text}</span>}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

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
                <li>
                  <SolutionsMenu path={path} />
                </li>
                {plainLinks.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      aria-current={isHere(item.href, path) ? 'page' : undefined}
                      className="nav-link flex min-h-11 min-w-11 items-center text-[15px] font-medium"
                    >
                      <span className="nav-label">{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-2.5">
              <a href={links.tel} className="btn btn-ghost min-h-11 px-4 text-[15px]" aria-label={`${nav.call} ${contact.phone}`}>
                <Icon name="phone" />
                <span>
                  {nav.call}
                  <span className="hidden tabular-nums xl:inline"> {contact.phone}</span>
                </span>
              </a>
              <a href={price} className="btn btn-cta min-h-11 px-5 text-[15px]">
                {nav.price}
              </a>
            </div>
          </div>

          {/* Mobil: Ring og Se din pris skjules, mens den faste bundbjælke (med de samme knapper) er synlig. */}
          <div className="flex items-center gap-1.5 lg:hidden">
            {/* Under 380 px skjules ikonet, så "Se din pris" og "Menu" kan være på linjen. */}
            <a href={links.tel} className="nav-call btn btn-ghost min-h-11 px-3 text-[14px] max-[379px]:[&_svg]:hidden" aria-label={`${nav.call} ${contact.phone}`}>
              <Icon name="phone" />
              {nav.call}
            </a>
            <a href={price} className="nav-call btn btn-cta min-h-11 px-3 text-[14px] whitespace-nowrap">
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
          <p className="t-eyebrow mt-2">{solutions.label}</p>
          <ul className="mt-1 flex flex-col">
            {solutions.items.map((item) => (
              <li key={item.href} className="border-b border-rule">
                <a href={item.href} onClick={close} aria-current={isHere(item.href, path) ? 'page' : undefined} className={bigLink}>
                  <span className="flex items-center gap-3.5">
                    <Icon name={SOLUTION_ICON[item.href] ?? 'arrow'} size={22} className="text-cta" />
                    {item.label}
                  </span>
                  <Arrow className="text-muted" />
                </a>
              </li>
            ))}
          </ul>

          <ul className="mt-5 flex flex-col border-t border-rule">
            {plainLinks.map((item) => (
              <li key={item.href} className="border-b border-rule">
                <a href={item.href} onClick={close} aria-current={isHere(item.href, path) ? 'page' : undefined} className={bigLink}>
                  {item.label}
                  <Arrow className="text-muted" />
                </a>
              </li>
            ))}
          </ul>

          <a href={price} onClick={close} className="btn btn-cta mt-8 w-full">
            {nav.price}
          </a>
          <ContactButtons className="mt-3 flex-col [&>a]:w-full" />
        </nav>
      </div>
    </>
  )
}
