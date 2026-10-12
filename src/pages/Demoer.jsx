import ContactSection from '../components/ContactSection.jsx'
import { WorkflowSketch } from '../components/HomeExamples.jsx'
import { Arrow } from '../components/Shots.jsx'
import Work from '../components/Work.jsx'
import { demos } from '../content.demos.js'
import { home } from '../data/texts.js'

/** /demoer/: de fire koncepter, mærket "Koncept – ikke en kundeopgave". */
export default function Demoer() {
  return (
    <>
      <section className="pt-[calc(var(--nav-h)+36px)] pb-[var(--space-block)] md:pt-[calc(var(--nav-h)+64px)]">
        <div className="shell">
          <div className="grid grid-cols-1 gap-x-14 gap-y-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <h1 data-hero="lift" className="t-display t-hero max-w-[18ch]">
                {demos.title}
              </h1>
              <p data-hero="lift" style={{ '--d': '140ms' }} className="t-body t-lead mt-5 max-w-[52ch]">
                {demos.intro}
              </p>
            </div>
            <div data-hero="fade" style={{ '--d': '200ms' }} className="lg:col-span-5">
              <div className="rounded-[var(--radius-panel)] border border-rule-strong bg-surface p-5 md:p-7">
                <p className="tag">{demos.tag}</p>
                <p className="t-body mt-3 text-[16px]">{demos.note}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Work />

      {demos.workflow && (
        <section aria-labelledby="arbejdsgang-titel" className="section-y bg-paper-2">
          <div className="shell">
            <div data-reveal className="card card-panel grid grid-cols-1 items-center gap-x-14 gap-y-8 p-6 md:p-10 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <p className="tag">{home.examples.workflow.tag}</p>
                <h2 id="arbejdsgang-titel" className="t-display t-h3 mt-4">
                  {demos.workflow.title}
                </h2>
                <p className="t-body t-lead mt-3 max-w-[48ch]">{demos.workflow.text}</p>
                <p className="mt-3 text-[15px] font-medium">{demos.workflow.label}</p>
                <a href={demos.workflow.href} className="btn btn-primary mt-6">
                  {demos.workflow.open}
                  <Arrow />
                </a>
              </div>
              <div className="lg:col-span-6" aria-hidden="true">
                <div className="browser">
                  <WorkflowSketch />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
      <ContactSection form={false} />
    </>
  )
}
