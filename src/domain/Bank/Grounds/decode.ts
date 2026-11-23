import { decodeStackGraphics } from '../BattleSprites'
import { extractEntries } from '../util'
import type Grounds from './Grounds'

export function decode(target: Grounds, bytes: Uint8Array): boolean {
  extractEntries(bytes, 0x23d400).forEach((entry, index) => {
    const paletteDelta = [...entry.subarray(0, 6)]
    const tiles = decodeStackGraphics(entry.subarray(6))!
    target.entries.push({ index, paletteDelta, tiles })
  })
  return true
}
