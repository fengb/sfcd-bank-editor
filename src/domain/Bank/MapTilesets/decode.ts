import { decodeStackGraphics, type Tile } from '../BattleSprites/graphics'
import { readU32be } from '../util'

export interface MapTileset {
  index: number
  pointer: number
  tiles: Tile[]
}

const MAX_MAP_TILESETS = 5

export function decodeMapTilesets(bytes: Uint8Array): MapTileset[] {
  const result: MapTileset[] = []

  for (let i = 0; i < MAX_MAP_TILESETS; i++) {
    const entryOffset = i * 4
    if (entryOffset + 4 > bytes.length) break

    const pointer = readU32be(bytes, entryOffset)
    if (!pointer) break

    const regionOffset = pointer - 0x10000 - bytes.byteOffset
    if (regionOffset < 0 || regionOffset >= bytes.length) break

    const block = bytes.subarray(regionOffset)
    const tiles = decodeStackGraphics(block)
    if (!tiles?.length) break

    result.push({ index: i, pointer, tiles })
  }

  return result
}
