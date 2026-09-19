import { ydelser } from '../content.js'

/**
 * Standard-reveal og intet andet. Ingen unikke idéer her — det er netop
 * kontrasten til de fem momenter, der får dem til at virke.
 */
export default function Ydelser() {
  return (
    <section id={ydelser.id} className="bg-paper">
      <div className="shell py-24 md:py-36">
        <header className="max-w-[46ch]">
          <p data-reveal className="t-eyebrow eyebrow-rule">
            {ydelser.eyebrow}
          </p>
          <h2
            data-reveal="lg"
            style={{ '--d': '60ms' }}
            className="t-display mt-5 text-[clamp(30px,5.2vw,54px)]"
          >
            {ydelser.title}
          </h2>
          <p data-reveal style={{ '--d': '120ms' }} className="t-body mt-5 text-[16px]">
            {ydelser.intro}
          </p>
        </header>

        {/* Hairline pr. punkt frem for gap-px på grid'et: med et ulige
            antal punkter efterlod gap-teknikken en tom celle, der stod
            og lyste som en fejl. Det her holder ved ethvert antal. */}
        <ul className="mt-14 grid gap-x-8 gap-y-10 md:mt-20 md:grid-cols-3">
          {ydelser.items.map((item, i) => (
            <li
              key={item.title}
              data-reveal
              style={{ '--d': `${Math.min(i, 4) * 60}ms` }}
              className="border-t border-rule pt-6"
            >
              <h3 className="t-display text-[26px] md:text-[32px]">{item.title}</h3>
              <p className="t-body mt-3 max-w-[42ch] text-[15px]">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
