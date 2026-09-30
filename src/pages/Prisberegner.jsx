import Calculator from '../components/Calculator.jsx'
import Faq from '../components/Faq.jsx'
import { ContactCta } from '../components/Kontakt.jsx'
import PageHead from '../components/PageHead.jsx'
import { calc } from '../content.js'

export default function PrisberegnerPage() {
  return (
    <>
      <PageHead eyebrow="Prisberegner" title={calc.title} lead={calc.intro} />
      <section className="bg-paper pb-[var(--space-block)]">
        <div className="shell">
          <Calculator />
        </div>
      </section>
      <Faq items={calc.faq} title="Om prisen." eyebrow="Spørgsmål" id="om-prisen" under />
      <ContactCta />
    </>
  )
}
