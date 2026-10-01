import { demos } from '../content.demos.js'
import DemoVisual, { DemoActions } from './DemoVisual.jsx'

/**
 * DEMOER (siden /demoer/)
 *
 * De fire koncepter, ét ad gangen: skærmbillede af selve demoen på
 * demoens egen farve, hvad den handler om, hvordan den ser ud, og hvad den kan.
 * "Åbn demo" åbner den rigtige, fungerende demo (/demoer/<navn>/), og
 * "Se priser på en hjemmeside" fører til beregneren.
 *
 * Alt er mærket "Koncept – ikke en kundeopgave". Koncepterne bruger intet
 * materiale fra rigtige virksomheder.
 */
function Facts({ project }) {
  return (
    <dl>
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

export default function Work() {
  return (
    <section id={demos.id} className="bg-paper pb-[var(--space-section)]">
      <div className="shell flex flex-col gap-20 md:gap-28">
        {demos.projects.map((p, i) => (
          <article key={p.id} id={`demo-${p.id}`} className="grid grid-cols-1 gap-x-12 gap-y-8 lg:grid-cols-12 lg:items-center">
            <div className={`lg:col-span-7 ${i % 2 ? 'lg:order-2' : ''}`}>
              <DemoVisual project={p} eager={i === 0} />
            </div>
            <div className={`lg:col-span-5 ${i % 2 ? 'lg:order-1' : ''}`}>
              <span className="tag">{demos.tagShort}</span>
              <h2 className="t-display t-h3 mt-4">{p.name}</h2>
              <p className="t-eyebrow mt-2">{p.kind}</p>
              <div className="mt-6">
                <Facts project={p} />
              </div>
              <DemoActions project={p} className="mt-7" />
            </div>
          </article>
        ))}

        <div className="max-w-[70ch] border-t border-ink pt-5 text-[14px] leading-relaxed text-muted">
          <p className="font-medium text-ink">{demos.tag}</p>
          <p className="mt-2">{demos.note}</p>
          <p className="mt-2">{demos.localNote}</p>
        </div>
      </div>
    </section>
  )
}
