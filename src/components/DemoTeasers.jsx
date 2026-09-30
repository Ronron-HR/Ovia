import { ConceptWindow } from '../concepts/index.jsx'
import { calcHref, demos } from '../content.js'
import { Arrow, Browser, Phone } from './Shots.jsx'

/**
 * UDVALGTE DEMOER PÅ FORSIDEN
 *
 * De tre stærkeste, hver som et stort forhåndsvisning (browser med en
 * telefon foran) og få linjer tekst. Alt er "Demo – koncept, ikke
 * kundearbejde". Forhåndsvisningerne er statiske udsnit af illustrationerne,
 * så der ikke tegnes bevægelige scener tre gange på forsiden; de fulde scener
 * ligger på /demoer/.
 */
function Teaser({ project, i }) {
  return (
    <article data-reveal style={{ '--d': `${i * 90}ms` }} className="flex flex-col">
      <a
        href="/demoer/"
        aria-label={`${project.name}: se alle demoer`}
        className="teaser group relative block rounded-[var(--radius-panel)] p-5 pb-9 md:p-6 md:pb-10"
        style={{ background: project.panel }}
      >
        <Browser label={project.label}>
          <ConceptWindow id={project.id} mode="desktop" />
        </Browser>
        <div className="teaser-phone absolute right-5 -bottom-1 w-[26%] min-w-[64px] md:right-6">
          <Phone label={project.labelMobile}>
            <ConceptWindow id={project.id} mode="mobile" />
          </Phone>
        </div>
      </a>

      <div className="mt-5">
        <span className="tag">{demos.tagShort}</span>
        <h3 className="t-display t-h4 mt-3">{project.name}</h3>
        <p className="t-eyebrow mt-1.5">{project.kind}</p>
        <p className="t-body mt-3 max-w-[40ch] text-[15px]">{project.design}</p>
        <a
          href={calcHref({ demo: project.id })}
          className="link-underline hit mt-4 inline-flex items-center gap-1.5 text-[15px] font-medium text-ink"
        >
          {demos.calcCta}
          <Arrow />
        </a>
      </div>
    </article>
  )
}

export default function DemoTeasers({ under = false }) {
  const shown = demos.projects.slice(0, 3)

  return (
    <section
      id="udvalgt-arbejde"
      className={`bg-paper ${under ? 'under-sheet pt-[var(--space-section)]' : ''}`}
    >
      <div className={`shell ${under ? '' : 'section-y'}`}>
        <header data-reveal className="grid grid-cols-1 gap-x-14 gap-y-5 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="t-eyebrow t-eyebrow-accent">{demos.eyebrow}</p>
            <h2 className="t-display t-h2 mt-4 max-w-[20ch]">{demos.homeTitle}</h2>
          </div>
          <div className="lg:col-span-5">
            <p className="t-body t-lead max-w-[46ch]">{demos.homeIntro}</p>
          </div>
        </header>

        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 md:mt-14 md:grid-cols-3">
          {shown.map((p, i) => (
            <Teaser key={p.id} project={p} i={i} />
          ))}
        </div>

        <div data-reveal className="mt-12 flex flex-col gap-4 border-t border-ink pt-6 md:flex-row md:items-center md:justify-between">
          <p className="t-body max-w-[60ch] text-[14px]">
            {demos.tag}. Illustrationerne er tegnet til denne side og bruger intet materiale fra virksomhederne.
          </p>
          <a href={demos.seeAll.href} className="btn btn-ghost shrink-0">
            {demos.seeAll.label}
            <Arrow />
          </a>
        </div>
      </div>
    </section>
  )
}
