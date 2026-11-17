/**
 * Kontrol af heroens O uden browser: geometrien er lukket og vender rigtigt, loopet er
 * sømløst (position, hastighed og acceleration), bevægelsen holder sig inden for de aftalte
 * udsving, og delene rører aldrig hinanden.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DIAMETER, buildPart, joint, SHAPE } from './geometry.js'
import { LOOP_SECONDS, createPose, createPoseBuffer, openness } from './motion.js'

const parts = [0, 1, 2].map((i) => buildPart(i))
const pose = createPose(parts.map((p) => p.axes))

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const rotate = (q, o, v) => {
  const [x, y, z, w] = [q[o], q[o + 1], q[o + 2], q[o + 3]]
  const t = [2 * (y * v[2] - z * v[1]), 2 * (z * v[0] - x * v[2]), 2 * (x * v[1] - y * v[0])]
  return [v[0] + w * t[0] + (y * t[2] - z * t[1]), v[1] + w * t[1] + (z * t[0] - x * t[2]), v[2] + w * t[2] + (x * t[1] - y * t[0])]
}

/** Et punkt i delens pivot-koordinater flyttet til O'ets ramme ved den givne pose. */
const place = (i, out, v) => {
  const r = rotate(out.quat, 4 * i, v)
  const pv = parts[i].pivot
  return [r[0] + pv[0] + out.offset[3 * i], r[1] + pv[1] + out.offset[3 * i + 1], r[2] + pv[2] + out.offset[3 * i + 2]]
}

test('geometrien: endelige tal og trekanter, der vender udad', () => {
  for (const g of parts) {
    assert.ok(g.positions.every(Number.isFinite) && g.normals.every(Number.isFinite))
    let good = 0
    let total = 0
    for (let k = 0; k < g.index.length; k += 3) {
      const ids = [g.index[k], g.index[k + 1], g.index[k + 2]]
      const [a, b, c] = ids.map((id) => [g.positions[3 * id], g.positions[3 * id + 1], g.positions[3 * id + 2]])
      const fn = cross(sub(b, a), sub(c, a))
      if (Math.hypot(...fn) < 1e-12) continue
      const vn = ids.reduce((acc, id) => [acc[0] + g.normals[3 * id], acc[1] + g.normals[3 * id + 1], acc[2] + g.normals[3 * id + 2]], [0, 0, 0])
      total++
      if (dot(fn, vn) > 0) good++
    }
    assert.ok(good / total > 0.999, `${total - good} af ${total} trekanter vender forkert`)
  }
})

test('loopet: position, hastighed og acceleration passer over samlingen', () => {
  const sample = (t) => {
    const o = pose(((t % LOOP_SECONDS) + LOOP_SECONDS) % LOOP_SECONDS, createPoseBuffer())
    return [o.yaw, ...o.offset, ...o.quat]
  }
  const h = 1e-3
  const deriv = (t) => {
    const [a, b, c] = [sample(t - h), sample(t), sample(t + h)]
    return b.map((v, k) => [v, (c[k] - a[k]) / (2 * h), (c[k] - 2 * v + a[k]) / (h * h)])
  }
  // Kurverne evalueres direkte (uden modulo) lige før og lige efter samlingen.
  const raw = (t) => {
    const o = pose(t, createPoseBuffer())
    return [o.yaw, ...o.offset, ...o.quat]
  }
  const end = raw(LOOP_SECONDS)
  const start = raw(0)
  end.forEach((v, k) => assert.ok(Math.abs(v - start[k]) < 1e-12))
  const before = [raw(LOOP_SECONDS - 2 * h), raw(LOOP_SECONDS - h), end]
  const after = [start, raw(h), raw(2 * h)]
  for (let k = 0; k < end.length; k++) {
    const vBefore = (before[2][k] - before[1][k]) / h
    const vAfter = (after[1][k] - after[0][k]) / h
    assert.ok(Math.abs(vBefore - vAfter) < 0.05, `hastighed springer i kanal ${k}`)
    const aBefore = (before[2][k] - 2 * before[1][k] + before[0][k]) / (h * h)
    const aAfter = (after[2][k] - 2 * after[1][k] + after[0][k]) / (h * h)
    assert.ok(Math.abs(aBefore - aAfter) < 0.5, `acceleration springer i kanal ${k}`)
  }
  // Ingen stillestående fase: et sted i hvert halve sekund bevæger mindst én kanal sig.
  for (let t = 0; t < LOOP_SECONDS; t += 0.5) {
    const moving = deriv(t + 0.25).some(([, v]) => Math.abs(v) > 1e-4)
    assert.ok(moving, `ingen bevægelse omkring t=${t + 0.25}`)
  }
})

test('udsving: forskydning 2–4 % af diameteren, lokal rotation 3–5°, samlet ved start', () => {
  let maxShift = 0
  let maxAngle = 0
  for (let t = 0; t < LOOP_SECONDS; t += 0.01) {
    const o = pose(t, createPoseBuffer())
    for (let i = 0; i < 3; i++) {
      maxShift = Math.max(maxShift, Math.hypot(o.offset[3 * i], o.offset[3 * i + 1], o.offset[3 * i + 2]) / DIAMETER)
      maxAngle = Math.max(maxAngle, (2 * Math.acos(Math.min(1, Math.abs(o.quat[4 * i + 3]))) * 180) / Math.PI)
    }
  }
  assert.ok(maxShift >= 0.02 && maxShift <= 0.04, `største forskydning ${(maxShift * 100).toFixed(2)} %`)
  assert.ok(maxAngle >= 3 && maxAngle <= 5, `største rotation ${maxAngle.toFixed(2)}°`)
  const o = pose(0, createPoseBuffer())
  for (let i = 0; i < 3; i++) {
    const shift = Math.hypot(o.offset[3 * i], o.offset[3 * i + 1], o.offset[3 * i + 2])
    assert.ok(shift < 0.001 * DIAMETER, `del ${i} er ikke samlet ved t=0 (${shift})`)
  }
  assert.equal(openness(0), 0)
})

test('ingen kollisioner: endefladerne i hver samling holder afstand gennem hele loopet', () => {
  // For hver samling: del A's slutflade og del B's startflade. Alle B's punkter nær samlingen
  // skal ligge foran A's flade og omvendt.
  const near = (g, centre) => {
    const pts = []
    for (let k = 0; k < g.positions.length; k += 3) {
      const v = [g.positions[k], g.positions[k + 1], g.positions[k + 2]]
      const w = [v[0] + g.pivot[0], v[1] + g.pivot[1], v[2]]
      if (Math.hypot(w[0] - centre[0], w[1] - centre[1]) < 0.5) pts.push(v)
    }
    return pts
  }
  let minGap = Infinity
  for (let j = 0; j < 3; j++) {
    const a = (j + 2) % 3 // del, der slutter i samling j
    const b = j // del, der starter i samling j
    const { p, t } = joint(j)
    const ptsA = near(parts[a], p)
    const ptsB = near(parts[b], p)
    const planeA = sub([p[0] - (t[0] * SHAPE.gap) / 2, p[1] - (t[1] * SHAPE.gap) / 2, 0], [...parts[a].pivot])
    const planeB = sub([p[0] + (t[0] * SHAPE.gap) / 2, p[1] + (t[1] * SHAPE.gap) / 2, 0], [...parts[b].pivot])
    for (let s = 0; s < 500; s++) {
      const o = pose((s / 500) * LOOP_SECONDS, createPoseBuffer())
      const pa = place(a, o, planeA)
      const na = rotate(o.quat, 4 * a, t)
      const pb = place(b, o, planeB)
      const nb = rotate(o.quat, 4 * b, t)
      for (const v of ptsB) minGap = Math.min(minGap, dot(sub(place(b, o, v), pa), na))
      for (const v of ptsA) minGap = Math.min(minGap, -dot(sub(place(a, o, v), pb), nb))
    }
  }
  assert.ok(minGap > 0.004, `mindste afstand i en samling: ${minGap.toFixed(4)}`)
})
