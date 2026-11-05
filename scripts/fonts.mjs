/**
 * Skrifterne: kun latin, kun de akser og vægte siden bruger, woff2.
 *
 * Kilden er @fontsource-variable (npm, SIL OFL). Dette script laver de tre filer, siden indlæser
 * (src/assets/fonts/), ved at begrænse de variable akser og beholde latin-området:
 *
 *   Archivo      kun vægt 700, bredde 100–125 %  (overskrifter i Archivo Expanded; tal i normal bredde)
 *   Geist        vægt 400–700                     (brødtekst, knapper)
 *   Geist Mono   vægt 400–500                     (priser og tal)
 *
 * De variable originaler er 90 + 29 + 23 kB; resultatet er cirka en tredjedel.
 * Kør `npm run fonts` efter en opdatering af fontsource-pakkerne, og commit filerne.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import subsetFont from 'subset-font'

const SRC = 'node_modules/@fontsource-variable'
const OUT = 'src/assets/fonts'

// Samme latin-område som fontsource: U+0000-00FF m.fl. (æ, ø, å, tankestreger, pile op/ned, minus).
const ranges = [
  [0x20, 0x7e], [0xa0, 0xff], [0x131, 0x131], [0x152, 0x153], [0x2bb, 0x2bc], [0x2c6, 0x2c6], [0x2da, 0x2da],
  [0x2dc, 0x2dc], [0x2000, 0x206f], [0x20ac, 0x20ac], [0x2122, 0x2122], [0x2190, 0x2193], [0x2212, 0x2212],
]
let text = ''
for (const [a, b] of ranges) for (let i = a; i <= b; i++) text += String.fromCodePoint(i)

const jobs = [
  ['archivo-latin', `${SRC}/archivo/files/archivo-latin-wdth-normal.woff2`, { wght: 700, wdth: { min: 100, max: 125 } }],
  ['geist-latin', `${SRC}/geist/files/geist-latin-wght-normal.woff2`, { wght: { min: 400, max: 700 } }],
  ['geist-mono-latin', `${SRC}/geist-mono/files/geist-mono-latin-wght-normal.woff2`, { wght: { min: 400, max: 500 } }],
]

mkdirSync(OUT, { recursive: true })
for (const [name, file, axes] of jobs) {
  const input = readFileSync(file)
  const output = await subsetFont(input, text, { targetFormat: 'woff2', variationAxes: axes })
  writeFileSync(`${OUT}/${name}.woff2`, output)
  console.log(`${name}.woff2  ${(input.length / 1024).toFixed(1)} kB -> ${(output.length / 1024).toFixed(1)} kB`)
}
