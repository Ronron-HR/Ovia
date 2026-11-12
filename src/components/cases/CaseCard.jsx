const heading = 'font-[family-name:var(--font-display)] font-bold [font-stretch:125%]'

/**
 * Case-kort til /cases: navn, branche og by, det leverede som mærker og et link til casen.
 * Hele kortet er ét link. Kortet læser kun fra en post i src/data/cases.js, så flere cases er flere poster.
 * Hover: teksten vender (ink på hvid → hvid på ink), som sitets øvrige hover-flader.
 */
export default function CaseCard({ c }) {
  return (
    <article>
      <a
        href={c.path}
        aria-label={`Læs casen: ${c.name}`}
        className="press group flex flex-col justify-between gap-10 bg-paper p-5 no-underline transition-colors duration-[180ms] ease-out [--press:.99] md:min-h-[360px] md:p-10 md:hover:bg-ink md:hover:text-paper"
      >
        <div className="flex flex-col gap-3">
          <span className="text-[15px] font-semibold">
            {c.kind} · {c.city}
          </span>
          <h2 className={`${heading} text-[clamp(28px,8vw,40px)] leading-none tracking-[-0.03em] md:text-[clamp(32px,3.6vw,56px)]`}>{c.name}</h2>
          <p className="m-0 max-w-[36ch] text-[17px] leading-[1.45]">{c.line}</p>
          <ul className="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
            {c.tags.map((t) => (
              <li key={t} className="bg-surface px-3 py-2 text-[15px] leading-[1.2] text-ink">
                {t}
              </li>
            ))}
          </ul>
        </div>
        <span className="flex min-h-12 items-center gap-2 text-base font-semibold">
          Læs casen <span aria-hidden="true">→</span>
        </span>
      </a>
    </article>
  )
}
