import { demoById, demos } from '../content.demos.js'
import { home } from '../data/texts.js'
import { Arrow } from './Shots.jsx'

/**
 * EKSEMPLER LIGE UNDER BEREGNEREN — to af de egne, fiktive demoer (src/content.demos.js).
 * Hvert kort har en stor forhåndsvisning (beskåret udsnit af demoens computervisning
 * i en browserramme med mærket "Demo", og telefonvisningen foran), en linje om, hvem
 * demoen passer til, og en tydelig knap. Hele kortet er ét link (se .example-link).
 * Billederne er beskårne udsnit uden OviaSpecs-striben (scripts/demo-shots.mjs
 * --crops-only), lazy og med fast størrelse. Intet er en kundecase: det står i
 * mærket og i noten.
 * Beregnerens valg står i adresselinjen, så "Tilbage til OviaSpecs" i demoen og
 * browserens tilbage-knap fører tilbage til samme trin (se DemoShell.jsx).
 */
export default function HomeExamples() {
  const ex = home.examples
  return (
    <section id="eksempler" data-tour="examples" aria-labelledby="eksempler-titel" className="section-y">
      <div className="shell">
        <header data-reveal className="max-w-[48rem]">
          <h2 id="eksempler-titel" className="t-display t-h2">
            {ex.title}
          </h2>
          <p className="t-body t-lead mt-3 max-w-[56ch]">{ex.note}</p>
        </header>

        <ul className="mt-8 grid grid-cols-1 gap-5 md:mt-10 md:gap-6 lg:grid-cols-2">
          {ex.items.map(({ id, fits, preview }, i) => {
            const p = demoById(id)
            if (!p) return null
            return (
              <li key={id} data-reveal style={{ '--d': `${i * 90}ms` }} className="example">
                <div className="example-preview">
                  <div className="browser example-browser" aria-hidden="true">
                    <div className="browser-bar">
                      <i />
                      <i />
                      <i />
                      <span className="tag">{ex.tag}</span>
                    </div>
                    <img
                      src={preview.desktop.src}
                      width={preview.desktop.width}
                      height={preview.desktop.height}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="phone example-phone" aria-hidden="true">
                    <img
                      src={preview.mobile.src}
                      width={preview.mobile.width}
                      height={preview.mobile.height}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </div>

                <div className="example-body">
                  <h3 className="t-display t-h4">{p.name}</h3>
                  <p className="t-body mt-2 max-w-[44ch] text-[16px]">{fits}</p>
                  <div className="mt-auto pt-6">
                    <a href={p.path} className="example-link btn btn-primary">
                      {ex.open}
                      <Arrow />
                      <span className="sr-only"> ({p.name})</span>
                    </a>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <p className="mt-6 md:mt-8">
          <a href={demos.seeAll.href} className="btn-text inline-flex items-center gap-2">
            {ex.all}
            <Arrow />
          </a>
        </p>
      </div>
    </section>
  )
}
