/**
 * Geometrien til heroens O: tre stive metaldele, der tilsammen danner et skulpturelt O.
 *
 * Ren matematik uden three.js, så den kan testes i node (heroO.test.js). scene.js gør
 * arrays'ene til BufferGeometry.
 *
 * Opbygning
 * - Midterlinjen er en lukket kurve i XY-planet: en cirkel med tre bløde lapper (rundet
 *   trekant) og en svag ægform, så toppen til højre er bredest.
 * - Tværsnittet er en superellipse (bred, buet forside og bagside, afrundet yderkant).
 *   Den del af profilen, der vender ind mod hullet, er champagnefarvet; resten er stål.
 * - Hver del slutter med en afrundet kant (fillet med radius `bevel`) og en plan endeflade.
 *   Endefladerne i en samling er parallelle (vinkelrette på kurvens tangent i samlingen),
 *   så fugen har samme bredde hele vejen rundt.
 *
 * Mål: ydre diameter ca. 1,95 enheder; O'et vender mod +Z (kameraet).
 */

const TAU = Math.PI * 2
const deg = (d) => (d * Math.PI) / 180

export const SHAPE = {
  radius: 0.72, // midterlinjens grundradius
  lobes: 0.045, // tre lapper: hullet bliver en blød trekant
  lobePhase: deg(112),
  egg: 0.03, // ægform
  eggPhase: deg(38),
  halfWidth: 0.245, // halv bredde af båndet (radialt)
  widthVar: 0.2, // båndet er bredest mod øverste højre
  widthPhase: deg(38),
  halfDepth: 0.19, // halv tykkelse (mod kameraet)
  exponent: 3, // superellipse: 2 = ellipse, højere = fladere front
  gap: 0.011, // fugens bredde
  bevel: 0.024, // radius på de afrundede kanter ved snittene
  joints: [deg(44), deg(168), deg(286)], // samlingernes vinkler
  champagne: deg(66), // halv åbningsvinkel af den varme inderside i profilen
}

const S = SHAPE

const centerRadius = (phi) =>
  S.radius * (1 + S.lobes * Math.cos(3 * (phi - S.lobePhase)) + S.egg * Math.cos(phi - S.eggPhase))

const centerAt = (phi) => {
  const r = centerRadius(phi)
  return [r * Math.cos(phi), r * Math.sin(phi)]
}

export const halfWidthAt = (phi) => S.halfWidth * (1 + S.widthVar * Math.cos(phi - S.widthPhase))

/* Buelængde-tabel, så delene kan måles og samples jævnt langs kurven. */
const TABLE = 8192
const tablePhi = new Float64Array(TABLE + 1)
const tableLen = new Float64Array(TABLE + 1)
{
  let prev = centerAt(0)
  for (let i = 1; i <= TABLE; i++) {
    const phi = (i / TABLE) * TAU
    const p = centerAt(phi)
    tablePhi[i] = phi
    tableLen[i] = tableLen[i - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1])
    prev = p
  }
}
export const LENGTH = tableLen[TABLE]

const phiAt = (s) => {
  s = ((s % LENGTH) + LENGTH) % LENGTH
  let lo = 0
  let hi = TABLE
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (tableLen[mid] <= s) lo = mid
    else hi = mid
  }
  const f = (s - tableLen[lo]) / (tableLen[hi] - tableLen[lo])
  return tablePhi[lo] + f * (tablePhi[hi] - tablePhi[lo])
}

const sAt = (phi) => {
  phi = ((phi % TAU) + TAU) % TAU
  const x = (phi / TAU) * TABLE
  const i = Math.min(TABLE - 1, Math.floor(x))
  return tableLen[i] + (x - i) * (tableLen[i + 1] - tableLen[i])
}

/** Punkt og enhedstangent på midterlinjen ved buelængde s. */
const frameAt = (s) => {
  const phi = phiAt(s)
  const h = 1e-5
  const a = centerAt(phi - h)
  const b = centerAt(phi + h)
  const l = Math.hypot(b[0] - a[0], b[1] - a[1])
  return { phi, p: centerAt(phi), t: [(b[0] - a[0]) / l, (b[1] - a[1]) / l] }
}

/**
 * Superellipse-profil. θ = 0 peger udad, θ = π ind mod hullet, θ = π/2 mod kameraet.
 * Returnerer [u, v, nu, nv]: punkt (radialt, dybde) flyttet `inset` ind langs normalen, og normalen.
 */
const superNormal = (theta, a, b) => {
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  const e = 2 / S.exponent
  const nu = (Math.sign(c) * Math.abs(c) ** (2 - e)) / a
  const nv = (Math.sign(s) * Math.abs(s) ** (2 - e)) / b
  const l = Math.hypot(nu, nv)
  return [nu / l, nv / l]
}

/** Fin rille, hvor stål og champagne mødes: en smal, blød fordybning (gaussisk profil). */
const GROOVE = { depth: 0.0045, width: 0.035 }
const groove = (theta) => {
  const d1 = (theta - (Math.PI - W)) / GROOVE.width
  const d2 = (theta - (Math.PI + W)) / GROOVE.width
  const d3 = (theta + (Math.PI - W)) / GROOVE.width // samme rille set fra θ < 0
  return GROOVE.depth * (Math.exp(-d1 * d1) + Math.exp(-d2 * d2) + Math.exp(-d3 * d3))
}

const profilePoint = (theta, a, b, inset) => {
  const c = Math.cos(theta)
  const s = Math.sin(theta)
  const e = 2 / S.exponent
  const u = a * Math.sign(c) * Math.abs(c) ** e
  const v = b * Math.sign(s) * Math.abs(s) ** e
  const [nu, nv] = superNormal(theta, a, b)
  const d = inset + groove(theta)
  return [u - d * nu, v - d * nv]
}

/**
 * Profilpunkt og normal. Normalen findes numerisk ud fra nabopunkter, så rillen også
 * påvirker lyset. Returnerer [u, v, nu, nv].
 */
const profile = (theta, a, b, inset) => {
  const [u, v] = profilePoint(theta, a, b, inset)
  const h = 1e-4
  const p0 = profilePoint(theta - h, a, b, inset)
  const p1 = profilePoint(theta + h, a, b, inset)
  // Tangenten roteret −90° giver den udadgående normal (profilen løber mod uret).
  let nu = p1[1] - p0[1]
  let nv = -(p1[0] - p0[0])
  const l = Math.hypot(nu, nv)
  nu /= l
  nv /= l
  return [u, v, nu, nv]
}

const range = (from, to, segments) => Array.from({ length: segments + 1 }, (_, i) => from + ((to - from) * i) / segments)

/** Som range, men tættere ved enderne (hvor rillen ligger): x − k·sin(2πx)/2π. */
const rangeDenseEnds = (from, to, segments, k = 0.86) =>
  Array.from({ length: segments + 1 }, (_, i) => {
    const x = i / segments
    return from + (to - from) * (x - (k * Math.sin(2 * Math.PI * x)) / (2 * Math.PI))
  })

const W = S.champagne
const STEEL_THETAS = rangeDenseEnds(-(Math.PI - W), Math.PI - W, 120)
const CHAMPAGNE_THETAS = rangeDenseEnds(Math.PI - W, Math.PI + W, 52)
const CAP_THETAS = range(0, TAU, 140)

const smoothstep = (x) => {
  const t = Math.min(1, Math.max(0, x))
  return t * t * (3 - 2 * t)
}

/**
 * Bygger del nr. `index` (0–2): fra samling `index` til samling `index + 1`.
 *
 * Returnerer arrays til en indekseret BufferGeometry med to grupper (0 = stål, 1 = champagne:
 * inderside og endeflader), delens omdrejningspunkt (pivot, midten af dens bounding box) og
 * dens lokale akser midt på buen (radial N, tangent T), som bevægelsen bruger.
 * Positionerne er relative til pivot.
 */
export function buildPart(index, { ringStep = 0.011, bevelRings = 9 } = {}) {
  const j0 = S.joints[index]
  const j1 = S.joints[(index + 1) % 3]
  const s0 = sAt(j0)
  let s1 = sAt(j1)
  if (s1 <= s0) s1 += LENGTH
  const t0 = frameAt(s0).t
  const t1 = frameAt(s1).t
  const a0 = s0 + S.gap / 2
  const a1 = s1 - S.gap / 2
  const r = S.bevel
  const blend = 0.09 // over denne længde drejes ringene, så endefladen står vinkelret på samlingens tangent

  // Ringene langs delen: [s, inset, θb (fillet-vinkel), side (-1 start, +1 slut, 0 krop)]
  const rings = []
  for (let k = 0; k < bevelRings; k++) {
    const tb = (Math.PI / 2) * (1 - k / bevelRings)
    rings.push([a0 + r - r * Math.sin(tb), r * (1 - Math.cos(tb)), tb, -1])
  }
  const bodyLen = a1 - a0 - 2 * r
  const m = Math.ceil(bodyLen / ringStep)
  for (let k = 0; k <= m; k++) rings.push([a0 + r + (bodyLen * k) / m, 0, 0, 0])
  for (let k = 1; k <= bevelRings; k++) {
    const tb = (Math.PI / 2) * (k / bevelRings)
    rings.push([a1 - r + r * Math.sin(tb), r * (1 - Math.cos(tb)), tb, 1])
  }

  // Ramme pr. ring: centrum, tangent, radial normal og halv bredde.
  const frames = rings.map(([s]) => {
    const f = frameAt(s)
    const w0 = 1 - smoothstep((s - a0) / blend)
    const w1 = 1 - smoothstep((a1 - s) / blend)
    const wl = 1 - w0 - w1
    let tx = f.t[0] * wl + t0[0] * w0 + t1[0] * w1
    let ty = f.t[1] * wl + t0[1] * w0 + t1[1] * w1
    const l = Math.hypot(tx, ty)
    tx /= l
    ty /= l
    return { p: f.p, t: [tx, ty], n: [ty, -tx], hw: halfWidthAt(f.phi) }
  })

  const positions = []
  const normals = []
  const tangents = []
  const uvs = []
  const steelIndex = []
  const champagneIndex = []
  const b = S.halfDepth

  const sweep = (thetas, out) => {
    const base = positions.length / 3
    const P = thetas.length
    rings.forEach(([s, inset, tb, side], k) => {
      const { p, t, n, hw } = frames[k]
      const ct = Math.cos(tb)
      const st = Math.sin(tb) * side
      for (const theta of thetas) {
        const [u, v, nu, nv] = profile(theta, hw, b, inset)
        positions.push(p[0] + n[0] * u, p[1] + n[1] * u, v)
        const nx = ct * n[0] * nu + st * t[0]
        const ny = ct * n[1] * nu + st * t[1]
        const nz = ct * nv
        normals.push(nx, ny, nz)
        // Tangent = børsteretningen (langs kurven), gjort vinkelret på normalen. Glat over hele
        // fladen, så anisotropien ikke bliver facetteret pr. trekant.
        const d = t[0] * nx + t[1] * ny
        let tx = t[0] - d * nx
        let ty = t[1] - d * ny
        let tz = -d * nz
        const tl = Math.hypot(tx, ty, tz) || 1
        tangents.push(tx / tl, ty / tl, tz / tl, 1)
        uvs.push(s, theta * 0.26)
      }
    })
    for (let k = 0; k < rings.length - 1; k++) {
      for (let j = 0; j < P - 1; j++) {
        const a = base + k * P + j
        const bb = a + P
        out.push(a, bb, a + 1, bb, bb + 1, a + 1)
      }
    }
  }
  sweep(STEEL_THETAS, steelIndex)
  sweep(CHAMPAGNE_THETAS, champagneIndex)

  // Plane endeflader: vifte fra midten af den indrykkede profil.
  const cap = (k, side) => {
    const { p, t, n, hw } = frames[k]
    const [s, inset] = rings[k]
    const base = positions.length / 3
    let cu = 0
    let cv = 0
    const pts = CAP_THETAS.slice(0, -1).map((theta) => {
      const [u, v] = profile(theta, hw, b, inset)
      cu += u
      cv += v
      return [u, v]
    })
    cu /= pts.length
    cv /= pts.length
    for (const [u, v] of [[cu, cv], ...pts]) {
      positions.push(p[0] + n[0] * u, p[1] + n[1] * u, v)
      normals.push(t[0] * side, t[1] * side, 0)
      tangents.push(n[0], n[1], 0, side)
      uvs.push(s + u * 0.4, v * 0.4)
    }
    const q = pts.length
    for (let j = 0; j < q; j++) {
      const a = base + 1 + j
      const c = base + 1 + ((j + 1) % q)
      if (side < 0) champagneIndex.push(base, a, c)
      else champagneIndex.push(base, c, a)
    }
  }
  cap(0, -1)
  cap(rings.length - 1, 1)

  // Pivot: midten af delens bounding box. Positionerne gøres relative til den.
  const min = [Infinity, Infinity, Infinity]
  const max = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < positions.length; i += 3) {
    for (let c = 0; c < 3; c++) {
      min[c] = Math.min(min[c], positions[i + c])
      max[c] = Math.max(max[c], positions[i + c])
    }
  }
  const pivot = [0, 1, 2].map((c) => (min[c] + max[c]) / 2)
  for (let i = 0; i < positions.length; i += 3) {
    for (let c = 0; c < 3; c++) positions[i + c] -= pivot[c]
  }

  const mid = frameAt((a0 + a1) / 2)
  const index32 = Uint32Array.from([...steelIndex, ...champagneIndex])
  return {
    positions: Float32Array.from(positions),
    normals: Float32Array.from(normals),
    tangents: Float32Array.from(tangents),
    uvs: Float32Array.from(uvs),
    index: index32,
    groups: [
      { start: 0, count: steelIndex.length, materialIndex: 0 },
      { start: steelIndex.length, count: champagneIndex.length, materialIndex: 1 },
    ],
    pivot,
    axes: { n: [mid.t[1], -mid.t[0], 0], t: [mid.t[0], mid.t[1], 0] },
  }
}

/** Samling nr. j: punkt på midterlinjen og tangent (peger fra del j-1 mod del j). */
export const joint = (j) => {
  const f = frameAt(sAt(S.joints[j]))
  return { p: [f.p[0], f.p[1], 0], t: [f.t[0], f.t[1], 0] }
}

/** Ydre diameter (største afstand på tværs), til at skalere bevægelsen. */
export const DIAMETER = (() => {
  let maxR = 0
  for (let i = 0; i < 720; i++) {
    const phi = (i / 720) * TAU
    maxR = Math.max(maxR, centerRadius(phi) + halfWidthAt(phi))
  }
  return 2 * maxR
})()
