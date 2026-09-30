import { ContactCta } from '../components/Kontakt.jsx'
import PageHead from '../components/PageHead.jsx'
import Work from '../components/Work.jsx'
import { demos } from '../content.js'

export default function Demoer() {
  return (
    <>
      <PageHead
        under
        eyebrow={demos.eyebrow}
        title={demos.title}
        lead={demos.intro}
        aside={
          <div className="rounded-[var(--radius-panel)] border border-rule bg-surface p-5 md:p-6">
            <p className="t-eyebrow">Sådan skal du læse demoerne</p>
            <p className="t-body mt-3 text-[15px]">{demos.note}</p>
          </div>
        }
      />
      <Work />
      <ContactCta />
    </>
  )
}
