import {
  decodeStackGraphics,
  parsePalette,
  type Tile,
  type Palette,
} from '../BattleSprites/graphics'

export interface ChapterGraphic {
  palette: Palette
  tiles: Tile[]
  metadata: Uint8Array
}

const TILE_DATA_OFFSET = 0x300
const METADATA_OFFSET = 0x20

export function decodeChapterGraphic(data: Uint8Array): ChapterGraphic | null {
  try {
    if (data.length < TILE_DATA_OFFSET + 32) return null

    const palette = parsePalette(data.subarray(0, METADATA_OFFSET))
    if (!palette?.length) return null
    const metadata = data.subarray(METADATA_OFFSET, TILE_DATA_OFFSET)
    const tiles = decodeStackGraphics(data.subarray(TILE_DATA_OFFSET))
    if (!tiles?.length) return null

    return { palette, tiles, metadata }
  } catch {
    return null
  }
}
