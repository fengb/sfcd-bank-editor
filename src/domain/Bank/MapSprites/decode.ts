import { decodeBasicGraphics, type Palette, type Tile } from '../BattleSprites/graphics'
import { readU32be } from '../util'

export const MAP_SPRITE_PALETTE: Palette = [
  [0, 0, 0],
  [255, 255, 255],
  [0, 0, 0],
  [87, 87, 87],
  [144, 144, 144],
  [0, 172, 87],
  [87, 116, 206],
  [255, 144, 87],
  [255, 206, 172],
  [255, 87, 144],
  [206, 52, 52],
  [255, 206, 87],
  [144, 87, 0],
  [87, 52, 0],
  [0, 116, 52],
  [0, 52, 144],
]

export interface MapSprite {
  index: number
  pointer: number
  frames: [Tile[], Tile[]]
}

const MAX_MAP_SPRITES = 4096
const MAP_FRAME_TILE_COUNT = 9

export function decodeMapSprite(
  data: Uint8Array,
  index: number = 0,
  pointer: number = 0,
): MapSprite | null {
  const tiles = decodeBasicGraphics(data)
  if (tiles?.length !== MAP_FRAME_TILE_COUNT * 2) return null
  return {
    index,
    pointer,
    frames: [tiles.slice(0, MAP_FRAME_TILE_COUNT), tiles.slice(MAP_FRAME_TILE_COUNT)],
  }
}

export function decodeMapSprites(bytes: Uint8Array): MapSprite[] {
  const result: MapSprite[] = []

  for (let i = 0; i < MAX_MAP_SPRITES; i++) {
    const entryOffset = i * 4
    if (entryOffset + 4 > bytes.length) break

    const pointer = readU32be(bytes, entryOffset)
    if (!pointer) break

    const regionOffset = pointer - 0x10000 - bytes.byteOffset
    if (regionOffset < 0 || regionOffset >= bytes.length) break

    const block = bytes.subarray(regionOffset)
    const decoded = decodeMapSprite(block, i, pointer)
    if (!decoded) break
    result.push(decoded)
  }

  return result
}
