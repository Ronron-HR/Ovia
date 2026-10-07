import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { canRemember, readChoice, tour, writeChoice } from '../data/tour.js'
import '../tour.css'

/**
 * "Vis mig rundt": den synlige indgang til rundvisningen plus en diskret
 * invitation ved første besøg. Placeres af designet i heroen:
 *   import TourLauncher from './TourLauncher.jsx'
 *   <TourLauncher className="…" />
 *
 * Selve rundvisningen (Tour.jsx) hentes først, når den startes (dynamic import).
 * Serveren renderer kun knappen: invitationen og rundvisningen lægges i
 * document.body efter montering, så intet her rører window eller localStorage
 * under render (forudrendering, scripts/prerender.mjs).
 *
 * Første besøg: et lille kort (position fixed, ingen layoutskift, over mobilens
 * bundbjælke) efter kort tid. Det blokerer aldrig, og "Nej tak" eller en
 * gennemført/sprunget rundvisning huskes i localStorage (data/tour.js), så det
 * ikke kommer igen. Uden lagring vises invitationen slet ikke.
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
  const [invite, setInvite] = useState(false)
  const [note, setNote] = useState(null)
  const button = useRef(null)
  const wasActive = useRef(false)

  // Invitationen: kun ved første besøg, kun hvis valget kan huskes, efter kort tid.
  useEffect(() => {
    if (!canRemember() || readChoice()) return
    const timer = setTimeout(() => {
      if (document.visibilityState === 'visible' && !readChoice()) setInvite(true)
    }, tour.inviteDelay)
    return () => clearTimeout(timer)
  }, [])

  // Escape lukker invitationen (og husker fravalget), så den aldrig står i vejen for tastaturet.
  useEffect(() => {
    if (!invite) return
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      writeChoice('declined')
      setInvite(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [invite])

  // Dækker invitationen det element, tastaturet netop har fokus på (WCAG 2.4.11), trækker den sig
  // tilbage, når siden har rullet færdigt. Det fravalg huskes ikke; ingen layoutændring.
  useEffect(() => {
    if (!invite) return
    let timer
    const onFocus = (e) => {
      const box = document.querySelector('[data-tour-invite]')
      if (!box || box.contains(e.target)) return
      clearTimeout(timer)
      timer = setTimeout(() => {
        const a = e.target.getBoundingClientRect?.()
        const b = box.getBoundingClientRect()
        if (a && a.bottom > b.top && a.top < b.bottom && a.right > b.left && a.left < b.right) setInvite(false)
      }, 350)
    }
    document.addEventListener('focusin', onFocus)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('focusin', onFocus)
    }
  }, [invite])

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
    setInvite(false)
    setNote(null)
    setActive(true)
  }

  const close = useCallback((reason) => {
    setActive(false)
    if (reason === 'none') setNote(tour.text.nothing)
    else writeChoice(reason)
  }, [])

  const fail = useCallback(() => {
    setActive(false)
    setNote(tour.text.failed)
  }, [])

  const decline = () => {
    writeChoice('declined')
    setInvite(false)
    button.current?.focus({ preventScroll: true })
  }

  const t = tour.text

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
        {t.launcher}
      </button>

      {mounted &&
        createPortal(
          <>
            {invite && !active && (
              <section className="tour-invite" data-tour-invite aria-label={t.inviteLabel}>
                <p className="tour-invite-title">{t.inviteTitle}</p>
                <p className="tour-invite-body">{t.inviteBody}</p>
                <div className="tour-actions">
                  <button type="button" className="tour-btn tour-btn-text" onClick={decline}>
                    {t.inviteNo}
                  </button>
                  <span className="tour-spacer" />
                  <button type="button" className="tour-btn tour-btn-primary" data-tour-invite-yes onClick={start}>
                    {t.inviteYes}
                  </button>
                </div>
              </section>
            )}
            {note && !active && (
              <div className="tour-invite tour-note" role="status" data-tour-note>
                <p className="tour-invite-body">{note}</p>
              </div>
            )}
          </>,
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
