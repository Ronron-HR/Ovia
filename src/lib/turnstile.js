/**
 * Cloudflare Turnstile (usynlig spamværn): FEJLFLAG, ikke påkrævet.
 *
 * Slås til ved at sætte BEGGE dele:
 *   1. byggevariablen VITE_TURNSTILE_SITE_KEY (Site Key fra Cloudflare → Turnstile → widget, "Invisible"),
 *   2. hemmeligheden TURNSTILE_SECRET på workeren "ovia" (Secret Key).
 * Er kun hemmeligheden sat, afviser workeren alle forespørgsler (den kræver en token, som siden ikke sender).
 * Er ingen af dem sat, springes Turnstile helt over: ingen script hentes, og workeren kræver ingen token.
 *
 * Scriptet fra challenges.cloudflare.com hentes først, når nogen sender formularen. CSP tillader det allerede
 * (public/_headers). Privatlivspolitikken skal ændres, hvis Turnstile slås til.
 */
const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

export const turnstileEnabled = Boolean(SITE_KEY)

let loading
const load = () =>
  (loading ??= new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    s.async = true
    s.onload = () => resolve(window.turnstile)
    s.onerror = () => reject(new Error('turnstile-script'))
    document.head.append(s)
  }))

/** Henter en token (usynligt). Afviser efter 10 s, så en blokeret widget aldrig hænger formularen. */
export async function turnstileToken(container) {
  const turnstile = await load()
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('turnstile-timeout')), 10_000)
    const done = (fn) => (v) => {
      clearTimeout(timer)
      fn(v)
    }
    const id = turnstile.render(container, {
      sitekey: SITE_KEY,
      execution: 'execute',
      appearance: 'interaction-only',
      callback: done(resolve),
      'error-callback': done(() => reject(new Error('turnstile'))),
    })
    turnstile.execute(id)
  })
}
