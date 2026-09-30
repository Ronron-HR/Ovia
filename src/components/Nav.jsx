import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { nav, site } from '../content.js'
import { useScrolled } from '../motion/useScrolled.js'
import Logo from './Logo.jsx'
import { Arrow } from './Shots.jsx'

/**
 * NAVIGATION
 *
 * Mærke til venstre, seks punkter og en fremhævet knap ("Beregn din pris")
 * til højre. Marketing og Integrationer har hver en rullemenu; resten er
 * almindelige links til egne sider. Den side, man står på, markeres med
 * aria-current="page" og en bronzestreg under ordet.
 *
 * RULLEMENUER: knappen åbner og lukker (aria-expanded). Med mus åbner de også
 * ved hover, og de lukker igen med Escape, ved klik udenfor, og når fokus
 * forlader dem. Panelerne ligger altid i HTML'en (skjult med visibility), så
 * de kan læses af søgemaskiner og uden JavaScript findes de samme links i
 * bunden af siden.
 *
 * MOBIL (under lg): ordet "Menu" i stedet for et ikon. Overlayet er et
 * SØSKENDE til baren, ikke et barn af den, så et fixed overlay ikke bliver
 * målt mod baren. Baren ligger i z-50 over overlayet, så mærket og "Luk"
 * står det samme sted, uanset om menuen er åben. Menuen lukker med Escape og
 * "Luk"; fokus fanges, mens den er åben, og går tilbage til knappen. Menuen
 * kan rulle, og der er ingen faste knapper, der dækker indhold.
 */

const FOCUSABLE = 'a[href], button:not([disabled])'

const clean = (p) => (p || '/').replace(/\/+$/, '') || '/'
const isHere = (href, path) => clean(href) === clean(path)

function Group({ item, path }) {
  const [open, setOpen] = useState(false)
  const box = useRef(null)
  const timer = useRef(0)
  const id = useId()
  const here = item.children.some((c) => isHere(c.href, path))

  const hoverCapable = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        box.current?.querySelector('button')?.focus()
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const enter = () => {
    if (!hoverCapable()) return
    window.clearTimeout(timer.current)
    setOpen(true)
  }
  const leave = () => {
    if (!hoverCapable()) return
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setOpen(false), 140)
  }

  return (
    <li
      ref={box}
      className="dd relative"
      data-open={open}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onBlur={(e) => {
        if (!box.current?.contains(e.relatedTarget)) setOpen(false)
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-current={here ? 'page' : undefined}
        onClick={() => setOpen((o) => (hoverCapable() ? true : !o))}
        className="nav-link flex min-h-11 cursor-pointer items-center gap-1.5 text-[14px] font-medium"
      >
        <span className="nav-label">{item.label}</span>
        <svg aria-hidden="true" viewBox="0 0 12 12" width="10" height="10" className="dd-caret" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 4.5 6 8l3.5-3.5" />
        </svg>
      </button>

      <div id={id} className="dd-panel absolute top-full left-1/2 z-50 w-[320px] -translate-x-1/2 pt-2">
        <ul className="rounded-[14px] border border-rule bg-surface p-2 shadow-[0_18px_40px_-18px_rgb(37_37_37/0.35)]">
          {item.children.map((child) => (
            <li key={child.href}>
              <a
                href={child.href}
                aria-current={isHere(child.href, path) ? 'page' : undefined}
                className="dd-link block rounded-[10px] px-3.5 py-3"
              >
                <span className="block text-[15px] font-medium text-ink">{child.label}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-muted">{child.text}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

export default function Nav({ path }) {
  const scrolled = useScrolled()
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

    // Body-scroll låses, mens menuen er åben.
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
      <header
        ref={header}
        data-scrolled={scrolled}
        className="nav fixed inset-x-0 top-0 z-50 bg-paper/[0.97]"
      >
        <div className="nav-bar shell flex h-[var(--nav-h)] items-center justify-between gap-6">
          <a href="/" onClick={close} aria-label={`${nav.brand}, til forsiden`} className="inline-flex min-h-11 items-center text-ink">
            <Logo className="block h-[26px]" />
          </a>

          <div className="hidden items-center gap-7 lg:flex xl:gap-9">
            <nav aria-label="Hovednavigation">
              <ul className="flex items-center gap-6 xl:gap-8">
                {nav.items.map((item) =>
                  item.children ? (
                    <Group key={item.label} item={item} path={path} />
                  ) : (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        aria-current={isHere(item.href, path) ? 'page' : undefined}
                        className="nav-link flex min-h-11 items-center text-[14px] font-medium"
                      >
                        <span className="nav-label">{item.label}</span>
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </nav>

            <a href={nav.cta.href} className="btn btn-accent min-h-11 px-5 text-[14px]">
              {nav.cta.label}
            </a>
          </div>

          <button
            ref={button}
            type="button"
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen((v) => !v)}
            className="-mr-2 inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-end px-2 text-[15px] font-medium text-ink lg:hidden"
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
        className="menu-overlay fixed inset-0 z-40 overflow-y-auto bg-paper lg:hidden"
      >
        <nav aria-label="Mobilmenu" className="shell flex min-h-full flex-col pt-[calc(var(--nav-h)+12px)] pb-8">
          <ul className="flex flex-col">
            {nav.items.map((item) =>
              item.children ? (
                <li key={item.label} className="border-b border-rule py-3">
                  <p className="t-display text-[26px] leading-tight">{item.label}</p>
                  <ul className="mt-1 flex flex-col">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <a
                          href={child.href}
                          onClick={close}
                          aria-current={isHere(child.href, path) ? 'page' : undefined}
                          className="flex min-h-11 items-center justify-between gap-4 text-[16px] text-muted aria-[current=page]:text-ink"
                        >
                          {child.label}
                          <Arrow className="text-accent" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={item.href} className="border-b border-rule">
                  <a
                    href={item.href}
                    onClick={close}
                    aria-current={isHere(item.href, path) ? 'page' : undefined}
                    className="t-display flex min-h-14 items-center justify-between gap-4 text-[26px] leading-tight aria-[current=page]:text-accent"
                  >
                    {item.label}
                    <Arrow className="text-accent" />
                  </a>
                </li>
              ),
            )}
          </ul>

          <div className="mt-6">
            <a href={nav.cta.href} onClick={close} className="btn btn-accent w-full">
              {nav.cta.label}
            </a>

            <ul className="mt-4 flex flex-col text-[15px]">
              <li>
                <a href={`mailto:${site.email}`} className="link-underline inline-block py-2.5 text-ink">
                  {site.email}
                </a>
              </li>
              <li>
                <a href={`tel:${site.phoneHref}`} className="link-underline inline-block py-2.5 text-ink">
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
