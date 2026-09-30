import { useEffect, useRef, useState } from 'react'
import { ConceptWindow } from '../concepts/index.jsx'
import { calcHref, demos } from '../content.js'
import { Arrow } from './Shots.jsx'
import Stage from './Stage.jsx'

/**
 * DEMOER (siden /demoer/)
 *
 * En mørk flade (.sheet), så scenerne og designretningernes egne farver står
 * frem. Hvert projekt er en scene (Stage) i sin egen komposition, så det ikke
 * bliver fire ens kort:
 *
 *   Frisør- og barberdemo   bred flade, skærm til venstre og telefon foran
 *   Restaurantdemo          skærmen til højre, telefonen nederst til venstre
 *   Cafédemo                telefonen er hovedpersonen, skærmen står bag
 *   Vinbardemo              bred flade som den første
 *
 * Under hver scene står tre udsnit af siden (Excerpts): de er statiske, så
 * arbejdet kan vurderes uden at ramme et bestemt scrollpunkt, og de er der
 * også med reduceret bevægelse. Alt er "Demo – koncept, ikke kundearbejde".
 *
 * Illustrationerne er tegnet til siden og bruger intet materiale fra
 * virksomhederne (se src/concepts/kit.jsx). "Se live-demo" vises kun, når
 * demos.showLiveLinks er true. "Beregn en lignende hjemmeside" åbner
 * beregneren med demoens branche og formål valgt; kunden kan ændre dem.
 */
function Excerpts({ project, wide = false }) {
  // Udsnittene tegnes først, når de nærmer sig skærmen: mange illustrationer
  // på én gang lige efter indlæsning gav et langt hak. Indtil da er det en
  // tom, låst ramme med samme højde, så siden ikke hopper.
  const box = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      const t = setTimeout(() => setReady(true), 0)
      return () => clearTimeout(t)
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setReady(true)
        observer.disconnect()
      },
      { rootMargin: '700px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={box} className="mt-6 md:mt-8">
      <p className="t-eyebrow">{demos.labels.views}</p>
      <ul className="mt-3 grid grid-cols-3 gap-3 md:gap-4">
        {project.excerpts.map((e) => (
          <li key={e.label} className="excerpt">
            {ready ? (
              <ConceptWindow id={project.id} mode="desktop" at={e.y} />
            ) : (
              <div className="scroll-view" style={{ background: 'rgb(255 255 255 / 0.06)' }} />
            )}
            <p className="mt-2 text-[13px] leading-snug font-medium text-paper">{e.label}</p>
            <p className={`mt-0.5 text-[13px] leading-snug text-paper/70 ${wide ? '' : 'hidden sm:block'}`}>{e.text}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Facts({ project, className = '' }) {
  return (
    <dl className={className}>
      <div>
        <dt className="t-eyebrow">{demos.labels.task}</dt>
        <dd className="t-body mt-2 max-w-[46ch] text-[15px]">{project.task}</dd>
      </div>
      <div className="mt-5">
        <dt className="t-eyebrow">{demos.labels.design}</dt>
        <dd className="t-body mt-2 max-w-[46ch] text-[15px]">{project.design}</dd>
      </div>
      <div className="mt-6">
        <dt className="t-eyebrow">{demos.labels.features}</dt>
        <dd className="mt-2">
          <ul className="spec-list max-w-[52ch]">
            {project.features.map((m) => (
              <li key={m}>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </dd>
      </div>
    </dl>
  )
}

/** Handlinger til en demo: live-demo (kun hvis slået til) og beregneren. */
export function DemoActions({ project, className = '' }) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap ${className}`}>
      <a href={calcHref({ demo: project.id })} className="btn btn-primary min-h-11">
        {demos.calcCta}
        <Arrow />
      </a>
      {demos.showLiveLinks && (
        <a
          href={project.href}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost min-h-11 whitespace-nowrap"
        >
          {demos.open}
          <Arrow />
          <span className="sr-only"> ({project.name}, åbner i et nyt vindue)</span>
        </a>
      )}
    </div>
  )
}

function Title({ project }) {
  return (
    <div>
      <span className="tag">{demos.tag}</span>
      <h3 className="t-display t-h3 mt-4">{project.name}</h3>
      <p className="t-eyebrow mt-2">{project.kind}</p>
    </div>
  )
}

export default function Work() {
  const [salon, belli, cafe, vinbar] = demos.projects

  return (
    <section id={demos.id} className="sheet on-dark relative bg-ink text-paper">
      <div className="shell relative z-10 pt-[var(--space-section)] pb-[var(--space-section)]">
        {/* Frisør- og barberdemo: sidens store eksempel. */}
        <article>
          <Stage project={salon} />
          <Excerpts project={salon} wide />
          <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Title project={salon} />
              <DemoActions project={salon} className="mt-7" />
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <Facts project={salon} />
            </div>
          </div>
        </article>

        {/* Restaurant og café: to bredder, to højder. */}
        <div className="mt-20 grid grid-cols-1 gap-x-10 gap-y-20 md:mt-28 lg:grid-cols-12">
          <article className="lg:col-span-7">
            <Stage project={belli} />
            <div className="mt-8">
              <Title project={belli} />
              <Excerpts project={belli} />
              <Facts project={belli} className="mt-8" />
              <DemoActions project={belli} className="mt-7" />
            </div>
          </article>

          <article className="lg:col-span-5 lg:mt-32">
            <Stage project={cafe} />
            <div className="mt-8">
              <Title project={cafe} />
              <Excerpts project={cafe} />
              <Facts project={cafe} className="mt-8" />
              <DemoActions project={cafe} className="mt-7" />
            </div>
          </article>
        </div>

        {/* Vinbardemo: bred flade, tekst og udsnit i omvendt rækkefølge. */}
        <article className="mt-20 md:mt-28">
          <Stage project={vinbar} />
          <Excerpts project={vinbar} wide />
          <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <Facts project={vinbar} />
            </div>
            <div className="lg:col-span-5 lg:col-start-8">
              <Title project={vinbar} />
              <DemoActions project={vinbar} className="mt-7" />
            </div>
          </div>
        </article>

        <div className="mt-20 max-w-[64ch] border-t border-paper/20 pt-5 text-[14px] leading-relaxed text-paper/70">
          <p>{demos.note}</p>
          {!demos.showLiveLinks && <p className="mt-2">{demos.more}</p>}
        </div>
      </div>
    </section>
  )
}
