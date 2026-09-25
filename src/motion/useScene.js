import { useEffect } from 'react'
import { reduced } from './motion.js'

/**
 * Scroll-drevne scener (dybden i heroen og projektscenerne).
 *
 * En scene er et element med børn, der bevæger sig, mens scenen er nær
 * skærmen. Hver bevægelse erklæres på barnet:
 *
 *   data-par="30"     lodret parallax: barnet flyttes (0,5 − p) × 30 px, så det
 *                     står stille, når scenen er midt i skærmen (mode "leave":
 *                     −p × 30 px, så det står stille øverst på siden). Negative tal
 *                     giver modsat retning, og dermed dybde mellem lagene.
 *   data-travel="70"  en side, der ruller igennem sit vindue: barnet flyttes
 *                     q × 70 % af sin egen højde opad.
 *
 * p er 0→1, mens scenen krydser skærmen (0: dens top rører bunden, 1: dens
 * bund forlader toppen). q er p strakt og klemt, så bevægelsen er færdig lidt
 * før og efter midten. mode "leave": p er 0 øverst på siden og 1, når scenen
 * er helt ude over toppen (bruges til heroen).
 *
 * Transforms skrives direkte på børnene og ikke som CSS-variabler: en
 * variabel på scenen ville blive arvet af hele illustrationen indeni og få
 * browseren til at genberegne stilen for hvert element i hvert billede.
 *
 * Bevægelsen mapper lineært til scroll: ingen easing, ingen scroll-kapring,
 * og siden scroller præcis, som browseren vil. Der lyttes kun, mens en scene
 * er i nærheden, og alle scener deler ét scroll-lyt og én rAF.
 *
 * Reduceret bevægelse: intet kører. Siderne står på deres top, og alt står
 * stille.
 */

const clamp = (n) => (n < 0 ? 0 : n > 1 ? 1 : n)

const live = new Set()
let frame = 0
let listening = false

function run() {
  frame = 0
  const vh = window.innerHeight
  for (const scene of live) scene(vh)
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(run)
}

function attach() {
  if (listening) return
  listening = true
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
}

function detach() {
  if (!listening || live.size > 0) return
  listening = false
  window.removeEventListener('scroll', schedule)
  window.removeEventListener('resize', schedule)
}

export function useScene(ref, { mode = 'pass', from = 0.18, to = 0.82 } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el || reduced()) return

    const pars = [...el.querySelectorAll('[data-par]')].map((node) => [node, Number(node.dataset.par)])
    const travels = [...el.querySelectorAll('[data-travel]')].map((node) => [node, Number(node.dataset.travel)])

    const measure = (vh) => {
      const r = el.getBoundingClientRect()
      const p =
        mode === 'leave'
          ? clamp(-r.top / Math.max(r.height, 1))
          : clamp((vh - r.top) / (vh + r.height))
      const q = clamp((p - from) / (to - from))
      for (const [node, par] of pars) {
        const d = mode === 'leave' ? -p : 0.5 - p
        node.style.transform = `translate3d(0, ${(d * par).toFixed(2)}px, 0)`
      }
      for (const [node, travel] of travels) {
        node.style.transform = `translate3d(0, ${(-q * travel).toFixed(3)}%, 0)`
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          live.add(measure)
          el.classList.add('is-live')
          attach()
          schedule()
        } else {
          live.delete(measure)
          el.classList.remove('is-live')
          measure(window.innerHeight)
          detach()
        }
      },
      { rootMargin: '25% 0px' },
    )
    observer.observe(el)
    measure(window.innerHeight)

    return () => {
      observer.disconnect()
      live.delete(measure)
      el.classList.remove('is-live')
      detach()
    }
  }, [ref, mode, from, to])
}
