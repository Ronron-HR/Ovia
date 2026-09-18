import { useEffect } from 'react'
import { subscribe } from './ticker.js'
import { clamp, reduced } from './motion.js'

/**
 * Skriver en scroll-progress 0→1 som CSS-variablen --p på elementet.
 * Selve bevægelsen defineres i motion.css — her kommer kun tallet.
 *
 * mode 'enter': starter når elementets top rammer startVh af viewporten og
 *   er færdig efter distanceVh scroll. Brugt på Palmy, hvor revealen SKAL
 *   være færdig, før billedet når midten — man kigger på et færdigt billede.
 * mode 'pass': 0→1 over hele elementets gennemløb. Brugt på parallax.
 *
 * Elementet observeres, så loopet kun kører mens scenen er i nærheden.
 */
export function useProgress(ref, { mode = 'enter', startVh = 0.85, distanceVh = 0.45 } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (reduced()) {
      el.style.setProperty('--p', '1')
      return
    }

    let unsubscribe = null
    let last = -1

    const measure = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const p =
        mode === 'pass'
          ? clamp((vh - rect.top) / (vh + rect.height))
          : clamp((vh * startVh - rect.top) / (vh * distanceVh))

      if (Math.abs(p - last) < 0.001) return
      last = p
      el.style.setProperty('--p', p.toFixed(4))
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !unsubscribe) {
          el.classList.add('is-live')
          unsubscribe = subscribe(measure)
        } else if (!entry.isIntersecting && unsubscribe) {
          unsubscribe()
          unsubscribe = null
          el.classList.remove('is-live') // will-change fjernes efter brug
        }
      },
      { rootMargin: '25% 0px 25% 0px' },
    )

    observer.observe(el)
    measure()

    return () => {
      observer.disconnect()
      if (unsubscribe) unsubscribe()
      el.classList.remove('is-live')
    }
  }, [ref, mode, startVh, distanceVh])
}
