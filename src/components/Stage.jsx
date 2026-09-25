import { useRef } from 'react'
import { ConceptWindow } from '../concepts/index.jsx'
import { useScene } from '../motion/useScene.js'
import { Browser, Phone } from './Shots.jsx'

/**
 * SCENE: ET PROJEKT PÅ COMPUTER OG TELEFON
 *
 * SIGNATURINTERAKTIONEN. Hver scene viser konceptillustrationen af et
 * projekt i en browserramme og en telefon. Mens man scroller forbi, ruller
 * siden igennem i begge rammer — med hver sin hastighed — og de to enheder
 * står i hvert sit lag og glider en anelse mod hinanden. Man ser sidens
 * rækkefølge og at den virker i begge formater, uden at trykke på noget.
 *
 * Det er scroll-drevet og lineært (useScene): siden scroller, som browseren
 * vil, og intet holdes fast eller forsinkes. Uden JavaScript og med
 * reduceret bevægelse står rammerne på toppen af siden; de tre udsnit under
 * scenen (Work.jsx) viser resten uden at kræve scroll.
 */
export default function Stage({ project }) {
  const ref = useRef(null)
  useScene(ref)

  return (
    <div
      ref={ref}
      data-stage
      data-reveal
      className={`stage stage--${project.variant}`}
      style={{ '--panel': project.panel }}
    >
      <div className="stage-dev stage-browser" data-par="30">
        <div className="stage-in">
          <Browser label={project.label}>
            <ConceptWindow id={project.id} mode="desktop" scroll />
          </Browser>
        </div>
      </div>

      <div className="stage-dev stage-phone" data-par="-52">
        <div className="stage-in" style={{ '--d': '180ms' }}>
          <Phone label={project.labelMobile}>
            <ConceptWindow id={project.id} mode="mobile" scroll />
          </Phone>
        </div>
      </div>
    </div>
  )
}
