import Contact from '../components/layout/Contact.jsx'
import { demos } from '../content.demos.js'

const heading = 'font-[family-name:var(--font-display)] font-bold [font-stretch:125%]'

/** /demoer/ (Eksempler): de fire koncepter, mærket "Koncepter. Opdigtet indhold". */
export default function Demoer() {
  return (
    <>
      <section aria-labelledby="demoer-titel" className="mx-auto max-w-[1440px] px-5 pt-7 pb-8 md:px-14 md:pt-28 md:pb-20">
        <h1 id="demoer-titel" className="display display-hero text-[clamp(40px,12vw,56px)] md:text-[clamp(72px,9vw,140px)]">
          Eksempler
        </h1>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-6 md:mt-14 md:ml-[33%]">
          <p className="m-0 max-w-[36ch] text-[17px] leading-[1.45] text-pretty md:text-[clamp(17px,1.5vw,21px)]">
            Fire små hjemmesider, du kan prøve på din telefon. {demos.localNote}
          </p>
        </div>
      </section>

      <section aria-labelledby="koncepter-titel" className="bg-surface">
        <div className="mx-auto max-w-[1440px] px-5 pt-12 pb-14 md:px-14 md:pt-24 md:pb-32">
          <h2 id="koncepter-titel" className="m-0 text-[15px] font-semibold [font-family:var(--font-body)] [font-stretch:100%] tracking-normal">
            Koncepter. Opdigtet indhold
          </h2>
          <ul className="m-0 mt-6 grid list-none gap-x-10 gap-y-12 p-0 md:grid-cols-2 md:gap-y-20">
            {demos.projects.map((p) => (
              <li key={p.id} id={`demo-${p.id}`} className="flex scroll-mt-24 flex-col gap-[14px]">
                <a href={p.path} className="grid items-end gap-3 no-underline" style={{ gridTemplateColumns: 'minmax(0,1fr) 28%' }} aria-label={`${p.name}. ${demos.open}`}>
                  <img
                    src={p.desktop.src}
                    alt={p.label}
                    width={p.desktop.width}
                    height={p.desktop.height}
                    loading="lazy"
                    decoding="async"
                    className="w-full bg-paper object-cover object-top"
                    style={{ aspectRatio: '16 / 10' }}
                  />
                  <img
                    src={p.mobile.src}
                    alt={p.labelMobile}
                    width={p.mobile.width}
                    height={p.mobile.height}
                    loading="lazy"
                    decoding="async"
                    className="w-full bg-paper object-cover object-top"
                    style={{ aspectRatio: '9 / 19.5' }}
                  />
                </a>
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <h3 className={`${heading} m-0 text-xl tracking-[-0.02em]`}>{p.kind}</h3>
                  <a href={p.path} className="flex min-h-12 items-center text-[15px] font-semibold">
                    {demos.open} →
                  </a>
                </div>
                <p className="m-0 max-w-[46ch] text-[15px] leading-normal">{p.task}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Contact />
    </>
  )
}
