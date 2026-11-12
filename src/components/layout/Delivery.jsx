import prices from '../../data/prices.json'

/** "Hvor lang tid tager det?": to tider, hvad kunden skal levere, og at rettelsesrunder er med. Tallene står i prices.json (delivery). */
export default function Delivery() {
  const d = prices.delivery
  return (
    <section id="levering" aria-labelledby="levering-titel" className="mx-auto max-w-[1440px] scroll-mt-20 px-5 pb-12 md:scroll-mt-[152px] md:px-14 md:pb-16">
      <h2 id="levering-titel" className="display t-h2s">
        Hvor lang tid tager det?
      </h2>
      <div className="mt-5 grid gap-2 md:max-w-[900px] md:grid-cols-2">
        {[
          [d.siteWeeks, 'Hjemmeside', d.siteNote],
          [d.functionsWeeks, 'Hjemmeside med funktioner', d.functionsNote],
        ].map(([weeks, label, note]) => (
          <div key={label} className="flex flex-col gap-2 bg-surface p-5 md:p-6">
            <span className="font-[family-name:var(--font-display)] text-[clamp(28px,4vw,40px)] leading-none font-bold tracking-[-0.03em]">{weeks}</span>
            <span className="text-base font-semibold">{label}</span>
            <span className="text-[15px] leading-normal">{note}</span>
          </div>
        ))}
      </div>
      <ul className="m-0 mt-4 flex list-none flex-col gap-2 p-0 md:max-w-[900px]">
        {[d.startsWhen, d.provide, d.rounds].map((t) => (
          <li key={t} className="px-1 text-[15px] leading-normal">
            {t}
          </li>
        ))}
      </ul>
    </section>
  )
}
