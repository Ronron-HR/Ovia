import { useState } from 'react'
import { flags, paths } from '../../data/site.js'
import ImageSlot from '../ui/ImageSlot.jsx'

const heading = 'font-[family-name:var(--font-display)] font-bold [font-stretch:125%]'

/**
 * Palmy-casen. Komponenten er bevaret, men vises ikke (flags.showPalmy = false):
 * der mangler en adresse til "Besøg siden". Slå den til i src/data/site.js.
 */
export function PalmyCase({ mobile = false }) {
  if (mobile) {
    return (
      <div className="flex w-[62%] flex-none snap-start flex-col gap-[10px]">
        <ImageSlot name="palmy-mobil-karrusel" ratio="9 / 19.5" alt="Palmy Spisested på telefon" />
        <span className="text-[13px]">Rigtig case · Live</span>
        <span className={`${heading} text-[19px] tracking-[-0.02em]`}>Palmy Spisested</span>
      </div>
    )
  }
  return (
    <div className="mt-12 grid items-end gap-14" style={{ gridTemplateColumns: 'minmax(0,8fr) minmax(0,3fr)' }}>
      <div className="grid items-end gap-4" style={{ gridTemplateColumns: 'minmax(0,1fr) 200px' }}>
        <ImageSlot name="palmy-desktop" ratio="16 / 10" alt="Palmy Spisested på computer" />
        <ImageSlot name="palmy-mobil" ratio="9 / 19.5" alt="Palmy Spisested på telefon" />
      </div>
      <div className="flex flex-col gap-[14px] pb-2">
        <span className="text-sm">Rigtig case · Live</span>
        <h3 className="text-[clamp(28px,3vw,44px)] leading-none tracking-[-0.03em]">Palmy Spisested</h3>
        <p className="m-0 text-base leading-normal">Min families restaurant. Siden er live og i brug.</p>
        {/* Adressen mangler: sæt href, når den er klar. */}
        <a href="#" className="text-[15px] font-semibold">
          Besøg siden
        </a>
      </div>
    </div>
  )
}

const concepts = [
  { id: 'restaurant', name: 'Restaurant', href: '/demoer/restaurant/', desktop: 'Restaurantdemo på computer', mobile: 'Restaurantdemo på telefon' },
  { id: 'salon', name: 'Salon', href: '/demoer/salon/', desktop: 'Salondemo på computer', mobile: 'Salondemo på telefon' },
]

function Dots({ count, active }) {
  return (
    <div className="mt-4 flex gap-[6px]" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="h-[3px]"
          style={{
            width: i === active ? 28 : 12,
            background: i === active ? 'var(--ink)' : 'var(--muted)',
            transition: 'width 320ms cubic-bezier(.3,1.5,.5,1), background 200ms ease-out',
          }}
        />
      ))}
    </div>
  )
}

/** Eksempler: koncepter på desktop (to kolonner) og som swipe-karrusel på telefon. */
export default function Examples() {
  const [active, setActive] = useState(0)
  const count = concepts.length + (flags.showPalmy ? 1 : 0)
  const onScroll = (e) => {
    const el = e.currentTarget
    const i = Math.round((el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth)) * (count - 1))
    if (i !== active) setActive(i)
  }
  return (
    <section id="eksempler" aria-labelledby="eksempler-titel" className="bg-surface">
      <div className="mx-auto max-w-[1440px] px-5 pt-14 pb-12 md:px-14 md:pt-[120px] md:pb-32">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3">
          <h2 id="eksempler-titel" className="display t-h2">
            Eksempler
          </h2>
          <a href={paths.demoer} className="flex min-h-12 items-center text-[15px]">
            Se alle eksempler
          </a>
        </div>

        {flags.showPalmy && (
          <div className="hidden md:block">
            <PalmyCase />
          </div>
        )}

        {/* Desktop */}
        <div className="hidden md:block">
          <span className="block text-[15px] font-semibold" style={{ marginTop: flags.showPalmy ? 96 : 40 }}>
            Koncepter. Opdigtet indhold
          </span>
          <div className="mt-6 grid grid-cols-2 gap-10">
            {concepts.map((c, i) => (
              <div key={c.id} className="flex flex-col gap-[14px]" style={{ marginTop: i ? 88 : 0 }}>
                <div className="grid items-end gap-3" style={{ gridTemplateColumns: 'minmax(0,1fr) 130px' }}>
                  <ImageSlot name={`koncept-${c.id}-desktop`} ratio="16 / 10" alt={c.desktop} />
                  <ImageSlot name={`koncept-${c.id}-mobil`} ratio="9 / 19.5" alt={c.mobile} />
                </div>
                <a href={c.href} className={`${heading} w-fit text-xl tracking-[-0.02em] no-underline`}>
                  {c.name}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Telefon */}
        <div className="md:hidden">
          <div
            onScroll={onScroll}
            role="region"
            aria-label="Eksempler, swipe for flere"
            tabIndex={0}
            className="-mx-5 mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-5 pb-1"
            style={{ scrollPaddingInline: 20, scrollbarWidth: 'none' }}
          >
            {flags.showPalmy && <PalmyCase mobile />}
            {concepts.map((c) => (
              <div key={c.id} className="flex w-[62%] flex-none snap-start flex-col gap-[10px]">
                <ImageSlot name={`koncept-${c.id}-telefon`} ratio="9 / 19.5" alt={c.mobile} />
                <span className="text-[13px] text-muted-2">Koncept. Opdigtet indhold</span>
                <a href={c.href} className={`${heading} w-fit text-[19px] tracking-[-0.02em] no-underline`}>
                  {c.name}
                </a>
              </div>
            ))}
            <span className="w-2 flex-none" aria-hidden="true" />
          </div>
          <Dots count={count} active={active} />
        </div>
      </div>
    </section>
  )
}
