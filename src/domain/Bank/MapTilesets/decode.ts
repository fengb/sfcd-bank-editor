import { decodeStackGraphics, type Tile } from '../BattleSprites/graphics'
import { extractRecords } from '../util'

export interface MapTileset {
  index: number
  tiles: Tile[]
}

const MAX_MAP_TILESETS = 5

export function decodeMapTilesets(bytes: Uint8Array): MapTileset[] {
  return extractRecords(bytes, 0x10000 + bytes.byteOffset, MAX_MAP_TILESETS).map((entry, i) => ({
    index: i,
    tiles: decodeStackGraphics(entry)!,
  }))
}
