import { useEffect } from 'react'
import { REVEAL_THRESHOLD, reduced } from './motion.js'

/**
 * Standard-reveal for hele siden.
 *
 * Én IntersectionObserver samler alle [data-reveal]-elementer. Hver enkelt
 * fyrer én gang og afmeldes derefter — der sker intet ved at scrolle tilbage op.
 * Ingen scroll-listeners.
 */
export function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]')

    const showAll = () => nodes.forEach((n) => n.classList.add('is-in'))

    if (reduced() || !('IntersectionObserver' in window)) {
      showAll()
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          // Et element, der er højere end viewporten, når aldrig 20% —
          // det slipper igennem på højden i stedet.
          const tall = entry.boundingClientRect.height > window.innerHeight * 0.9
          if (entry.intersectionRatio >= REVEAL_THRESHOLD || tall) {
            entry.target.classList.add('is-in')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: [0, REVEAL_THRESHOLD] },
    )

    nodes.forEach((node) => observer.observe(node))

    // Sikkerhedsnet: hvis noget går galt i observeren, må indhold der
    // allerede er i viewporten ikke blive hængende usynligt.
    const watchdog = window.setTimeout(() => {
      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect()
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          node.classList.add('is-in')
          observer.unobserve(node)
        }
      })
    }, 3000)

    return () => {
      window.clearTimeout(watchdog)
      observer.disconnect()
    }
  }, [])
}
