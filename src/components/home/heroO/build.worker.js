/** Web Worker: beregner geometri og tekstur uden for hovedtråden og overdrager arrays'ene. */
import { buildAll, transferables } from './build.js'

self.onmessage = () => {
  const data = buildAll()
  self.postMessage(data, transferables(data))
}
