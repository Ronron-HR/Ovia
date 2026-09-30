import { demos } from '../content.js'
import { Arrow } from './Shots.jsx'
import DemoVisual, { DemoActions } from './DemoVisual.jsx'

/**
 * DEMOER PÅ FORSIDEN OG HJEMMESIDESIDEN
 *
 * De fire fiktive demoer, hver med et skærmbillede af selve demoen (browser med
 * en telefon foran), få linjer tekst og to handlinger: "Åbn demo" åbner den
 * rigtige, fungerende demo, og "Beregn en lignende hjemmeside" tager demovalget
 * med til beregneren. Alt er mærket "Fiktiv demo – koncept udviklet af
 * OviaSpecs, ikke kundearbejde."
 */
function Teaser({ project, i }) {
  return (
    <article id={`demo-${project.id}`} data-reveal style={{ '--d': `${(i % 2) * 90}ms` }} className="flex flex-col">
      <a
        href={project.path}
        aria-label={`${project.name}: åbn demoen`}
        className="block"
        tabIndex={-1}
      >
        <DemoVisual project={project} />
      </a>

      <div className="mt-5">
        <span className="tag">{demos.tagShort}</span>
        <h3 className="t-display t-h4 mt-3">{project.name}</h3>
        <p className="t-eyebrow mt-1.5">{project.kind}</p>
        <p className="t-body mt-3 max-w-[46ch] text-[15px]">{project.design}</p>
        <DemoActions project={project} className="mt-5" />
      </div>
    </article>
  )
}

export default function DemoTeasers({ under = false }) {
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

        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 md:mt-14 md:grid-cols-2">
          {demos.projects.map((p, i) => (
            <Teaser key={p.id} project={p} i={i} />
          ))}
        </div>

        <div data-reveal className="mt-12 flex flex-col gap-4 border-t border-ink pt-6 md:flex-row md:items-center md:justify-between">
          <p className="t-body max-w-[64ch] text-[14px]">
            {demos.tag} Skærmbillederne er taget af demoerne selv.
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
