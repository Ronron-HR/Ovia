import { useId, useRef, useState } from 'react'
import { useScene } from '../motion/useScene.js'

/**
 * Fælles dele til demoerne: faner, menu-/prislister og lokale formularer.
 * Alt er lokalt: formularerne sender intet og reserverer intet. Hver handling
 * viser en tydelig besked om det (Notice).
 */

/**
 * Demoens øverste flade. Illustrationen (data-par) glider en anelse langsommere
 * end siden, mens man scroller forbi (useScene, mode "leave"): kun transform,
 * kun mens fladen er nær skærmen, slået fra på telefon og ved reduceret bevægelse.
 */
export function DemoHero({ children }) {
  const ref = useRef(null)
  useScene(ref, { mode: 'leave', mobile: false })
  return (
    <section ref={ref} className="dm-hero">
      {children}
    </section>
  )
}

/** Besked ved en handling. Pladsen er altid i siden, så skærmlæsere når at lytte med. */
export function Notice({ notice }) {
  return (
    <div role="status" aria-live="polite">
      {notice && (
        <p className="dm-notice dm-rise">
          <strong>{notice.title}</strong>
          {notice.text}
        </p>
      )}
    </div>
  )
}

/**
 * Faner med piletaster (venstre/højre, Home, End). `children` får id'et på den
 * aktive fane og returnerer panelets indhold.
 */
export function Tabs({ tabs, label, children }) {
  const uid = useId()
  const [active, setActive] = useState(tabs[0].id)
  const refs = useRef({})

  const move = (index) => {
    const next = tabs[(index + tabs.length) % tabs.length]
    setActive(next.id)
    refs.current[next.id]?.focus()
  }

  const onKeyDown = (e, i) => {
    if (e.key === 'ArrowRight') move(i + 1)
    else if (e.key === 'ArrowLeft') move(i - 1)
    else if (e.key === 'Home') move(0)
    else if (e.key === 'End') move(tabs.length - 1)
    else return
    e.preventDefault()
  }

  return (
    <div>
      <div role="tablist" aria-label={label} className="dm-tabs">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[t.id] = el
            }}
            type="button"
            role="tab"
            id={`${uid}-tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`${uid}-panel`}
            tabIndex={active === t.id ? 0 : -1}
            className="dm-tab"
            onClick={() => setActive(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${uid}-panel`}
        aria-labelledby={`${uid}-tab-${active}`}
        tabIndex={0}
        key={active}
        className="dm-rise"
      >
        {children(active)}
      </div>
    </div>
  )
}

/** Liste med varer: navn, tekst og pris. */
export function ItemList({ items, columns = 1, meta = false }) {
  return (
    <ul className={`dm-list ${columns === 2 ? 'dm-list-2' : ''}`}>
      {items.map((it) => (
        <li key={it.name} className="dm-item">
          <h3 className="dm-h3">{it.name}</h3>
          <span className="dm-price">{it.price}</span>
          {it.text && <p>{it.text}</p>}
          {meta && it.meta && <p className="dm-meta">{it.meta}</p>}
        </li>
      ))}
    </ul>
  )
}

/** Et felt med etiket og fejl. */
export function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="dm-label">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="dm-error">
          {error}
        </p>
      )}
    </div>
  )
}

export const errProps = (id, error) => ({
  'aria-invalid': error ? true : undefined,
  'aria-describedby': error ? `${id}-error` : undefined,
})

/**
 * Lokal formular: tjekker de obligatoriske felter og viser så en besked om, at
 * intet er sendt. `summary(values)` bygger beskeden.
 */
export function useDemoForm({ required, summary }) {
  const form = useRef(null)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null)

  const submit = (event) => {
    event.preventDefault()
    const data = new FormData(form.current)
    const values = Object.fromEntries([...data.entries()].map(([k, v]) => [k, String(v).trim()]))
    const found = {}
    for (const [name, message] of Object.entries(required)) {
      if (!values[name]) found[name] = message
    }
    setErrors(found)
    const first = Object.keys(found)[0]
    if (first) {
      setNotice(null)
      form.current.elements[first]?.focus()
      return
    }
    setNotice(summary(values))
  }

  return { form, errors, notice, submit, setNotice }
}
