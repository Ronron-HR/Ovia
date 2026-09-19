import { useEffect } from 'react'
import { REVEAL_THRESHOLD, reduced } from './motion.js'

/**
 * Standard-reveal for hele siden.
 *
 * Én IntersectionObserver samler alle [data-reveal]-elementer. Hver enkelt
 * fyrer én gang og afmeldes derefter — der sker intet ved at scrolle tilbage op.
 * Ingen scroll-listeners.
 *
 * [data-step] er undtaget fra den fælles observer, men tændes her, af en
 * observer med sin egen trigger-linje: et trin, der står i en rækkefølge, skal
 * afsløres, når man scroller ned til DET — ikke når sektionen som helhed
 * dukker op. Linjen ligger REVEAL_THRESHOLD af skærmhøjden oppe fra bunden,
 * så et trin først tænder, når det selv har rejst sig så langt. Ingen
 * forsinkelse pr. indeks: tidsforløbet kommer af, hvor hurtigt man scroller.
 */
export function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]:not([data-step])')
    const steps = document.querySelectorAll('[data-step]')

    const showAll = () => {
      nodes.forEach((n) => n.classList.add('is-in'))
      steps.forEach((n) => n.classList.add('is-in'))
    }

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

    // Rodens bund trækkes REVEAL_THRESHOLD op: et trin tæller først som set,
    // når det rører den indsnævrede skærm. Ellers ville alle trin, der
    // allerede står i skærmen, når man lander i sektionen, tænde på én gang.
    const stepObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          stepObserver.unobserve(entry.target)
        }
      },
      { rootMargin: `0px 0px -${REVEAL_THRESHOLD * 100}% 0px` },
    )

    nodes.forEach((node) => observer.observe(node))
    steps.forEach((node) => stepObserver.observe(node))

    // Sikkerhedsnet: hvis noget går galt i observeren, må indhold der
    // allerede er i viewporten ikke blive hængende usynligt.
    const watchdog = window.setTimeout(() => {
      const show = (node, bottom) => {
        const rect = node.getBoundingClientRect()
        if (rect.top < bottom && rect.bottom > 0) {
          node.classList.add('is-in')
          observer.unobserve(node)
          stepObserver.unobserve(node)
        }
      }
      nodes.forEach((node) => show(node, window.innerHeight))
      // Trinnene holder deres egen linje, også her: et trin, der står under
      // den, skal blive i skjul, til man scroller ned til det.
      steps.forEach((node) => show(node, window.innerHeight * (1 - REVEAL_THRESHOLD)))
    }, 3000)

    return () => {
      window.clearTimeout(watchdog)
      observer.disconnect()
      stepObserver.disconnect()
    }
  }, [])
}
