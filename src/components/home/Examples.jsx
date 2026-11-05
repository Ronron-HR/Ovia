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
      <div className="flex w-[85%] flex-none snap-start flex-col gap-[10px]">
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

/**
 * Koncepterne på forsiden. Ét kort pr. koncept med et fast, lavt billedformat (16 / 9). Billedet er pladsens fil
 * (koncept-<id>-desktop i src/assets/billeder); findes den ikke, vises udsnittet af selve konceptets skærmbillede
 * (public/demoer/<id>-udsnit-desktop.webp, 14–18 kB), så kortet aldrig er en tom flade.
 */
const concepts = [
  { id: 'restaurant', name: 'Restaurant', line: 'Menukort i faner og bordbestilling.', href: '/demoer/restaurant/', alt: 'Restaurantdemo' },
  { id: 'salon', name: 'Salon', line: 'Behandlinger, priser og booking.', href: '/demoer/salon/', alt: 'Salondemo' },
]

function ConceptCard({ c }) {
  return (
    <article className="flex flex-col gap-3">
      <a href={c.href} tabIndex={-1} aria-hidden="true" className="block no-underline">
        <ImageSlot name={`koncept-${c.id}-desktop`} ratio="16 / 9" alt="" fallback={`/demoer/${c.id}-udsnit-desktop.webp`} width={680} height={383} />
      </a>
      <div className="flex flex-col gap-1">
        <h3 className="text-xl tracking-[-0.02em]">{c.name}</h3>
        <p className="m-0 text-[15px] leading-[1.4]">{c.line}</p>
      </div>
      <a href={c.href} className="flex min-h-12 w-fit items-center gap-2 text-[15px] font-semibold" aria-label={`Åbn demo: ${c.alt}`}>
        <span>Åbn demo</span>
        <span aria-hidden="true">→</span>
      </a>
    </article>
  )
}

function Dots({ count, active }) {
  return (
    <div className="mt-3 flex gap-[6px]" aria-hidden="true">
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

/**
 * Eksempler: kortene side om side i én række på desktop og en vandret swipe-karrusel på telefon (kortene er ca. 85 %
 * af bredden, så det næste kigger frem). Hele sektionen fylder højst ca. én skærm.
 */
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
      <div className="mx-auto max-w-[1440px] px-5 pt-12 pb-10 md:px-14 md:pt-20 md:pb-20">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
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

        <span className="mt-2 block text-[15px] font-semibold md:mt-8">Koncepter. Opdigtet indhold</span>

        {/* Desktop: i én række */}
        <div className="mt-5 hidden grid-cols-2 gap-10 md:grid">
          {concepts.map((c) => (
            <ConceptCard key={c.id} c={c} />
          ))}
        </div>

        {/* Telefon: swipe-karrusel */}
        <div className="md:hidden">
          <div
            onScroll={onScroll}
            role="region"
            aria-label="Eksempler, swipe for flere"
            tabIndex={0}
            className="-mx-5 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-5 pb-1"
            style={{ scrollPaddingInline: 20, scrollbarWidth: 'none' }}
          >
            {flags.showPalmy && <PalmyCase mobile />}
            {concepts.map((c) => (
              <div key={c.id} className="w-[85%] flex-none snap-start">
                <ConceptCard c={c} />
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
