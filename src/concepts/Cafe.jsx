import { Box, Btn, Page, Plate, Polaroid, Skel, Txt } from './kit.jsx'

/**
 * Konceptillustration: farverig café med gule, lyserøde og lilla flader.
 * Kraftig sans, runde former og polaroids. Alt er tegnet til siden:
 * ingen fotos, logo, menukort eller tilbud fra en virksomhed.
 */
const YELLOW = '#f4c343'
const INK = '#241b14'
const PINK = '#f3a7bd'
const PURPLE = '#5b3f7d'
const GREEN = '#2f7d5b'

export const CAFE_DESKTOP = { w: 1440, h: 2500 }
export const CAFE_MOBILE = { w: 390, h: 2100 }

const H = { fontWeight: 800, letterSpacing: '-0.035em' }

function Cup({ x, y, d }) {
  return (
    <>
      <Box x={x} y={y} w={d} h={d} r={d / 2} bg="#fff" style={{ boxShadow: 'inset 0 0 0 4px rgb(0 0 0 / .05)' }} />
      <Box x={x + d * 0.18} y={y + d * 0.18} w={d * 0.64} h={d * 0.64} r={d * 0.32} bg="#7a4a2a" />
      <Box x={x + d * 0.3} y={y + d * 0.3} w={d * 0.4} h={d * 0.4} r={d * 0.2} bg="#c99866" />
    </>
  )
}

export function CafeDesktop() {
  return (
    <Page {...CAFE_DESKTOP} mode="d" bg={YELLOW}>
      {/* Hero */}
      <Txt x={253} y={38} size={22} color={INK} style={H}>Den Gule Café</Txt>
      {['Menu', 'Åbningstider', 'Find os'].map((t, i) => (
        <Txt key={t} x={[1010, 1092, 1210][i]} y={44} size={15} color={INK}>{t}</Txt>
      ))}
      <Box x={1290} y={38} w={28} h={28} r={14} border={[3, INK]} />

      <Txt x={253} y={140} size={104} color={INK} lh={0.98} style={H}>
        Morgenmad,
        <br />
        brunch og
        <br />
        kaffe.
      </Txt>
      <Txt x={253} y={478} w={520} size={22} color={INK} lh={1.45}>
        En farverig café med mad lavet fra bunden. Kom forbi, uden at bestille bord.
      </Txt>
      <Btn x={253} y={584} w={220} h={62} label="Se hvad vi laver" bg={INK} color="#fff" r={31} size={17} weight={700} />
      <Btn x={488} y={584} w={140} h={62} label="Find vej" bg="#fff" color={INK} r={31} size={17} weight={700} />

      <Polaroid x={900} y={100} w={290} h={350} fill="#3b2a20" rot={-6}>
        <Cup x={40} y={40} d={190} />
      </Polaroid>
      <Polaroid x={1060} y={80} w={270} h={330} fill="#b9d08a" rot={5}>
        <Box x={40} y={50} w={150} h={150} r={75} bg="#f4c343" />
        <Box x={90} y={110} w={110} h={110} r={55} bg="#e8794a" />
      </Polaroid>
      <Polaroid x={980} y={290} w={310} h={380} fill="#d9c7a8" rot={-2}>
        <Plate x={40} y={40} d={230} food="#c9702d" accent="#5a7d3a" rim="#faf6ee" />
      </Polaroid>

      {/* Åbningstider */}
      <Box x={0} y={660} w={1440} h={58} bg={PINK} />
      <Txt x={253} y={676} size={16} weight={700} color={INK}>Åbningstider</Txt>
      <Skel x={400} y={686} w={420} n={1} gap={0} color="rgb(36 27 20 / .35)" last={1} />

      {/* Menu */}
      <Box x={0} y={718} w={1440} h={700} bg={PURPLE} />
      <Txt x={253} y={800} size={64} color="#fff" style={H}>Det får du hos os</Txt>
      {[
        ['Morgenmad', 'Bolle, æg, smør og drikke'],
        ['Grød og skåle', 'Med frugt og knas'],
        ['Toasts', 'Til morgen og frokost'],
        ['Juice', 'Friskpresset'],
        ['Kaffe og te', 'Varmt og koldt'],
        ['Aftentallerken', 'Små retter og drikke'],
      ].map(([a, b], i) => {
        const col = i % 2
        const row = Math.floor(i / 2)
        const x = 253 + col * 480
        const y = 940 + row * 132
        return (
          <div key={a}>
            <Txt x={x} y={y} size={26} weight={800} color={YELLOW} style={{ letterSpacing: '-0.02em' }}>{a}</Txt>
            <Txt x={x} y={y + 40} size={16} color="rgb(255 255 255 / .82)">{b}</Txt>
            <Skel x={x} y={y + 72} w={360} n={1} gap={0} color="rgb(255 255 255 / .2)" last={0.7} />
          </div>
        )
      })}

      {/* Fra caféen */}
      <Txt x={253} y={1500} size={64} color={INK} style={H}>Fra caféen</Txt>
      {[0, 1, 2].map((i) => (
        <Polaroid key={i} x={253 + i * 340} y={1620} w={300} h={360} fill={['#e8794a', '#3b7f8f', '#9c6bb0'][i]} rot={[-3, 2, -1][i]}>
          <Box x={50} y={50} w={150} h={150} r={75} bg="rgb(255 255 255 / .35)" />
        </Polaroid>
      ))}
      <Btn x={253} y={2040} w={260} h={58} label="Flere billeder" bg={INK} color="#fff" r={29} size={16} weight={700} />

      {/* Åbningstider og find os */}
      <Box x={0} y={2140} w={1440} h={360} bg={GREEN} />
      <Txt x={253} y={2196} size={54} color="#fff" style={H}>Åbningstider</Txt>
      {['Mandag', 'Tirsdag', 'Onsdag', 'Torsdag'].map((d, i) => (
        <div key={d}>
          <Txt x={253} y={2286 + i * 46} size={16} color="#fff">{d}</Txt>
          <Box x={380} y={2296 + i * 46} w={90} h={8} r={4} bg="rgb(255 255 255 / .45)" />
        </div>
      ))}
      <Txt x={820} y={2200} size={22} weight={800} color="#fff">Godt at vide</Txt>
      <Skel x={820} y={2250} w={380} n={4} gap={26} color="rgb(255 255 255 / .35)" />
    </Page>
  )
}

export function CafeMobile() {
  return (
    <Page {...CAFE_MOBILE} mode="m" bg={YELLOW}>
      <Txt x={24} y={26} size={19} color={INK} style={H}>Den Gule Café</Txt>
      <Box x={338} y={24} w={28} h={28} r={14} border={[3, INK]} />

      <Polaroid x={24} y={86} w={150} h={184} fill="#3b2a20" rot={-6}>
        <Cup x={14} y={16} d={100} />
      </Polaroid>
      <Polaroid x={206} y={76} w={150} h={184} fill="#b9d08a" rot={5}>
        <Box x={16} y={20} w={80} h={80} r={40} bg="#f4c343" />
        <Box x={50} y={60} w={60} h={60} r={30} bg="#e8794a" />
      </Polaroid>
      <Polaroid x={112} y={130} w={170} h={206} fill="#d9c7a8" rot={-2}>
        <Plate x={14} y={14} d={128} food="#c9702d" accent="#5a7d3a" rim="#faf6ee" />
      </Polaroid>

      <Txt x={24} y={370} size={58} color={INK} lh={0.98} style={H}>
        Morgenmad,
        <br />
        brunch og
        <br />
        kaffe.
      </Txt>
      <Txt x={24} y={558} w={330} size={17} color={INK} lh={1.45}>
        En farverig café med mad lavet fra bunden.
      </Txt>
      <Btn x={24} y={640} w={186} h={54} label="Se hvad vi laver" bg={INK} color="#fff" r={27} size={15} weight={700} />
      <Btn x={222} y={640} w={112} h={54} label="Find vej" bg="#fff" color={INK} r={27} size={15} weight={700} />

      <Box x={0} y={740} w={390} h={64} bg={PINK} />
      <Txt x={24} y={760} size={14} weight={700} color={INK}>Åbningstider</Txt>
      <Skel x={24} y={784} w={280} n={1} gap={0} color="rgb(36 27 20 / .35)" last={1} />

      <Box x={0} y={804} w={390} h={700} bg={PURPLE} />
      <Txt x={24} y={846} size={38} color="#fff" lh={1.05} style={H}>
        Det får du
        <br />
        hos os
      </Txt>
      {['Morgenmad', 'Grød og skåle', 'Toasts', 'Juice', 'Kaffe og te'].map((a, i) => (
        <div key={a}>
          <Txt x={24} y={960 + i * 100} size={22} weight={800} color={YELLOW} style={{ letterSpacing: '-0.02em' }}>{a}</Txt>
          <Skel x={24} y={996 + i * 100} w={330} n={2} gap={18} color="rgb(255 255 255 / .28)" />
        </div>
      ))}

      <Txt x={24} y={1570} size={38} color={INK} style={H}>Fra caféen</Txt>
      {[0, 1].map((i) => (
        <Polaroid key={i} x={24 + i * 180} y={1650} w={162} h={200} fill={['#e8794a', '#3b7f8f'][i]} rot={[-3, 2][i]}>
          <Box x={24} y={26} w={80} h={80} r={40} bg="rgb(255 255 255 / .35)" />
        </Polaroid>
      ))}
      <Btn x={24} y={1900} w={190} h={52} label="Flere billeder" bg={INK} color="#fff" r={26} size={15} weight={700} />
      <Box x={0} y={1990} w={390} h={110} bg={GREEN} />
      <Txt x={24} y={2018} size={26} color="#fff" style={H}>Åbningstider</Txt>
      <Skel x={24} y={2062} w={300} n={2} gap={18} color="rgb(255 255 255 / .4)" />
    </Page>
  )
}
