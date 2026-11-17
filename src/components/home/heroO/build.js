/**
 * Alt det tunge, der kan beregnes uden GPU: de tre deles geometri og den børstede tekstur.
 * Bruges af build.worker.js (uden for hovedtråden) og som reserve direkte i scene.js, hvis en
 * worker ikke kan startes.
 */
import { brushedData } from './brushed.js'
import { buildPart } from './geometry.js'

export function buildAll() {
  const parts = [0, 1, 2].map((i) => buildPart(i))
  const brush = brushedData()
  return { parts, brush }
}

/** ArrayBuffers, der kan overdrages (ikke kopieres) fra workeren. */
export const transferables = ({ parts, brush }) => [
  ...parts.flatMap((p) => [p.positions.buffer, p.normals.buffer, p.tangents.buffer, p.uvs.buffer, p.index.buffer]),
  brush.normal.buffer,
  brush.rough.buffer,
]
