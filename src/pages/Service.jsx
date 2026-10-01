import ConceptGrid from '../components/ConceptGrid.jsx'
import ServicePage from '../components/ServicePage.jsx'
import { hjemmeside as web } from '../data/services.js'

/** Ydelsessiderne deler skabelon og ét modul (én fil at hente). */
export const hjemmeside = () => <ServicePage page={web} extra={<ConceptGrid {...web.concepts} />} />
