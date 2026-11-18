import { decodeBasicGraphics, type Palette, type Tile } from '../BattleSprites/graphics'
import { extractEntries } from '../util'

export const MAP_SPRITE_PALETTE: Palette = [
  [0, 0, 0],
  [7, 7, 7],
  [0, 0, 0],
  [2, 2, 2],
  [4, 4, 4],
  [0, 5, 2],
  [2, 3, 6],
  [7, 4, 2],
  [7, 6, 5],
  [7, 2, 4],
  [6, 1, 1],
  [7, 6, 2],
  [4, 2, 0],
  [2, 1, 0],
  [0, 3, 1],
  [0, 1, 4],
]

export interface MapSprite {
  index: number
  frames: [Tile[], Tile[]]
}

const MAX_MAP_SPRITES = 4096
const MAP_FRAME_TILE_COUNT = 9

export function decodeMapSprites(bytes: Uint8Array): MapSprite[] {
  return extractEntries(bytes, 0x10000 + bytes.byteOffset, MAX_MAP_SPRITES).map((entry, index) => {
    const tiles = decodeBasicGraphics(entry)!
    return {
      index,
      frames: [tiles.slice(0, MAP_FRAME_TILE_COUNT), tiles.slice(MAP_FRAME_TILE_COUNT)],
    }
  })
}
