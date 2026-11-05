import ImageSlot from '../ui/ImageSlot.jsx'

const heading = 'font-[family-name:var(--font-display)] font-bold [font-stretch:125%]'

const steps = ['Vi mødes', 'Du ser et udkast på din telefon', 'Det går live']

export function Hero() {
  return (
    <section aria-labelledby="hero-titel" className="mx-auto max-w-[1440px] px-5 pt-7 pb-10 md:px-14 md:pt-[120px] md:pb-[136px]">
      <h1
        id="hero-titel"
        className="display display-hero max-w-[12ch] text-[clamp(38px,11.6vw,52px)] md:text-[clamp(64px,9.4vw,152px)]"
      >
        Fra Google til bordet.
      </h1>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-6 md:mt-14 md:ml-[33%] md:gap-7">
        <p className="m-0 max-w-[34ch] text-[17px] leading-[1.45] text-pretty md:text-[clamp(17px,1.5vw,21px)]">
          Hjemmeside og Google-profil til restauranter og caféer i Aarhus, med bordbooking, bestilling og gavekort, hvis I vil have det. Faste priser.
        </p>
        <a href="#prisberegner" className="btn btn-ink hov-ink-soft w-full text-[17px] md:w-auto">
          <span>Se din pris</span>
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  )
}

export function Process() {
  return (
    <section aria-labelledby="proces-titel" className="mx-auto grid max-w-[1440px] gap-7 section-pad px-5 md:grid-cols-[4fr_8fr] md:gap-14 md:px-14">
      <h2 id="proces-titel" className="display t-h2s">
        Sådan foregår det
      </h2>
      <ol className="m-0 grid list-none gap-5 p-0 md:grid-cols-3 md:gap-10">
        {steps.map((text, i) => (
          <li key={text} className="flex items-baseline gap-4 md:flex-col md:items-start md:gap-[14px]">
            <span
              aria-hidden="true"
              className={`${heading} w-9 flex-none text-4xl leading-[.9] tracking-[-0.04em] text-muted md:w-auto md:text-[clamp(48px,5vw,80px)]`}
            >
              {i + 1}
            </span>
            <span className="min-w-0 flex-1 text-[19px] leading-[1.35] font-medium text-pretty">{text}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function About() {
  return (
    <section
      id="om"
      aria-labelledby="om-titel"
      className="mx-auto grid max-w-[1440px] items-end gap-7 px-5 py-16 md:grid-cols-[5fr_6fr] md:gap-14 md:px-14 md:pt-40 md:pb-36"
    >
      <ImageSlot name="portraet-ronny" ratio="4 / 5" width={500} height={625} alt="Ronny Hong" gray fill="bg-surface" className="max-w-[72%] md:max-w-none" />
      <div className="flex flex-col gap-5 md:pb-8">
        <h2 id="om-titel" className="display t-h2 max-w-[14ch]" style={{ lineHeight: 0.98 }}>
          Du taler direkte med den, der bygger din side.
        </h2>
        <p className="m-0 max-w-[44ch] text-[17px] leading-normal text-pretty">
          Vi bygger hjemmesiden, sætter Google-profilen op og tilføjer de funktioner, I vælger. Svar inden for 24 timer.
        </p>
      </div>
    </section>
  )
}
