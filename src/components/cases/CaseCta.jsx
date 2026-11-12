import { paths } from '../../data/site.js'

/** "Vil du have det samme?": knapper til prisberegneren og kontakten. Bruges nederst på /cases og på casesiderne. */
export default function CaseCta({ id = 'case-cta-titel', title = 'Vil du have det samme til din restaurant?', surface = false }) {
  return (
    <section aria-labelledby={id} className={surface ? 'bg-surface' : undefined}>
     <div className="mx-auto max-w-[1440px] section-pad px-5 md:px-14">
      <h2 id={id} className="display t-h2 max-w-[18ch]">
        {title}
      </h2>
      <div className="mt-7 flex flex-col gap-2 md:mt-12 md:max-w-[640px] md:flex-row">
        <a href={paths.beregner} className="btn btn-ink hov-ink-soft w-full text-[17px] md:flex-1">
          <span>Se din pris</span>
          <span aria-hidden="true">→</span>
        </a>
        <a href="#kontakt" className="btn btn-surface w-full text-[17px] md:flex-1">
          <span>Kontakt</span>
          <span aria-hidden="true">↓</span>
        </a>
      </div>
     </div>
    </section>
  )
}
