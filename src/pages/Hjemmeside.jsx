import Calculator from '../components/calculator/Calculator.jsx'
import Contact from '../components/layout/Contact.jsx'
import prices from '../data/prices.json'
import { googleWork, systemExamples } from '../data/pages.js'
import { priceText } from '../lib/receipt.js'

/**
 * /hjemmeside/: hovedsiden for tilbuddet. Prisberegneren står lige under overskriften (som på forsiden),
 * derefter funktionerne og det, vi gør for Google.
 */
export default function Hjemmeside() {
  return (
    <>
      <section aria-labelledby="ydelse-titel" className="mx-auto max-w-[1440px] px-5 pt-7 pb-10 md:px-14 md:pt-28 md:pb-20">
        <h1 id="ydelse-titel" className="display display-hero text-[clamp(36px,11vw,52px)] md:text-[clamp(64px,8vw,128px)]">
          Hjemmeside
        </h1>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6 md:mt-14 md:ml-[33%]">
          <p className="m-0 max-w-[36ch] text-[17px] leading-[1.45] text-pretty md:text-[clamp(17px,1.5vw,21px)]">
            Hjemmeside og Google-profil til din restaurant eller café, med bordbooking, bestilling, gavekort og mere. Én pakke til en fast pris.
          </p>
          <a href="#prisberegner" className="btn btn-ink hov-ink-soft w-full text-[17px] md:w-auto">
            <span>Se din pris</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <Calculator />

      <section aria-labelledby="site-titel" className="mx-auto grid max-w-[1440px] gap-7 section-pad px-5 md:grid-cols-[5fr_7fr] md:gap-14 md:px-14">
        <h2 id="site-titel" className="display t-h2s">
          {prices.website.title}
        </h2>
        <div>
          <p className="m-0 max-w-[60ch] text-[17px] leading-normal">
            Siden bygges til jer, ikke ud fra en skabelon. I alle pakker er den:
          </p>
          <ul className="m-0 mt-4 flex list-none flex-wrap gap-2 p-0">
            {prices.website.parts.map((part) => (
              <li key={part} className="bg-surface px-4 py-3 text-[15px] leading-[1.3]">
                {part}
              </li>
            ))}
          </ul>
          <p className="mt-4 mb-0 max-w-[60ch] text-[15px] leading-normal">
            {prices.packages.map((p, i) => (
              <span key={p.key}>
                {i ? ' · ' : ''}
                {p.name}: {p.pages.charAt(0).toLowerCase() + p.pages.slice(1)}
              </span>
            ))}
            .
          </p>
        </div>
      </section>

      <section id="systemer" aria-labelledby="systemer-titel" className="scroll-mt-20 bg-surface md:scroll-mt-24">
        <div className="mx-auto max-w-[1440px] section-pad px-5 md:px-14">
          <h2 id="systemer-titel" className="display t-h2">
            Funktioner, der passer til jer
          </h2>
          <p className="mt-4 mb-0 max-w-[48ch] text-[17px] leading-normal text-pretty">
            Vi sætter funktionerne op eller kobler jeres egen udbyder på, fx DinnerBooking eller easyTable til bordbooking.
          </p>
          <ul className="m-0 mt-7 grid list-none gap-2 p-0 md:mt-12 md:grid-cols-2 lg:grid-cols-3">
            {prices.systems.standard.map((s) => (
              <li key={s.key} className="flex flex-col gap-2 bg-paper p-5 md:p-6">
                <h3 className="text-xl tracking-[-0.02em]">{s.name}</h3>
                <p className="m-0 text-[15px] leading-normal">{s.desc}</p>
              </li>
            ))}
            <li className="flex flex-col gap-3 bg-ink p-5 text-paper md:col-span-2 md:p-6 lg:col-span-1">
              <h3 className="text-xl tracking-[-0.02em]">{prices.systems.custom.name}</h3>
              <p className="m-0 text-[15px] leading-normal text-on-ink-2">{prices.systems.custom.desc}</p>
              <ul className="m-0 flex list-none flex-col gap-[6px] p-0">
                {systemExamples.map((e) => (
                  <li key={e} className="text-[15px] leading-normal">
                    – {e}
                  </li>
                ))}
              </ul>
            </li>
          </ul>
          <div className="mt-7 bg-paper p-5 md:max-w-[760px] md:p-6">
            <h3 className="text-xl tracking-[-0.02em]">Har I allerede en hjemmeside?</h3>
            <p className="mt-2 mb-0 text-[15px] leading-normal">
              Så kan I få funktionerne alene. {prices.systemOnly.note} Almindelig funktion: {priceText({ once: prices.systemOnly.standard.once, monthly: prices.systemOnly.standard.monthly })} pr. stk.
              Bygget specielt til jer: {priceText({ once: prices.systemOnly.custom.once, monthly: prices.systemOnly.custom.monthly })} pr. stk.
            </p>
            <a href="#prisberegner" className="btn btn-ink hov-ink-soft mt-4 w-full md:w-auto">
              <span>Beregn prisen på et system</span>
              <span aria-hidden="true">↑</span>
            </a>
          </div>
          <p className="mt-5 mb-0 max-w-[60ch] text-sm leading-normal text-muted-2">
            {prices.systems.thirdParty} {prices.systems.excluded}
          </p>
        </div>
      </section>

      <section aria-labelledby="google-titel" className="mx-auto grid max-w-[1440px] gap-7 section-pad px-5 md:grid-cols-[5fr_7fr] md:gap-14 md:px-14">
        <h2 id="google-titel" className="display t-h2s">
          Bliv fundet på Google
        </h2>
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {googleWork.map((g) => (
            <li key={g} className="bg-surface px-5 py-4 text-base leading-[1.4]">
              {g}
            </li>
          ))}
        </ul>
      </section>

      <Contact />
    </>
  )
}
