import { about } from '../data/texts.js'
import { Pic } from './Shots.jsx'

/**
 * OM — ærligt og kort: én person, lille virksomhed, du taler med den, der
 * laver arbejdet. Ingen kundetal eller udtalelser.
 */
export default function About() {
  return (
    <section id={about.id} aria-labelledby="om-titel" className="section-y bg-paper-2">
      <div className="shell">
        <div className="grid grid-cols-1 gap-x-16 gap-y-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-4">
            <div className="w-full max-w-[220px] overflow-hidden rounded-[var(--radius-panel)] bg-paper sm:max-w-[280px] lg:max-w-[340px]">
              <Pic image={about.portrait} fallback="jpg" sizes="(min-width: 1024px) 340px, 280px" className="block h-auto w-full" />
            </div>
          </div>

          <div data-reveal className="lg:col-span-7 lg:col-start-6">
            <h2 id="om-titel" className="t-display t-h2 max-w-[22ch]">
              {about.title}
            </h2>
            {about.body.map((p) => (
              <p key={p.slice(0, 24)} className="t-body t-lead mt-5 max-w-[58ch]">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
