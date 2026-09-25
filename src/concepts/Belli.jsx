import { Box, Btn, Checks, Orb, Page, Plate, Skel, Txt } from './kit.jsx'

/**
 * Konceptillustration: varm brasserie med bordeaux, fløde og lampelys.
 * Serif i overskrifter, ternet dug som eneste mønster. Alt er tegnet til
 * siden: ingen fotos, logo, menukort eller historie fra en virksomhed.
 */
const NIGHT = '#1d120e'
const WINE = '#6a1b22'
const CREAM = '#faf6ee'
const INK = '#241612'
const BRASS = '#c8a45c'

export const BELLI_DESKTOP = { w: 1440, h: 3300 }
export const BELLI_MOBILE = { w: 390, h: 2500 }

function Lamps({ scale = 1, x0 = 0, y0 = 0 }) {
  const items = [
    [170, 130, 120],
    [520, 60, 170],
    [900, 150, 130],
    [1240, 90, 150],
  ]
  return items.map(([x, y, d], i) => (
    <Orb
      key={i}
      x={x0 + x * scale}
      y={y0 + y * scale}
      d={d * scale}
      from="rgb(255 226 160 / .95)"
      to="rgb(200 120 40 / 0)"
      glow
    />
  ))
}

export function BelliDesktop() {
  return (
    <Page {...BELLI_DESKTOP} mode="d" bg={CREAM}>
      {/* Hero */}
      <Box x={0} y={0} w={1440} h={810} style={{ background: `linear-gradient(180deg, #2a1811 0%, ${NIGHT} 70%, #150c09 100%)` }} />
      <Lamps />
      <Box x={0} y={560} w={1440} h={250} style={{ background: 'linear-gradient(180deg, transparent, rgb(0 0 0 / .55))' }} />
      <Checks x={0} y={690} w={1440} h={120} a="rgb(179 38 45 / .55)" b="rgb(244 236 224 / .32)" size={40} />

      <Txt x={180} y={32} size={12} color={CREAM} track={0.42} serif>BRASSERIE</Txt>
      <Txt x={180} y={50} size={30} color={CREAM} track={0.06} weight={700} serif>BELLI</Txt>
      {['Menu', 'Frokost', 'Aften', 'Historien', 'Huset', 'Kontakt'].map((t, i) => (
        <Txt key={t} x={[760, 826, 904, 966, 1062, 1128][i]} y={46} size={15} color="rgb(250 246 238 / .85)">{t}</Txt>
      ))}
      <Btn x={1230} y={30} w={116} h={46} label="Book bord" color={CREAM} border={[1, 'rgb(250 246 238 / .5)']} size={14} weight={600} />

      <Txt x={180} y={340} size={19} serif italic color={BRASS}>Fransk brasserie i Aarhus</Txt>
      <Txt x={180} y={378} size={150} serif color={CREAM} lh={1} track={-0.02}>Belli</Txt>
      <Txt x={180} y={550} w={460} size={20} color="rgb(250 246 238 / .82)" lh={1.5}>
        Moules, steak frites og tatar i et hus med sjæl.
      </Txt>
      <Btn x={180} y={628} w={158} h={54} label="Book bord" bg={WINE} color={CREAM} size={16} weight={600} r={3} />
      <Btn x={354} y={628} w={176} h={54} label="Se menukortet" color={CREAM} border={[1, 'rgb(250 246 238 / .5)']} size={16} r={3} />

      {/* Aktuelt */}
      <Box x={0} y={810} w={1440} h={64} bg="#f0e8d8" />
      <Txt x={180} y={831} size={14} weight={700} color={WINE}>Aktuelt</Txt>
      <Skel x={262} y={838} w={420} n={1} gap={0} color="rgb(36 22 18 / .2)" last={1} />

      {/* Huset */}
      <Txt x={180} y={952} size={78} serif color={INK} lh={1} track={-0.01}>Huset</Txt>
      <Skel x={180} y={1080} w={480} n={6} gap={26} color="rgb(36 22 18 / .15)" />
      <Skel x={180} y={1260} w={480} n={4} gap={26} color="rgb(36 22 18 / .15)" />
      <Box x={780} y={952} w={480} h={340} r={4} style={{ overflow: 'hidden', background: '#efe6d4' }}>
        <Checks x={0} y={190} w={480} h={150} a="rgb(179 38 45 / .8)" b="#f4ece0" size={36} />
        <Box x={40} y={70} w={110} h={130} r={6} bg="#c8912f" />
        <Box x={180} y={90} w={110} h={120} r={6} bg="#2f6f8f" />
        <Box x={320} y={70} w={110} h={130} r={6} bg="#b8322f" />
        <Box x={0} y={0} w={480} h={60} style={{ background: 'linear-gradient(180deg, rgb(106 27 34 / .5), transparent)' }} />
      </Box>

      {/* Historien */}
      <Box x={0} y={1540} w={1440} h={980} bg={WINE} />
      <Txt x={180} y={1620} size={64} serif color={CREAM} lh={1.04} track={-0.01}>
        Historien
        <br />
        om huset
      </Txt>
      <Skel x={780} y={1640} w={480} n={3} gap={24} color="rgb(250 246 238 / .28)" />
      {[0, 1].map((i) => (
        <Box key={i} x={180 + i * 200} y={1850} w={180} h={230} r={2} style={{ overflow: 'hidden', background: i ? '#8a4a2c' : '#5a3a34' }}>
          <Box x={0} y={0} w={180} h={230} style={{ background: 'radial-gradient(circle at 50% 30%, rgb(255 226 160 / .5), transparent 60%)' }} />
          <Box x={55} y={70} w={70} h={70} r={35} bg="rgb(250 246 238 / .55)" />
          <Box x={30} y={150} w={120} h={90} r={40} bg="rgb(20 10 8 / .5)" />
        </Box>
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i}>
          <Box x={780} y={1850 + i * 100} w={480} h={1} bg="rgb(250 246 238 / .25)" />
          <Box x={780} y={1876 + i * 100} w={70} h={20} r={3} bg={BRASS} style={{ opacity: 0.85 }} />
          <Skel x={880} y={1878 + i * 100} w={380} n={2} gap={20} color="rgb(250 246 238 / .28)" />
        </div>
      ))}

      {/* Maden */}
      <Txt x={180} y={2650} size={78} serif color={INK} lh={1} track={-0.01}>Maden</Txt>
      <Skel x={780} y={2670} w={480} n={3} gap={26} color="rgb(36 22 18 / .15)" />
      <Box x={180} y={2830} w={560} h={380} r={4} bg="#2a1811" style={{ overflow: 'hidden' }}>
        <Plate x={140} y={40} d={300} food="#3d2a22" accent="#a8c060" rim="#eee5d3" />
      </Box>
      <Box x={780} y={2830} w={480} h={380} r={4} bg="#e9dcc3" style={{ overflow: 'hidden' }}>
        <Plate x={90} y={40} d={300} food="#b8622a" accent="#5a7d3a" rim="#faf6ee" />
      </Box>
    </Page>
  )
}

export function BelliMobile() {
  return (
    <Page {...BELLI_MOBILE} mode="m" bg={CREAM}>
      <Box x={0} y={0} w={390} h={760} style={{ background: `linear-gradient(180deg, #2a1811 0%, ${NIGHT} 70%, #150c09 100%)` }} />
      <Lamps scale={0.42} x0={-10} y0={50} />
      <Checks x={0} y={600} w={390} h={160} a="rgb(179 38 45 / .5)" b="rgb(244 236 224 / .28)" size={26} />
      <Box x={0} y={420} w={390} h={340} style={{ background: 'linear-gradient(180deg, transparent, rgb(0 0 0 / .6))' }} />

      <Txt x={24} y={22} size={9} color={CREAM} track={0.42} serif>BRASSERIE</Txt>
      <Txt x={24} y={36} size={24} color={CREAM} track={0.06} weight={700} serif>BELLI</Txt>
      {[0, 1, 2].map((i) => (
        <Box key={i} x={342} y={28 + i * 7} w={24} h={1.5} bg={CREAM} />
      ))}

      <Txt x={24} y={330} size={15} serif italic color={BRASS}>Fransk brasserie i Aarhus</Txt>
      <Txt x={24} y={356} size={96} serif color={CREAM} lh={1} track={-0.02}>Belli</Txt>
      <Txt x={24} y={490} w={330} size={16} color="rgb(250 246 238 / .82)" lh={1.5}>
        Moules, steak frites og tatar i et hus med sjæl.
      </Txt>
      <Btn x={24} y={570} w={342} h={50} label="Book bord" bg={WINE} color={CREAM} size={16} weight={600} r={3} />
      <Btn x={24} y={632} w={342} h={50} label="Se menukortet" color={CREAM} border={[1, 'rgb(250 246 238 / .5)']} size={16} r={3} />

      <Box x={0} y={760} w={390} h={90} bg="#f0e8d8" />
      <Txt x={24} y={784} size={13} weight={700} color={WINE}>Aktuelt</Txt>
      <Skel x={24} y={812} w={342} n={2} gap={16} color="rgb(36 22 18 / .2)" />

      <Txt x={24} y={900} size={50} serif color={INK} lh={1} track={-0.01}>Huset</Txt>
      <Skel x={24} y={984} w={342} n={5} gap={24} color="rgb(36 22 18 / .15)" />
      <Box x={24} y={1140} w={342} h={230} r={4} style={{ overflow: 'hidden', background: '#efe6d4' }}>
        <Checks x={0} y={130} w={342} h={100} a="rgb(179 38 45 / .8)" b="#f4ece0" size={26} />
        <Box x={28} y={40} w={80} h={90} r={5} bg="#c8912f" />
        <Box x={130} y={54} w={80} h={84} r={5} bg="#2f6f8f" />
        <Box x={232} y={40} w={80} h={90} r={5} bg="#b8322f" />
      </Box>

      <Box x={0} y={1440} w={390} h={620} bg={WINE} />
      <Txt x={24} y={1490} size={44} serif color={CREAM} lh={1.04}>
        Historien
        <br />
        om huset
      </Txt>
      {[0, 1, 2, 3].map((i) => (
        <div key={i}>
          <Box x={24} y={1620 + i * 100} w={342} h={1} bg="rgb(250 246 238 / .25)" />
          <Box x={24} y={1642 + i * 100} w={56} h={18} r={3} bg={BRASS} style={{ opacity: 0.85 }} />
          <Skel x={24} y={1674 + i * 100} w={342} n={2} gap={16} color="rgb(250 246 238 / .28)" />
        </div>
      ))}

      <Txt x={24} y={2120} size={50} serif color={INK} lh={1} track={-0.01}>Maden</Txt>
      <Box x={24} y={2200} w={342} h={250} r={4} bg="#2a1811" style={{ overflow: 'hidden' }}>
        <Plate x={76} y={20} d={210} food="#3d2a22" accent="#a8c060" rim="#eee5d3" />
      </Box>
    </Page>
  )
}
