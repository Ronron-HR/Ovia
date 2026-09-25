import { ConceptWindow } from '../concepts/index.jsx'
import { ydelser } from '../content.js'
import { Browser } from './Shots.jsx'

/**
 * En konceptillustration af en cafés side med tre markeringer over det, en
 * lokal side skal kunne. Markeringerne peger på det, der faktisk står i
 * illustrationen, og ligger i procent af udsnittet, så de følger med ved
 * enhver bredde.
 */
export default function Annotated() {
  const a = ydelser.hjemmesider.annotated

  return (
    <figure>
      <div className="relative">
        <Browser label={a.ariaLabel}>
          <ConceptWindow id="cafe" mode="desktop" />
        </Browser>
        {a.pins.map((p) => (
          <span
            key={p.n}
            aria-hidden="true"
            className="pin"
            style={{ left: `${p.x}%`, top: `calc(34px + (100% - 34px) * ${p.y / 100})` }}
          >
            {p.n}
          </span>
        ))}
      </div>

      <figcaption className="mt-6 grid gap-x-8 gap-y-4 md:grid-cols-[auto_1fr]">
        <div>
          <p className="t-eyebrow">{a.label}</p>
          <p className="mt-2">
            <span className="tag">{a.caption}</span>
          </p>
        </div>
        <ol className="flex flex-col gap-2.5 text-[15px]">
          {a.pins.map((p) => (
            <li key={p.n} className="flex gap-3">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-[11px] leading-none text-white"
              >
                {p.n}
              </span>
              <span>{p.text}</span>
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  )
}
