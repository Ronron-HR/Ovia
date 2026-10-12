import { demoById, demos } from '../content.demos.js'
import { home } from '../data/texts.js'
import { Arrow } from './Shots.jsx'

/**
 * EKSEMPLER LIGE UNDER HEROEN: to af de egne, fiktive demoer (src/content.demos.js)
 * og et kort til arbejdsgangsdemoen (/systemer/#demo).
 *
 * Hvert kort har en stor forhåndsvisning, en linje om, hvem det passer til, og en
 * tydelig knap; hele kortet er ét link (se .card-link). Demokortene viser et
 * beskåret udsnit af demoens computervisning i en browserramme med mærket "Demo", og
 * telefonvisningen foran. Billederne er beskårne udsnit uden OviaSpecs-striben
 * (scripts/demo-shots.mjs --crops-only), lazy og med fast størrelse. Arbejdsgangskortet
 * har ingen skærmbillede: forhåndsvisningen er en tegnet skitse (aria-hidden) af
 * overblikket med statuschips. Intet er en kundecase: det står i mærket og i noten.
 */
export default function HomeExamples({ tone = 'grey' }) {
  const ex = home.examples
  const wf = ex.workflow
  return (
    <section
      id="eksempler"
      data-tour="examples"
      aria-labelledby="eksempler-titel"
      className={`section-y ${tone === 'grey' ? 'bg-paper-2' : 'bg-paper'}`}
    >
      <div className="shell">
        <header data-reveal className="max-w-[48rem]">
          <h2 id="eksempler-titel" className="t-display t-h2">
            {ex.title}
          </h2>
          <p className="t-body t-lead mt-3 max-w-[60ch]">{ex.note}</p>
        </header>

        <ul className="mt-8 grid grid-cols-1 gap-5 md:mt-10 md:gap-6 lg:grid-cols-3">
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
                    <a href={p.path} className="card-link btn btn-primary">
                      {ex.open}
                      <Arrow />
                      <span className="sr-only"> ({p.name})</span>
                    </a>
                  </div>
                </div>
              </li>
            )
          })}

          {wf && (
            <li data-reveal style={{ '--d': `${ex.items.length * 90}ms` }} className="example">
              <div className="example-preview">
                <div className="browser example-browser" aria-hidden="true">
                  <div className="browser-bar">
                    <i />
                    <i />
                    <i />
                    <span className="tag">{wf.tag}</span>
                  </div>
                  <WorkflowSketch />
                </div>
              </div>

              <div className="example-body">
                <h3 className="t-display t-h4">{wf.title}</h3>
                <p className="t-body mt-2 max-w-[44ch] text-[16px]">{wf.text}</p>
                <p className="mt-2 text-[14px] font-medium text-ink">{wf.label}</p>
                <div className="mt-auto pt-6">
                  <a href={wf.href} className="card-link btn btn-primary">
                    {wf.open}
                    <Arrow />
                    <span className="sr-only"> ({wf.title})</span>
                  </a>
                </div>
              </div>
            </li>
          )}
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

/**
 * Skitse af arbejdsgangsdemoens overblik: tre rækker med en stribe tekst og en
 * statuschip. Kun tegning (aria-hidden i forælderen); statusnavnene er dem, demoen bruger.
 */
export function WorkflowSketch() {
  const rows = [
    { chip: 'Ny', accent: true, w: ['62%', '38%'] },
    { chip: 'Besvaret', w: ['54%', '30%'] },
    { chip: 'Tilbud sendt', w: ['70%', '44%'] },
  ]
  return (
    <div className="sketch">
      {rows.map((r) => (
        <div key={r.chip} className="sketch-row">
          <span className="sketch-lines">
            <i style={{ width: r.w[0] }} />
            <i style={{ width: r.w[1] }} />
          </span>
          <span className={`chip ${r.accent ? 'chip-accent' : ''}`}>{r.chip}</span>
        </div>
      ))}
    </div>
  )
}
