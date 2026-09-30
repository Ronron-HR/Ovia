import { Box, Btn, Orb, Page, Skel, Txt, U } from './kit.jsx'

/**
 * Illustration: rolig vinbar i mørkegrønt og fløde med serifskrift.
 * Alt er tegnet til siden: ingen fotos, logo, kort, priser eller tekster fra
 * en virksomhed. Flaskerne, glassene og lamperne er egne former.
 */
const SKOV = '#1f221b'
const OLIVEN = '#33382a'
const CREME = '#f1ecdd'
const SALVIE = '#b9bb8e'
const RUST = '#8a4a3a'

export const VINBAR_DESKTOP = { w: 1440, h: 2400 }
export const VINBAR_MOBILE = { w: 390, h: 1900 }

function Bottle({ x, y, s = 1, body = '#2c3a2a', label = CREME }) {
  return (
    <>
      <Box x={x + 26 * s} y={y} w={28 * s} h={90 * s} r={8 * s} bg={body} />
      <Box x={x} y={y + 70 * s} w={80 * s} h={230 * s} r={22 * s} bg={body} />
      <Box x={x + 12 * s} y={y + 140 * s} w={56 * s} h={90 * s} r={4 * s} bg={label} style={{ opacity: 0.9 }} />
      <Box x={x + 22 * s} y={y + 160 * s} w={36 * s} h={4 * s} r={2 * s} bg={body} />
      <Box x={x + 22 * s} y={y + 176 * s} w={28 * s} h={4 * s} r={2 * s} bg={body} />
    </>
  )
}

function Glass({ x, y, s = 1, wine = RUST }) {
  return (
    <>
      <Box x={x} y={y} w={90 * s} h={110 * s} r={45 * s} bg="rgb(241 236 221 / .22)" border={[2 * s, 'rgb(241 236 221 / .5)']} />
      <Box x={x + 8 * s} y={y + 52 * s} w={74 * s} h={54 * s} r={37 * s} bg={wine} style={{ opacity: 0.9 }} />
      <Box x={x + 43 * s} y={y + 108 * s} w={4 * s} h={90 * s} bg="rgb(241 236 221 / .5)" />
      <Box x={x + 20 * s} y={y + 196 * s} w={50 * s} h={4 * s} r={2 * s} bg="rgb(241 236 221 / .5)" />
    </>
  )
}

function Leader({ x, y, w, label, note }) {
  return (
    <>
      <Txt x={x} y={y} size={22} color={CREME}>{label}</Txt>
      <Box
        x={x + 420}
        y={y + 22}
        w={w - 420 - 90}
        h={0}
        style={{ borderBottom: `${U(2)} dotted rgb(185 187 142 / .6)` }}
      />
      <Txt x={x + w - 80} y={y} size={20} italic color="rgb(241 236 221 / .7)">{note}</Txt>
    </>
  )
}

export function VinbarDesktop() {
  return (
    <Page {...VINBAR_DESKTOP} mode="d" bg={OLIVEN}>
      {/* Nav og hero */}
      <Box x={0} y={0} w={1440} h={860} style={{ background: `linear-gradient(180deg, #2a2e23 0%, ${SKOV} 100%)` }} />
      <Orb x={1010} y={70} d={210} from="rgb(255 226 160 / .55)" to="rgb(200 140 60 / 0)" glow />
      <Orb x={1230} y={40} d={150} from="rgb(255 226 160 / .45)" to="rgb(200 140 60 / 0)" glow />
      <Bottle x={1010} y={280} s={1.6} body="#26301f" />
      <Bottle x={1160} y={330} s={1.4} body="#3a2a22" label="#e7d7b8" />
      <Glass x={860} y={420} s={1.2} />

      <Txt x={120} y={34} size={38} serif italic color={CREME}>Vinbar</Txt>
      {['Denne måned', 'Kortet', 'Om stedet', 'Find os'].map((t, i) => (
        <Txt key={t} x={[640, 780, 860, 980][i]} y={46} size={16} weight={600} color="rgb(241 236 221 / .9)">{t}</Txt>
      ))}
      <Box x={1270} y={38} w={110} h={42} r={4} bg={CREME} />
      <Txt x={1296} y={48} size={16} weight={600} color={SKOV}>Åbent nu</Txt>

      <Txt x={120} y={300} size={116} serif italic color={CREME} lh={1}>
        Vin, cocktails
        <br />
        og musik.
      </Txt>
      <Txt x={120} y={560} w={560} size={24} color="rgb(241 236 221 / .85)" lh={1.5}>
        En rolig bar, hvor man kan sidde længe og tale sammen.
      </Txt>
      <Btn x={120} y={650} w={170} h={58} label="Book bord" bg={CREME} color={SKOV} size={18} weight={600} r={4} />
      <Btn x={306} y={650} w={140} h={58} label="Find os" color={CREME} border={[1, 'rgb(241 236 221 / .6)']} size={18} weight={600} r={4} />

      {/* Opslagstavle */}
      <Box x={0} y={860} w={1440} h={230} bg={SKOV} style={{ borderTop: `${U(1)} solid rgb(185 187 142 / .3)` }} />
      {['Åbningstider', 'Bord', 'Adresse'].map((t, i) => (
        <div key={t}>
          <Txt x={120 + i * 430} y={904} size={26} serif italic color={SALVIE}>{t}</Txt>
          <Skel x={120 + i * 430} y={956} w={330} n={3} gap={26} color="rgb(241 236 221 / .3)" />
        </div>
      ))}

      {/* Denne måned */}
      <Txt x={120} y={1180} size={84} serif color={CREME} weight={600}>Denne måned</Txt>
      {['Månedens vin', 'Årstidens drink'].map((t, i) => (
        <div key={t}>
          <Box x={120 + i * 640} y={1330} w={560} h={0} style={{ borderTop: `${U(1)} solid rgb(185 187 142 / .5)` }} />
          <Txt x={120 + i * 640} y={1366} size={44} serif italic color={CREME}>{t}</Txt>
          <Skel x={120 + i * 640} y={1440} w={520} n={3} gap={28} color="rgb(241 236 221 / .3)" />
        </div>
      ))}

      {/* Billedbånd */}
      <Box x={0} y={1640} w={480} h={420} bg="#2f3a29" />
      <Box x={480} y={1640} w={480} h={420} bg="#3b2d25" />
      <Box x={960} y={1640} w={480} h={420} bg="#232a1d" />
      <Bottle x={160} y={1690} s={1.15} body="#1f2a1c" />
      <Bottle x={270} y={1720} s={1.0} body="#4a3a2e" label="#e7d7b8" />
      <Glass x={650} y={1720} s={1.5} />
      <Orb x={1060} y={1690} d={150} from="rgb(255 226 160 / .8)" to="rgb(200 140 60 / 0)" glow />
      <Orb x={1250} y={1740} d={110} from="rgb(255 226 160 / .7)" to="rgb(200 140 60 / 0)" glow />
      <Box x={1000} y={1900} w={380} h={90} r={10} bg="rgb(241 236 221 / .1)" />

      {/* Kortet */}
      <Txt x={120} y={2110} size={84} serif color={CREME} weight={600}>Kortet</Txt>
      <Leader x={620} y={2124} w={700} label="Cocktails" note="Spørg" />
      <Leader x={620} y={2184} w={700} label="Vin på glas" note="Spørg" />
      <Leader x={620} y={2244} w={700} label="Bobler" note="Spørg" />
      <Leader x={620} y={2304} w={700} label="Fadøl og alkoholfrit" note="Spørg" />
    </Page>
  )
}

export function VinbarMobile() {
  return (
    <Page {...VINBAR_MOBILE} mode="m" bg={OLIVEN}>
      <Box x={0} y={0} w={390} h={760} style={{ background: `linear-gradient(180deg, #2a2e23 0%, ${SKOV} 100%)` }} />
      <Orb x={250} y={70} d={130} from="rgb(255 226 160 / .5)" to="rgb(200 140 60 / 0)" glow />
      <Bottle x={250} y={260} s={0.95} body="#26301f" />
      <Bottle x={330} y={300} s={0.7} body="#3a2a22" label="#e7d7b8" />

      <Txt x={24} y={26} size={30} serif italic color={CREME}>Vinbar</Txt>
      <Box x={286} y={26} w={80} h={34} r={4} bg={CREME} />
      <Txt x={300} y={33} size={13} weight={600} color={SKOV}>Åbent nu</Txt>

      <Txt x={24} y={430} size={52} serif italic color={CREME} lh={1.02}>
        Vin, cocktails
        <br />
        og musik.
      </Txt>
      <Txt x={24} y={548} w={320} size={17} color="rgb(241 236 221 / .85)" lh={1.5}>
        En rolig bar, hvor man kan sidde længe og tale sammen.
      </Txt>
      <Btn x={24} y={628} w={150} h={52} label="Book bord" bg={CREME} color={SKOV} size={16} weight={600} r={4} />
      <Btn x={188} y={628} w={120} h={52} label="Find os" color={CREME} border={[1, 'rgb(241 236 221 / .6)']} size={16} weight={600} r={4} />

      <Box x={0} y={760} w={390} h={270} bg={SKOV} style={{ borderTop: `${U(1)} solid rgb(185 187 142 / .3)` }} />
      {['Åbningstider', 'Bord'].map((t, i) => (
        <div key={t}>
          <Txt x={24} y={790 + i * 120} size={22} serif italic color={SALVIE}>{t}</Txt>
          <Skel x={24} y={828 + i * 120} w={300} n={2} gap={22} color="rgb(241 236 221 / .3)" />
        </div>
      ))}

      <Txt x={24} y={1080} size={42} serif color={CREME} weight={600}>Denne måned</Txt>
      {['Månedens vin', 'Årstidens drink'].map((t, i) => (
        <div key={t}>
          <Box x={24} y={1170 + i * 190} w={342} h={0} style={{ borderTop: `${U(1)} solid rgb(185 187 142 / .5)` }} />
          <Txt x={24} y={1190 + i * 190} size={28} serif italic color={CREME}>{t}</Txt>
          <Skel x={24} y={1240 + i * 190} w={320} n={3} gap={22} color="rgb(241 236 221 / .3)" />
        </div>
      ))}

      <Txt x={24} y={1580} size={42} serif color={CREME} weight={600}>Kortet</Txt>
      {['Cocktails', 'Vin på glas', 'Bobler', 'Fadøl'].map((t, i) => (
        <div key={t}>
          <Txt x={24} y={1650 + i * 56} size={18} color={CREME}>{t}</Txt>
          <Box x={140} y={1662 + i * 56} w={170} h={0} style={{ borderBottom: `${U(2)} dotted rgb(185 187 142 / .6)` }} />
          <Txt x={318} y={1650 + i * 56} size={16} italic color="rgb(241 236 221 / .7)">Spørg</Txt>
        </div>
      ))}
    </Page>
  )
}
