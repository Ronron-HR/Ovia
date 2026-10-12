import ContactButtons from '../components/ContactButtons.jsx'
import ContactSection from '../components/ContactSection.jsx'
import Icon from '../components/Icon.jsx'
import WorkflowDemo from '../components/WorkflowDemo.jsx'
import { systems } from '../data/offer.js'

/**
 * /systemer/: små systemer til én arbejdsgang, og kun hvis den findes.
 *
 * Rækkefølge: overskrift med modulets status (ærligt og synligt fra start) ·
 * jeg spørger først · tre eksempler (med og uden) · sikkerhed og pris ·
 * arbejdsgangsdemoen (id="demo", med synlig disclaimer) · kontakt. Teksterne står i src/data/offer.js (systems).
 *
 * Arbejdsgangsdemoen (WorkflowDemo.jsx) er mærket Demo i sektionen og i selve komponenten.
 */

const QUESTION_ICON = ['inbox', 'search', 'clock', 'workflow']

export default function Systemer() {
  const s = systems
  return (
    <>
      <section className="hero" aria-labelledby="systemer-titel">
        <div className="shell">
          <div className="grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-7">
              <p data-hero="fade" className="t-eyebrow t-eyebrow-strong">
                {s.eyebrow}
              </p>
              <h1 id="systemer-titel" data-hero="lift" style={{ '--d': '40ms' }} className="t-display t-hero mt-3 max-w-[16ch]">
                {s.title}
              </h1>
              <p data-hero="lift" style={{ '--d': '100ms' }} className="t-body t-lead mt-5 max-w-[56ch] md:mt-6">
                {s.lead}
              </p>
              <div data-hero="fade" style={{ '--d': '160ms' }} data-callbar-hide>
                <ContactButtons stretch className="mt-7 md:mt-8" />
              </div>
            </div>

            <div data-hero="fade" style={{ '--d': '200ms' }} className="lg:col-span-5">
              <div className="card card-panel p-6 md:p-8" role="group" aria-labelledby="status-titel">
                <p id="status-titel" className="tag">
                  {s.status.label}
                </p>
                <p className="mt-4 text-[16px] leading-relaxed">{s.status.text}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="spoerg-titel" className="section-y bg-paper-2">
        <div className="shell">
          <header data-reveal className="max-w-[48rem]">
            <h2 id="spoerg-titel" className="t-display t-h2">
              {s.questionsFirst.title}
            </h2>
            <p className="t-body t-lead mt-3 max-w-[58ch]">{s.questionsFirst.note}</p>
          </header>
          <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:mt-10 lg:grid-cols-4">
            {s.questionsFirst.items.map((q, i) => (
              <li key={q} data-reveal style={{ '--d': `${i * 60}ms` }} className="card flex flex-col gap-4 p-5 md:p-6">
                <span className="icon-tile">
                  <Icon name={QUESTION_ICON[i] ?? 'info'} size={22} />
                </span>
                <span className="text-[18px] leading-snug font-medium">{q}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="eksempler-systemer-titel" className="section-y bg-paper">
        <div className="shell">
          <header data-reveal className="max-w-[48rem]">
            <h2 id="eksempler-systemer-titel" className="t-display t-h2">
              {s.examplesTitle}
            </h2>
            {s.examplesIntro && <p className="t-body t-lead mt-3 max-w-[58ch]">{s.examplesIntro}</p>}
          </header>

          <ul className="mt-8 grid grid-cols-1 gap-5 md:mt-10 lg:grid-cols-3 lg:gap-6">
            {s.examples.map((ex, i) => (
              <li key={ex.id} data-reveal style={{ '--d': `${i * 80}ms` }} className="flex">
                <article className="card flex w-full flex-col p-6 md:p-7" aria-labelledby={`ex-${ex.id}`}>
                  <h3 id={`ex-${ex.id}`} className="t-display t-h4">
                    {ex.title}
                  </h3>
                  <p className="t-body mt-3 text-[16px]">{ex.fits}</p>

                  <p className="mode-label">Det er med</p>
                  <ul className="spec-list !border-0 !pt-2">
                    {ex.includes.map((line) => (
                      <li key={line}>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>

                  <p className="mode-label">Det er ikke med</p>
                  <ul className="x-list pt-2">
                    {ex.notIncluded.map((line) => (
                      <li key={line}>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>

                  {ex.skipIf && (
                    <div className="mt-auto pt-6">
                      <p className="flex gap-2.5 border-t border-rule pt-5 text-[15px] text-muted">
                        <Icon name="info" size={18} className="mt-0.5" />
                        <span>{ex.skipIf}</span>
                      </p>
                    </div>
                  )}
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="sikkerhed-titel" className="section-y bg-paper">
        <div className="shell">
          <div className="grid grid-cols-1 gap-x-14 gap-y-12 lg:grid-cols-12">
            <div data-reveal className="lg:col-span-6">
              <h2 id="sikkerhed-titel" className="t-display t-h3">
                {s.safety.title}
              </h2>
              <ul className="rows mt-6 text-[16px] leading-relaxed">
                {s.safety.items.map((item) => (
                  <li key={item.slice(0, 40)} className="flex gap-3">
                    <Icon name="shield" size={20} className="mt-0.5 text-cta" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div data-reveal style={{ '--d': '80ms' }} className="lg:col-span-5 lg:col-start-8">
              <div className="card card-panel p-6 md:p-8">
                <h2 className="t-display t-h3">{s.pricing.title}</h2>
                <p className="t-body mt-4 text-[16px] leading-relaxed">{s.pricing.text}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="demo" aria-labelledby="demo-titel" className="section-y bg-paper-2">
        <div className="shell">
          <header data-reveal className="max-w-[48rem]">
            <p className="tag">{s.demo.label}</p>
            <h2 id="demo-titel" className="t-display t-h2 mt-4">
              {s.demo.title}
            </h2>
            <p className="t-body t-lead mt-3 max-w-[58ch]">{s.demo.intro}</p>
          </header>
          <div className="callout mt-6 max-w-[48rem]">
            <Icon name="info" size={20} className="mt-0.5 text-cta" />
            <p className="text-[16px] font-medium">{s.demo.disclaimer}</p>
          </div>
          <div className="mt-7 md:mt-9">
            <WorkflowDemo />
          </div>
        </div>
      </section>

      <ContactSection title={s.contact.title} body={s.contact.body} form={false} />
    </>
  )
}
