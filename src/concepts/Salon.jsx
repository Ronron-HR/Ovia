import { Box, Btn, Orb, Page, Slats, Txt } from './kit.jsx'

/**
 * Konceptillustration: mørkt, redaktionelt udtryk til en frisør og barber.
 * Varm sort, fløde og guld; serif i overskrifter. Alt er tegnet til siden:
 * ingen fotos, logo, priser eller tekster fra en virksomhed.
 */
const DARK = '#171310'
const DARK2 = '#211a15'
const CREAM = '#f6f1ea'
const GOLD = '#c9974f'
const INK = '#1b1510'

export const SALON_DESKTOP = { w: 1440, h: 3400 }
export const SALON_MOBILE = { w: 390, h: 2600 }

function Frame({ x, y, w, h, tone = 0 }) {
  const tones = [
    ['#3a2a1e', '#2a1d14'],
    ['#4a3a2a', '#33261a'],
    ['#2c2621', '#3b322a'],
  ][tone]
  return (
    <Box x={x} y={y} w={w} h={h} r={6} style={{ overflow: 'hidden', background: tones[1] }}>
      <Slats x={0} y={0} w={w} h={h} a={tones[0]} b={tones[1]} step={w / 12} />
      <Orb x={w * 0.3} y={h * 0.12} d={w * 0.4} from="#fff7e8" to="#d8b678" ring="#f6f1ea" />
      <Box x={0} y={h * 0.7} w={w} h={h * 0.3} bg="rgb(0 0 0 / .35)" />
    </Box>
  )
}

export function SalonDesktop() {
  return (
    <Page {...SALON_DESKTOP} mode="d" bg={CREAM}>
      {/* Hero */}
      <Box x={0} y={0} w={1440} h={900} bg={DARK} />
      <Box x={760} y={0} w={680} h={900} style={{ background: `linear-gradient(90deg, ${DARK} 0%, transparent 38%), radial-gradient(ellipse at 62% 40%, #5a4128 0%, #2a1e14 55%, ${DARK} 100%)` }} />
      <Orb x={1010} y={150} d={330} from="#fff7e8" to="#c9a465" ring="#e9d9b8" />

      <Txt x={180} y={36} size={22} serif color={CREAM} track={0.18}>SALON MATIN</Txt>
      <Txt x={180} y={64} size={10} color={GOLD} track={0.24}>AARHUS C</Txt>
      {['Historien', 'Håndværket', 'Priser', 'Holdet', 'Find os'].map((t, i) => (
        <Txt key={t} x={[884, 972, 1082, 1156, 1230][i]} y={44} size={15} color="rgb(246 241 234 / .75)">{t}</Txt>
      ))}
      <Btn x={1290} y={30} w={92} h={44} label="Book tid" bg={CREAM} color={INK} size={14} />

      <Box x={180} y={274} w={46} h={1} bg={GOLD} />
      <Txt x={244} y={264} size={12} color={GOLD} track={0.22}>FRISØR &amp; BARBER</Txt>
      <Txt x={180} y={320} size={84} serif color={CREAM} lh={1.04} track={-0.02}>
        Klassisk klip.
        <br />
        <span style={{ fontStyle: 'italic' }}>Skarpe kanter.</span>
      </Txt>
      <Txt x={180} y={548} w={500} size={20} color="rgb(246 241 234 / .72)" lh={1.5}>
        Herreklip, skin fade og barbering med ragekniv.
      </Txt>
      <Btn x={180} y={650} w={196} h={58} label="Book tid online" bg={CREAM} color={INK} size={16} />
      <Btn x={392} y={650} w={136} h={58} label="Se priser" color={CREAM} border={[1, 'rgb(246 241 234 / .35)']} size={16} />

      {/* Fordele */}
      <Box x={0} y={900} w={1440} h={92} bg={DARK2} />
      {[
        ['Online booking', 'Vælg behandling og tid'],
        ['Drop-in', 'Kig ind uden tid'],
        ['Gavekort', 'Køb i salonen'],
        ['Beliggenhed', 'Aarhus C'],
      ].map(([a, b], i) => (
        <div key={a}>
          <Txt x={180 + i * 285} y={926} size={15} weight={600} color={CREAM}>{a}</Txt>
          <Txt x={180 + i * 285} y={950} size={13} color="rgb(246 241 234 / .55)">{b}</Txt>
          {i > 0 && <Box x={165 + i * 285} y={922} w={1} h={48} bg="rgb(246 241 234 / .12)" />}
        </div>
      ))}

      {/* Historien */}
      <Frame x={180} y={1100} w={430} h={580} tone={0} />
      <Box x={700} y={1112} w={38} h={1} bg={GOLD} />
      <Txt x={752} y={1102} size={12} color="#7a5c2e" track={0.22}>HISTORIEN</Txt>
      <Txt x={700} y={1150} size={58} serif color={INK} lh={1.04} track={-0.02}>
        Håndværk,
        <br />
        der holder.
      </Txt>
      <Txt x={700} y={1292} w={520} size={19} lh={1.55} color="rgb(27 21 16 / .78)">
        Vi klipper, som vi selv gerne vil klippes: med tid til at høre, hvad du ønsker, og øje for detaljen. Herreklip, skin fade og barbering, lavet med saks, maskine og ragekniv.
      </Txt>
      <Txt x={700} y={1470} w={520} size={19} lh={1.55} color="rgb(27 21 16 / .78)">
        Kom forbi uden tid, eller book online. Du vælger behandling og tidspunkt, og resten klarer vi i stolen.
      </Txt>
      {[
        ['Saks', 'Klassisk klip'],
        ['Maskine', 'Skin fade'],
        ['Ragekniv', 'Barbering'],
      ].map(([a, b], i) => (
        <div key={a}>
          <Txt x={700 + i * 190} y={1616} size={18} weight={600} color={INK}>{a}</Txt>
          <Txt x={700 + i * 190} y={1642} size={14} color="rgb(27 21 16 / .72)">{b}</Txt>
        </div>
      ))}

      {/* Værdier */}
      <Box x={0} y={1850} w={1440} h={800} bg={DARK} />
      <Box x={180} y={1936} w={38} h={1} bg={GOLD} />
      <Txt x={232} y={1926} size={12} color={GOLD} track={0.22}>HVAD VI STÅR FOR</Txt>
      <Txt x={180} y={1976} size={50} serif color={CREAM} lh={1.05} track={-0.02}>
        Tre ting, vi
        <br />
        passer på.
      </Txt>
      {[
        ['Håndværk', 'Saks, maskine og ragekniv, brugt med tid og øje for detaljen.'],
        ['Rådgivning', 'Vi siger, hvad der klæder dig, før vi klipper.'],
        ['Priser', 'Alle behandlinger og priser står på siden, så der ingen overraskelser er.'],
      ].map(([t, d], i) => (
        <div key={t}>
          <Frame x={180 + i * 370} y={2210} w={340} h={250} tone={i} />
          <Txt x={180 + i * 370} y={2490} size={20} weight={600} color={CREAM}>{t}</Txt>
          <Txt x={180 + i * 370} y={2526} w={320} size={16} lh={1.5} color="rgb(246 241 234 / .74)">{d}</Txt>
        </div>
      ))}

      {/* Priser */}
      <Box x={180} y={2736} w={38} h={1} bg={GOLD} />
      <Txt x={232} y={2726} size={12} color="#7a5c2e" track={0.22}>PRISER</Txt>
      <Txt x={180} y={2776} size={50} serif color={INK} lh={1.05} track={-0.02}>
        Vælg behandling,
        <br />
        book tid.
      </Txt>
      {[
        ['Herreklip', '30 min.'],
        ['Skin fade', '30 min.'],
        ['Skægtrim', '15 min.'],
        ['Klip og skæg', '45 min.'],
        ['Barbering', '15 min.'],
        ['Hårvask', '15 min.'],
      ].map(([a, b], i) => {
        const col = i < 3 ? 0 : 1
        const row = i % 3
        const x = 180 + col * 600
        const y = 3020 + row * 92
        return (
          <div key={a}>
            <Box x={x} y={y} w={540} h={1} bg="rgb(27 21 16 / .18)" />
            <Txt x={x} y={y + 20} size={22} color={INK}>{a}</Txt>
            <Txt x={x} y={y + 52} size={14} color="rgb(27 21 16 / .72)">{b}</Txt>
            <Btn x={x + 452} y={y + 22} w={88} h={44} label="Book" color={INK} border={[1, 'rgb(27 21 16 / .3)']} size={15} />
          </div>
        )
      })}
      <Box x={180} y={3296} w={1080} h={1} bg="rgb(27 21 16 / .18)" />
    </Page>
  )
}

export function SalonMobile() {
  return (
    <Page {...SALON_MOBILE} mode="m" bg={CREAM}>
      <Box x={0} y={0} w={390} h={780} bg={DARK} />
      <Box x={0} y={0} w={390} h={780} style={{ background: `radial-gradient(ellipse at 80% 24%, #5a4128 0%, #2a1e14 50%, ${DARK} 95%)` }} />
      <Orb x={190} y={70} d={230} from="#fff7e8" to="#c9a465" ring="#e9d9b8" />
      <Box x={0} y={0} w={390} h={780} style={{ background: `linear-gradient(180deg, transparent 30%, ${DARK} 78%)` }} />

      <Txt x={24} y={22} size={19} serif color={CREAM} track={0.18}>SALON MATIN</Txt>
      <Txt x={24} y={46} size={8} color={GOLD} track={0.24}>AARHUS C</Txt>
      {[0, 1, 2].map((i) => (
        <Box key={i} x={342} y={28 + i * 7} w={24} h={1.5} bg={CREAM} />
      ))}

      <Box x={24} y={430} w={30} h={1} bg={GOLD} />
      <Txt x={66} y={422} size={10} color={GOLD} track={0.22}>FRISØR &amp; BARBER</Txt>
      <Txt x={24} y={452} size={48} serif color={CREAM} lh={1.04} track={-0.02}>
        Klassisk klip.
        <br />
        <span style={{ fontStyle: 'italic' }}>Skarpe kanter.</span>
      </Txt>
      <Txt x={24} y={574} w={320} size={16} color="rgb(246 241 234 / .72)" lh={1.5}>
        Herreklip, skin fade og barbering med ragekniv.
      </Txt>
      <Btn x={24} y={654} w={166} h={52} label="Book tid online" bg={CREAM} color={INK} size={15} />
      <Btn x={202} y={654} w={112} h={52} label="Se priser" color={CREAM} border={[1, 'rgb(246 241 234 / .35)']} size={15} />

      {[
        ['Online booking', 'Vælg behandling og tid'],
        ['Drop-in', 'Kig ind uden tid'],
        ['Gavekort', 'Køb i salonen'],
      ].map(([a, b], i) => (
        <div key={a}>
          <Box x={24} y={780 + i * 74} w={342} h={1} bg="rgb(246 241 234 / .12)" />
          <Txt x={24} y={800 + i * 74} size={15} weight={600} color={CREAM}>{a}</Txt>
          <Txt x={24} y={824 + i * 74} size={13} color="rgb(246 241 234 / .55)">{b}</Txt>
        </div>
      ))}
      <Box x={0} y={770} w={390} h={1} bg={DARK} />
      <Box x={0} y={1002} w={390} h={1000} bg={CREAM} />

      <Frame x={24} y={1050} w={342} h={340} tone={0} />
      <Box x={24} y={1428} w={30} h={1} bg={GOLD} />
      <Txt x={66} y={1420} size={10} color="#7a5c2e" track={0.22}>HISTORIEN</Txt>
      <Txt x={24} y={1452} size={40} serif color={INK} lh={1.05} track={-0.02}>
        Håndværk,
        <br />
        der holder.
      </Txt>
      <Txt x={24} y={1556} w={342} size={16} lh={1.55} color="rgb(27 21 16 / .78)">
        Vi klipper, som vi selv gerne vil klippes: med tid til at høre, hvad du ønsker, og øje for detaljen. Herreklip, skin fade og barbering.
      </Txt>
      <Txt x={24} y={1690} w={342} size={16} lh={1.55} color="rgb(27 21 16 / .78)">
        Kom forbi uden tid, eller book online.
      </Txt>

      <Box x={0} y={1830} w={390} h={770} bg={DARK} />
      <Box x={24} y={1892} w={30} h={1} bg={GOLD} />
      <Txt x={66} y={1884} size={10} color={GOLD} track={0.22}>HVAD VI STÅR FOR</Txt>
      <Txt x={24} y={1914} size={38} serif color={CREAM} lh={1.05} track={-0.02}>
        Tre ting, vi
        <br />
        passer på.
      </Txt>
      {[
        ['Håndværk', 'Saks, maskine og ragekniv, brugt med tid og øje for detaljen.'],
        ['Rådgivning', 'Vi siger, hvad der klæder dig, før vi klipper.'],
      ].map(([t, d], i) => (
        <div key={t}>
          <Frame x={24} y={2020 + i * 280} w={342} h={190} tone={i} />
          <Txt x={24} y={2226 + i * 280} size={17} weight={600} color={CREAM}>{t}</Txt>
          <Txt x={24} y={2256 + i * 280} w={330} size={14} lh={1.5} color="rgb(246 241 234 / .74)">{d}</Txt>
        </div>
      ))}
    </Page>
  )
}
