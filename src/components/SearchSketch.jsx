import { ydelser } from '../content.js'

/**
 * Skitse af en søgning, der viser de tre veje til at blive fundet: annoncen
 * (betalt), virksomhedens profil (organisk) og hjemmesidens eget resultat
 * (SEO). Numrene svarer til rækkerne ved siden af. HTML og CSS med
 * opdigtet indhold og et neutralt udseende — den er en forklaring, ikke et
 * skærmbillede af nogens arbejde, og er mærket "Skitse".
 */
function Pin({ n, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute z-10 flex h-6 w-6 items-center justify-center rounded-full bg-accent font-mono text-[12px] leading-none text-white ring-2 ring-white ${className}`}
    >
      {n}
    </span>
  )
}

export default function SearchSketch() {
  const s = ydelser.synlighed.search

  return (
    <figure>
      <div className="backdrop">
        <div className="mx-auto max-w-[440px] rounded-2xl bg-white p-4 shadow-[0_24px_48px_-24px_rgb(16_19_23/0.35),0_2px_4px_rgb(16_19_23/0.08)] md:p-5" role="img" aria-label={s.label}>
          <div aria-hidden="true">
            {/* Søgefelt */}
            <div className="flex items-center gap-3 rounded-full border border-rule px-4 py-2.5 text-[14px]">
              <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-muted">
                <circle cx="7" cy="7" r="4.5" />
                <path d="M10.5 10.5 14 14" />
              </svg>
              {s.query}
            </div>

            {/* 3: annonce */}
            <div className="relative mt-4 rounded-lg p-3 pl-3">
              <Pin n={3} className="-top-2 -left-2" />
              <p className="flex items-center gap-2 text-[12px] text-muted">
                <span className="rounded-sm border border-ink px-1 font-mono text-[10px] leading-4 tracking-wide text-ink uppercase">
                  {s.ad.tag}
                </span>
                {s.ad.url}
              </p>
              <p className="mt-1 text-[16px] font-medium text-ink">{s.ad.title}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-muted">{s.ad.text}</p>
            </div>

            {/* 1: profil */}
            <div className="relative mt-2 rounded-xl border border-rule bg-paper p-3">
              <Pin n={1} className="-top-2 -left-2" />
              <div className="flex gap-3">
                <div className="h-14 w-14 shrink-0 rounded-lg bg-paper-2" />
                <div>
                  <p className="text-[15px] font-semibold">{s.brand}</p>
                  <p className="text-[12px] text-muted">
                    {s.profile.kind} · {s.profile.hours}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.profile.actions.map((a) => (
                  <span key={a} className="rounded-full border border-rule bg-white px-3 py-1 text-[12px]">
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* 2: organisk resultat */}
            <div className="relative mt-3 rounded-lg p-3">
              <Pin n={2} className="-top-2 -left-2" />
              <p className="text-[12px] text-muted">{s.organic.url}</p>
              <p className="mt-1 text-[16px] font-medium text-ink">{s.organic.title}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-muted">{s.organic.text}</p>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-4">
        <p className="t-eyebrow">{s.label}</p>
        <p className="t-body mt-2 max-w-[44ch] text-[13px]">{s.note}</p>
      </figcaption>
    </figure>
  )
}
