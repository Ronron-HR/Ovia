import { useEffect } from 'react'
import { subscribe } from './ticker.js'
import { LERP, POINTER_EPSILON, POINTER_MAX, finePointer, reduced } from './motion.js'

/**
 * Cursor-reaktivt element. Kun to steder på hele siden: Om mig-billedet
 * og kontakt-CTA'et.
 *
 * Forskydningen lerpes, så den føles tung frem for nervøs, og loopet stopper
 * så snart elementet står stille. På touch findes effekten ikke — elementet
 * er designet til at se færdigt ud uden den.
 *
 * @param sceneRef  området cursoren måles indenfor (ikke window)
 * @param targetRef elementet der forskydes
 */
export function usePointer(sceneRef, targetRef, max = POINTER_MAX) {
  useEffect(() => {
    const scene = sceneRef.current
    const target = targetRef.current
    if (!scene || !target) return
    if (reduced() || !finePointer()) return

    let goalX = 0
    let goalY = 0
    let x = 0
    let y = 0
    let unsubscribe = null
    let inside = false

    const step = () => {
      x += (goalX - x) * LERP
      y += (goalY - y) * LERP

      const settled =
        Math.abs(goalX - x) < POINTER_EPSILON && Math.abs(goalY - y) < POINTER_EPSILON

      if (settled) {
        x = goalX
        y = goalY
      }

      target.style.setProperty('--mx', `${x.toFixed(2)}px`)
      target.style.setProperty('--my', `${y.toFixed(2)}px`)

      if (settled && !inside && unsubscribe) {
        unsubscribe()
        unsubscribe = null
        target.style.willChange = ''
      }
    }

    const start = () => {
      if (unsubscribe) return
      target.style.willChange = 'transform'
      unsubscribe = subscribe(step)
    }

    const onMove = (event) => {
      const rect = scene.getBoundingClientRect()
      const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
      const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
      goalX = Math.max(-1, Math.min(1, dx)) * max
      goalY = Math.max(-1, Math.min(1, dy)) * max
      inside = true
      start()
    }

    const onLeave = () => {
      goalX = 0
      goalY = 0
      inside = false
      start()
    }

    scene.addEventListener('pointermove', onMove, { passive: true })
    scene.addEventListener('pointerleave', onLeave, { passive: true })

    return () => {
      scene.removeEventListener('pointermove', onMove)
      scene.removeEventListener('pointerleave', onLeave)
      if (unsubscribe) unsubscribe()
      target.style.willChange = ''
    }
  }, [sceneRef, targetRef, max])
}
