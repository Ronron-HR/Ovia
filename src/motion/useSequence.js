import { useEffect } from 'react'
import { REVEAL_THRESHOLD, SEQ_GAP, reduced } from './motion.js'

/**
 * Sekvens-reveal: ét led ad gangen, i dokumentrækkefølge.
 *
 * Markér elementerne med data-seq (oveni data-reveal). useReveal springer
 * dem over, så der kun er én, der tænder dem — men klassen, der tændes, er
 * den samme .is-in, og al CSS gælder derfor uændret.
 *
 * FORSKELLEN PÅ DET HER OG EN STAGGER
 * En stagger er en statisk forsinkelse pr. indeks: led nr. fire venter
 * altid 3 x afstanden. Det virker kun, hvis alle fire kommer ind samtidig.
 * Scroller man langsomt ned til nr. fire alene, sidder det og venter på
 * tre led, der for længst er tændt — en pause uden nogen grund.
 *
 * Her måles turen i stedet fra HVORNÅR DET FORRIGE FAKTISK GIK I GANG.
 * Kommer der tre ind på én frame, tæller de 01, 02, 03 med SEQ_GAP
 * imellem. Kommer der ét ind alene, er køen tom, og det tænder med det
 * samme. Det er hele pointen: ventetiden findes kun, når der er noget at
 * vente på.
 *
 * Rækkefølgen er dokumentets, ikke observerens. En IntersectionObserver
 * nævner ikke nødvendigvis sine entries oppefra og ned, og et tælleværk,
 * der tæller 02, 01, 03, er værre end slet ingen sekvens.
 */
export function useSequence() {
  useEffect(() => {
    const nodes = [...document.querySelectorAll('[data-seq]')]
    if (!nodes.length) return

    const show = (node) => node.classList.add('is-in')

    if (reduced() || !('IntersectionObserver' in window)) {
      nodes.forEach(show)
      return
    }

    // Tidligste tidspunkt, det næste led må gå i gang. Ligger det i
    // fortiden, er køen tom, og der ventes ikke.
    let nextAt = 0
    const timers = new Set()

    const enqueue = (node) => {
      const now = performance.now()
      const at = Math.max(now, nextAt)
      nextAt = at + SEQ_GAP

      const wait = at - now
      if (wait < 1) {
        show(node)
        return
      }
      const timer = window.setTimeout(() => {
        timers.delete(timer)
        show(node)
      }, wait)
      timers.add(timer)
    }

    const order = new Map(nodes.map((node, i) => [node, i]))

    const observer = new IntersectionObserver(
      (entries) => {
        const arrived = entries
          .filter((entry) => {
            if (!entry.isIntersecting) return false
            // Samme undtagelse som i useReveal: et led, der er højere end
            // viewporten, når aldrig 20% og slipper igennem på højden.
            const tall = entry.boundingClientRect.height > window.innerHeight * 0.9
            return entry.intersectionRatio >= REVEAL_THRESHOLD || tall
          })
          .sort((a, b) => order.get(a.target) - order.get(b.target))

        for (const entry of arrived) {
          observer.unobserve(entry.target)
          enqueue(entry.target)
        }
      },
      { threshold: [0, REVEAL_THRESHOLD] },
    )

    nodes.forEach((node) => observer.observe(node))

    // Samme sikkerhedsnet som useReveal: går observeren i stykker, må
    // indhold, der allerede står i viewporten, ikke blive hængende
    // usynligt. Hele sekvensen er overstået længe inden de 3s.
    const watchdog = window.setTimeout(() => {
      for (const node of nodes) {
        const rect = node.getBoundingClientRect()
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          show(node)
          observer.unobserve(node)
        }
      }
    }, 3000)

    return () => {
      window.clearTimeout(watchdog)
      for (const timer of timers) window.clearTimeout(timer)
      observer.disconnect()
    }
  }, [])
}
