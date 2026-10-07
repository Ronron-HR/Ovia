import ContactSection from '../components/ContactSection.jsx'
import Work from '../components/Work.jsx'
import { demos } from '../content.demos.js'

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
      <ContactSection form={false} />
    </>
  )
}
