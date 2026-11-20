import { decodeStackGraphics } from '../BattleSprites/graphics'
import { extractEntries } from '../util'
import type MapTilesets from './MapTilesets'

const MAX_MAP_TILESETS = 5

export function decode(target: MapTilesets, bytes: Uint8Array): boolean {
  target.tiles = extractEntries(bytes, 0x10000 + bytes.byteOffset, MAX_MAP_TILESETS).flatMap(
    (entry) => decodeStackGraphics(entry)!,
  )
  return true
}
