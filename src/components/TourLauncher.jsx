import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { tour } from '../data/tour.js'
import '../tour.css'

/**
 * "Vis mig rundt": den synlige indgang til rundvisningen. Placeres af designet i heroen:
 *   import TourLauncher from './TourLauncher.jsx'
 *   <TourLauncher className="…" />
 *
 * Hjælp kun på brugerens eget initiativ: der er ingen automatisk invitation, ingen
 * timer og ingen lagring. Rundvisningen starter først, når knappen trykkes, og kan
 * aldrig dukke op midt i en anden opgave (fx beregneren eller guiden).
 *
 * Selve rundvisningen (Tour.jsx) hentes først, når den startes (dynamic import).
 * Serveren renderer kun knappen: den korte besked ("intet at vise") lægges i
 * document.body efter montering, så intet her rører window under render
 * (forudrendering, scripts/prerender.mjs).
 */

const loadTour = () => import('./Tour.jsx')
const Tour = lazy(loadTour)

/** Klient-flag uden effekt: false ved forudrendering og hydrering, true bagefter. */
const subscribeNone = () => () => {}

/** Fanger fejl i den hentede rundvisning (fx hentning der fejler), så siden forbliver brugbar. */
class Guard extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onFail()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function TourLauncher({ className = '' }) {
  const mounted = useSyncExternalStore(subscribeNone, () => true, () => false)
  const [active, setActive] = useState(false)
  const [note, setNote] = useState(null)
  const button = useRef(null)
  const wasActive = useRef(false)

  // En kort besked ("intet at vise") forsvinder igen af sig selv.
  useEffect(() => {
    if (!note) return
    const timer = setTimeout(() => setNote(null), tour.noteTime)
    return () => clearTimeout(timer)
  }, [note])

  // Efter lukning er siden tilgængelig igen (Tour fjerner inert i sin oprydning): fokus tilbage til knappen.
  useEffect(() => {
    if (active) wasActive.current = true
    else if (wasActive.current) {
      wasActive.current = false
      button.current?.focus({ preventScroll: true })
    }
  }, [active])

  const start = () => {
    setNote(null)
    setActive(true)
  }

  const close = useCallback((reason) => {
    setActive(false)
    if (reason === 'none') setNote(tour.text.nothing)
  }, [])

  const fail = useCallback(() => {
    setActive(false)
    setNote(tour.text.failed)
  }, [])

  return (
    <>
      <button
        ref={button}
        type="button"
        className={className}
        data-tour-launcher
        aria-haspopup="dialog"
        onClick={start}
        onPointerEnter={loadTour}
        onFocus={loadTour}
      >
        {tour.text.launcher}
      </button>

      {mounted &&
        note &&
        !active &&
        createPortal(
          <div className="tour-invite tour-note" role="status" data-tour-note>
            <p className="tour-invite-body">{note}</p>
          </div>,
          document.body,
        )}

      {active && (
        <Guard onFail={fail}>
          <Suspense fallback={null}>
            <Tour onClose={close} />
          </Suspense>
        </Guard>
      )}
    </>
  )
}
