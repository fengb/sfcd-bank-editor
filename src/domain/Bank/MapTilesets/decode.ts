import { decodeStackGraphics, type Tile } from '../BattleSprites/graphics'
import { extractEntries } from '../util'

export interface MapTileset {
  tiles: Tile[]
}

const MAX_MAP_TILESETS = 5

export function decodeMapTilesets(bytes: Uint8Array): MapTileset {
  return {
    tiles: extractEntries(bytes, 0x10000 + bytes.byteOffset, MAX_MAP_TILESETS).flatMap((entry) =>
      decodeStackGraphics(entry)!,
    ),
  }
}
