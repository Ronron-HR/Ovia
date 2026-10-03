import { demos } from '../content.demos.js'
import { Arrow } from './Shots.jsx'

/**
 * EKSEMPLER — de fire fiktive hjemmesider (koncepter). Over listen står én
 * linje om, at de ikke er kundeopgaver; hvert kort har det korte mærke
 * "Koncept" og fører til selve eksemplet.
 * Billedet er toppen af konceptets mobilskærmbillede i en telefonramme på
 * konceptets egen farve.
 */
export default function ConceptGrid({ eyebrow, title, intro, more }) {
  return (
    <section aria-labelledby="koncepter-titel" className="section-y bg-paper">
      <div className="shell">
        <header data-reveal className="grid grid-cols-1 gap-x-14 gap-y-4 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-6">
            <p className="t-eyebrow t-eyebrow-accent">{eyebrow}</p>
            <h2 id="koncepter-titel" className="t-display t-h2 mt-4">
              {title}
            </h2>
          </div>
          <p className="t-body t-lead max-w-[46ch] lg:col-span-6">{intro}</p>
        </header>

        <p className="mt-8 text-[15px] font-medium md:mt-10">{demos.listNote}</p>
        <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 md:mt-12 lg:grid-cols-4 lg:gap-x-6">
          {demos.projects.map((p, i) => (
            <li key={p.id} data-reveal style={{ '--d': `${i * 60}ms` }}>
              <a href={p.path} className="concept group block">
                <span className="concept-stage" style={{ '--panel': p.panel }}>
                  <span className="concept-phone">
                    <img
                      src={p.mobile.src}
                      width={p.mobile.width}
                      height={p.mobile.height}
                      alt={p.labelMobile}
                      loading="lazy"
                      decoding="async"
                    />
                  </span>
                </span>
                <span className="tag mt-4">{demos.tagShort}</span>
                <span className="mt-2.5 flex items-center gap-2 text-[16px] font-medium">
                  {p.name}
                  <Arrow className="transition-transform duration-200 group-hover:translate-x-1" />
                </span>
                <span className="t-body block text-[14px]">{p.kind}</span>
              </a>
            </li>
          ))}
        </ul>

        <a href={demos.seeAll.href} className="btn btn-ghost mt-10">
          {more}
          <Arrow />
        </a>
      </div>
    </section>
  )
}
