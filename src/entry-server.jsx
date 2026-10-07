import { renderToString } from 'react-dom/server'
import { contact, driftPlanList, services, tierName } from './data/pricing.js'
import Privatlivspolitik from './components/Privatlivspolitik.jsx'
import Site from './Site.jsx'
import { pages } from './pages.jsx'
import { pageFiles, pageKeyFor } from './pageKeys.js'
import { routes } from './routes.js'

/**
 * Bruges kun ved build: scripts/prerender.mjs kalder disse og lægger
 * resultatet ind i dist/. Komponenterne må derfor ikke røre window eller
 * document, mens de renderes — det hører til i useEffect.
 */
export { routes }
export { pageFiles, pageKeyFor }
export const renderPage = (path) => {
  const Page = pages[pageKeyFor(path)]
  return renderToString(<Site path={path} Page={Page} />)
}
export const renderPrivacy = () => renderToString(<Privatlivspolitik />)

/**
 * Strukturerede data for forsiden (JSON-LD), bygget ud fra pricing.js, så
 * priserne kun står ét sted. Kun det, der står på siden: navn, mail, telefon
 * og pakker (hjemmesidepakkerne og driftsplanerne som hver sine tilbud). Ingen
 * adresse, ingen ratings, ingen udtalelser.
 */
export const organisationLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': 'https://oviaspecs.com/#organisation',
  name: 'OviaSpecs',
  url: 'https://oviaspecs.com/',
  image: 'https://oviaspecs.com/og.jpg',
  email: contact.email,
  telephone: contact.phoneHref,
  description: 'Hjemmesider, marketing og booking til lokale virksomheder.',
  founder: { '@type': 'Person', name: contact.name },
  areaServed: { '@type': 'Country', name: 'Danmark' },
  knowsLanguage: 'da',
  makesOffer: [
    ...Object.values(services).flatMap((service) =>
      service.tiers.map((tier) => ({
        '@type': 'Offer',
        name: `${service.name}: ${tierName(tier)}`,
        description: tier.features.join(', '),
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          price: tier.price,
          priceCurrency: 'DKK',
          ...(service.billing === 'monthly' ? { unitCode: 'MON' } : {}),
        },
        itemOffered: { '@type': 'Service', name: service.name },
      })),
    ),
    // Hjemmesidens drift er et særskilt valg pr. måned, uafhængigt af pakken.
    ...driftPlanList.map((plan) => ({
      '@type': 'Offer',
      name: `${services.hjemmeside.name}, drift: ${plan.name}`,
      description: [...services.hjemmeside.drift.included, plan.content].join(', '),
      priceSpecification: { '@type': 'UnitPriceSpecification', price: plan.monthly, priceCurrency: 'DKK', unitCode: 'MON' },
      itemOffered: { '@type': 'Service', name: `${services.hjemmeside.name}, drift` },
    })),
  ],
})
