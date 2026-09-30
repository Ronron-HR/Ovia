import Faq from '../components/Faq.jsx'
import Kontakt from '../components/Kontakt.jsx'
import PageHead from '../components/PageHead.jsx'
import { faq, kontakt } from '../content.js'

export default function KontaktPage() {
  return (
    <>
      <PageHead
        under
        eyebrow="Kontakt"
        title="Fortæl om din opgave."
        lead="Du behøver ikke have et færdigt oplæg. Skriv, hvad virksomheden laver, og hvad der driller, så finder vi ud af, hvad der giver mening."
      />
      <Kontakt
        selectable
        eyebrow="Skriv til mig"
        title="Vælg emne, og skriv et par linjer."
        body={kontakt.body}
      />
      <Faq items={faq.items} />
    </>
  )
}
