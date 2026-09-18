import { useEffect } from 'react'
import { subscribe } from './ticker.js'
import { clamp, reduced } from './motion.js'

/**
 * Lagovergangen mellem hero og resten af siden (signature moment 02).
 *
 * Skriver --lp (0→1) på :root. Heroen læser den til sin modbevægelse,
 * .layer-rest til sit løft, og nav'en fader ind når den rammer 1.
 *
 * Progressen udledes af scenens egen højde frem for et hardcodet tal, så
 * --layer-travel i motion.css altid er den eneste sandhed.
 */
export function useLayer(stageRef) {
  useEffect(() => {
    const stage = stageRef.current
    const root = document.documentElement
    if (!stage) return

    // Deep-link: browseren springer til ankeret, mens siden stadig er et
    // tomt #root — før React har renderet, og før laget har løftet
    // indholdet på plads. Resultatet er et spring, der lander flere
    // hundrede pixels ved siden af. Vi lander det igen, når layoutet står:
    // én gang nu, og én gang når skrifterne er hentet, da de flytter
    // højder. scrollIntoView respekterer selv scroll-margin-top.
    if (location.hash.length > 1) {
      // behavior 'instant' er ikke til pynt: html har scroll-behavior:
      // smooth, og en blød animation ved indlæsning bliver afbrudt af
      // næste layout og ender aldrig med at ramme målet — foruden at det
      // ville sende hele siden susende forbi, før man har set noget.
      let landedAt = -1
      const land = () => {
        try {
          const target = document.querySelector(location.hash)
          if (!target) return
          // Har brugeren selv scrollet imens, blander vi os ikke.
          if (landedAt >= 0 && Math.abs(window.scrollY - landedAt) > 4) return
          target.scrollIntoView({ block: 'start', behavior: 'instant' })
          landedAt = window.scrollY
        } catch {
          /* ugyldig selector i hash — ignorér */
        }
      }
      requestAnimationFrame(land)
      // Skrifterne flytter højder, når de lander. Vi retter positionen én
      // gang mere, når de er hentet.
      document.fonts?.ready.then(land)
    }

    // Reduced motion: ingen lagovergang. Nav'en er der fra start, så siden
    // ikke mister sin eneste navigation.
    if (reduced()) {
      root.style.setProperty('--lp', '1')
      root.dataset.nav = 'on'
      root.dataset.layer = 'done'
      return
    }

    let unsubscribe = null
    let last = -1

    const measure = () => {
      const travel = stage.offsetHeight - window.innerHeight
      const p = travel > 0 ? clamp(-stage.getBoundingClientRect().top / travel) : 1

      if (Math.abs(p - last) < 0.001) return
      last = p

      root.style.setProperty('--lp', p.toFixed(4))
      root.dataset.layer = p < 1 ? 'active' : 'done'
      root.dataset.nav = p > 0.98 ? 'on' : 'off'
    }

    // Loopet kører kun mens scenen er i nærheden. Resten af siden ligger
    // laget stille på --lp: 1.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !unsubscribe) {
          unsubscribe = subscribe(measure)
        } else if (!entry.isIntersecting && unsubscribe) {
          unsubscribe()
          unsubscribe = null
          measure()
        }
      },
      { rootMargin: '50% 0px 50% 0px' },
    )

    observer.observe(stage)
    measure()

    return () => {
      observer.disconnect()
      if (unsubscribe) unsubscribe()
    }
  }, [stageRef])
}
