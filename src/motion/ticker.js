/**
 * Én delt rAF-ticker for hele siden.
 *
 * Forskellen på 60fps og hak er ikke, hvor meget der animeres, men hvor
 * mange loops der kører. Alle scroll- og cursor-drevne effekter abonnerer
 * her; loopet stopper helt, når ingen lytter.
 */

const subscribers = new Set()
let frame = 0

function tick() {
  frame = 0
  // Kopi, så en subscriber kan afmelde sig selv midt i loopet.
  for (const fn of [...subscribers]) fn()
  if (subscribers.size > 0) frame = requestAnimationFrame(tick)
}

export function subscribe(fn) {
  subscribers.add(fn)
  if (frame === 0) frame = requestAnimationFrame(tick)

  return () => {
    subscribers.delete(fn)
    if (subscribers.size === 0 && frame !== 0) {
      cancelAnimationFrame(frame)
      frame = 0
    }
  }
}
