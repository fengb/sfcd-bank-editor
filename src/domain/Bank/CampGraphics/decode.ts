import {
  decodeStackGraphics,
  parsePalette,
  type Tile,
  type Palette,
} from '../BattleSprites/graphics'

export interface CampGraphic {
  palette: Palette
  tiles: Tile[]
  metadata: Uint8Array
}

const PALETTE_OFFSET = 0x18
const PALETTE_SIZE = 0x20
const TILE_DATA_OFFSET = 0x98

export function decodeCampGraphic(data: Uint8Array): CampGraphic | null {
  try {
    if (data.length < TILE_DATA_OFFSET + 32) return null

    const palette = parsePalette(data.subarray(PALETTE_OFFSET, PALETTE_OFFSET + PALETTE_SIZE))
    if (!palette?.length) return null
    const metadata = data.subarray(PALETTE_OFFSET + PALETTE_SIZE, TILE_DATA_OFFSET)
    const tiles = decodeStackGraphics(data.subarray(TILE_DATA_OFFSET))
    if (!tiles?.length) return null

    return { palette, tiles, metadata }
  } catch {
    return null
  }
}
