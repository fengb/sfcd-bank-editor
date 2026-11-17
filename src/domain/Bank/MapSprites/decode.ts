import { decodeBasicGraphics, type Palette, type Tile } from '../BattleSprites/graphics'
import { extractRecords } from '../util'

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
  frames: [Tile[], Tile[]]
}

const MAX_MAP_SPRITES = 4096
const MAP_FRAME_TILE_COUNT = 9

export function decodeMapSprites(bytes: Uint8Array): MapSprite[] {
  return extractRecords(bytes, 0x10000 + bytes.byteOffset, MAX_MAP_SPRITES).map((entry, index) => {
    const tiles = decodeBasicGraphics(entry)!
    return {
      index,
      frames: [tiles.slice(0, MAP_FRAME_TILE_COUNT), tiles.slice(MAP_FRAME_TILE_COUNT)],
    }
  })
}
