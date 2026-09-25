/**
 * Billedpipeline.
 *
 *   node scripts/images.mjs
 *
 * Gør tre ting ved portrættet:
 *   1. Beskærer til slottets format. Opskalerer ALDRIG.
 *   2. Skifter den hvide studiebaggrund ud med papirfarven. Motivet
 *      røres ikke — se noten om flood fill nedenfor.
 *   3. Skriver AVIF, WebP og JPEG ud.
 *
 * Hvorfor flood fill og ikke en simpel lys-tærskel: skjortens hvide
 * striber rammer 255 ligesom baggrunden. En tærskel ville skære huller
 * i skjorten. Flood fill starter ved billedkanten og breder sig kun til
 * naboer, der også er næsten hvide — og kan derfor per definition ikke
 * ramme hvide områder inde i motivet (tænder, øjne, striber), fordi de
 * ikke hænger sammen med kanten.
 */
import { mkdirSync } from 'node:fs'
import sharp from 'sharp'

/** Papirfarven fra index.css. Ændrer du den dér, så ændr den her. */
const PAPER = { r: 0xf5, g: 0xf5, b: 0xf2 }

/** Hvor hvidt et pixel skal være for at tælle som baggrund. */
const WHITE = 248

const JOBS = [
  {
    from: 'Pictures/brugerfoto (1).jpg',
    to: 'public/ronny',
    ratio: 4 / 5,
    dropBackground: true,
  },
]

/**
 * Markerer den sammenhængende, næsten hvide baggrund fra kanten og ind.
 * Returnerer en alfakanal: 0 = baggrund, 255 = motiv.
 */
function subjectAlpha(data, w, h, channels) {
  const isWhite = (i) => data[i] >= WHITE && data[i + 1] >= WHITE && data[i + 2] >= WHITE

  const bg = new Uint8Array(w * h)
  const queue = []

  const push = (x, y) => {
    const p = y * w + x
    if (bg[p]) return
    if (!isWhite(p * channels)) return
    bg[p] = 1
    queue.push(p)
  }

  for (let x = 0; x < w; x++) {
    push(x, 0)
    push(x, h - 1)
  }
  for (let y = 0; y < h; y++) {
    push(0, y)
    push(w - 1, y)
  }

  while (queue.length) {
    const p = queue.pop()
    const x = p % w
    const y = (p / w) | 0
    if (x > 0) push(x - 1, y)
    if (x < w - 1) push(x + 1, y)
    if (y > 0) push(x, y - 1)
    if (y < h - 1) push(x, y + 1)
  }

  // Udvid baggrunden ét pixel ind i motivet, så den hvide antialias-kant
  // omkring håret ikke bliver stående som en lys rand på papiret.
  const grown = Uint8Array.from(bg)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (bg[y * w + x]) continue
      const n =
        (x > 0 && bg[y * w + x - 1]) ||
        (x < w - 1 && bg[y * w + x + 1]) ||
        (y > 0 && bg[(y - 1) * w + x]) ||
        (y < h - 1 && bg[(y + 1) * w + x])
      if (n) grown[y * w + x] = 1
    }
  }

  const alpha = Buffer.alloc(w * h)
  for (let p = 0; p < w * h; p++) alpha[p] = grown[p] ? 0 : 255
  return alpha
}

mkdirSync('public', { recursive: true })

for (const job of JOBS) {
  const meta = await sharp(job.from).metadata()

  const cropW = Math.min(meta.width, Math.round(meta.height * job.ratio))
  const cropH = Math.min(meta.height, Math.round(cropW / job.ratio))

  let pipeline = sharp(job.from).extract({
    left: Math.round((meta.width - cropW) / 2),
    top: Math.round((meta.height - cropH) / 2),
    width: cropW,
    height: cropH,
  })

  let buf = await pipeline.png().toBuffer()

  if (job.dropBackground) {
    const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true })
    const alpha = subjectAlpha(data, info.width, info.height, info.channels)

    const covered = alpha.reduce((n, a) => n + (a === 0 ? 1 : 0), 0)
    const pct = Math.round((covered / (info.width * info.height)) * 100)

    // Blødgør kanten, så overgangen til papir ikke bliver takket.
    // blur() på et 1-kanals råt input giver 3 kanaler retur — derfor
    // læses masken med sin faktiske skridtlængde og ikke med 1.
    // Uden det bliver billedet stribet.
    const soft = await sharp(alpha, {
      raw: { width: info.width, height: info.height, channels: 1 },
    })
      .blur(0.7)
      .raw()
      .toBuffer({ resolveWithObject: true })

    const step = soft.info.channels
    const pixels = info.width * info.height
    const rgba = Buffer.alloc(pixels * 4)

    for (let p = 0; p < pixels; p++) {
      const s = p * info.channels
      const d = p * 4
      const a = soft.data[p * step]
      // Blandingen laves her frem for med sharps flatten(): flatten
      // afvikles tidligere end joinChannel i sharps faste rækkefølge og
      // ville køre, før alfakanalen overhovedet var sat på.
      rgba[d] = (data[s] * a + PAPER.r * (255 - a)) / 255
      rgba[d + 1] = (data[s + 1] * a + PAPER.g * (255 - a)) / 255
      rgba[d + 2] = (data[s + 2] * a + PAPER.b * (255 - a)) / 255
      rgba[d + 3] = 255
    }

    buf = await sharp(rgba, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .png()
      .toBuffer()

    console.log(`  baggrund erstattet: ${pct}% af fladen`)
  }

  await sharp(buf).avif({ quality: 66 }).toFile(`${job.to}.avif`)
  await sharp(buf).webp({ quality: 80 }).toFile(`${job.to}.webp`)
  await sharp(buf).jpeg({ quality: 84, mozjpeg: true }).toFile(`${job.to}.jpg`)

  console.log(`${job.from}  kilde ${meta.width}x${meta.height}  ->  ${cropW}x${cropH}`)
  console.log(`  sæt width: ${cropW}, height: ${cropH} i src/content.js`)
}
