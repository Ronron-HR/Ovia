import { useRef } from 'react'
import { demos } from '../content.demos.js'
import { paths } from '../data/texts.js'
import { useScene } from '../motion/useScene.js'
import { Arrow, Browser, Phone } from './Shots.jsx'

/**
 * Præsentation af en demo: en scene med skærmbilleder af selve demoen
 * (public/demoer, taget med `npm run demo-shots`) i en browser- og en
 * telefonramme på demoens egen farve.
 *
 * Scroll-effekten fra den tidligere side (useScene): rammerne glider med hver
 * sin hastighed, og siden ruller igennem sit vindue, mens scenen krydser
 * skærmen. Kun transform og opacity, og kun mens scenen er nær skærmen. På
 * telefon kører kun sidens rulning igennem vinduet. Ved reduceret bevægelse og
 * uden JavaScript står rammerne på toppen af siden.
 *
 * Skærmbillederne er høje udsnit af demoen (toppen af siden): den rulning, der
 * ses, er billedet, ikke en rigtig side.
 */

/** Hvor mange procent af billedets højde, det skal flyttes for at vise det hele. */
const travel = (img, windowRatio) => {
  const ratio = img.height / img.width
  return ratio > windowRatio ? ((1 - windowRatio / ratio) * 100).toFixed(2) : undefined
}

export default function DemoVisual({ project, eager = false }) {
  const ref = useRef(null)
  useScene(ref)
  const { desktop: d, mobile: m } = project
  const img = (s, travelValue) => (
    <img
      src={s.src}
      width={s.width}
      height={s.height}
      alt=""
      loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'}
      decoding="async"
      className="scroll-img"
      data-travel={travelValue}
    />
  )

  return (
    <div ref={ref} data-stage data-reveal className="stage" style={{ '--panel': project.panel }}>
      <div className="stage-dev stage-browser" data-par="22">
        <Browser label={project.label}>
          <div className="scroll-view">{img(d, travel(d, 10 / 16))}</div>
        </Browser>
      </div>
      <div className="stage-dev stage-phone" data-par="-40">
        <Phone label={project.labelMobile}>
          <div className="scroll-view scroll-view--phone">{img(m, travel(m, 19.5 / 9))}</div>
        </Phone>
      </div>
    </div>
  )
}

/** Handlinger til et koncept: åbn det, og se priserne på en hjemmeside. */
export function DemoActions({ project, className = '' }) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center ${className}`}>
      <a href={project.path} className="btn btn-primary min-h-11">
        {demos.open}
        <Arrow />
        <span className="sr-only"> ({project.name})</span>
      </a>
      <a href={`${paths.priser}?ydelser=hjemmeside#beregner`} className="btn btn-ghost min-h-11">
        {demos.calcCta}
      </a>
    </div>
  )
}
