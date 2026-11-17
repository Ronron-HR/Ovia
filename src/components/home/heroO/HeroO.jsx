import { useEffect, useRef, useState } from 'react'
import posterAvif from '../../../assets/hero/ovia-o.avif'
import posterWebp from '../../../assets/hero/ovia-o.webp'

/**
 * Heroens O: tre metaldele, der åbner og samler sig i et loop på fem sekunder.
 *
 * Stillbilledet (samme pose som animationens første frame, se scripts/hero-o.mjs) står i den
 * forudrenderede HTML, så pladsen aldrig er tom og siden ikke hopper. 3D-scenen (three.js) hentes
 * først, når browseren har tid, og kun hvis figuren er i nærheden af skærmen. Når første frame er
 * tegnet, tones lærredet ind over stillbilledet.
 *
 * Animationen kører kun, når figuren er synlig, fanen er aktiv og brugeren ikke har bedt om
 * reduceret bevægelse. Ved reduceret bevægelse hentes 3D slet ikke; stillbilledet bliver stående.
 * Kan WebGL ikke starte (eller mistes konteksten), bliver stillbilledet også stående.
 *
 * Pladsen har fast format (12:13), som kameraet i scene.js er indstillet til.
 */
/** Kan browseren lave en WebGL-kontekst? Testkonteksten frigives straks igen. */
const webglAvailable = () => {
  try {
    const gl = document.createElement('canvas').getContext('webgl2')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    return Boolean(gl)
  } catch {
    return false
  }
}

export default function HeroO({ className = '' }) {
  const boxRef = useRef(null)
  const canvasRef = useRef(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const box = boxRef.current
    const canvas = canvasRef.current
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let api = null
    let disposed = false
    let booting = false
    let visible = false
    let lost = false
    let idle = 0

    const sync = () => {
      if (!api || lost) return
      if (visible && !document.hidden && !motion.matches) api.start()
      else api.stop()
    }

    const boot = async () => {
      if (booting || api || disposed || motion.matches) return
      booting = true
      if (!webglAvailable()) return // three.js hentes ikke forgæves; stillbilledet bliver stående
      try {
        const { createHeroO } = await import('./scene.js')
        if (disposed) return
        const created = await createHeroO(canvas, {
          onFirstFrame: () => !disposed && setLive(true),
          onContextLost: () => {
            lost = true
            if (!disposed) setLive(false)
          },
        })
        // Komponenten kan være fjernet, mens scenen blev bygget.
        if (disposed) {
          created.dispose()
          return
        }
        api = created
        const { width, height } = box.getBoundingClientRect()
        api.setSize(width, height)
        api.renderAt(0)
        sync()
      } catch {
        // Ingen WebGL eller fejl i hentningen: stillbilledet bliver stående.
        api = null
      }
    }

    const schedule = () => {
      if (idle || api) return
      idle = window.requestIdleCallback ? window.requestIdleCallback(boot, { timeout: 1500 }) : window.setTimeout(boot, 200)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) schedule()
        sync()
      },
      { rootMargin: '120px' },
    )
    io.observe(box)

    const ro = new ResizeObserver(([entry]) => {
      if (!api || lost) return
      const { width, height } = entry.contentRect
      api.setSize(width, height)
      api.renderAt(api.time) // tegn straks i ny størrelse, også når loopet står stille
    })
    ro.observe(box)

    const onMotionChange = () => {
      if (motion.matches) {
        api?.stop()
        setLive(false) // tilbage til stillbilledet (første frame)
      } else if (api && !lost) {
        api.renderAt(0)
        setLive(true)
        sync()
      } else if (visible) schedule()
    }
    motion.addEventListener('change', onMotionChange)
    document.addEventListener('visibilitychange', sync)

    return () => {
      disposed = true
      if (idle) (window.cancelIdleCallback ?? window.clearTimeout)(idle)
      io.disconnect()
      ro.disconnect()
      motion.removeEventListener('change', onMotionChange)
      document.removeEventListener('visibilitychange', sync)
      api?.dispose()
      api = null
    }
  }, [])

  return (
    <div ref={boxRef} className={`relative aspect-[12/13] ${className}`} aria-hidden="true">
      <picture>
        <source type="image/avif" srcSet={posterAvif} />
        <img
          src={posterWebp}
          alt=""
          width={960}
          height={1040}
          decoding="async"
          // Stillbilledet er sidens største element over folden (LCP): hentes med det samme.
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full transition-opacity duration-0"
          // Stillbilledet skjules først, når lærredet er helt tonet ind (ellers dæmpes figuren midt i
          // overgangen), og vises med det samme, når 3D slås fra.
          style={{ opacity: live ? 0 : 1, transitionDelay: live ? '320ms' : '0ms' }}
        />
      </picture>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full transition-opacity duration-300 ease-out"
        style={{ opacity: live ? 1 : 0 }}
      />
    </div>
  )
}
