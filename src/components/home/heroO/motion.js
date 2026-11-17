/**
 * Bevægelsen for heroens O: én funktion af tiden, ingen tilstand.
 *
 * Alt beregnes fra én klokke `t` (sekunder) og delenes gemte udgangstransformationer:
 *   fase p = 2π·t / LOOP_SECONDS
 *   åbning e(p) = ease((1 − cos p) / 2)        0 = samlet, 1 = mest åben
 * ease er et polynomium, så e er en uendeligt glat, periodisk funktion af p. Position, rotation,
 * hastighed og acceleration passer derfor sammen over loopets samling (t = 5 s → 0 s).
 *
 * Hver del åbner med en lille forsinkelse (delay i radianer af fasen) langs en buet bane:
 * radialt udad lineært i e og i dybden/langs kurven kvadratisk i e (en parabel). Den første del
 * af bevægelsen er altså ren adskillelse i samlingerne; dybden kommer bagefter. Det holder
 * delene fri af hinanden (se heroO.test.js).
 *
 * Ren matematik uden three.js; scene.js lægger tallene over i objekterne.
 */
import { DIAMETER } from './geometry.js'

export const LOOP_SECONDS = 5

const deg = (d) => (d * Math.PI) / 180
const TAU = Math.PI * 2

/** Udgangsvinkel: let 3D-vinkel. Hele O'et drejer TURN omkring den lodrette akse og tilbage. */
export const BASE = { pitch: deg(-2), yaw: deg(-19), roll: deg(-3) }
export const TURN = deg(10)
const TURN_DELAY = 0

/**
 * Pr. del (samme rækkefølge som geometry.js: 0 = top, 1 = venstre/nederst, 2 = højre).
 * radial/along/depth: forskydning i brøkdele af diameteren ved fuld åbning.
 * tilt: rotation om delens tangent (positiv vender indersiden mod kameraet); spin: om Z.
 */
export const PARTS = [
  { delay: -0.28, radial: 0.014, along: 0.004, depth: 0.03, tilt: deg(3.5), spin: deg(-1) }, // frem mod betragteren
  { delay: 0, radial: 0.014, along: -0.004, depth: -0.028, tilt: deg(4), spin: deg(1) }, // tilbage
  { delay: 0.28, radial: 0.026, along: 0.012, depth: 0.004, tilt: deg(2), spin: deg(2.5) }, // udadgående, afbalancerende bue
]

const ease = (s) => 0.55 * s + 0.45 * s * s * (3 - 2 * s)

/** Åbning 0–1 ved fase p (radianer). Periodisk med 2π og glat i alle afledede. */
export const openness = (p) => ease(0.5 - 0.5 * Math.cos(p))

const quatAxisAngle = (out, o, x, y, z, angle) => {
  const s = Math.sin(angle / 2)
  out[o] = x * s
  out[o + 1] = y * s
  out[o + 2] = z * s
  out[o + 3] = Math.cos(angle / 2)
}

/** a ← a·b (begge [x, y, z, w] i et array ved offset). */
const quatMul = (q, o, bx, by, bz, bw) => {
  const ax = q[o]
  const ay = q[o + 1]
  const az = q[o + 2]
  const aw = q[o + 3]
  q[o] = ax * bw + aw * bx + ay * bz - az * by
  q[o + 1] = ay * bw + aw * by + az * bx - ax * bz
  q[o + 2] = az * bw + aw * bz + ax * by - ay * bx
  q[o + 3] = aw * bw - ax * bx - ay * by - az * bz
}

/**
 * Laver en pose-funktion til de tre dele. `axes` er delenes lokale akser fra buildPart.
 * pose(t, out) skriver i genbrugte arrays (ingen allokering pr. frame):
 *   out.yaw                  hele O'ets drejning om lodret akse (radianer, inkl. BASE.yaw)
 *   out.offset[3i..3i+2]     delens forskydning fra udgangspositionen
 *   out.quat[4i..4i+3]       delens rotation om sin pivot
 */
export function createPose(axes) {
  return function pose(t, out) {
    const p = (TAU * t) / LOOP_SECONDS
    out.yaw = BASE.yaw + TURN * openness(p - TURN_DELAY)
    for (let i = 0; i < 3; i++) {
      const m = PARTS[i]
      const { n, t: tg } = axes[i]
      const e = openness(p - m.delay)
      const e2 = e * e
      const r = m.radial * DIAMETER * e
      const a = m.along * DIAMETER * e2
      const d = m.depth * DIAMETER * e2
      out.offset[3 * i] = n[0] * r + tg[0] * a
      out.offset[3 * i + 1] = n[1] * r + tg[1] * a
      out.offset[3 * i + 2] = d
      // Om tangenten T: R(T, +α) fører N mod −Z, så yderkanten går bagud og indersiden vender frem.
      quatAxisAngle(out.quat, 4 * i, tg[0], tg[1], 0, m.tilt * e)
      const s = Math.sin((m.spin * e) / 2)
      quatMul(out.quat, 4 * i, 0, 0, s, Math.cos((m.spin * e) / 2))
    }
    return out
  }
}

export const createPoseBuffer = () => ({ yaw: 0, offset: new Float64Array(9), quat: new Float64Array(12) })
