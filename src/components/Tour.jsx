import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { targetSelector, tour } from '../data/tour.js'
import '../tour.css'

/**
 * RUNDVISNINGEN (indlæses først, når den startes, se TourLauncher).
 *
 * Et spotlight (absolut i dokumentet, så det følger siden, når den scroller)
 * dæmper resten af siden og glider mellem målene; en lille dialog forklarer
 * hvert trin (på mobil et bund-sheet). Målene findes med [data-tour="…"]; et
 * mål, der ikke findes eller ikke er synligt, springes over.
 *
 * Rundvisningen rører hverken beregnerens tilstand, adressen eller formularer:
 * siden under er inert og aria-hidden, mens den kører, og et gennemsigtigt lag
 * fanger klik. Det fjernes igen ved lukning, fejl og unmount.
 *
 * Genbrugt mønster fra Nav.jsx: fokusfælde, Escape, fokus tilbage til udløseren
 * (det sidste gør TourLauncher, efter at siden igen er tilgængelig).
 */

const MOBILE_MAX = 639 // under 640 px er dialogen et bund-sheet
const PAD = 8 // luft rundt om målet i spotlightet
const GAP = 14 // afstand mellem spotlight og dialog
const EDGE = 12 // minimumsafstand til skærmkanten

const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi))
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function isShown(el) {
  if (!el?.isConnected) return false
  const r = el.getBoundingClientRect()
  if (r.width < 1 || r.height < 1) return false
  if (typeof el.checkVisibility === 'function') return el.checkVisibility({ visibilityProperty: true })
  return getComputedStyle(el).visibility !== 'hidden'
}

/** Første synlige element for et trin, ellers null. */
const findTarget = (id) => [...document.querySelectorAll(targetSelector(id))].find(isShown) ?? null

/** De mest nyttige trin, der faktisk findes lige nu, i den rækkefølge de står på siden. */
function pickSteps() {
  const found = tour.steps.map((s) => ({ s, el: findTarget(s.id) })).filter((x) => x.el)
  return found
    .slice(0, tour.maxSteps)
    .sort((a, b) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
    .map((x) => x.s)
}

/** Højden af den faste navigation (--nav-h), målt med et skjult element. */
function navHeight() {
  const probe = document.createElement('div')
  probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;width:0;height:var(--nav-h, 72px)'
  document.body.appendChild(probe)
  const h = probe.offsetHeight
  probe.remove()
  return h || 72
}

/**
 * Hvor dialogen står (desktop), regnet i skærmkoordinater ud fra målets
 * rektangel r: under, over, til højre, til venstre, ellers inde i skærmen.
 */
function place(r, w, h, vw, vh) {
  const cx = (Math.max(r.left, 0) + Math.min(r.right, vw)) / 2
  const centred = clamp(cx - w / 2, EDGE, vw - w - EDGE)
  const below = r.bottom + PAD + GAP
  if (below + h <= vh - EDGE) return { x: centred, y: below, kind: 'below' }
  const above = r.top - PAD - GAP - h
  if (above >= EDGE) return { x: centred, y: above, kind: 'above' }
  const side = clamp(r.top, EDGE, vh - h - EDGE)
  const right = r.right + PAD + GAP
  if (right + w <= vw - EDGE) return { x: right, y: side, kind: 'right' }
  const left = r.left - PAD - GAP - w
  if (left >= EDGE) return { x: left, y: side, kind: 'left' }
  return { x: centred, y: clamp(vh - h - 24, EDGE, vh), kind: 'inside' }
}

export default function Tour({ onClose }) {
  const [steps] = useState(pickSteps)
  const [i, setI] = useState(0)
  const [announce, setAnnounce] = useState('')

  const layer = useRef(null)
  const spot = useRef(null)
  const pop = useRef(null)
  const state = useRef({ i: 0, dir: 1, prog: null, first: true, missing: 0 })
  const closed = useRef(false)

  const finish = useCallback(
    (reason) => {
      if (closed.current) return
      closed.current = true
      onClose(reason)
    },
    [onClose],
  )

  /** Går til næste/forrige trin, der kan vises. Giver false, hvis vi blev stående. */
  const move = useCallback(
    (dir) => {
      let n = state.current.i + dir
      while (n >= 0 && n < steps.length && !findTarget(steps[n].id)) n += dir
      if (n < 0) return false
      if (n >= steps.length) {
        finish(dir > 0 ? 'done' : 'skipped')
        return false
      }
      state.current.dir = dir
      state.current.i = n
      setI(n)
      return true
    },
    [steps, finish],
  )

  // Ingen trin at vise (ingen mål findes): luk igen med besked.
  useEffect(() => {
    if (steps.length === 0) finish('none')
  }, [steps, finish])

  // Siden under er inert og skjult for hjælpemidler, så længe rundvisningen kører.
  useEffect(() => {
    const root = document.getElementById('root')
    if (!root) return
    root.setAttribute('inert', '')
    root.setAttribute('aria-hidden', 'true')
    return () => {
      root.removeAttribute('inert')
      root.removeAttribute('aria-hidden')
    }
  }, [])

  // Fokus ind i dialogen ved start.
  useEffect(() => {
    pop.current?.focus({ preventScroll: true })
  }, [])

  // Scroller målet ind, så det hverken ligger bag navigationen eller bag dialogen.
  const ensureVisible = useCallback((el) => {
    const p = pop.current
    if (!p || !el) return
    const vw = window.innerWidth
    const vh = window.innerHeight
    const mobile = vw <= MOBILE_MAX
    const navH = navHeight()
    const r = el.getBoundingClientRect()
    const ph = p.offsetHeight
    const pw = p.offsetWidth
    let dest = window.scrollY

    if (mobile) {
      const bandTop = navH + 8
      const bandBottom = vh - ph - 16
      const band = bandBottom - bandTop
      const inside = r.top - PAD >= bandTop && r.bottom + PAD <= bandBottom
      if (r.height + 2 * PAD <= band) {
        if (!inside) dest = window.scrollY + r.top - PAD - bandTop - (band - r.height - 2 * PAD) / 2
      } else {
        dest = window.scrollY + r.top - PAD - bandTop
      }
    } else {
      const inside = r.top - PAD >= navH + 8 && r.bottom + PAD <= vh - 8
      if (!(inside && place(r, pw, ph, vw, vh).kind !== 'inside')) dest = window.scrollY + r.top - PAD - (navH + 16)
    }

    const max = document.documentElement.scrollHeight - vh
    dest = Math.round(clamp(dest, 0, max))
    if (Math.abs(dest - window.scrollY) > 2) {
      state.current.prog = { dest, t: performance.now() }
      window.scrollTo({ left: window.scrollX, top: dest, behavior: reduced() ? 'auto' : 'smooth' })
    } else {
      state.current.prog = null
    }
  }, [])

  // Nyt trin: scroll ind, glid dialogen på plads og annoncér trinnet.
  useLayoutEffect(() => {
    const step = steps[i]
    if (!step) return
    const s = state.current
    const el = findTarget(step.id)
    if (!el) {
      if (!move(s.dir)) finish('skipped')
      return
    }
    ensureVisible(el)
    const p = pop.current
    let timer
    if (p && !s.first) {
      p.dataset.glide = 'true'
      timer = setTimeout(() => {
        p.dataset.glide = 'false'
      }, 320)
    }
    // Første trin læses op af dialogens navn og beskrivelse; senere trin annonceres her.
    if (!s.first) setAnnounce(tour.text.announce(i + 1, steps.length, step.title, step.body))
    s.first = false
    // Gik fokus tabt (fx fordi "Tilbage" forsvandt), tages det tilbage i dialogen.
    if (p && !p.contains(document.activeElement)) p.focus({ preventScroll: true })
    return () => clearTimeout(timer)
  }, [i, steps, ensureVisible, move, finish])

  // Hver frame: spotlight og dialog følger målet (også under scroll, resize og indhold, der flytter sig).
  useEffect(() => {
    if (steps.length === 0) return
    const s = state.current
    let raf
    let lastSpot = ''
    let lastPop = ''
    let frames = 0

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      frames += 1
      const sp = spot.current
      const p = pop.current
      const lay = layer.current
      const step = steps[s.i]
      if (!sp || !p || !lay || !step) return

      const el = findTarget(step.id)
      if (!el) {
        s.missing += 1
        if (s.missing > 20) {
          s.missing = 0
          if (!move(s.dir)) finish('skipped')
        }
        return
      }
      s.missing = 0

      const sy = window.scrollY
      if (s.prog && (Math.abs(sy - s.prog.dest) <= 1.5 || now - s.prog.t > 1400)) s.prog = null
      const vw = window.innerWidth
      const vh = window.innerHeight
      const r = el.getBoundingClientRect()

      // Spotlightet ligger i dokumentkoordinater, så det følger siden, når den scroller.
      const o = lay.getBoundingClientRect()
      const x = Math.round(r.left - o.left - PAD)
      const y = Math.round(r.top - o.top - PAD)
      const w = Math.round(r.width + 2 * PAD)
      const h = Math.round(r.height + 2 * PAD)
      const spotKey = `${x},${y},${w},${h}`
      if (spotKey !== lastSpot) {
        sp.style.transform = `translate(${x}px, ${y}px)`
        sp.style.width = `${w}px`
        sp.style.height = `${h}px`
        lastSpot = spotKey
      }

      // Dialogen placeres ud fra, hvor målet ender, mens siden glider (s.prog), ellers hvor det står.
      const mobile = vw <= MOBILE_MAX
      const mode = mobile ? 'sheet' : 'pop'
      if (p.dataset.mode !== mode) p.dataset.mode = mode
      let popKey = mode
      if (!mobile) {
        const eff = s.prog ? s.prog.dest : sy
        const pr = {
          left: r.left,
          right: r.right,
          top: r.top + sy - eff,
          bottom: r.bottom + sy - eff,
        }
        const at = place(pr, p.offsetWidth, p.offsetHeight, vw, vh)
        popKey = `${Math.round(at.x)},${Math.round(at.y)}`
        if (popKey !== lastPop) p.style.transform = `translate(${Math.round(at.x)}px, ${Math.round(at.y)}px)`
        p.dataset.place = at.kind
      } else if (lastPop !== popKey) {
        p.style.transform = ''
      }
      lastPop = popKey

      // Første gang vises begge først, når de står rigtigt (ingen glidning ind fra hjørnet).
      if (frames === 2) p.dataset.ready = 'true'
      if (frames === 3) sp.dataset.ready = 'true'
    }
    raf = requestAnimationFrame(frame)

    // Brugeren tager over: stop med at forudsige, hvor siden ender.
    const release = () => {
      s.prog = null
    }
    let resizeTimer
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        const el = findTarget(steps[s.i]?.id)
        if (el) ensureVisible(el)
      }, 120)
    }
    window.addEventListener('wheel', release, { passive: true })
    window.addEventListener('touchstart', release, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(resizeTimer)
      window.removeEventListener('wheel', release)
      window.removeEventListener('touchstart', release)
      window.removeEventListener('resize', onResize)
    }
  }, [steps, ensureVisible, move, finish])

  // Tastatur: Escape lukker; Tab holdes inde i dialogen.
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        finish('skipped')
        return
      }
      if (event.key !== 'Tab') return
      const p = pop.current
      if (!p) return
      const list = [...p.querySelectorAll('button')].filter((b) => b.getClientRects().length > 0)
      if (list.length === 0) {
        event.preventDefault()
        return
      }
      const first = list[0]
      const last = list[list.length - 1]
      const current = document.activeElement
      if (!list.includes(current)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (event.shiftKey && current === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && current === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [finish])

  const step = steps[i]
  if (!step) return null
  const t = tour.text
  const last = i === steps.length - 1

  return createPortal(
    <div className="tour-layer" ref={layer}>
      <div className="tour-spot" ref={spot} aria-hidden="true" />
      <div className="tour-shield" aria-hidden="true" />
      <div
        ref={pop}
        className="tour-pop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-count tour-title"
        aria-describedby="tour-body"
        data-tour-popup
        data-tour-step={step.id}
        tabIndex={-1}
      >
        <div className="tour-head">
          <p id="tour-count" className="tour-count">
            {t.progress(i + 1, steps.length)}
          </p>
          <span className="tour-dots" aria-hidden="true">
            {steps.map((s, n) => (
              <span key={s.id} data-on={n <= i} />
            ))}
          </span>
        </div>
        <div key={step.id} className="tour-text">
          <h2 id="tour-title" className="tour-title">
            {step.title}
          </h2>
          <p id="tour-body" className="tour-body">
            {step.body}
          </p>
        </div>
        <div className="tour-actions">
          {!last && (
            <button type="button" className="tour-btn tour-btn-text" onClick={() => finish('skipped')}>
              {t.skip}
            </button>
          )}
          <span className="tour-spacer" />
          {i > 0 && (
            <button type="button" className="tour-btn" onClick={() => move(-1)}>
              {t.back}
            </button>
          )}
          <button type="button" className="tour-btn tour-btn-primary" onClick={() => (last ? finish('done') : move(1))}>
            {last ? t.done : t.next}
          </button>
        </div>
        <div className="tour-sr" role="status" aria-live="polite">
          {announce}
        </div>
      </div>
    </div>,
    document.body,
  )
}
