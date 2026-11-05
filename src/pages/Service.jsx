import Contact from '../components/layout/Contact.jsx'
import ImageSlot from '../components/ui/ImageSlot.jsx'
import prices from '../data/prices.json'
import { includedText, servicePages } from '../data/pages.js'
import { formatKr } from '../lib/calculate.js'

/** Ydelsessiderne følger samme skabelon; data kommer fra prices.json. */
function ServicePage({ k }) {
  const page = servicePages[k]
  const service = prices.services[k]
  const month = service.period === 'month'
  const cheapestDrift = prices.drift.plans[0]
  return (
    <>
      <section
        aria-labelledby="ydelse-titel"
        className={`mx-auto grid max-w-[1440px] items-center gap-7 px-5 pt-7 pb-12 md:gap-14 md:px-14 md:pt-28 md:pb-[120px] ${page.phone ? 'md:grid-cols-[7fr_5fr]' : ''}`}
      >
        <div>
          <h1 id="ydelse-titel" className="display display-hero text-[clamp(36px,11vw,52px)] md:text-[clamp(64px,8vw,128px)]">
            {page.title}
          </h1>
          <p className="mt-5 mb-0 max-w-[30ch] text-[17px] leading-[1.45] text-pretty md:mt-14 md:text-[clamp(17px,1.5vw,21px)]">{page.lead}</p>
          <div className="mt-7 flex">
            <a href={`/?${page.param}=1#prisberegner`} className="btn btn-ink hov-ink-soft w-full text-[17px] md:w-auto">
              <span>Se din pris</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        {page.phone && (
          <ImageSlot
            name="hjemmeside-telefon"
            ratio="9 / 19.5"
            alt="Skærmoptagelse af en hjemmeside på telefon"
            fill="bg-surface"
            className="w-[56%] md:w-[min(260px,100%)] md:justify-self-end"
          />
        )}
      </section>

      <section aria-labelledby="pakker-titel" className="bg-surface">
        <div className="mx-auto max-w-[1440px] section-pad px-5 md:px-14">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 id="pakker-titel" className="display t-h2">
              Tre pakker
            </h2>
            <span className="text-sm whitespace-nowrap text-muted-2">{page.unit}</span>
          </div>
          <div className="mt-7 grid gap-2 md:mt-14 md:grid-cols-3">
            {service.packages.map((p, i) => (
              <div key={p.key} className={`flex flex-col gap-4 p-5 md:p-7 ${p.recommended ? 'bg-ink text-paper' : 'bg-paper text-ink'}`}>
                <div className="flex flex-wrap items-center gap-[10px]">
                  <h3 className="text-[22px] tracking-[-0.02em] whitespace-nowrap">{p.name}</h3>
                  {p.recommended && <span className="bg-paper px-[7px] py-[3px] text-xs font-medium text-ink">Anbefalet</span>}
                </div>
                <span className="price text-xl md:text-2xl">{formatKr(p.price, month)}</span>
                <ul className="m-0 flex list-none flex-col gap-[6px] p-0">
                  {p.points.map((pt) => (
                    <li key={pt} className="text-[15px] leading-[1.4]">
                      – {pt}
                    </li>
                  ))}
                </ul>
                <a
                  href={`/?${page.param}=${i}#prisberegner`}
                  className={`btn mt-auto min-h-[52px] px-[18px] text-[15px] ${p.recommended ? 'btn-white' : 'btn-ink'}`}
                >
                  <span>Vælg {p.name}</span>
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            ))}
          </div>
          {page.note && <p className="mt-5 mb-0 text-sm text-muted-2">{page.note}</p>}
        </div>
      </section>

      {page.drift && (
        <section aria-labelledby="drift-titel" className="mx-auto grid max-w-[1440px] gap-7 section-pad px-5 md:grid-cols-[5fr_7fr] md:gap-14 md:px-14">
          <h2 id="drift-titel" className="display t-h2s">
            Drift fra {formatKr(cheapestDrift.price, true)}
          </h2>
          <div className="flex flex-col gap-4">
            <p className="m-0 max-w-[40ch] text-[17px] leading-normal">
              {includedText}. Ingen binding, 1&nbsp;måneds opsigelse. Domænet står i dit navn.
            </p>
            <a href="/priser/#drift" className="flex min-h-12 items-center text-[15px] font-semibold">
              Se alle driftsplaner
            </a>
          </div>
        </section>
      )}

      <Contact />
    </>
  )
}

export const hjemmeside = () => <ServicePage k="web" />
export const marketing = () => <ServicePage k="mkt" />
export const bookingGoogle = () => <ServicePage k="book" />
