import { useEffect, useState } from 'react'
import { calcPages, contact, isCurrent, links, navLinks, paths } from '../../data/site.js'
import Logo from '../ui/Logo.jsx'

const heading = 'font-[family-name:var(--font-display)] font-bold [font-stretch:125%]'

/**
 * Navigation. Over 1120 px: links, "Ring" og "Se din pris". Under: "Se din pris" og en
 * "Menu"-knap, der åbner en fuldskærmsmenu (links i Archivo med 35 ms forskydning).
 */
export default function Nav({ path }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const priceHref = calcPages.some((p) => isCurrent(path, p)) ? '#prisberegner' : paths.beregner

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    const onResize = () => window.innerWidth >= 1120 && setOpen(false)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
      document.body.style.overflow = prev
    }
  }, [open])

  return (
    <header className="sticky top-0 z-20 bg-paper">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-6 px-5 md:h-[84px] md:px-14">
        <a href="/" aria-label="OviaSpecs, forside" className="block flex-none">
          <Logo />
        </a>

        <nav aria-label="Hovedmenu" className="hidden gap-7 text-[15px] font-medium whitespace-nowrap nav:flex">
          {navLinks.map((l) => {
            const current = isCurrent(path, l.href)
            return (
              <a
                key={l.href}
                href={l.href}
                aria-current={current ? 'page' : undefined}
                className={current ? 'underline underline-offset-[6px]' : 'no-underline'}
              >
                {l.label}
              </a>
            )
          })}
        </nav>
        <div className="hidden gap-2 nav:flex">
          <a href={links.tel} className="btn btn-surface hov-ink h-12 min-h-12 px-[18px] text-[15px] [--press:.96]">
            Ring {contact.phone}
          </a>
          <a href={priceHref} className="btn btn-ink hov-ink-soft h-12 min-h-12 px-5 text-[15px] [--press:.96]">
            Se din pris
          </a>
        </div>

        <div className="flex gap-2 nav:hidden">
          <a href={priceHref} onClick={close} className="btn btn-ink h-12 min-h-12 px-4 text-[15px] [--press:.94]">
            Se din pris
          </a>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="fuldmenu"
            onClick={() => setOpen((o) => !o)}
            className="press h-12 min-w-16 bg-surface px-[14px] text-[15px] font-semibold [--press:.94]"
          >
            {open ? 'Luk' : 'Menu'}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="fuldmenu"
          aria-label="Menu"
          className="anim-menu fixed top-[72px] right-0 bottom-0 left-0 z-[19] flex flex-col overflow-y-auto bg-paper px-5 pt-4 pb-6 md:top-[84px]"
        >
          <nav aria-label="Menu" className="flex flex-col gap-1">
            {navLinks.map((l, i) => (
              <a
                key={l.href}
                href={l.href}
                onClick={close}
                aria-current={isCurrent(path, l.href) ? 'page' : undefined}
                className={`${heading} anim-link flex min-h-[60px] items-center text-[clamp(24px,7.4vw,32px)] tracking-[-0.03em] no-underline`}
                style={{ animationDelay: `${40 + i * 35}ms` }}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-2 pt-6">
            <a href={links.tel} className="btn btn-surface min-h-14 px-[18px]">
              <span>Ring til Ronny</span>
              <span className="whitespace-nowrap">{contact.phone}</span>
            </a>
            <a href={priceHref} onClick={close} className="btn btn-ink min-h-14 px-[18px]">
              <span>Se din pris</span>
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
