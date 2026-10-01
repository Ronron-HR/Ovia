import ConceptGrid from '../components/ConceptGrid.jsx'
import FreeCheck from '../components/FreeCheck.jsx'
import PilotSection from '../components/PilotSection.jsx'
import ServicePage from '../components/ServicePage.jsx'
import { flags } from '../data/pricing.js'
import { bookingGoogle as bg, hjemmeside as web, marketing as mk } from '../data/services.js'

/** Ydelsessiderne deler skabelon og ét modul (én fil at hente). */
export const hjemmeside = () => <ServicePage page={web} extra={<ConceptGrid {...web.concepts} />} />

/** Så længe der ikke er marketingcases (flags.hasMarketingCases), vises pilotforløbet. */
export const marketing = () => (
  <ServicePage page={mk} extra={flags.hasMarketingCases ? null : <PilotSection text={mk.pilot} />} />
)

export const bookingGoogle = () => <ServicePage page={bg} extra={<FreeCheck text={bg.check} />} />
