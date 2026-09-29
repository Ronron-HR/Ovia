import { useEffect, useRef, useState } from 'react'
import { ConceptWindow } from '../concepts/index.jsx'
import { work } from '../content.js'
import { Arrow } from './Shots.jsx'
import Stage from './Stage.jsx'

/**
 * ARBEJDE
 *
 * Sektionen er en mørk flade, der skubber ind over ydelserne (.sheet), så
 * scenerne og de tre designretningers egne farver står frem. Hvert projekt er
 * en scene (Stage) i sin egen komposition, så det ikke bliver tre ens kort:
 *
 *   Salonkoncept    bred flade, skærm til venstre og telefon foran
 *   Restaurantkoncept skærmen står til højre, telefonen nederst til venstre
 *   Cafékoncept     telefonen er hovedpersonen, skærmen står bag
 *
 * Under hver scene står tre udsnit af siden (Excerpts): de er statiske, så
 * arbejdet kan vurderes uden at ramme et bestemt scrollpunkt, og de er der
 * også med reduceret bevægelse og uden JavaScript. Teksten er holdt kort:
 * opgaven og to ting, der faktisk er lavet.
 *
 * Alt er "Demo / koncept" og står ikke som kunder eller anbefalinger.
 * Illustrationerne er tegnet til siden og bruger intet materiale fra
 * virksomhederne (se src/concepts/kit.jsx).
 */
function Excerpts({ project, wide = false }) {
  // Udsnittene tegnes først, når de nærmer sig skærmen: ni illustrationer på
  // én gang lige efter indlæsning gav et langt hak. Indtil da er det en tom,
  // låst ramme med samme højde, så siden ikke hopper. Uden IntersectionObserver
  // tegnes de med det samme.
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
      <p className="t-eyebrow">{work.labels.views}</p>
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
        <dt className="t-eyebrow">{work.labels.task}</dt>
        <dd className="t-body mt-2 max-w-[44ch] text-[15px]">{project.task}</dd>
      </div>
      <div className="mt-6">
        <dt className="t-eyebrow">{work.labels.made}</dt>
        <dd className="mt-2">
          <ul className="spec-list max-w-[50ch]">
            {project.made.map((m) => (
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

function OpenLink({ project }) {
  if (!work.showDemoLinks) return null
  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      className="btn btn-ghost min-h-11 whitespace-nowrap"
    >
      {work.open}
      <Arrow />
      <span className="sr-only"> ({project.name}, åbner i et nyt vindue)</span>
    </a>
  )
}

function Title({ project }) {
  return (
    <div>
      <span className="tag">{work.tag}</span>
      <h3 className="t-display t-h3 mt-4">{project.name}</h3>
      <p className="t-eyebrow mt-2">{project.kind}</p>
    </div>
  )
}

export default function Work() {
  const [salon, belli, cafe] = work.projects

  return (
    <section
      id={work.id}
      className="sheet on-dark relative bg-ink text-paper"
    >
      <div className="shell relative z-10 pt-[var(--space-section)] pb-[var(--space-section)]">
        <header data-reveal className="max-w-[54ch]">
          <p className="t-eyebrow t-eyebrow-accent">{work.eyebrow}</p>
          <h2 className="t-display t-h2 mt-4">{work.title}</h2>
          <p className="t-lead mt-5 max-w-[52ch] text-paper/75">{work.intro}</p>
        </header>

        {/* Salonkoncept: sidens store eksempel. */}
        <article className="mt-12 md:mt-16">
          <Stage project={salon} />
          <Excerpts project={salon} wide />
          <div className="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <Title project={salon} />
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <Facts project={salon} />
              <div className="mt-7">
                <OpenLink project={salon} />
              </div>
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
              <div className="mt-7">
                <OpenLink project={belli} />
              </div>
            </div>
          </article>

          <article className="lg:col-span-5 lg:mt-32">
            <Stage project={cafe} />
            <div className="mt-8">
              <Title project={cafe} />
              <Excerpts project={cafe} />
              <Facts project={cafe} className="mt-8" />
              <div className="mt-7">
                <OpenLink project={cafe} />
              </div>
            </div>
          </article>
        </div>

        <div className="mt-20 max-w-[64ch] border-t border-paper/20 pt-5 text-[14px] leading-relaxed text-paper/70">
          <p>{work.note}</p>
          {!work.showDemoLinks && <p className="mt-2">{work.more}</p>}
        </div>
      </div>
    </section>
  )
}
