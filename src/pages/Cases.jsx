import CaseCard from '../components/cases/CaseCard.jsx'
import Breadcrumb from '../components/cases/Breadcrumb.jsx'
import CaseCta from '../components/cases/CaseCta.jsx'
import Contact from '../components/layout/Contact.jsx'
import { cases } from '../data/cases.js'
import { paths } from '../data/site.js'

/** /cases/: overblik over cases. Ét kort pr. post i src/data/cases.js. */
export default function Cases() {
  return (
    <>
      <section aria-labelledby="cases-titel" className="mx-auto max-w-[1440px] px-5 pt-2 pb-10 md:px-14 md:pt-16 md:pb-20">
        <Breadcrumb
          items={[
            ['Forside', paths.home],
            ['Cases', paths.cases],
          ]}
        />
        <h1 id="cases-titel" className="display mt-5 md:mt-10 display-hero text-[clamp(40px,12vw,56px)] md:text-[clamp(72px,9vw,140px)]">
          Cases
        </h1>
        <p className="mt-5 mb-0 max-w-[36ch] text-[17px] leading-[1.45] text-pretty md:mt-14 md:ml-[33%] md:text-[clamp(17px,1.5vw,21px)]">
          Her kan du se, hvad vi har bygget til en restaurant.
        </p>
      </section>

      <section aria-label="Cases" className="bg-surface">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-12 md:px-14 md:py-24">
          {cases.map((c) => (
            <CaseCard key={c.slug} c={c} />
          ))}
        </div>
      </section>

      <CaseCta />
      <Contact />
    </>
  )
}
