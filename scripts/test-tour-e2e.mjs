/**
 * Browsertest af rundvisningen "Vis mig rundt" (src/components/Tour*.jsx) mod en
 * kørende server (puppeteer-core, som de øvrige browsertests):
 *
 *   npx vite --port 5176
 *   SITE=http://localhost:5176 node scripts/test-tour-e2e.mjs
 *
 * Kører på 375 og 1440 px, hvert scenarie i en ren browserkontekst (frisk localStorage):
 * invitationen ved første besøg (vises efter kort tid, lukkes, kommer ikke igen),
 * start, næste, tilbage, spring over, Escape, afslutning, genåbning, fokusfælde,
 * fokus tilbage til knappen, spotlight om målet, dialog inden for skærmen, scroll,
 * ingen ændring af adresse/valg under touren, manglende/skjulte mål, ingen mål,
 * fejl ved hentning, uden lagring, reduceret bevægelse og ingen konsolfejl.
 *
 * Er launcheren eller [data-tour]-målene endnu ikke sat ind på siden af de andre
 * agenter, indsætter testen dem midlertidigt i den åbne side (sidens egne kilder
 * røres ikke) og skriver det i resultatet.
 */
import puppeteer from 'puppeteer-core'

const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const SITE = process.env.SITE ?? 'http://localhost:4173'
const INVITE_WAIT = 5200 // tour.inviteDelay (4500) + margin

const failures = []
const notes = new Set()
const check = (ok, msg) => {
  if (!ok) failures.push(msg)
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 30000 })
const errors = []

async function newPage(ctx, width, { reduceMotion = false, noStorage = false, blockTour = false } = {}) {
  const page = await ctx.newPage()
  const tag = `${width}px`
  // Siden med blokeret rundvisning fremprovokerer fejlen med vilje (og skal klare den).
  if (!blockTour) {
    page.on('pageerror', (e) => errors.push(`${tag}: ${e}`))
    page.on('console', (m) => m.type() === 'error' && errors.push(`${tag}: ${m.text()}`))
  }
  await page.setViewport({ width, height: width < 768 ? 812 : 900, isMobile: width < 768, hasTouch: width < 768 })
  if (reduceMotion) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  if (noStorage) {
    await page.evaluateOnNewDocument(() => {
      Storage.prototype.setItem = () => {
        throw new DOMException('blocked', 'SecurityError')
      }
      Storage.prototype.getItem = () => {
        throw new DOMException('blocked', 'SecurityError')
      }
    })
  }
  if (blockTour) {
    await page.setRequestInterception(true)
    page.on('request', (req) => (/\/Tour\.jsx|Tour-[\w-]+\.js/.test(req.url()) ? req.abort() : req.continue()))
  }
  return page
}

/** Åbner siden og sørger for launcher og mål (fra siden selv, ellers midlertidigt indsat). */
async function open(page, path = '/', { harness = true } = {}) {
  await page.goto(`${SITE}${path}`, { waitUntil: 'networkidle0' })
  await wait(500)
  if (!harness) return
  const used = await page.evaluate(async () => {
    const used = []
    const map = { calc: '#beregner', examples: '#eksempler', contact: '#kontakt' }
    for (const [id, sel] of Object.entries(map)) {
      if (document.querySelector(`[data-tour="${id}"]`)) continue
      const el = document.querySelector(sel)
      if (el) {
        el.setAttribute('data-tour', id)
        used.push(`data-tour="${id}" sat midlertidigt på ${sel}`)
      }
    }
    if (!document.querySelector('[data-tour="guide"]')) {
      const b = [...document.querySelectorAll('#beregner button, #beregner a')].find((n) => n.textContent.trim().startsWith('Hjælp mig med at vælge'))
      if (b) {
        b.setAttribute('data-tour', 'guide')
        used.push('data-tour="guide" sat midlertidigt på guideknappen')
      }
    }
    if (!document.querySelector('[data-tour-launcher]')) {
      const urls = performance.getEntriesByType('resource').map((r) => r.name)
      const react = urls.find((u) => /\/deps\/react\.js/.test(u))
      const client = urls.find((u) => /\/deps\/react-dom_client\.js/.test(u))
      if (!react || !client) throw new Error('kunne ikke finde React i dev-serveren til launcher-fixturen')
      const [{ default: React }, { createRoot }, { default: Launcher }] = await Promise.all([
        import(react),
        import(client),
        import('/src/components/TourLauncher.jsx'),
      ])
      const host = document.createElement('div')
      host.setAttribute('data-tour-harness', '')
      host.style.cssText = 'position:absolute;top:96px;left:16px;z-index:5'
      document.querySelector('main').prepend(host)
      createRoot(host).render(React.createElement(Launcher, { className: 'btn btn-ghost min-h-11 px-4' }))
      await new Promise((r) => setTimeout(r, 200))
      used.push('launcher monteret midlertidigt (ikke sat ind på siden endnu)')
    }
    return used
  })
  used.forEach((u) => notes.add(u))
}

const launcher = (page) => page.$('[data-tour-launcher]')
const dialog = (page) => page.$('[role="dialog"][data-tour-popup]')
const calcText = (page) => page.evaluate(() => document.querySelector('#beregner')?.textContent ?? '')
const info = (page) =>
  page.evaluate(() => {
    const d = document.querySelector('[data-tour-popup]')
    if (!d) return null
    const r = d.getBoundingClientRect()
    return {
      step: d.dataset.tourStep,
      count: d.querySelector('.tour-count')?.textContent.trim(),
      title: d.querySelector('.tour-title')?.textContent,
      place: d.dataset.place,
      mode: d.dataset.mode,
      rect: { left: r.left, top: r.top, right: r.right, bottom: r.bottom },
      live: d.querySelector('[aria-live]')?.textContent ?? '',
      buttons: [...d.querySelectorAll('button')].map((b) => b.textContent.trim()),
      active: d.contains(document.activeElement) || document.activeElement === d,
    }
  })

/** Venter til siden og spotlightet har sat sig (scroll og glidning færdig). */
async function settle(page) {
  let last = ''
  let same = 0
  for (let n = 0; n < 40 && same < 4; n++) {
    const now = await page.evaluate(() => `${window.scrollY}|${document.querySelector('.tour-spot')?.getBoundingClientRect().top}|${document.querySelector('.tour-spot')?.getBoundingClientRect().height}`)
    same = now === last ? same + 1 : 0
    last = now
    await wait(100)
  }
  await wait(120)
}

/** Spotlight om målet, målet synligt under navigationen, dialogen inden for skærmen. */
async function checkStep(page, tag, label, { loose = false } = {}) {
  const g = await page.evaluate(() => {
    const d = document.querySelector('[data-tour-popup]')
    const id = d?.dataset.tourStep
    const el = [...document.querySelectorAll(`[data-tour="${id}"]`)].find((e) => e.getClientRects().length)
    const s = document.querySelector('.tour-spot')?.getBoundingClientRect()
    const t = el?.getBoundingClientRect()
    const p = d?.getBoundingClientRect()
    const nav = document.querySelector('header.nav, header')?.getBoundingClientRect()
    return {
      id,
      s: s && { l: s.left, t: s.top, r: s.right, b: s.bottom },
      t: t && { l: t.left, t: t.top, r: t.right, b: t.bottom },
      p: p && { l: p.left, t: p.top, r: p.right, b: p.bottom },
      mode: d?.dataset.mode,
      place: d?.dataset.place,
      navB: nav && nav.height < 200 ? nav.bottom : 0,
      vw: window.innerWidth,
      vh: window.innerHeight,
      dim: getComputedStyle(document.querySelector('.tour-spot')).boxShadow,
      spotOpacity: getComputedStyle(document.querySelector('.tour-spot')).opacity,
    }
  })
  const where = `${tag} ${label} (${g.id})`
  check(!!g.t && !!g.s, `${where}: mål eller spotlight mangler`)
  if (!g.t || !g.s) return g
  const tol = 3
  check(
    g.s.l <= g.t.l + tol && g.s.t <= g.t.t + tol && g.s.r >= g.t.r - tol && g.s.b >= g.t.b - tol && g.t.l - g.s.l < 20 && g.t.t - g.s.t < 20,
    `${where}: spotlight sidder ikke om målet ${JSON.stringify({ s: g.s, t: g.t })}`,
  )
  check(g.spotOpacity === '1' && /9999px/.test(g.dim), `${where}: spotlightet er ikke synligt/dæmper ikke`)
  if (loose) return g // efter at brugeren selv har scrollet må målet ligge hvor som helst
  check(g.t.t >= g.navB - 2 && g.t.t < g.vh - 40, `${where}: målet ligger bag navigationen eller uden for skærmen (${Math.round(g.t.t)}, nav ${g.navB})`)
  check(g.p.l >= -1 && g.p.t >= -1 && g.p.r <= g.vw + 1 && g.p.b <= g.vh + 1, `${where}: dialogen ligger uden for skærmen ${JSON.stringify(g.p)}`)
  const overlap = g.p.l < g.t.r && g.p.r > g.t.l && g.p.t < g.t.b && g.p.b > g.t.t
  if (g.mode === 'pop' && g.place !== 'inside') check(!overlap, `${where}: dialogen dækker målet (${g.place})`)
  if (g.mode === 'sheet') {
    const tall = g.t.b - g.t.t > g.vh - (g.vh - g.p.t) - g.navB - 16
    check(tall || g.t.b <= g.p.t + 2, `${where}: bund-sheet dækker målet`)
    check(g.p.b <= g.vh + 1 && g.p.l >= 0 && g.p.r <= g.vw, `${where}: bund-sheet uden for skærmen`)
  }
  return g
}

const pageState = (page) => page.evaluate(() => ({ url: location.href, root: { inert: document.getElementById('root').hasAttribute('inert'), hidden: document.getElementById('root').getAttribute('aria-hidden') } }))
const choice = (page) => page.evaluate(() => localStorage.getItem('oviaspecs-tour'))

for (const width of [375, 1440]) {
  const tag = `${width}px`

  // ---- 1: invitationen ved første besøg -------------------------------------------
  {
    const ctx = await browser.createBrowserContext()
    const page = await newPage(ctx, width)
    await open(page)
    check(await launcher(page), `${tag}: knappen "Vis mig rundt" findes ikke`)
    check((await page.evaluate(() => document.querySelector('[data-tour-launcher]')?.textContent.trim())) === 'Vis mig rundt', `${tag}: knapteksten er ikke "Vis mig rundt"`)
    const before = await page.evaluate(() => ({ h: document.documentElement.scrollHeight, y: document.querySelector('#beregner').getBoundingClientRect().top }))
    check(!(await page.$('[data-tour-invite]')), `${tag}: invitationen vises med det samme`)
    await wait(INVITE_WAIT)
    const inv = await page.evaluate(() => {
      const el = document.querySelector('[data-tour-invite]')
      if (!el) return null
      const r = el.getBoundingClientRect()
      const cb = document.querySelector('.callbar')
      const cbr = cb && cb.dataset.show === 'true' ? cb.getBoundingClientRect() : null
      return {
        pos: getComputedStyle(el).position,
        r: { l: r.left, t: r.top, r: r.right, b: r.bottom },
        callTop: cbr?.top ?? null,
        vw: innerWidth,
        vh: innerHeight,
        blocking: document.getElementById('root').hasAttribute('inert') || !!document.querySelector('[role="dialog"][aria-modal="true"][data-tour-popup]'),
        h: document.documentElement.scrollHeight,
        y: document.querySelector('#beregner').getBoundingClientRect().top,
        focusStolen: el.contains(document.activeElement),
      }
    })
    check(!!inv, `${tag}: invitationen vises ikke ved første besøg`)
    if (inv) {
      check(inv.pos === 'fixed', `${tag}: invitationen er ikke fixed`)
      check(inv.r.l >= 0 && inv.r.r <= inv.vw && inv.r.b <= inv.vh && inv.r.t >= 0, `${tag}: invitationen ligger uden for skærmen`)
      check(!inv.blocking && !inv.focusStolen, `${tag}: invitationen blokerer eller stjæler fokus`)
      check(inv.h === before.h && Math.abs(inv.y - before.y) < 1, `${tag}: invitationen giver layoutskift`)
      if (inv.callTop !== null) check(inv.r.b <= inv.callTop, `${tag}: invitationen ligger over bundbjælken`)
    }
    // på mobil: scroll, til bundbjælken er synlig, og tjek, at invitationen ligger over den
    if (width < 768) {
      await page.evaluate(() => document.querySelector('#eksempler')?.scrollIntoView())
      await wait(700)
      const over = await page.evaluate(() => {
        const el = document.querySelector('[data-tour-invite]')
        const cb = document.querySelector('.callbar')
        if (!el || !cb || cb.dataset.show !== 'true') return null
        return el.getBoundingClientRect().bottom <= cb.getBoundingClientRect().top
      })
      check(over !== false, `${tag}: invitationen overlapper den faste bundbjælke`)
      if (over === null) notes.add(`${tag}: bundbjælken var ikke synlig ved scroll (overlap ikke målt)`)
      await page.evaluate(() => window.scrollTo(0, 0))
    }
    // "Nej tak" lukker og huskes
    const btn = await page.evaluateHandle(() => [...document.querySelectorAll('[data-tour-invite] button')].find((b) => b.textContent.trim() === 'Nej tak'))
    await btn.asElement().click()
    await wait(200)
    check(!(await page.$('[data-tour-invite]')), `${tag}: "Nej tak" lukkede ikke invitationen`)
    check((await choice(page)) === 'declined', `${tag}: "Nej tak" blev ikke husket`)
    await page.reload({ waitUntil: 'networkidle0' })
    await wait(INVITE_WAIT)
    check(!(await page.$('[data-tour-invite]')), `${tag}: invitationen kom igen efter "Nej tak"`)
    await ctx.close()
  }

  // ---- 1b: invitationen -> "Ja" starter touren; efter afslutning kommer den ikke igen ----
  {
    const ctx = await browser.createBrowserContext()
    const page = await newPage(ctx, width)
    await open(page)
    await wait(INVITE_WAIT)
    const yes = await page.$('[data-tour-invite-yes]')
    check(!!yes, `${tag}: "Ja, vis mig rundt" i invitationen findes ikke`)
    if (yes) {
      await yes.click()
      await wait(500)
      check(!!(await dialog(page)) && !(await page.$('[data-tour-invite]')), `${tag}: "Ja" startede ikke touren / invitationen blev stående`)
      await page.keyboard.press('Escape')
      await wait(300)
      check((await choice(page)) === 'skipped', `${tag}: lukning blev ikke husket (${await choice(page)})`)
      await page.reload({ waitUntil: 'networkidle0' })
      await wait(INVITE_WAIT)
      check(!(await page.$('[data-tour-invite]')), `${tag}: invitationen kom igen efter en lukket rundvisning`)
    }
    await ctx.close()
  }

  // ---- 2: hovedforløbet med knappen -------------------------------------------------
  {
    const ctx = await browser.createBrowserContext()
    const page = await newPage(ctx, width)
    await open(page)
    const before = await pageState(page)
    const calcBefore = await calcText(page)
    check(!before.root.inert && before.root.hidden === null, `${tag}: siden er inert før start`)

    await page.focus('[data-tour-launcher]')
    await page.keyboard.press('Enter') // starter med tastatur
    await page.waitForSelector('[data-tour-popup]', { timeout: 5000 })
    await wait(400)
    let s = await info(page)
    check(!!s, `${tag}: dialogen vistes ikke`)
    const ids = []
    const dlg = await page.evaluate(() => {
      const d = document.querySelector('[data-tour-popup]')
      const names = (d.getAttribute('aria-labelledby') ?? '').split(' ').map((i) => document.getElementById(i)?.textContent.trim())
      return {
        role: d.getAttribute('role'),
        modal: d.getAttribute('aria-modal'),
        labels: names,
        desc: document.getElementById(d.getAttribute('aria-describedby') ?? '')?.textContent.trim(),
        focus: document.activeElement === d,
        rootInert: document.getElementById('root').hasAttribute('inert'),
        rootHidden: document.getElementById('root').getAttribute('aria-hidden'),
        spotHidden: document.querySelector('.tour-spot').getAttribute('aria-hidden'),
        shield: document.querySelector('.tour-shield').getAttribute('aria-hidden'),
        navVisibleToAt: [...document.querySelectorAll('header')].some((h) => !h.closest('[inert],[aria-hidden="true"]')),
      }
    })
    check(dlg.role === 'dialog' && dlg.modal === 'true', `${tag}: dialogen mangler role/aria-modal`)
    check(dlg.labels.length === 2 && dlg.labels.every(Boolean) && !!dlg.desc, `${tag}: dialogen mangler aria-labelledby/-describedby: ${JSON.stringify(dlg)}`)
    check(dlg.focus, `${tag}: fokus flyttes ikke til dialogen`)
    check(dlg.rootInert && dlg.rootHidden === 'true', `${tag}: siden under er ikke inert/aria-hidden under touren`)
    check(dlg.spotHidden === 'true' && dlg.shield === 'true', `${tag}: overlayet er ikke skjult for hjælpemidler`)
    check(!dlg.navVisibleToAt, `${tag}: navigationen er stadig tilgængelig for hjælpemidler under touren`)
    const total = Number(s?.count?.split(' af ')[1])
    check(s?.count === `1 af ${total}` && total >= 3 && total <= 4, `${tag}: fremdrift "1 af N" (3-4 trin) forkert: ${s?.count}`)
    check(!!s && !s.buttons.includes('Tilbage') && s.buttons.includes('Næste') && s.buttons.includes('Spring over'), `${tag}: knapper på trin 1: ${s?.buttons}`)

    // klik på siden under touren (midt i målet) ændrer intet
    const tcenter = await page.evaluate(() => {
      const el = document.querySelector('.tour-spot').getBoundingClientRect()
      return { x: el.left + el.width / 2, y: Math.min(Math.max(el.top + el.height / 2, 60), innerHeight / 2) }
    })
    await settle(page)
    await page.mouse.click(tcenter.x, Math.min(tcenter.y, 400))
    await wait(250)
    const mid = await pageState(page)
    check(mid.url === before.url && (await calcText(page)) === calcBefore, `${tag}: klik under touren ændrede adresse eller beregner`)

    for (let n = 0; n < total; n++) {
      await settle(page)
      s = await info(page)
      ids.push(s.step)
      check(s.count === `${n + 1} af ${total}`, `${tag}: fremdrift trin ${n + 1}: ${s.count}`)
      await checkStep(page, tag, `trin ${n + 1}`)
      await page.screenshot({ path: `${process.env.TEMP ?? '.'}/tour-${width}-${n + 1}.png` }).catch(() => {})
      // fokusfælde: tab rundt, fokus forbliver i dialogen
      for (let k = 0; k < 5; k++) {
        await page.keyboard.press(k % 2 ? 'Tab' : 'Tab')
        if (!(await info(page)).active) {
          failures.push(`${tag}: fokus forlod dialogen med Tab (trin ${n + 1})`)
          break
        }
      }
      await page.keyboard.down('Shift')
      await page.keyboard.press('Tab')
      await page.keyboard.up('Shift')
      check((await info(page)).active, `${tag}: fokus forlod dialogen med Shift+Tab (trin ${n + 1})`)
      if (n < total - 1) {
        const next = await page.evaluateHandle(() => [...document.querySelectorAll('[data-tour-popup] button')].find((b) => b.textContent.trim() === 'Næste'))
        await next.asElement().click()
        await wait(300)
        const t = await info(page)
        check(/Trin \d af \d/.test(t.live) && t.live.includes(t.title), `${tag}: live-annoncering mangler ved trinskift: "${t.live}"`)
      }
    }
    check(new Set(ids).size === ids.length, `${tag}: trin gentages: ${ids}`)
    check(ids[0] === 'calc', `${tag}: første trin er ikke beregneren: ${ids}`)
    notes.add(`${tag}: trin ved start: ${ids.join(' > ')}`)

    // scroll under touren: spotlightet følger målet
    await page.evaluate(() => window.scrollBy(0, 70))
    await wait(250)
    await checkStep(page, tag, 'efter scroll', { loose: true })

    // tilbage
    s = await info(page)
    check(s.buttons.includes('Færdig') && !s.buttons.includes('Spring over'), `${tag}: sidste trin har ikke "Færdig": ${s.buttons}`)
    const back = await page.evaluateHandle(() => [...document.querySelectorAll('[data-tour-popup] button')].find((b) => b.textContent.trim() === 'Tilbage'))
    await back.asElement().click()
    await wait(300)
    s = await info(page)
    check(s.count === `${total - 1} af ${total}` && s.step === ids[total - 2], `${tag}: Tilbage gik ikke et trin tilbage: ${s.count}/${s.step}`)
    await settle(page)
    await checkStep(page, tag, 'efter Tilbage')
    const fwd = await page.evaluateHandle(() => [...document.querySelectorAll('[data-tour-popup] button')].find((b) => b.textContent.trim() === 'Næste'))
    await fwd.asElement().click()
    await wait(300)

    // Færdig
    const done = await page.evaluateHandle(() => [...document.querySelectorAll('[data-tour-popup] button')].find((b) => b.textContent.trim() === 'Færdig'))
    await done.asElement().click()
    await wait(300)
    const after = await pageState(page)
    check(!(await dialog(page)) && !(await page.$('.tour-spot')), `${tag}: touren lukkede ikke ved "Færdig"`)
    check(!after.root.inert && after.root.hidden === null, `${tag}: inert/aria-hidden blev ikke fjernet efter afslutning`)
    check(after.url === before.url && (await calcText(page)) === calcBefore, `${tag}: adresse eller beregner ændret af touren`)
    check(await page.evaluate(() => document.activeElement === document.querySelector('[data-tour-launcher]')), `${tag}: fokus kom ikke tilbage til "Vis mig rundt"`)
    check((await choice(page)) === 'done', `${tag}: afslutning blev ikke husket (${await choice(page)})`)

    // genåbning
    await page.click('[data-tour-launcher]')
    await page.waitForSelector('[data-tour-popup]', { timeout: 5000 })
    await wait(300)
    s = await info(page)
    check(s.count === `1 af ${total}` && s.step === 'calc', `${tag}: genåbning starter ikke ved trin 1: ${s.count}`)

    // Spring over
    const skip = await page.evaluateHandle(() => [...document.querySelectorAll('[data-tour-popup] button')].find((b) => b.textContent.trim() === 'Spring over'))
    await skip.asElement().click()
    await wait(300)
    check(!(await dialog(page)) && !(await pageState(page)).root.inert, `${tag}: "Spring over" lukkede ikke rent`)
    check(await page.evaluate(() => document.activeElement === document.querySelector('[data-tour-launcher]')), `${tag}: fokus tilbage efter "Spring over"`)
    check((await choice(page)) === 'skipped', `${tag}: "Spring over" blev ikke husket`)

    // Escape midt i touren
    await page.click('[data-tour-launcher]')
    await page.waitForSelector('[data-tour-popup]', { timeout: 5000 })
    const nx = await page.evaluateHandle(() => [...document.querySelectorAll('[data-tour-popup] button')].find((b) => b.textContent.trim() === 'Næste'))
    await nx.asElement().click()
    await wait(300)
    await page.keyboard.press('Escape')
    await wait(300)
    check(!(await dialog(page)) && !(await pageState(page)).root.inert, `${tag}: Escape lukkede ikke rent`)
    check(await page.evaluate(() => document.activeElement === document.querySelector('[data-tour-launcher]')), `${tag}: fokus tilbage efter Escape`)
    check((await pageState(page)).url === before.url, `${tag}: adresse ændret efter Escape`)
    await ctx.close()
  }

  // ---- 3: skjult og manglende mål springes over; ingen mål; reduceret bevægelse ---------
  {
    const ctx = await browser.createBrowserContext()
    const page = await newPage(ctx, width, { reduceMotion: true })
    await open(page)
    await page.evaluate(() => {
      document.querySelector('[data-tour="contact"]')?.style.setProperty('display', 'none')
      document.querySelector('[data-tour="examples"]')?.removeAttribute('data-tour')
    })
    await page.click('[data-tour-launcher]')
    await page.waitForSelector('[data-tour-popup]', { timeout: 5000 })
    await wait(400)
    const ids = []
    for (let n = 0; n < 5; n++) {
      const s = await info(page)
      if (!s) break
      ids.push(s.step)
      if (!s.buttons.includes('Næste')) break
      const nx = await page.evaluateHandle(() => [...document.querySelectorAll('[data-tour-popup] button')].find((b) => b.textContent.trim() === 'Næste'))
      await nx.asElement().click()
      await wait(250)
    }
    check(!ids.includes('contact') && !ids.includes('examples') && ids.length >= 1, `${tag}: skjult/manglende mål blev ikke sprunget over: ${ids}`)
    const rm = await page.evaluate(() => {
      const sp = getComputedStyle(document.querySelector('.tour-spot'))
      return { td: sp.transitionDuration, an: getComputedStyle(document.querySelector('.tour-text')).animationName }
    })
    check(/^0s(, 0s)*$/.test(rm.td) && rm.an === 'none', `${tag}: prefers-reduced-motion respekteres ikke: ${JSON.stringify(rm)}`)
    await page.keyboard.press('Escape')
    await wait(200)

    // ingen mål overhovedet
    await page.evaluate(() => document.querySelectorAll('[data-tour]').forEach((e) => e.removeAttribute('data-tour')))
    await page.click('[data-tour-launcher]')
    await wait(500)
    check(!(await dialog(page)) && !(await pageState(page)).root.inert, `${tag}: uden mål åbnede touren alligevel / siden blev inert`)
    check(!!(await page.$('[data-tour-note]')), `${tag}: ingen besked, når der intet er at vise`)
    await ctx.close()
  }

  // ---- 4: fejl ved hentning og uden lagring ----------------------------------------------
  {
    const ctx = await browser.createBrowserContext()
    const page = await newPage(ctx, width, { blockTour: true })
    await open(page)
    await page.click('[data-tour-launcher]')
    await wait(1200)
    const st = await pageState(page)
    check(!st.root.inert && !(await dialog(page)), `${tag}: fejl ved hentning efterlod siden inert/dialog`)
    check(!!(await page.$('[data-tour-note]')), `${tag}: ingen besked ved fejl i hentning`)
    await ctx.close()
  }
  {
    const ctx = await browser.createBrowserContext()
    const page = await newPage(ctx, width, { noStorage: true })
    await open(page)
    await wait(INVITE_WAIT)
    check(!(await page.$('[data-tour-invite]')), `${tag}: uden lagring vises invitationen alligevel`)
    await page.click('[data-tour-launcher]')
    await page.waitForSelector('[data-tour-popup]', { timeout: 5000 })
    const nx = await page.evaluateHandle(() => [...document.querySelectorAll('[data-tour-popup] button')].find((b) => b.textContent.trim() === 'Næste'))
    await nx.asElement().click()
    await wait(200)
    await page.keyboard.press('Escape')
    await wait(300)
    check(!(await dialog(page)) && !(await pageState(page)).root.inert, `${tag}: uden lagring lukker touren ikke rent`)
    await ctx.close()
  }

  // ---- 5: med et prisresultat vises drift/pris som mål, når de findes ---------------------
  {
    const ctx = await browser.createBrowserContext()
    const page = await newPage(ctx, width)
    await open(page, '/?ydelser=hjemmeside&sider=2-5&bestilling=nej&drift=plus&trin=3')
    const present = await page.evaluate(() => ({ drift: !!document.querySelector('[data-tour="drift"]'), price: !!document.querySelector('[data-tour="price"]') }))
    if (!present.drift && !present.price) {
      notes.add(`${tag}: data-tour="drift"/"price" findes ikke endnu på siden (kontrakt, ejes af priser) — drift/pris-trin ikke afprøvet`)
    } else {
      const url = page.url()
      await page.click('[data-tour-launcher]')
      await page.waitForSelector('[data-tour-popup]', { timeout: 5000 })
      const seen = []
      for (let n = 0; n < 5; n++) {
        await settle(page)
        const s = await info(page)
        if (!s) {
          failures.push(`${tag}: touren lukkede uventet (pris-trin ${n + 1}, set: ${seen})`)
          break
        }
        seen.push(s.step)
        await checkStep(page, tag, `pris-trin ${n + 1}`)
        if (!s.buttons.includes('Næste')) break
        const nx = await page.evaluateHandle(() => [...document.querySelectorAll('[data-tour-popup] button')].find((b) => b.textContent.trim() === 'Næste'))
        await nx.asElement().click()
        await wait(250)
      }
      notes.add(`${tag}: trin med prisresultat: ${seen.join(' > ')}`)
      check(seen.length <= 4, `${tag}: flere end 4 trin med prisresultat`)
      await page.keyboard.press('Escape')
      await wait(250)
      check(page.url() === url, `${tag}: adressen ændret af touren (prisresultat)`)
    }
    await ctx.close()
  }
}

await browser.close()
const unique = [...new Set(errors)]
check(unique.length === 0, `konsolfejl: ${unique.join(' | ')}`)
for (const n of notes) console.log(`note: ${n}`)
if (failures.length) {
  console.error(`Rundvisning-browsertest FEJLET (${failures.length}):\n- ${failures.join('\n- ')}`)
  process.exit(1)
}
console.log('Rundvisning-browsertest bestået (375 og 1440 px): invitation, start, næste/tilbage, spring over, Escape, færdig, genåbning, fokus, spotlight, mål der mangler, fejl, uden lagring, reduceret bevægelse, ingen konsolfejl.')
